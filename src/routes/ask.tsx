// Ask ORBITEX: a space-only study assistant. Four modes (chat, practice
// quizzes, explanations, resource guidance) all post to /api/ask, which
// grounds answers in live ORBITEX telemetry and enforces the space-only
// scope. Replies stream in token by token.
import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BOOK_TOPICS } from "@/lib/books";
import { useAskHistory } from "@/lib/ask-history";

export const Route = createFileRoute("/ask")({
  head: () => ({
    meta: [
      { title: "Ask ORBITEX - ORBITEX" },
      {
        name: "description",
        content:
          "A space-only study assistant. Ask questions, generate practice quizzes from aerospace topics, get explanations at your level, and find the right resources.",
      },
      { property: "og:title", content: "Ask ORBITEX - ORBITEX" },
      {
        property: "og:description",
        content:
          "A space-only study assistant: answers, practice quizzes, explanations, and resource guidance, grounded in live ORBITEX data.",
      },
    ],
  }),
  component: AskPage,
});

type Mode = "chat" | "quiz" | "explain" | "resources";
type Msg = { role: "user" | "assistant"; content: string };

const MODE_LABELS: Record<Mode, string> = {
  chat: "Chat",
  quiz: "Practice quiz",
  explain: "Explain a concept",
  resources: "Find resources",
};

const SUGGESTIONS: Record<Mode, string[]> = {
  chat: [
    "Where is the ISS right now?",
    "What is the Kp index and why does it matter?",
    "Why do sun-synchronous orbits always face the Sun the same way?",
  ],
  quiz: [],
  explain: [
    "Explain specific impulse",
    "What is a gravity turn during launch?",
    "Why do low Earth orbits slowly decay?",
  ],
  resources: [
    "I want to start learning orbital mechanics",
    "Best study path for rocket propulsion",
    "How do I learn to read satellite TLE data?",
  ],
};

const LEVELS = [
  { id: "curious beginner", label: "Curious beginner" },
  { id: "high school student", label: "High school student" },
  { id: "engineering student", label: "Engineering student" },
] as const;

