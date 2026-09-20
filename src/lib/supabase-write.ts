// Fire-and-forget helper for account writes made from the browser.
//
// A Supabase query builder is lazy: the request is only sent when the builder
// is awaited or its then() is called. Discarding one with `void` therefore
// silently drops the write, which is how saved reading lists, favorites and
// observer locations could appear to save on screen and be missing on the next
// visit. Every such write now goes through this helper, which starts the
// request and reports a failure instead of losing it quietly.
export function runWrite(
  query: PromiseLike<{ error: { message: string } | null }>,
  what: string
): void {
  Promise.resolve(query)
    .then(({ error }) => {
      if (error) console.error(`${what} could not be saved: ${error.message}`);
    })
    .catch((err) => {
      console.error(`${what} could not be saved:`, err);
    });
}
