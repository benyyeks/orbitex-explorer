// Ask ORBITEX: streaming assistant endpoint. Scoped strictly to space and
// astronomy; the system prompt refuses off-topic requests. Live ORBITEX
// telemetry (ISS position, Kp index, next launch) is injected as grounding
// context when the upstream feeds answer. The gateway secret never leaves
// the server; the browser talks only to this route.
import { createFileRoute } from "@tanstack/react-router";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";
const MAX_MESSAGES = 24;
const MAX_CONTENT = 2000;

type ChatMessage = { role: "user" | "assistant"; content: string };
type AskMode = "chat" | "quiz" | "explain" | "resources";
const MODES: readonly AskMode[] = ["chat", "quiz", "explain", "resources"];

function parseBody(raw: unknown): { mode: AskMode; messages: ChatMessage[] } | null {
  if (typeof raw !== "object" || raw === null) return null;
  const modeRaw = (raw as { mode?: unknown }).mode;
  const mode: AskMode = MODES.includes(modeRaw as AskMode) ? (modeRaw as AskMode) : "chat";
  const list = (raw as { messages?: unknown }).messages;
  if (!Array.isArray(list) || list.length === 0 || list.length > MAX_MESSAGES) return null;
  const messages: ChatMessage[] = [];
  for (const item of list) {
    const role = (item as { role?: unknown })?.role;
    const content = (item as { content?: unknown })?.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > MAX_CONTENT) return null;
    messages.push({ role, content: trimmed });
  }
  if (messages[messages.length - 1].role !== "user") return null;
  return { mode, messages };
}

// ------------------------- Live grounding context -------------------------
async function fetchJsonSafe(url: string): Promise<unknown> {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`status ${res.status}`);
  return res.json();
}

async function liveContext(): Promise<string> {
  const [iss, kp, launch] = await Promise.allSettled([
    fetchJsonSafe("https://api.wheretheiss.at/v1/satellites/25544"),
    fetchJsonSafe("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"),
    fetchJsonSafe("https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=1"),
  ]);

  const lines: string[] = [`Current UTC time: ${new Date().toISOString()}`];

  if (iss.status === "fulfilled") {
    const d = iss.value as { latitude?: number; longitude?: number; altitude?: number };
    if (typeof d?.latitude === "number" && typeof d?.longitude === "number") {
      lines.push(
        `Live ISS position: latitude ${d.latitude.toFixed(2)}, longitude ${d.longitude.toFixed(2)}` +
          (typeof d.altitude === "number" ? `, altitude ${d.altitude.toFixed(0)} km` : "")
      );
    }
  }
  if (kp.status === "fulfilled" && Array.isArray(kp.value)) {
    const rows = (kp.value as unknown[][]).slice(1);
    const last = rows[rows.length - 1];
    if (Array.isArray(last) && last.length >= 2) {
      lines.push(`Latest NOAA planetary Kp index: ${last[1]} (observed ${last[0]})`);
    }
  }
  if (launch.status === "fulfilled") {
    const first = (launch.value as { results?: { name?: string; net?: string }[] })?.results?.[0];
    if (first?.name && first?.net) {
      lines.push(`Next scheduled orbital launch: ${first.name} at ${first.net} UTC`);
    }
  }
  return lines.join("\n");
}

// ------------------------------ System prompt -----------------------------
const BASE_PROMPT = [
  "You are ORBITEX, the built-in assistant of the ORBITEX space intelligence dashboard.",
  "",
  "Scope, enforced strictly:",
  "- You answer only questions about space and space studies: astronomy, spaceflight, satellites, rockets, missions, space weather, planetary science, aerospace engineering, and the physics or mathematics directly needed for those subjects.",
  "- If a request is not about space, decline briefly and politely, and suggest a space-related alternative. Never write websites, code, general essays, homework outside space subjects, or general-purpose content, even if the user insists.",
  "",
  "Conduct:",
  "- Professional, concise, factual tone, like a NASA public affairs writer.",
  "- Never invent figures. If a number is an estimate, label it as an estimate and say what it is based on.",
  "- Plain punctuation only. Never use em dashes.",
  "- When live telemetry is supplied below, treat it as current and cite it naturally.",
  "- When relevant, point users to ORBITEX pages: /tracker (live satellite tracking), /deepspace (solar system and deep space probes), /sky (tonight's sky), /mars (rover imagery), /weather (space weather), /neo (asteroid watch), /launches (launch schedule), /research (research library), /intelligence (mission intelligence), /engineering (engineering notes), /resources (learning resources and the textbook shelf).",
].join("\n");

