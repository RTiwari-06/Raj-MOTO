# Immersive Helmet — Cinematic Rebuild (Spec)

**Date:** 2026-05-31
**Branch:** feat/cinematic-motion
**Section:** `src/components/sections/HelmetSection.jsx` (the `#gear` pinned section)
**Asset:** `public/helmet.glb` (Khronos DamagedHelmet, externalized → `helmet_data.bin` + `helmet_img0..4.jpg`: baseColor / metallicRoughness / emissive / occlusion / normal)

## Goal

Turn the existing pinned 360° helmet spin into a **cinematic "gear-check boot sequence"** — a scroll-scrubbed instrument startup where the camera choreographs around the helmet while a telemetry HUD ("counter effects") boots, scans, calibrates, ignites, and locks in. Production-grade, distinctive, on-brand (lime `#D2FF00` on near-black, Saira display, JetBrains mono telemetry).

## Constraints (hard)

- **No new npm dependency.** Cinematic look via R3F camera choreography + lighting + DOM/CSS post-FX overlays driven by the existing GSAP→`scrollState` bridge. (EffectComposer bloom is an explicit non-goal for this pass.)
- **Preserve the architecture:** pinned + `scrub` ScrollTrigger over `+=300%`; GSAP writes a plain `scrollState` object, R3F reads it in `useFrame` — **zero React re-renders per frame**.
- Do NOT touch `motion/system.js`, Lenis, shaders/*, Hero/FluidBackground logic.
- Respect `useUIStore.motionEnabled` and `prefers-reduced-motion`: degrade to a static, low-motion presentation (no scanline sweep, no aberration, reduced float).
- Must not regress scroll/pin behavior elsewhere on the page.

## Narrative (scroll 0 → 1, pinned)

| Range      | Beat            | Camera                              | HUD / counter effects                                              |
|------------|-----------------|-------------------------------------|-------------------------------------------------------------------|
| 0.00–0.12  | POWER ON        | far dolly-in, helmet dark           | boot lines type/scramble in; degree `000°`; grid + scanline wake  |
| 0.12–0.40  | SYSTEMS SCAN    | slow orbit L→R, mid distance        | live scan-% , 360° degree counter, horizontal scan bar sweeps helmet, rider identity readout (`MEDIA.helmet.rider`) |
| 0.40–0.66  | CALIBRATION     | push toward visor, slight tilt      | machine spec telemetry table reveals (`MEDIA.helmet.machine.specs`), coordinate ticks, crosshair lock |
| 0.66–0.85  | IGNITION        | pull back, hero framing             | accent light lerps grey→lime + intensity ramp; lime bloom radial wash; philosophy quote; aberration peak |
| 0.85–1.00  | READY TO RACE   | settle to hero 3/4 view             | finale seal `READY TO RACE` / `360° INSPECTION VERIFIED`; progress bar full |

## Architecture / units

1. **`scrollState`** (module-scope plain object) — extended fields: `progress`, `scanMix`, `accentMix`, `igniteMix`. GSAP timeline writes; R3F + a rAF DOM-FX driver read. Single source of truth for the frame loop.
2. **`HelmetModel`** (R3F) — loads GLB, centers/scales (unchanged math). `useFrame`: subtle idle float + small rotation; reads `scrollState` for emissive/rim accent. Lights: key + cool fill + lime accent point light (intensity/colour driven by `accentMix`/`igniteMix`) + rim.
3. **`CameraRig`** (R3F, new) — a `useFrame` component that drives `camera.position`/`lookAt` along the choreography keyframes from `scrollState.progress` (eased segments). Replaces "spin the object 360°" as the primary motion; the degree counter is retained as telemetry.
4. **`HelmetFX`** (DOM overlay, new sub-block) — vignette, `.grain-layer`, animated scanline sweep, chromatic-aberration edge tint, lime bloom radial washes. A small rAF loop (or GSAP-driven CSS vars) reads `scrollState` and sets CSS custom properties; **no React state** in the loop. Gated off under `.motion-off` / reduced-motion.
5. **`HelmetHUD`** (DOM, refactor of current phase blocks) — boot lines, scan-%, degree counter, coordinate ticks, spec telemetry table, philosophy, finale seal. Each beat is a ref-addressed block animated by the existing GSAP timeline (opacity/transform), same pattern as today.
6. **`HelmetSection`** — composes Canvas (`HelmetModel` + `CameraRig` + Environment) + `HelmetFX` + `HelmetHUD`; owns the single pinned ScrollTrigger timeline and the cleanup that resets `scrollState`.

## Data flow

`Lenis scroll → ScrollTrigger(scrub, pin) → GSAP timeline → scrollState (+ degreeRef/progressRef textContent/transform) → [useFrame: camera + model + lights] and [rAF: CSS vars on FX overlays]`. React renders the static DOM once; all motion is imperative.

## Error / edge handling

- GLB load: `<Suspense fallback={null}>` retained; section bg + HUD chrome render regardless so there's no empty flash.
- Reduced motion / motion-off: camera snaps to hero framing, no scanline/aberration/float; HUD shows final state.
- Cleanup: `gsap.context(...).revert()` + reset `scrollState` fields on unmount (as today) to avoid stale pin state on route changes.
- Mobile: smaller helmet scale via camera distance; aberration/scanline reduced; pin retained (works today).

## Success criteria

- Scrolling the `#gear` section plays a continuous, scrubbable boot→scan→calibrate→ignite→ready cinematic with camera movement, telemetry counters, and lime ignition — no jank, no dropped pin.
- `npm run build` passes; no new dependency added.
- Motion toggle / reduced-motion produces a tasteful static state.
- No regression to neighbouring sections' scroll/pin.

## Out of scope

EffectComposer/true bloom & DOF, drag-to-orbit interactivity, hotspot callouts, swapping the GLB model. (Candidate follow-ups.)
