# Mobile Liveliness + Odometer Polish — Design

**Date:** 2026-06-28
**Scope:** Mobile motion across key beats + the `StatRevealSection` counter; touches `MobileRevealCanvas`, `RidesSection`, `StatRevealSection`, and 2–3 flat sections.
**Type:** UI/motion polish (no new architecture, no new WebGL, no shader work).
**Status:** Approved direction — ready for implementation plan.

---

## 1. Problem

On phones the site reads as **frozen**. The cause is largely deliberate — a documented mobile-perf doctrine (coarse-pointer fallbacks, pause off-screen, transform-only loops) and a "restraint" ethos strip motion on touch devices. Four concrete faults:

1. **Hero dies after one sweep.** `MobileRevealCanvas` runs its auto-sweep once, then the blob radius lerps to 0 — the reveal collapses to the static base photo until the user touches or scrolls. Desktop (`HeroShaderMesh`) keeps **4 autonomous curl-noise fluid cells flowing continuously**, so it is alive when idle. Mobile lacks that ambient life.
2. **RidesSection is flat on mobile.** Desktop is a pinned horizontal cinematic scrub (parallax, active-slide dim/emphasis, hover "telemetry curtain"). Mobile (`RidesSection.jsx:148–159`) only fades each slide in (`y:50→0, opacity:0→1`); the rich telemetry curtain is **hover-only**, so touch users never see it.
3. **Other beats sit static** on mobile with no scroll-reactive life.
4. **The 20k clock is muted.** `StatRevealSection` ("THE LOG") already counts `0 → 20,000` ("KILOMETERS CLOCKED", `:51–61`), but its live WebGL `FluidBackground` sits under a **75% black scrim**, so the whole set-piece reads flat and the WebGL spend is wasted.

## 2. Decisions (locked with the user)

- **Motion appetite — "Lively but cheap-only."** Add life using **only GPU-safe transforms/opacity + the existing 2D canvas**; pause off-screen; fully honor the mobile-perf doctrine. No horizontal Rides scrub on mobile, no new WebGL contexts, no new shaders.
- **Scope — "Key beats + light touches."** Polish the three named items (mobile hero, RidesSection, the clock) + add cheap scroll-life to **2–3** of the flattest remaining sections. One coherent spec.
- **Clock direction — "Odometer / instrument."** Restyle the counter as a mechanical odometer (rolling tabular digit reels, gauge ticks, dark instrument-cluster background), **pure CSS/2D — removing the WebGL fluid from this section.**

## 3. Global constraints (carried from project doctrine)

- **Transforms + opacity only.** No animation that drives layout/reflow; no animated blend modes on strips; no `filter`/`backdrop` churn in loops.
- **No new WebGL context** (the app caps/recovers contexts). Item 4 *removes* one.
- **Demand-driven rAF that sleeps when settled**, and every motion is gated to `inView` via the existing `IntersectionObserver` pattern — off-screen = paused.
- **`prefers-reduced-motion` / `.motion-off` → final state, no motion.**
- **Restraint:** *expensive feel, not impressive effect.* No glitch/aberration/noise. Ambient motion is subtle ("alive, not busy").
- **Palette:** lime `#D2FF00`; KTM-orange stays scoped to Machine/Doctrine.
- **Do not touch:** `motion/system.js`, `utils/Lenis.jsx`, `shaders/*`, `HeroShaderMesh` logic, `FluidBackground` *logic* (item 4 removes its *usage* in StatReveal only), and Hero **desktop** internals.
- **Mobile = coarse pointer**, detected with the existing `window.matchMedia('(pointer: coarse)')` pattern.

## 4. Item 1 — Mobile hero: ambient idle life

Bring the desktop's autonomous-flow feel to the existing 2D canvas without three.js.

- Add **2–3 autonomous ambient blobs** to `MobileRevealCanvas`'s draw loop — the mobile analog of desktop's 4 curl-noise cells. Each drifts on a cheap sine/value-noise path at **low radius + low alpha**, so faint slivers of the rider (`MEDIA.hero.reveal`) keep breathing through the base photo.
- Reuse the existing `drawBlob` + `source-in` composite; ambient points are just additional always-present low-strength contributors composited alongside the existing sweep/touch/scroll blobs.
- **Touch and scroll still dominate** when active (they set larger radius/alpha); ambient is the resting state, replacing today's "radius→0, dead."
- The rAF loop now stays alive **while the hero is `inView`** (the existing `inView` gate already pauses it off-screen). The `settled` short-circuit is relaxed so ambient keeps ticking on-screen, but the loop still fully sleeps when the hero scrolls away.
- **Reduced motion:** no ambient — static base photo (current behavior).

**Interface:** `MobileRevealCanvas` keeps its `{ inView }` prop and public behavior; change is internal to the render loop. **Alternative considered:** a periodic re-sweep every ~10s (sleeps between, cheaper, less alive) — rejected in favor of continuous drift for closer desktop parity. Honors `[[rtmoto-hero-dual-identity]]` and `[[rtmoto-reveal-random-meaningful]]` (drift explores the rider, never decorative chaos).

## 5. Item 2 — RidesSection mobile polish

Elevate the vertical mobile experience to carry the desktop content, transform/opacity only. (Implementation uses the **frontend-design** skill.)

- **Per-slide image parallax.** Reuse the existing over-scaled wrapper (`imgWrapRefs`, `-inset-[8%]`); drift `yPercent` on scroll via `ScrollTrigger` scrub as each slide passes — the mobile analog of desktop's `xPercent` drift. Transform-only.
- **Telemetry-on-scroll.** The hover-curtain content (tagline + specs, `:338–379`) is dead on touch. On mobile, reveal it on scroll: as a slide centers, its telemetry panel animates in (opacity/translate), then out as it leaves. Same data, scroll-triggered instead of hover.
- **Active-slide emphasis.** Port the desktop dim idea (`dimRefs`): centered slide clear, neighbors dimmed via an opacity overlay (no transform of layout).
- **Sticky mini progress.** A small `01 / 04` index + the existing dash row (`dotRefs`) made useful on mobile, tracking the centered slide as you scroll.
- **Reduced motion:** all panels resolve to their visible end state; no parallax.