const MODE_PROMPTS: Record<AskMode, string> = {
  chat: "Mode: answer the user's space questions directly and helpfully.",
  quiz: [
    "Mode: practice quizzes.",
    "Generate clear, numbered practice questions on the aerospace topic and difficulty the user requests, drawing on standard textbook material.",
    "Withhold the answers until the user asks for them. When asked, provide each answer with a brief explanation.",
    "Mix conceptual and quantitative questions where the topic allows, and keep notation simple.",
  ].join("\n"),
  explain: [
    "Mode: study explanations.",
    "Explain the concept at the level the user states (curious beginner, high school student, or engineering student).",
    "Use one concrete example or analogy. Include formulas only when the stated level calls for them.",
  ].join("\n"),
  resources: [
    "Mode: study guide.",
    "Recommend a short, ordered learning path for the user's goal: name the relevant ORBITEX pages, then credible external sources such as NASA and ESA outreach, university open courseware, and standard textbooks.",
    "The ORBITEX textbook shelf at /resources lists canonical titles by topic (orbital mechanics, propulsion, spacecraft systems, guidance and control, aerodynamics, structures); refer to those titles when they fit.",
  ].join("\n"),
};

function buildSystemPrompt(mode: AskMode, context: string): string {
  return `${BASE_PROMPT}\n\n${MODE_PROMPTS[mode]}\n\nLive ORBITEX telemetry for grounding:\n${context}`;
}

// ------------------------------ SSE transform -----------------------------
// The gateway streams OpenAI-style SSE; the browser receives a plain text
// stream of answer deltas, which keeps the client trivially simple.
function deltaStream(upstream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let idx: number;
          while ((idx = buffer.indexOf("\n\n")) >= 0) {
            const event = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            for (const line of event.split("\n")) {
              if (!line.startsWith("data:")) continue;
              const payload = line.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const json = JSON.parse(payload) as {
                  choices?: { delta?: { content?: unknown } }[];
                };
                const delta = json.choices?.[0]?.delta?.content;
                if (typeof delta === "string" && delta) {
                  controller.enqueue(encoder.encode(delta));
                }
              } catch {
                /* partial JSON chunk: ignore */
              }
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      void upstream.cancel().catch(() => {});
    },
  });
}

// -------------------------------- Handler ---------------------------------
export const Route = createFileRoute("/api/ask")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json({ error: "assistant_unavailable" }, { status: 503 });
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ error: "bad_request" }, { status: 400 });
        }
        const parsed = parseBody(raw);
        if (!parsed) {
          return Response.json({ error: "bad_request" }, { status: 400 });
        }

        const context = await liveContext();
        const system = buildSystemPrompt(parsed.mode, context);

        let upstream: Response;
        try {
          upstream = await fetch(GATEWAY_URL, {
            method: "POST",
            signal: request.signal,
            headers: {
              "Content-Type": "application/json",
              "Lovable-API-Key": apiKey,
            },
            body: JSON.stringify({
              model: MODEL,
              stream: true,
              max_tokens: 2048,
              messages: [{ role: "system", content: system }, ...parsed.messages],
            }),
          });
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") {
            return new Response(null, { status: 499 });
          }
          return Response.json({ error: "assistant_unavailable" }, { status: 502 });
        }

        if (!upstream.ok || !upstream.body) {
          if (upstream.body) void upstream.body.cancel().catch(() => {});
          if (upstream.status === 429) {
            return Response.json({ error: "rate_limited" }, { status: 429 });
          }
          return Response.json({ error: "assistant_unavailable" }, { status: 503 });
        }

        return new Response(deltaStream(upstream.body), {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
