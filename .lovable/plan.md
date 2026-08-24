# Reading Wishlist and Book Covers for the Textbook Shelf

## Overview

Extend the Learning Resources page (`/resources`) so every textbook on the shelf shows its real cover, and readers can save books to a personal wishlist stored in the browser, then share that list with a link or export it as a file. No accounts needed, mirroring how satellite favorites already work on the tracker.

## What changes

### 1. Shelf data becomes structured

- Replace the hardcoded JSX lists in `src/routes/resources.tsx` with a `BOOKS` data array: `id, title, authors, note, topic, isbn13`.
- Six topics stay exactly as they are; only the rendering changes.
- ISBN-13 for each of the 17 books is verified during the build (publisher catalogs and Open Library records), not guessed.

### 2. Real book covers

- Covers load from the Open Library Covers API (`covers.openlibrary.org/b/isbn/{isbn13}-M.jpg`): free, no key, hotlinking allowed, and it covers these standard academic titles.
- Each cover renders through the existing `SkeletonImage` component: shimmer while loading, neutral placeholder tile if a cover does not exist. No layout shift.
- Cover frame is a fixed size (about 56 x 84 px) to the left of each title, aligned like a real shelf row.

### 3. Personal wishlist

- New module `src/lib/wishlist.ts` following the `favorites.ts` pattern:
  - Stored in `localStorage` under `orbitex:wishlist`, capped at 30 entries.
  - `useWishlist()` hook with `toggle`, `importMany`, `isSaved`.
- Every book row gets a "Save" / "Saved" toggle button with `aria-pressed` and a clear label.
- A "My reading list" card sits directly above the shelf:
  - Lists saved books with cover thumbnails and remove buttons.
  - Empty state explains how saving works, in plain language.
  - "Copy share link" builds a URL like `/resources?list=id1,id2,...` and copies it to the clipboard.
  - "Export list" downloads a small JSON file; the same card accepts an import file, matching the satellite favorites export format.

### 4. Shared lists open cleanly

- Opening a `/resources?list=...` link shows a "Shared reading list" banner with those books and a "Save to my list" button that merges them into the visitor's own wishlist.
- Unknown or malformed ids are ignored; the page never errors on a bad link.

### 5. Styling

- New CSS in `src/styles.css`: `book-row` (cover + text + button layout), `book-cover` frame, wishlist card bits. Semantic color tokens only, warm-paper theme consistent, mobile stacks the row.

## Technical notes

- Files touched: `src/routes/resources.tsx`, `src/styles.css`, new `src/lib/wishlist.ts`. No new routes, no nav changes, no database changes.
- All cover URLs use `https`, `loading="lazy"` via SkeletonImage, `referrerPolicy="no-referrer"`.
- Share-link ids are the short internal book ids (e.g. `vallado-fundamentals`), not ISBNs, so links stay short and stable.

## Verification

- HEAD-request each Open Library cover URL during the build; any missing cover gets its ISBN corrected or falls back to the neutral tile.
- Playwright on `/resources`: shelf renders with covers, save toggle persists across reload, share link round-trips into the shared-list banner, export/import file works, no console errors.
- No em dashes in any new copy; professional tone throughout.
