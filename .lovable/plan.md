# Ask ORBITEX: saved conversations per account

Make Ask ORBITEX remember conversations for signed-in users, sync them across devices, and let you delete them.

## What you get

- A conversation sidebar on the Ask page listing your saved chats, newest first, with an auto-generated title from your first question.
- Every question and answer stored to your account as it completes, so reopening the page on another device shows the same threads.
- Follow-up context preserved per conversation: reopening a chat restores the full message history the assistant sees.
- "New chat" to start a fresh thread, rename a chat, delete a single chat, and clear all chats (with a confirm step).
- Signed out, the page keeps working exactly as it does today (session-only, nothing stored), with a short note that signing in saves history.

## Build steps

1. Database migration: two tables scoped to the signed-in user.
   - `ask_conversations`: `id`, `user_id`, `title`, `mode`, `created_at`, `updated_at` (with the existing updated-at trigger).
   - `ask_messages`: `id`, `conversation_id` (cascade delete), `user_id`, `role` (`user`/`assistant`), `content`, `created_at`.
   - GRANTs for `authenticated` and `service_role` only (no `anon`), RLS on, policies scoped to `auth.uid() = user_id`. Content length caps so a single message cannot be oversized.
2. `src/lib/ask-history.ts`: hook for listing conversations, loading one thread, creating a conversation, appending messages, renaming, deleting one, and clearing all. Uses the browser Supabase client under RLS.
3. `src/routes/ask.tsx`: add the conversation sidebar and controls; on send, create the conversation if needed, persist the user message, and persist the assistant reply once streaming finishes (partial answers from Stop are saved as-is). Mode selection is remembered per conversation.
4. `src/styles.css`: sidebar, list rows, and delete/confirm affordances in the existing glass-card style.
5. `src/routes/privacy.tsx`: one line noting that assistant conversations are stored on your account and can be deleted.
6. Verify with a browser pass: send a question, reload, confirm the thread restores, delete it, confirm it is gone.

## Technical notes

- No change to `/api/ask`; it stays stateless and the browser sends the thread it already holds. Storage happens client-side under RLS, so the assistant endpoint never gains database access.
- Message writes are per-turn (user message immediately, assistant message on completion) to avoid losing a thread if the tab closes mid-answer.
- History is capped to the last 20 messages when sent upstream, matching current behaviour.