**Alternative considered:** CSS `scroll-snap` so each slide snaps to viewport (more paced) — optional, can layer onto the above; left out of the core to avoid fighting Lenis smooth-scroll unless testing shows it helps.

## 6. Item 3 — Light touches on the flattest sections

Add cheap scroll-life to **2–3** sections that currently have no scroll-reactive motion on mobile. Committed picks, to be confirmed by a per-section mobile-motion audit at plan time (swap a pick if it turns out already lively):

- **DoctrineSection (Turf).** Route map is hover-to-trace on desktop and static on touch. Touch: **advance the active route on scroll** (or reveal route details on scroll), so the dashboard animates as you pass.
- **StorySection (The Path).** Already has scroll-reveal *entrance* (`:79,:88`), but its **active-beat emphasis** (`translateX/scale`, `:166`) is desktop-only (`!isCoarse`). Touch: bring that emphasis to mobile — the centered timeline beat scales/highlights as you scroll.
- **Optional third — IABridge (Thesis).** Line-by-line reveal of the thesis copy on scroll.

"Flat" criterion: little or no scroll-reactive *interaction* on mobile today — a section may already fade in on entrance yet still sit inert as you scroll through it. All touches are transform/opacity, `inView`-gated, reduced-motion safe.

## 7. Item 4 — The 20k clock: odometer / instrument

Restyle `StatRevealSection`'s counter set-piece; **count-up logic (`:51–61`) is unchanged.** (Implementation uses the **frontend-design** skill.)

- **Remove the WebGL `FluidBackground`** from this section (`:92–105`) and replace with a **CSS/SVG instrument cluster**: a dark gauge-face vignette, faint concentric gauge arcs + tick marks, and a thin lime **needle that sweeps with the count** — the `0 → 20,000` progress maps to the needle arc and (optionally) drives the existing `onUpdate`.
- **Rolling digit reels.** Restyle the big number (`statRef`, `:142`) as mechanical odometer reels — each digit in a fixed-width slot with a subtle `translateY` roll as it ticks; tabular/mono tracking.
- **Chrome.** Keep the corner glyphs; add gauge/unit readout chrome and the "KILOMETERS CLOCKED" label in the instrument idiom. Lime accent only.
- **Reduced motion:** show final `20,000` + static gauge (needle at full), no roll.
- **Side benefit:** removing this WebGL context eases the app's context cap (`6f1e0f9`), helping the pinned sections.

`FluidBackground.jsx` stays in the repo (logic untouched); it is not used elsewhere, so removing its StatReveal usage breaks nothing.

## 8. Implementation surface

- `src/components/sections/MobileRevealCanvas.jsx` — ambient blobs in the render loop (item 1).
- `src/components/sections/RidesSection.jsx` — mobile parallax, telemetry-on-scroll, active emphasis, sticky progress (item 2).
- `src/components/sections/StatRevealSection.jsx` — remove `FluidBackground` usage; odometer background + rolling reels (item 4).
- `src/components/sections/DoctrineSection.jsx`, `src/components/sections/StorySection.jsx` (+ optionally `IABridgeSection.jsx`) — scroll-life touches (item 3).
- New (item 4): a small `OdometerBackground` (CSS/SVG gauge) and/or `RollingNumber` helper, colocated under `src/components/ui/` if reused, else inline in StatReveal.

## 9. Risks

- **rAF staying alive on the hero (item 1).** Mitigated: gated to `inView`, few blobs, trivial math; fully sleeps off-screen.
- **Telemetry-on-scroll vs. pins (item 2).** RidesSection is a pinned section; new scroll triggers must respect the existing `invalidateOnRefresh`/refresh flow. Use the section's own GSAP context; re-test pin behavior.
- **scroll-snap vs. Lenis (item 2 alt).** Only adopt snap if it cooperates with smooth-scroll.
- **Odometer needle accuracy (item 4).** Needle must track the same `counterRef` progress as the digits so they never disagree.
- **Reduced-motion coverage.** Every new effect needs its static end-state path.

## 10. Out of scope

- Horizontal Rides scrub on mobile; any "max parity" desktop mirroring.
- New shaders / WebGL / signature effects.
- Hero **desktop** internals; `HeroShaderMesh`; `motion/system.js`.
- Per-section gold-plating beyond the 2–3 item-3 touches.
- Desktop redesign of any section (these are mobile + the clock).

## 11. Success criteria

- Mobile hero **breathes when idle** (faint ambient reveal), with touch/scroll still dominant; off-screen it's fully paused.
- RidesSection on mobile shows **parallax + telemetry revealed on scroll** + active-slide emphasis; no pin regression.
- 2–3 previously-static sections gain tasteful scroll-life on mobile.
- The 20k clock reads as an **odometer/instrument**: rolling digits + a needle sweeping with the count, on a CSS/2D background; **no WebGL context** in that section.
- `npm run build` + `npm run lint` clean; `prefers-reduced-motion` resolves every effect to a static state; nothing janks or lurches on a real phone.

## Reference

- Project memory: `[[rtmoto-mobile-perf]]`, `[[rtmoto-design-restraint]]`, `[[rtmoto-hero-dual-identity]]`, `[[rtmoto-reveal-random-meaningful]]`.
- Desktop reference for item 1: `src/components/webgl/HeroShaderMesh.jsx` (autonomous curl-noise cells).
