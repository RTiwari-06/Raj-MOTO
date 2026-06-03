# Rides Curtain-Wipe Spec Reveal — Design

**Date:** 2026-06-02
**Branch:** feat/cinematic-motion
**File(s):** `src/components/sections/RidesSection.jsx`, `src/index.css`

## Goal

On hover of a ride slide (desktop), reveal that ride's `tagline` + `specs`
table via a curtain that wipes in **diagonally from the bottom-right corner**
(rightward and upward at once), with a lime leading edge that ties into the
existing "THE SCAN" motif.

## Behavior

- Each slide is already a Tailwind `group`. Add a reveal panel anchored to the
  slide's **bottom-right corner**, sitting above (`z-20`) the existing GSAP
  arrow/odometer block (`z-10`) so it covers that corner when shown.
- **Hidden state:** `clip-path: inset(100% 0 0 100%)` (collapsed to the
  bottom-right corner → nothing visible).
- **Hover state (`group-hover`):** `clip-path: inset(0 0 0 0)` → the panel
  grows diagonally toward the top-left. Transition on `clip-path` (~700ms) +
  `opacity`.
- A **2px lime bar** on the panel's left edge reads as the leading scan edge as
  the wipe sweeps.
- Panel content (from existing `media.js` fields, no data changes):
  - `tagline` — small italic serif line.
  - `specs[]` — instrument rows: mono label · `.lead-dots` leader · mono value.
- Panel is `pointer-events-none` (purely visual; doesn't block the cursor or the
  bottom-left "View Ride" button).
- Existing image `scale(1.03)` and arrow nudge on hover stay.

## Constraints honored

- **No new GSAP / ScrollTrigger** — pure CSS hover, so it cannot conflict with
  the pinned horizontal `containerAnimation`. Existing `specRef`/`nameRef`
  GSAP instances are untouched (panel sits on top, never mutates their refs).
- **Reduced motion:** `.motion-off .ride-reveal { transition: none; }` plus a
  `@media (prefers-reduced-motion: reduce)` guard — reveal is instant, no wipe.
- **Mobile:** vertical-stack slides unchanged (no hover; specs not shown there,
  as today).
- Scope limited to JSX markup + Tailwind/inline classes in `RidesSection.jsx`
  and one small CSS utility (`.ride-reveal`) in `index.css`.

## Out of scope

- No changes to `media.js`, motion system, shaders, or any GSAP instance.
- Mobile spec display.
