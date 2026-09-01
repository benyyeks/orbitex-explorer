# ORBITEX: sign-in gate, assistant hardening, formatting, page merge

Five changes, built in this order.

## 1. Sign-in required for everything except the landing page

Public routes (no sign-in): landing page, sign-in page, shared reading-list links, privacy.
Everything else requires an account: Orbit Tracker (and object detail pages), Deep Space (and object detail pages), Sky Tonight, Mars, Space Weather, Asteroid Watch, Launches, Research Library, Mission Intelligence, Learning Resources, Ask ORBITEX, About & Sources.

Behaviour:
- A signed-out visitor who opens or refreshes a protected page is sent to the sign-in page, and after signing in lands back on the page they asked for.
- The landing page becomes the shopfront: navigation shows only public links when signed out, and the section links present themselves as a preview with a clear "Sign in to open" prompt rather than dead ends.
- Old links keep working: every current address stays the same, only the gate is added.

## 2. Assistant security: no injection, no account data

- The assistant has no path to user accounts or credentials. Its server endpoint reads no user tables, receives no session data beyond confirming the caller is signed in, and never runs database queries assembled from a message.
- Instruction-injection defence: every message is treated as untrusted content. The assistant is told that text inside a question can never change its rules, and attempts to extract its instructions, request account data, ask for database or system commands, or claim staff authority are refused with a short professional line.
- Hard refusals for: account details, emails, passwords, other users' saved lists or notes, database or command execution, and anything outside space subjects.
- Input limits stay strict (message count, length, allowed roles), plus a per-account rate limit so the endpoint cannot be hammered.
- Sign-in page hardening: field length caps, normalised email input, no error text that reveals whether an account exists, and no message content ever passed into a query.

## 3. Fix assistant answer formatting

Answers currently render as raw text, so Markdown syntax leaks into the page (the `**Satellite Operations**` and `*` bullets in your screenshot). Fix:
- Render answers through a small, safe formatter that turns bold, italics, headings, numbered and bulleted lists, tables, inline code, code blocks, and links into real elements. No raw HTML from the model is ever inserted.
- Styling matches the site: Lora headings, Inter body, mono for figures and code.
- The assistant is also instructed to keep formatting simple and consistent, so long answers read as clean sections rather than dense blocks.

## 4. Merge Engineering Notes into Learning Resources

- One page at Learning Resources, reorganised into clear top-level sections: Orbital regimes and mechanics, Spacecraft engineering explainers, Textbook shelf and reading list, Courses and open courseware, STEM programs, Citizen science, Student competitions.
- The engineering content is folded in without duplication; overlapping items are merged into one entry.
- A jump menu at the top navigates the sections, and the old Engineering address redirects to the merged page so existing links and bookmarks still work.
- Navigation drops the separate Engineering entry.

## 5. Give the assistant the whole site as knowledge

- A compiled site briefing (page purposes, mission profiles, engineering explainers, orbital-regime reference, catalog structure, textbook shelf, sources) is supplied with every answer, so questions like "how many people are on the ISS" get answered directly instead of being redirected.
- Live feeds already grounded (ISS position, Kp index, next launch) are widened to include station crew count, current space weather summary, next launches, and near-Earth object activity.
- Nothing user-specific is in that briefing: no accounts, no saved lists, no notes, no location.
- For fast-changing values the answer states the reading, its time, and then points to the matching page for the newest update, instead of pointing to a page in place of an answer.

## Technical notes

- Protected routes move under a pathless `_authenticated` layout (integration-managed gate, `ssr: false`, redirect to `/auth`); public routes stay at top level. The landing page keeps SSR and its metadata.
- `src/routes/api/ask.tsx` gains bearer verification, per-account rate limiting, a layered system prompt with an untrusted-content wrapper, and the expanded briefing/live-context builder in a new server-only knowledge module. It keeps using the Lovable AI gateway with no key in the browser.
- New `src/components/site/answer-text.tsx` implements the Markdown-subset renderer (element construction only, no `dangerouslySetInnerHTML`).
- `src/routes/engineering.tsx` becomes a redirect route; its content moves into sections on `src/routes/resources.tsx`; nav list updated in `src/components/site/site-header.tsx`.
- No database schema change is needed for this section.
