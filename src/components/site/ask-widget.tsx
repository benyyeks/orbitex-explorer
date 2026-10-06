// Floating Ask ORBITEX widget, bottom right on every page except the Ask page.
// One continuing conversation follows the user across pages (its id is kept
// in localStorage and the thread lives in their saved chats). Opening the Ask
// page archives it: the thread stays in saved chats and the widget starts over.
import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useAskHistory, type AskMsg } from "@/lib/ask-history";
import { AnswerText } from "@/components/site/answer-text";

const KEY = "orbitex-widget-conversation";

function errorCopy(status: number): string {
  if (status === 429) return "ORBITEX is answering many questions right now. Please try again in a moment.";
  if (status === 401) return "Your session has expired. Sign in again to continue.";
  if (status === 402 || status === 503) return "Ask ORBITEX is paused right now. Please try again later.";
  return "The answer link failed. Check your connection and try again.";
}

export function AskWidget() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const history = useAskHistory();
  const [open, setOpen] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AskMsg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const onAsk = path.startsWith("/ask");

  // Restore the continuing thread once signed in.
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(KEY);
    if (saved) {
      setConvId(saved);
      void history.loadMessages(saved).then((m) => {
        if (m.length) setMessages(m);
        else localStorage.removeItem(KEY);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Visiting the Ask page archives the widget chat into saved chats.
  useEffect(() => {
    if (!onAsk) return;
    abortRef.current?.abort();
    localStorage.removeItem(KEY);
    setConvId(null);
    setMessages([]);
    setOpen(false);
  }, [onAsk]);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  if (onAsk) return null;

  const send = async () => {
    const content = input.trim();
    if (!content || streaming) return;
    const thread = [...messages, { role: "user" as const, content }];
    setMessages([...thread, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setStreaming(true);
    let id = convId;
    if (!id) {
      id = await history.createConversation(content, "chat");
      if (id) {
        setConvId(id);
        localStorage.setItem(KEY, id);
      }
    }
    if (id) await history.appendMessage(id, { role: "user", content });
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ mode: "chat", messages: thread.slice(-20), conversationId: id }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error(errorCopy(res.status));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const snap = acc;
        setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: snap }]);
      }
      if (!acc.trim()) {
        setMessages((prev) => prev.slice(0, -1));
        setError("No answer came back. Please try again.");
      }
    } catch (err) {
      setMessages((prev) => {
        const last = prev.at(-1);
        return last?.role === "assistant" && !last.content ? prev.slice(0, -1) : prev;
      });
      if ((err as Error).name !== "AbortError") setError((err as Error).message);
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const newChat = () => {
    if (streaming) return;
    localStorage.removeItem(KEY);
    setConvId(null);
    setMessages([]);
    setError(null);
  };

  return (
    <div className="ask-widget">
      {open && (
        <div className="ask-widget-panel" role="dialog" aria-label="Ask ORBITEX">
          <div className="ask-widget-head">
            <div>
              <strong>Ask ORBITEX</strong>
              <span>Live data and web sources</span>
            </div>
            <div className="ask-widget-actions">
              {user && messages.length > 0 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={newChat}>
                  New
                </button>
              )}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setOpen(false)}
                aria-label="Close Ask ORBITEX"
              >
                Close
              </button>
            </div>
          </div>
          {!user ? (
            <div className="ask-widget-empty">
              <p>Sign in to ask ORBITEX about missions, satellites and space weather.</p>
              <Link to="/auth" className="btn btn-primary btn-sm">
                Sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="ask-widget-thread" ref={threadRef}>
                {messages.length === 0 && (
                  <p className="ask-widget-hint">
                    Ask anything about space. This chat follows you across pages and is saved
                    to your chats.
                  </p>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`ask-widget-msg ask-widget-${m.role}`}>
                    {m.role === "assistant" ? (
                      m.content ? <AnswerText text={m.content} /> : <span className="live-dot" aria-label="Thinking" />
                    ) : (
                      m.content
                    )}
                  </div>
                ))}
                {error && <p className="ask-widget-error" role="alert">{error}</p>}
              </div>
              <form
                className="ask-widget-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void send();
                }}
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  placeholder="Ask about a mission, satellite or event"
                  rows={2}
                  aria-label="Your question"
                />
                {streaming ? (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => abortRef.current?.abort()}>
                    Stop
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary btn-sm" disabled={!input.trim()}>
                    Send
                  </button>
                )}
              </form>
            </>
          )}
        </div>
      )}
      <button
        type="button"
        className="ask-widget-fab"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close Ask ORBITEX" : "Open Ask ORBITEX"}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-25 12 12)" />
          <circle cx="12" cy="12" r="2.4" fill="currentColor" />
        </svg>
        <span>Ask ORBITEX</span>
      </button>
    </div>
  );
}
