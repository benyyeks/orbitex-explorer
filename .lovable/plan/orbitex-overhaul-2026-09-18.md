# ORBITEX overhaul

Delivered fix-first: Phase 1 repairs everything that is currently broken or misleading, then Phases 2 to 4 add the new features. Each phase ends with a check-in so you can review before I continue.

## Phase 1 - Fix what is broken

**Look and feel**

- Remove the manual light/dark switch. The app follows the visitor's device setting automatically.
- Light mode gets deep-blue accent panels behind the hero, stat strips, footer and key cards so it stops reading as plain white.
- Desktop dropdown menus get a frosted blur backdrop so the text always stands out.

**Accounts and messages**

- Turn on confirmation emails properly so sign-up messages arrive.
- Feedback and suggestions get emailed straight to [noreplyobitex@gmail.com](mailto:noreplyobitex@gmail.com), with a confirmation shown in the form. No admin dashboard needed.

**Home page**

- Rewrite the About section as a real story about why ORBITEX exists and who it serves.
- Weekly reports render properly, with no stray `##` marks.
- Article feed pulls from several trusted space newsrooms, not NASA alone, and only shows pieces from the last 30 days.
- The 2D planetary map draws true elliptical orbits instead of perfect circles.

**Launch Schedule**

- Countdown no longer sticks on "Awaiting updated data". At zero it reads LIFTOFF, then shows the result: in flight, success or failure.

**Academy**

- My Reading List correctly loads your saved textbooks for each user, so a shared list never says "0 textbooks selected"

**Deep Space and Orbit Tracker**

- Time controls start at the real current moment, with a "Reset to now" button.
- Fix the position data so Webb and Roman no longer sit on top of each other.
- The first view zooms out to show everything, with a reset-view button.
- On phones or small screens the control buttons move below the globe instead of covering it.
- The 2D flight path inside an object's detail view updates correctly.

**Mars**

- Stop overwriting the daily images and repair the Curiosity feed so photos return again.
- Creates a gallery section of past images free mars with proper filter and time& date stamps. 
- Then user clicks on the mars images, they should open on full page to properly view the image instead of redirecting to the NASA page. 
- Remove the marse page from the actual menu bar and headers and footer but the page should be accessd when the user clicks on mars from the deep space page, but is should remain in the home Page.

## Phase 2 - Data pipeline and speed

- Every outside data source is fetched by the backend on a schedule and stored in your own database(supabase). The pages read only from there(the supabase and is update a instantly), so no visitor ever waits on a slow third-party service.
- Refresh rates for the database: positions and telemetry continuously, Mars and space weather each hour, launch streams from one hour before liftoff, directories and reference data once a day.

## Phase 3 - Assistant and profiles

- Creat a custom avatarspecifically for the Orbitex AI.
- A floating assistant button in the bottom-right corner(of the Orbitex avatar), on every page, keeping one running conversation as you move around.
- It can search the live web alongside its own reference data, so it stops describing launched spacecraft as still being built.
- Opening the dedicated Ask ORBITEX page files the floating chat away into history and starts a clean study workspace each visit.
- Profile pictures:  choose from a set of space-themed avatars I will create, with both male and female options plus neutral ones.
- Your exact location pinned on the 2D and 3D maps as a reference point, at the best accuracy your device reports.
- All user should filling their names age range, gender and pick an avatar after sign up 

## Phase 4 - Depth and new sections

**Mission Intelligence**

- A properly styled A to Z directory of global missions with filters for status, target, discipline and agency, and More Details linking to the official agency page.
- The Mission Breakdown section moves here out of the Research Library.

**Academy**

- STEM programmes expanded with ESA, JAXA and other international agencies.
- Citizen Science stops being its own section and appears in context on the pages it relates to the most and more context and /content should be added to it.
- The old competitions or closed competition board is replaced by a card grid of aerospace and aviation competitions and hackathons, with images, descriptions, deadlines and sign-up links.
- The terminology dictionary grows to cover aviation as well as spaceflight.

**Tracker and probes**

- Comparison moves out of the 3D view into its own panel below the map, up to five objects, across different orbit types, all paths drawn together.
- Mars imagery gets a calendar gallery so you can open any past date full screen.
- A 3D view for asteroid and near-Earth close approaches, plus aurora and night-sky event tracking.
- Retired and lost probes join the main list with fuller history, while staying out of the live 3D view.

## Technical notes

- Theme: delete `ThemeToggle` and the stored-override path in `src/lib/theme.ts`; keep a single CSS `prefers-color-scheme` driven token set in `src/styles.css`. Add light-mode accent surface tokens and apply them to hero/panel classes. Add `backdrop-filter` to the header dropdown surfaces.
- Email: enable Cloud email auth plus confirmation; feedback posts to a server function that sends to the admin address through the platform email sender, keeping the existing `feedback` table insert as the record.
- Caching: extend `src/lib/api-cache.server.ts` TTL usage into a scheduled refresher under `src/routes/api/public/*` (pattern already used by `refresh-news.tsx`), one endpoint per tier, driven by database cron. Page loaders read cached rows only.
- Tracker: clock state seeded from `Date.now()`; Webb/Roman positions corrected in `src/lib/satellite.ts` anchors; camera fit distance raised on first mount; controls container moved out of the canvas wrapper under a mobile breakpoint.
- Launch countdown: replace the fallback branch with an explicit post-T0 state machine reading LL2 status ids.
- Reading list: shared-list fetch goes through the existing security-definer functions with the owner's rows, fixing the empty count.
- Assistant widget: persistent component in `__root.tsx` using the existing `/api/ask` route with a web-search tool added; the `/ask` page archives the widget thread and opens a new conversation row.
- Avatars: generated preset images in `src/assets`, uploads into a Cloud storage bucket, reference stored on a new `profiles` row.