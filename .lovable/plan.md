# Fix: Intermittent "Use my location" failures

## Diagnosis (confirmed from code)

The location lookup lives in `src/lib/location.ts` (`requestDeviceLocation`), used by the tracker, with a second, divergent copy in `src/routes/sky.tsx`. Three concrete causes for the "sometimes works, sometimes fails" behavior:

1. **Single attempt with a 10-second timeout.** On desktops and laptops there is no GPS; the position comes from the OS/browser network-location service. The first fix after a browser start, a network change, or waking from sleep routinely takes longer than 10 seconds. The request then dies with a TIMEOUT error and the UI shows failure. Moments later the provider has a cached fix, so the next click succeeds. This is exactly the intermittent pattern reported.
2. **No automatic retry.** A slow or temporarily unavailable position response is surfaced to the user immediately instead of being retried with different settings.
3. **Two divergent implementations.** `src/routes/sky.tsx` duplicates the geolocation logic with different (terser) error text and does not share the saved-location store, so behavior and messaging differ between pages.

A fourth, environmental factor: when the site is viewed embedded in a cross-origin preview frame, some browsers deny geolocation to the frame entirely. The same site opened directly or on its own domain behaves differently, which adds to the "sometimes" confusion. Verification will cover both contexts.

## Changes

### 1. Harden `src/lib/location.ts`
- Two-stage lookup inside `requestDeviceLocation`:
  - Attempt 1: `enableHighAccuracy: false`, `timeout: 12000`, `maximumAge: 600000` (fast, accepts a recent cached fix).
  - On timeout or position-unavailable only: one automatic retry with `enableHighAccuracy: true`, `timeout: 20000`, `maximumAge: 0` before showing any error.
- Pre-check with `navigator.permissions.query({ name: "geolocation" })` where supported: if already denied, skip the hopeless request and show the manual-entry guidance immediately.
- In-flight guard so rapid clicks never stack concurrent requests.
- Distinct, professional messages per failure type (access declined / position unavailable / timed out), each pointing to the manual coordinate entry fallback. No infrastructure or browser internals in the copy.

### 2. Unify Sky Tonight onto the shared hook
- Replace the duplicated `getCurrentPosition` block in `src/routes/sky.tsx` with `useObserverLocation`, keeping Greenwich as the default until a fix arrives. Sky Tonight gains the retry logic, saved location, and consistent error messaging for free.

### 3. Verification (Playwright)
- Success path: grant geolocation and set a fixed position in the browser context; confirm both `/tracker` and `/sky` resolve and display it.
- Denied path: deny permission; confirm the professional error and manual fallback appear.
- Slow-path: assert the retry logic fires (simulate via delayed geolocation) and no premature error renders.

## Out of scope
- No changes to pass-prediction math or the tracker UI beyond what the shared hook already renders.
