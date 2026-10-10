// Mount once in the authenticated shell. Reports uncaught client errors to the
// admin inbox (rate-limited). Does not capture extension noise from other origins.
import { useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { reportClientError } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/use-auth";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 4;

export function ErrorReporter() {
  const { user } = useAuth();
  const reportFn = useServerFn(reportClientError);
  const times = useRef<number[]>([]);

  useEffect(() => {
    if (!user) return;

    const allowed = () => {
      const now = Date.now();
      times.current = times.current.filter((t) => now - t < WINDOW_MS);
      if (times.current.length >= MAX_PER_WINDOW) return false;
      times.current.push(now);
      return true;
    };

    const send = (source: string, message: string, detail?: string) => {
      if (!allowed()) return;
      const path = typeof window !== "undefined" ? window.location.pathname : undefined;
      void reportFn({
        data: {
          source,
          message: message.slice(0, 500),
          path,
          detail: detail?.slice(0, 1500),
        },
      }).catch(() => {
        /* never break the page for logging */
      });
    };

    const onError = (event: ErrorEvent) => {
      const msg = event.message || "Unhandled error";
      if (/ResizeObserver|Script error\.?$/i.test(msg)) return;
      const detail = event.error instanceof Error ? event.error.stack : undefined;
      send("client", msg, detail);
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const msg =
        reason instanceof Error
          ? reason.message
          : typeof reason === "string"
            ? reason
            : "Unhandled promise rejection";
      const detail = reason instanceof Error ? reason.stack : undefined;
      send("client", msg, detail);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [user, reportFn]);

  return null;
}