const DIFFICULTIES = [
  { id: "introductory", label: "Introductory" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
] as const;

function errorCopy(status: number, code: string | undefined): string {
  if (status === 429 || code === "rate_limited") {
    return "ORBITEX is answering a high volume of questions right now. Please try again in a moment.";
  }
  if (status === 503 || code === "assistant_unavailable") {
    return "The assistant is temporarily unavailable. Please try again later.";
  }
  return "The answer link failed. Check your connection and try again.";
}

function AskPage() {
  const [mode, setMode] = useState<Mode>("chat");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizTopic, setQuizTopic] = useState(BOOK_TOPICS[0]?.id ?? "");
  const [quizDifficulty, setQuizDifficulty] = useState<string>("introductory");
  const [level, setLevel] = useState<string>("curious beginner");
  const abortRef = useRef<AbortController | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);

  const history = useAskHistory();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;

  // Keep the latest exchange in view as tokens stream in.
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Stop an in-flight answer if the page unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  const openConversation = async (id: string) => {
    if (streaming) return;
    const saved = history.conversations.find((c) => c.id === id);
    setActiveId(id);
    setError(null);
    if (saved) setMode(saved.mode);
    const thread = await history.loadMessages(id);
    setMessages(thread);
  };

  const startNewChat = () => {
    if (streaming) return;
    setActiveId(null);
    setMessages([]);
    setError(null);
  };

  const removeConversation = async (id: string) => {
    await history.deleteConversation(id);
    if (activeIdRef.current === id) {
      setActiveId(null);
      setMessages([]);
    }
  };

  const clearAllChats = async () => {
    await history.clearAll();
    setConfirmClear(false);
    setActiveId(null);
    setMessages([]);
  };

  const send = async (rawText: string) => {
    const content = rawText.trim();
    if (!content || streaming) return;
    const thread = [...messages, { role: "user" as const, content }];
    setMessages([...thread, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setStreaming(true);

    // Signed-in accounts keep the thread; a new chat gets its conversation now
    // so the question is saved even if the answer never arrives.
    let conversationId = activeId;
    if (history.signedIn) {
      if (!conversationId) {
        conversationId = await history.createConversation(content, mode);
        if (conversationId) setActiveId(conversationId);
      }
      if (conversationId) {
        await history.appendMessage(conversationId, { role: "user", content });
      }
    }

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode, messages: history.slice(-20) }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorCopy(res.status, data?.error));
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const snapshot = acc;
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: snapshot };
          return next;
        });
      }
      if (!acc.trim()) {
        setMessages((prev) => prev.slice(0, -1));
        setError("No answer came back. Please try again.");
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        // User pressed stop: keep whatever partial answer arrived.
        setMessages((prev) =>
          prev.at(-1)?.role === "assistant" && !prev.at(-1)?.content
            ? prev.slice(0, -1)
            : prev
        );
      } else {
        setMessages((prev) =>
          prev.at(-1)?.role === "assistant" && !prev.at(-1)?.content
            ? prev.slice(0, -1)
            : prev
        );
        setError((err as Error).message || errorCopy(0, undefined));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const startQuiz = () => {
    const topic = BOOK_TOPICS.find((t) => t.id === quizTopic);
    if (!topic) return;
    void send(
      `Generate a 5-question ${quizDifficulty} practice quiz on ${topic.label}. ` +
        "Include a mix of conceptual and calculation questions. Do not show the answers yet."
    );
  };

  const explainPrompt = (concept: string) =>
    mode === "explain" ? `Explain this for a ${level}: ${concept}` : concept;

  const lastMessage = messages.at(-1);
  const quizReady =
    mode === "quiz" &&
    !streaming &&
    messages.some((m) => m.role === "assistant" && m.content.includes("1"));

  return (
    <main className="container page-scaffold">
      <section className="page-hero">
        <h1>Ask ORBITEX</h1>
        <p className="tagline">
          A study assistant for space and astronomy, grounded in live ORBITEX
          data. It answers space questions only, and labels estimates rather
          than inventing figures.
        </p>
      </section>

      <div className="ask-modes" role="tablist" aria-label="Assistant mode">
        {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            className={mode === m ? "active" : ""}
            onClick={() => setMode(m)}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {mode === "quiz" && (
        <section className="glass glass-card ask-controls" aria-label="Quiz settings">
          <div className="form-row">
            <label htmlFor="quiz-topic">Topic</label>
            <select
              id="quiz-topic"
              value={quizTopic}
              onChange={(e) => setQuizTopic(e.target.value)}
            >
              {BOOK_TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="quiz-difficulty">Difficulty</label>
            <select
              id="quiz-difficulty"
              value={quizDifficulty}
              onChange={(e) => setQuizDifficulty(e.target.value)}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={startQuiz}
            disabled={streaming}
          >
            Generate practice questions
          </button>
          <p className="ask-hint">
            Questions follow the topics of the textbook shelf on the resources
            page. Answers stay hidden until you ask for them.
          </p>
        </section>
      )}

      {mode === "explain" && (
        <section className="glass glass-card ask-controls" aria-label="Explanation level">
          <div className="form-row">
            <label htmlFor="explain-level">Explain for</label>
            <select id="explain-level" value={level} onChange={(e) => setLevel(e.target.value)}>
              {LEVELS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <p className="ask-hint">
            Pick a level, then ask about any space concept below.
          </p>
        </section>
      )}

      <section
        className="glass glass-card chat-thread"
        ref={threadRef}
        aria-live="polite"
        aria-label="Conversation"
      >
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>
              {mode === "quiz"
                ? "Choose a topic above and generate a set of practice questions."
                : mode === "resources"
                  ? "Describe what you want to learn and ORBITEX will map out a study path."
                  : "Ask anything about space, missions, satellites, or space weather."}
            </p>
            {SUGGESTIONS[mode].length > 0 && (
              <div className="chat-suggestions">
                {SUGGESTIONS[mode].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="chat-chip"
                    onClick={() => void send(explainPrompt(s))}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "msg msg-user" : "msg msg-ai"}>
              {m.role === "assistant" && <span className="msg-who">ORBITEX</span>}
              <p>{m.content}</p>
              {streaming && i === messages.length - 1 && m.role === "assistant" && (
                <span className="msg-cursor" aria-hidden="true" />
              )}
            </div>
          ))
        )}
        {quizReady && lastMessage?.role === "assistant" && (
          <div className="chat-suggestions">
            <button
              type="button"
              className="chat-chip"
              onClick={() => void send("Show the answers, each with a brief explanation.")}
            >
              Show answers with explanations
            </button>
            <button type="button" className="chat-chip" onClick={startQuiz}>
              New set of questions
            </button>
          </div>
        )}
      </section>

      {error && (
        <p className="form-status error" role="alert">
          {error}
        </p>
      )}

      <form
        className="chat-composer"
        onSubmit={(e) => {
          e.preventDefault();
          void send(mode === "explain" ? explainPrompt(input) : input);
        }}
      >
        <label htmlFor="ask-input" className="sr-only">
          Your question
        </label>
        <input
          id="ask-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "quiz"
              ? "Ask a follow-up, or request the answers..."
              : "Ask a space question..."
          }
          maxLength={2000}
          disabled={streaming}
          autoComplete="off"
        />
        {streaming ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => abortRef.current?.abort()}
          >
            Stop
          </button>
        ) : (
          <button type="submit" className="btn btn-primary" disabled={!input.trim()}>
            Send
          </button>
        )}
        {messages.length > 0 && !streaming && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setMessages([]);
              setError(null);
            }}
          >
            Clear
          </button>
        )}
      </form>
      <p className="ask-scope-note">
        ORBITEX answers questions about space and space studies only.
      </p>
    </main>
  );
}
