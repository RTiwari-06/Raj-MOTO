# Mobile Liveliness + Odometer Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the phone experience feel *alive* — ambient hero breathing, a scroll-reactive RidesSection, scroll-life on two flat sections, and a mechanical odometer set-piece — using only GPU-safe transforms/opacity + the existing 2D canvas, with no new WebGL.

**Architecture:** Pure UI/motion polish across five existing components plus one already-built helper (`RollingOdometer.jsx`) and one new CSS/SVG helper (`OdometerBackground.jsx`). No new architecture, no shaders, no new WebGL context — item 4 actually *removes* one (the `FluidBackground` Canvas in `StatRevealSection`). Every effect is `inView`-gated, transform/opacity/clip-only, and resolves to a static final state under reduced motion.

**Tech Stack:** React 19 · Vite 8 · Tailwind 4 · GSAP 3.15 + ScrollTrigger · Lenis · Zustand 5. Spec: `docs/superpowers/specs/2026-06-28-mobile-liveliness-odometer-design.md`.

## Global Constraints

- **No test framework exists** (`package.json` scripts: `dev`, `build`, `lint`, `preview`). Per-task verification cycle is: `npm run build` (must succeed) → `npm run lint` (no new errors) → `npm run dev` + manual mobile check (DevTools device emulation / coarse pointer) → commit. Do **not** add a test runner.
- **Leave the uncommitted flow-rework edits alone.** The working tree already has uncommitted ON-TRACK//OFF-TRACK edits (`DoctrineSection.jsx`, `Gallery.jsx`, `TheMachine.jsx`, `media.js`, `Home.jsx`). Each task below stages **only its own files** with explicit `git add <path>` — never `git add -A`/`git add .`.
- **Transforms + opacity (+ clip-path/SVG transform) only.** No animation that drives layout/reflow; no animated blend modes on strips; no `filter`/`backdrop` churn inside rAF loops.
- **No new WebGL context** (the app caps/recovers contexts, commit `6f1e0f9`). Item 4 removes one.
- **Demand-driven rAF that sleeps when settled**; every motion gated to `inView` via the existing `IntersectionObserver` / ScrollTrigger pattern — off-screen = paused.
- **`prefers-reduced-motion` / `.motion-off` → final state, no motion.** Detect with `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.
- **Mobile = coarse pointer**, detected with the existing `window.matchMedia('(pointer: coarse)')` pattern.
- **Restraint:** *expensive feel, not impressive effect.* No glitch/aberration/noise. Ambient motion is subtle — "alive, not busy."
- **Palette:** lime `#D2FF00`; KTM-orange `#FF6600` stays scoped to `TheMachine` / `DoctrineSection` only.
- **Do not touch:** `motion/system.js`, `utils/Lenis.jsx`, `shaders/*`, `HeroShaderMesh`/`HeroCanvas` logic, `FluidBackground` *logic* (item 4 only removes its *usage* in StatReveal), and Hero **desktop** internals.
- **Motion tokens come from `@/motion/system`** (`EASE`, `DUR`, `ST`, `STAGGER`) — never hard-code a duration/ease.
- **Design-heavy items (2 + 4)** should invoke the **frontend-design** skill at execution before finalizing visual values.

---

### Task 1: Mobile hero — ambient idle life (`MobileRevealCanvas`)

Today the mobile hero runs one auto-sweep, then `targetRadius` lerps to 0 and the reveal collapses to the static base photo — dead until touch/scroll. Add 2–3 always-present low-strength ambient blobs that drift on cheap sine paths so faint slivers of the rider keep breathing through, the mobile analog of the desktop shader's 4 curl-noise cells. Touch/scroll still dominate. The component is only mounted when `showMobile = motionEnabled && !reduceMotion && coarse` (see `Hero.jsx:42,182`), so **reduced motion already yields the static base photo** — no extra guard needed inside this file.

**Files:**
- Modify: `src/components/sections/MobileRevealCanvas.jsx`

**Interfaces:**
- Unchanged public surface: `MobileRevealCanvas({ inView })`. All changes are internal to the render loop.

- [ ] **Step 1: Add ambient config constants**

In `src/components/sections/MobileRevealCanvas.jsx`, immediately AFTER the `FOCAL` constant (line 34), add:

```js
// Ambient idle life — a few always-present, low-strength blobs that drift on
// cheap sine paths so faint slivers of the rider (MEDIA.hero.reveal) keep
// breathing through the base photo when nothing else is happening. The mobile
// analog of the desktop shader's autonomous curl-noise cells. Touch + scroll
// still dominate (they set larger radius/alpha); ambient is the resting state,
// replacing today's "radius→0, dead." Honors the dual-identity reveal: drift
// stays bound to exploring the rider's face, never decorative chaos.
const AMBIENT = [
  { bx: 0.42, by: 0.40, ax: 0.05, ay: 0.04, fx: 0.16, fy: 0.11, ph: 0.0 },
  { bx: 0.52, by: 0.52, ax: 0.06, ay: 0.05, fx: 0.11, fy: 0.15, ph: 2.1 },
  { bx: 0.38, by: 0.55, ax: 0.04, ay: 0.05, fx: 0.13, fy: 0.09, ph: 4.2 },
];
const R_AMBIENT = 0.085; // ambient blob radius (fraction of maxDim)
const A_AMBIENT = 0.16;  // ambient blob peak alpha
```

- [ ] **Step 2: Add a time accumulator to the reveal state**

In the draw effect, in the `// ── reveal state ──` block (after `let lastTs = 0;`, ~line 84), add:

```js
    let tSec = 0;            // seconds elapsed, drives ambient drift
```

- [ ] **Step 3: Draw ambient blobs inside the mask**

Replace the body of `draw` from the smoothstep line through the `drawBlob(cx, cy, r, 1);` call (currently lines 107–117) with:

```js
      // Scroll-driven expansion: blends the blob toward a frame-covering
      // circle centred on the rider as the hero exits.
      const sm = scrollMix * scrollMix * (3 - 2 * scrollMix); // smoothstep
      const coverR = maxDim() * 1.15;
      const cx = (pos.x + (FOCAL.x - pos.x) * sm) * width;
      const cy = (pos.y + (FOCAL.y - pos.y) * sm) * height;
      const r = Math.max(radius, coverR * sm);
      const hasMain = r >= 1;

      // ── mask ──
      ctx.save();

      // Ambient idle blobs — faded out as the scroll reveal takes over (sm→1).
      const ambientAlpha = A_AMBIENT * (1 - sm);
      if (ambientAlpha > 0.01) {
        const ar = R_AMBIENT * maxDim();
        for (const a of AMBIENT) {
          const axp = (a.bx + Math.sin(tSec * a.fx * Math.PI * 2 + a.ph) * a.ax) * width;
          const ayp = (a.by + Math.cos(tSec * a.fy * Math.PI * 2 + a.ph) * a.ay) * height;
          drawBlob(axp, ayp, ar, ambientAlpha);
        }
      }

      for (const t of trail) drawBlob(t.x * width, t.y * height, r * 0.55 * t.s, 0.85 * t.s);
      if (hasMain) drawBlob(cx, cy, r, 1);
```

This removes the old `if (r < 1) return;` early-return (line 112) — the composite now runs whenever the image is ready so ambient is always visible. The lime-rim block below already self-guards via `Math.min(1, radius / 40)`, so it contributes ~0 when the main blob is dead. Leave the rest of `draw` (the `source-in` composite, object-cover math, rim, `drawnScrollMix = scrollMix;`) unchanged.

- [ ] **Step 4: Advance the clock and keep the loop alive while on-screen**

In `render`, immediately after `lastTs = ts;` (line 158), add:

```js
      tSec += dt;
```

Then update the `settled` short-circuit (lines 190–197) so ambient keeps ticking while the hero is in view but the loop still fully sleeps once scrolled away. Replace the `const settled = ...` assignment with:

```js
      // Ambient keeps the loop ticking while the hero is on screen; once the
      // hero is essentially scrolled away (sm→1) there's nothing to breathe,
      // so we allow settling (and the inView teardown cancels the rAF anyway).
      const ambientActive = scrollMix < 0.999;
      const settled =
        !ambientActive &&
        (sweepT < 0 || sweepT >= 2 || userInteracted) &&
        !touching &&
        Math.abs(target.x - pos.x) < 0.002 &&
        Math.abs(target.y - pos.y) < 0.002 &&
        Math.abs(targetRadius - radius) < 0.5 &&
        trail.length === 0 &&
        Math.abs(scrollMix - drawnScrollMix) < 0.002;
```

(The effect's `[inView]` dependency already tears the whole loop down — `cancelAnimationFrame(rafId)` in cleanup — when the hero leaves the viewport, so "fully sleeps off-screen" is preserved.)

- [ ] **Step 5: Build** — `npm run build` → succeeds.
- [ ] **Step 6: Lint** — `npm run lint` → no new errors in `MobileRevealCanvas.jsx`.
- [ ] **Step 7: Dev check** — `npm run dev`, emulate a coarse-pointer phone. Verify: after the initial sweep the hero keeps faintly breathing (ambient slivers of the rider) instead of going dead; touch still swells the blob and dominates; scrolling the hero away expands the reveal then the loop stops (no runaway rAF — confirm in DevTools Performance that frames cease once the hero is off-screen).
- [ ] **Step 8: Commit**

```bash
git add src/components/sections/MobileRevealCanvas.jsx
git commit -m "feat(hero/mobile): ambient idle blobs so the 2D reveal breathes when idle"
```

---

### Task 2: The 20k clock → odometer / instrument (`StatRevealSection` + `OdometerBackground`)

Restyle `StatRevealSection`'s counter set-piece as a mechanical instrument cluster: rolling digit reels (`RollingOdometer`, already built) + a lime needle sweeping with the count on a CSS/SVG gauge, **removing the WebGL `FluidBackground`** from this section. Count-up logic (the `0 → 20000` tween) is preserved; only its `onUpdate` target and the surrounding chrome change. **Invoke the frontend-design skill** before finalizing gauge proportions/needle styling.

**Files:**
- Create: `src/components/ui/OdometerBackground.jsx`
- Modify: `src/components/sections/StatRevealSection.jsx`
- Uses (already present, untracked): `src/components/ui/RollingOdometer.jsx`

**Interfaces:**
- `RollingOdometer` (existing): default export, `forwardRef`, props `{ digits=5, comma=2, unit='KM', ariaValue='' }`, imperative handle `{ setValue(v) }`.
- `OdometerBackground` (new): default export, `forwardRef`, no props, imperative handle `{ setProgress(p) }` where `p` is `0..1`.

- [ ] **Step 1: Create `OdometerBackground.jsx`**

Create `src/components/ui/OdometerBackground.jsx`:

```jsx
import { forwardRef, useImperativeHandle, useRef } from 'react';

// CSS/SVG instrument cluster that sits BEHIND the odometer reels — a dark
// gauge-face vignette, faint concentric arcs + tick marks, and a thin lime
// needle that sweeps as the count climbs. Driven imperatively (setProgress
// 0..1) by the parent's GSAP counter so there are zero React re-renders per
// frame; the needle is a single SVG transform → cheap on mobile. No WebGL.
const SWEEP_DEG = 240;   // total needle travel
const START_DEG = -120;  // needle angle at progress 0
const TICKS = 41;        // tick marks across the sweep (every 5th is major)

const OdometerBackground = forwardRef(function OdometerBackground(_props, ref) {
  const needleRef = useRef(null);

  useImperativeHandle(ref, () => ({
    setProgress(p) {
      const clamped = Math.max(0, Math.min(1, p));
      const a = START_DEG + clamped * SWEEP_DEG;
      needleRef.current?.setAttribute('transform', `rotate(${a} 100 100)`);
    },
  }), []);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* instrument vignette */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 46%, rgba(22,22,22,0.9) 0%, #060606 58%, #000 100%)' }}
      />
      <svg
        viewBox="0 0 200 200"
        className="relative w-[130vw] max-w-[820px] aspect-square opacity-50"
        aria-hidden="true"
      >
        {/* concentric gauge arcs */}
        <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
        <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.4" />

        {/* tick marks */}
        {Array.from({ length: TICKS }).map((_, i) => {
          const aRad = ((START_DEG + (i / (TICKS - 1)) * SWEEP_DEG) * Math.PI) / 180;
          const major = i % 5 === 0;
          const r1 = 92;
          const r2 = major ? 82 : 87;
          const x1 = 100 + r1 * Math.sin(aRad);
          const y1 = 100 - r1 * Math.cos(aRad);
          const x2 = 100 + r2 * Math.sin(aRad);
          const y2 = 100 - r2 * Math.cos(aRad);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={major ? 'rgba(210,255,0,0.45)' : 'rgba(255,255,255,0.15)'}
              strokeWidth={major ? 1 : 0.5}
            />
          );
        })}

        {/* needle */}
        <g ref={needleRef} transform={`rotate(${START_DEG} 100 100)`}>
          <line
            x1="100" y1="100" x2="100" y2="18"
            stroke="#D2FF00" strokeWidth="1.4" strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 4px rgba(210,255,0,0.7))' }}
          />
          <circle cx="100" cy="100" r="3" fill="#D2FF00" />
        </g>
      </svg>
    </div>
  );
});

export default OdometerBackground;
```

- [ ] **Step 2: Build** — `npm run build` → succeeds (component compiles; not yet rendered).
- [ ] **Step 3: Lint** — `npm run lint` → no errors in `OdometerBackground.jsx`.
- [ ] **Step 4: Commit the helper**

```bash
git add src/components/ui/OdometerBackground.jsx
git commit -m "feat(ui): add OdometerBackground SVG gauge (CSS/SVG, no WebGL)"
```

- [ ] **Step 5: Rewire `StatRevealSection` — remove WebGL, wire the odometer**

In `src/components/sections/StatRevealSection.jsx`:

**5a.** Replace the import block (lines 1–8) with:

```jsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DUR, ST } from '@/motion/system';
import RollingOdometer from '@/components/ui/RollingOdometer';
import OdometerBackground from '@/components/ui/OdometerBackground';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

(This drops `useState`, `Suspense`, `Canvas`, `FluidBackground`, `attachContextRecovery`, `MEDIA`, and the `TECHNICAL`/`COARSE` constants — none are used after this rewrite. The technical-stack card already shows static copy, not `TECHNICAL`.)

**5b.** Replace the refs + the entire `inView`/`near` IntersectionObserver effect (lines 18–39) with:

```jsx
  const sectionRef   = useRef(null);
  const labelRef     = useRef(null);
  const subRef       = useRef(null);
  const counterRef   = useRef({ value: 0 });
  const odometerRef  = useRef(null);
  const gaugeRef     = useRef(null);
```

**5c.** Replace the count-up effect (lines 41–79) with a version that drives the reels + needle and honors reduced motion:

```jsx
  useEffect(() => {
    if (prefersReduced()) {
      odometerRef.current?.setValue(20000);
      gaugeRef.current?.setProgress(1);
      gsap.set([labelRef.current, subRef.current], { opacity: 1, yPercent: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: ST.start.late, once: true },
      });

      tl.to(counterRef.current, {
        value: 20000,
        duration: DUR.breath,
        ease: EASE.momentum,
        onUpdate: () => {
          const v = counterRef.current.value;
          odometerRef.current?.setValue(v);
          gaugeRef.current?.setProgress(v / 20000);
        },
      }, 0);

      tl.fromTo(labelRef.current,
        { yPercent: 60, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: DUR.considered, ease: EASE.momentum }, 0.2);

      tl.fromTo(subRef.current,
        { opacity: 0 },
        { opacity: 1, duration: DUR.standard, ease: EASE.momentum }, 0.9);
    }, sectionRef);

    return () => ctx.revert();
  }, []);
```

**5d.** In the counter-zone JSX, replace the WebGL background block (lines 90–105, the `<div className="absolute inset-0 z-0">…</div>` containing the `{near && <Canvas …>}`) with:

```jsx
        {/* Instrument-cluster background — CSS/SVG gauge, no WebGL */}
        <div className="absolute inset-0 z-0">
          <OdometerBackground ref={gaugeRef} />
        </div>
```

**5e.** Drop the now-redundant 75% scrim. Remove the line:

```jsx
        {/* Dark overlay */}
        <div className="absolute inset-0 z-10 bg-black/75" />
```

(The gauge already supplies its own dark vignette; keeping a 75% scrim would re-bury the instrument we just built. If the corner glyphs / text need more contrast, the gauge's `radial-gradient` is the place to tune it — adjust in Step 6 with the frontend-design skill, do not re-add a flat scrim.)

**5f.** Replace the big-number block (lines 139–148, the `<div className="overflow-hidden"><p ref={statRef} …>0</p></div>`) with the rolling reels:

```jsx
          {/* The massive stat — mechanical odometer reels */}
          <div className="overflow-hidden">
            <RollingOdometer ref={odometerRef} digits={5} comma={2} unit="KM" ariaValue="20,000 kilometers clocked" />
          </div>
```

- [ ] **Step 6: Build** — `npm run build` → succeeds, no "is not defined" (confirms the removed WebGL imports left no dangling refs).
- [ ] **Step 7: Lint** — `npm run lint` → no errors; no `no-unused-vars` for the removed imports.
- [ ] **Step 8: Dev check** — `npm run dev`. Scroll to THE LOG. Verify: the digits roll up `0 → 20,000` (each reel rotating, the 9→0 wrap rolling forward, comma placed as `20,000`), the lime needle sweeps in lockstep and lands at full at exactly `20,000` (digits and needle never disagree), the gauge reads as an instrument cluster (no flat black scrim), and **no WebGL context** is created by this section (DevTools → the page's live-context count drops by one vs. before). Emulate `prefers-reduced-motion: reduce`, reload: shows static `20,000` + needle at full, no roll, no console errors.
- [ ] **Step 9: Commit**

```bash
git add src/components/sections/StatRevealSection.jsx src/components/ui/RollingOdometer.jsx
git commit -m "feat(thelog): odometer reels + SVG gauge needle; remove WebGL fluid from StatReveal"
```

---

### Task 3: RidesSection — mobile parallax + telemetry-on-scroll + active emphasis

Today the mobile branch (`RidesSection.jsx:148–159`) only fades each slide in; the rich telemetry curtain is hover-only (CSS `.group:hover .ride-reveal` + Tailwind `group-hover:` on the inner copy), so touch users never see it. Bring desktop's content to the vertical mobile layout with transform/opacity/clip only — no horizontal scrub, no pin changes. **Invoke the frontend-design skill** before finalizing the mobile telemetry layout/timing. RidesSection is a pinned section on desktop; all new triggers live in the existing `gsap.context` and only run in the `!isDesktop` branch, so the desktop pin is untouched.

**Files:**
- Modify: `src/components/sections/RidesSection.jsx` (the `if (!isDesktop)` block, lines 148–159; the curtain markup, lines 338–379)

- [ ] **Step 1: Tag the telemetry copy so it can be scroll-driven on touch**

In the hover-curtain markup, add a shared `tele-item` class to the three currently hover-revealed children so the mobile branch can target them. Change the three elements (lines 350–359 region):

The `Telemetry // 0{i+1}` `<p>` className — add `tele-item`:
```jsx
                  <p
                    className="tele-item font-mono text-[8px] tracking-[0.4em] uppercase mb-5 transition-all duration-500 opacity-0 translate-y-2 group-hover:opacity-60 group-hover:translate-y-0 delay-100"
                    style={{ color: ride.accent || ACCENT }}
                  >
```
The tagline `<p>` className — add `tele-item`:
```jsx
                  <p className="tele-item font-serif italic text-white/90 text-base leading-snug mb-8 max-w-[32ch] transition-all duration-500 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 delay-200">
```
The specs `<div className="flex flex-col gap-1 …">` — add `tele-item`:
```jsx
                  <div className="tele-item flex flex-col gap-1 transition-all duration-500 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 delay-300">
```

(On desktop these stay hover-driven exactly as before — `group-hover:` is untouched. On touch, hover never fires, so GSAP in Step 2 sets their inline opacity/transform, which wins over the `opacity-0 translate-y-2` utilities.)

- [ ] **Step 2: Rewrite the mobile branch — parallax, telemetry-on-scroll, active emphasis, progress**

Replace the entire `// ── MOBILE: Vertical reveal ──` block (lines 147–159) with:

```jsx
      // ── MOBILE: scroll-reactive vertical experience ────────────────────────
      // Transform/opacity/clip only; no pin, no horizontal scrub. Mirrors the
      // desktop content (parallax, telemetry, active emphasis, progress) for touch.
      if (!isDesktop) {
        const reduced =
          typeof window !== 'undefined' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        slideRefs.current.forEach((slide, i) => {
          if (!slide) return;

          if (reduced) {
            // Resolve everything to its visible end state, no motion.
            gsap.set(slide, { y: 0, opacity: 1 });
            gsap.set(slide.querySelectorAll('.tele-item'), { opacity: 1, y: 0 });
            const curtainStatic = slide.querySelector('.ride-reveal');
            const edgeStatic = slide.querySelector('.ride-reveal-edge');
            if (curtainStatic) gsap.set(curtainStatic, { clipPath: 'inset(0 0 0 0)' });
            if (edgeStatic) gsap.set(edgeStatic, { left: 0, top: 0, opacity: 1 });
            if (dimRefs.current[i]) dimRefs.current[i].style.opacity = '0';
            return;
          }

          // Entrance fade (as before).
          gsap.fromTo(slide,
            { y: 50, opacity: 0 },
            {
              y: 0, opacity: 1, duration: DUR.considered, ease: EASE.momentum,
              scrollTrigger: { trigger: slide, start: ST.start.section, once: true },
            },
          );

          // Image parallax — the over-scaled wrapper drifts vertically as the
          // slide passes (mobile analog of desktop's xPercent drift).
          const wrap = imgWrapRefs.current[i];
          if (wrap) {
            gsap.fromTo(wrap,
              { yPercent: -6 },
              {
                yPercent: 6, ease: 'none',
                scrollTrigger: { trigger: slide, start: 'top bottom', end: 'bottom top', scrub: true },
              },
            );
          }

          // Telemetry-on-scroll — the hover curtain content reveals as the slide
          // centres, then retracts as it leaves. Clip-path opens the panel;
          // tele-items stagger in. play/reverse on enter/leave both edges.
          const curtain = slide.querySelector('.ride-reveal');
          const edge = slide.querySelector('.ride-reveal-edge');
          const items = slide.querySelectorAll('.tele-item');
          const tele = gsap.timeline({
            paused: true,
            defaults: { ease: EASE.precision },
          });
          if (curtain) tele.fromTo(curtain, { clipPath: 'inset(100% 0 0 100%)' }, { clipPath: 'inset(0 0 0 0)', duration: DUR.standard }, 0);
          if (edge) tele.fromTo(edge, { opacity: 0 }, { opacity: 1, duration: DUR.fast }, 0);
          if (items.length) tele.fromTo(items, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: DUR.standard, stagger: STAGGER.elements }, 0.1);
          ScrollTrigger.create({
            trigger: slide,
            start: 'top 60%',
            end: 'bottom 40%',
            onEnter: () => tele.play(),
            onLeave: () => tele.reverse(),
            onEnterBack: () => tele.play(),
            onLeaveBack: () => tele.reverse(),
          });

          // Active-slide emphasis — the centred slide is clear; off-centre dims.
          const dim = dimRefs.current[i];
          if (dim) {
            gsap.set(dim, { opacity: 0.55 });
            gsap.timeline({
              scrollTrigger: { trigger: slide, start: 'top bottom', end: 'bottom top', scrub: true },
            })
              .to(dim, { opacity: 0, ease: 'none' })
              .to(dim, { opacity: 0.55, ease: 'none' });
          }

          // Sticky mini progress — light the dash for the centred slide.
          ScrollTrigger.create({
            trigger: slide,
            start: 'top 55%',
            end: 'bottom 45%',
            onToggle: (self) => {
              const dot = dotRefs.current[i];
              if (!dot) return;
              gsap.to(dot, {
                opacity: self.isActive ? 1 : 0.25,
                scaleX: self.isActive ? 1.8 : 1,
                backgroundColor: self.isActive ? ACCENT : 'rgba(255,255,255,0.25)',
                duration: DUR.feedback, ease: EASE.hover,
              });
            },
          });
        });
      }
```

This adds `STAGGER` to the motion-token import. Update line 5:

```jsx
import { EASE, DUR, ST, STAGGER } from '@/motion/system';
```

- [ ] **Step 3: Build** — `npm run build` → succeeds.
- [ ] **Step 4: Lint** — `npm run lint` → no errors.
- [ ] **Step 5: Dev check** — `npm run dev`, coarse-pointer emulation, scroll the Rides beat. Verify: each slide's image drifts (parallax) as it passes; the telemetry panel (tagline + specs) wipes open as the slide centres and retracts as it leaves; off-centre slides dim while the centred one is clear; the top progress dash advances to track the centred slide. Then switch to a desktop viewport and confirm the **horizontal pinned scrub is unchanged** (pin, parallax, hover curtain, dim, dots all behave exactly as before — the desktop branch was not touched). Emulate reduced motion on mobile: every panel resolves to its visible end state, no parallax/scrub.
- [ ] **Step 6: Commit**

```bash
git add src/components/sections/RidesSection.jsx
git commit -m "feat(rides/mobile): parallax + telemetry-on-scroll + active emphasis + progress"
```

---

### Task 4: DoctrineSection — advance routes on scroll (touch)

The route-map dashboard is hover/auto-cycled on desktop and fully static on touch (auto-cycle is off for `COARSE`; only tap switches). Add a touch-only ScrollTrigger that advances the active route as the section scrolls past, so the dashboard animates as you ride through it. Tap-to-select still works (the scroll trigger only *sets* `active`, same state the tap uses).

**Files:**
- Modify: `src/components/sections/DoctrineSection.jsx` (imports line 7–11; add one effect after the off-screen-pause effect, ~line 176)

- [ ] **Step 1: Import ScrollTrigger**

Replace line 8:

```jsx
import { gsap } from 'gsap';
```

with:

```jsx
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
```

- [ ] **Step 2: Add the touch scroll-advance effect**

Immediately AFTER the off-screen-pause effect (the `useEffect` that ends at line 176 with `}, []);`), add:

```jsx
  // Touch: advance the active route as the section scrolls past — the dashboard
  // is otherwise static on touch (no hover, no auto-cycle). Transform/opacity
  // only (the [active] effects redraw the route). Off under reduced motion.
  useEffect(() => {
    if (!COARSE || prefersReduced()) return;
    const el = sectionRef.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      end: 'bottom 20%',
      onUpdate: (self) => {
        const i = Math.min(ROUTES.length - 1, Math.floor(self.progress * ROUTES.length));
        setActive((cur) => (cur === i ? cur : i));
      },
    });
    return () => st.kill();
  }, []);
```

- [ ] **Step 3: Build** — `npm run build` → succeeds.
- [ ] **Step 4: Lint** — `npm run lint` → no errors.
- [ ] **Step 5: Dev check** — `npm run dev`, coarse emulation, scroll through Doctrine (Turf). Verify the active route advances `01 → 02 → 03` as you scroll (route line re-traces, schedule highlight + elevation + detail update), and tapping a route still selects it. Desktop unchanged (effect is `COARSE`-gated). Reduced motion: no scroll-advance.
- [ ] **Step 6: Commit**

```bash
git add src/components/sections/DoctrineSection.jsx
git commit -m "feat(doctrine/mobile): advance active route on scroll for touch"
```

---

### Task 5: StorySection — active-beat emphasis on touch

Desktop emphasis (the text retreat at `:166`) is `!isCoarse` only, so on touch the timeline beats sit inert after their entrance fade. Bring centred-beat emphasis to mobile: as each `EVOLUTION_DATA` card centres, it scales up + brightens; off-centre cards dim. Single-column on mobile, so scaling a card is transform-only and causes no reflow.

**Files:**
- Modify: `src/components/sections/StorySection.jsx` (add `prefersReduced` helper; the card loop inside the `gsap.context` effect, lines 87–95)

- [ ] **Step 1: Add a reduced-motion helper**

After the imports (after line 9, `import SignatureDraw …`), add:

```jsx
const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

- [ ] **Step 2: Branch the card animation for coarse pointers**

Replace the `cardRefs.current.forEach(...)` block (lines 87–95) with:

```jsx
      const reduced = prefersReduced();

      cardRefs.current.forEach((el, i) => {
        if (!el) return;

        if (reduced) {
          gsap.set(el, { y: 0, opacity: 1, scale: 1 });
          return;
        }

        if (isCoarse) {
          // Centred timeline beat scales/brightens as you scroll; neighbours dim.
          gsap.timeline({
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
          })
            .fromTo(el, { scale: 0.95, opacity: 0.5 }, { scale: 1, opacity: 1, ease: 'none' })
            .to(el, { scale: 0.95, opacity: 0.5, ease: 'none' });
          return;
        }

        gsap.fromTo(el,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: DUR.standard, ease: EASE.precision, delay: i * STAGGER.elements,
            scrollTrigger: { trigger: el, start: ST.start.section, once: true },
          }
        );
      });
```

(`isCoarse` is already computed via `useMemo` at the top of the component. The coarse timeline's `fromTo` sets the card's inline opacity from the Tailwind `opacity-0` baseline, so the card still appears.)

- [ ] **Step 3: Build** — `npm run build` → succeeds.
- [ ] **Step 4: Lint** — `npm run lint` → no errors.
- [ ] **Step 5: Dev check** — `npm run dev`, coarse emulation, scroll The Path. Verify the centred timeline card scales up + brightens while neighbours dim, smoothly tracking scroll; desktop entrance stagger unchanged. Reduced motion: cards static and fully visible.
- [ ] **Step 6: Commit**

```bash
git add src/components/sections/StorySection.jsx
git commit -m "feat(story/mobile): centred-beat scale/emphasis on scroll for touch"
```

---

### Task 6 (optional stretch — the "3rd" section): IABridge thesis line-reveal

Spec lists IABridge as the *optional third* item-3 touch (Doctrine + Story already satisfy the "2–3 sections" success criterion). Adds a touch-only line-by-line reveal of the thesis as it scrolls in. Skip if you want to keep scope tight.

**Files:**
- Modify: `src/components/sections/IABridgeSection.jsx` (the body-copy effect, lines 39–49)

- [ ] **Step 1: Add a touch-only word/line reveal for the body copy**

The body copy (`bodyRef`) currently fades up once. On coarse pointers, replace that single fade with a scrubbed reveal so the thesis "types in" as you scroll. Replace the `gsap.fromTo(bodyRef.current, ...)` call (lines 39–49) with:

```jsx
      const isCoarse =
        typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
      const reduced =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduced) {
        gsap.set(bodyRef.current, { y: 0, opacity: 1 });
      } else if (isCoarse) {
        gsap.fromTo(bodyRef.current,
          { opacity: 0.15 },
          {
            opacity: 1, ease: 'none',
            scrollTrigger: { trigger: bodyRef.current, start: 'top 85%', end: 'top 45%', scrub: true },
          }
        );
      } else {
        gsap.fromTo(bodyRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: DUR.standard, ease: EASE.momentum, delay: 0.3,
            scrollTrigger: { trigger: bodyRef.current, start: ST.start.section, once: true },
          }
        );
      }
```

- [ ] **Step 2: Build** — `npm run build` → succeeds.
- [ ] **Step 3: Lint** — `npm run lint` → no errors.
- [ ] **Step 4: Dev check** — `npm run dev`, coarse emulation, scroll the Thesis. Body copy brightens from faint to full as it scrolls through; desktop fade-up unchanged; reduced motion shows it static.
- [ ] **Step 5: Commit**

```bash
git add src/components/sections/IABridgeSection.jsx
git commit -m "feat(thesis/mobile): scrubbed thesis reveal on scroll for touch"
```

---

### Task 7: Final integration verification

Whole-experience check before declaring done.

**Files:** none (verification only).

- [ ] **Step 1: Clean build + lint** — `npm run build` then `npm run lint` → both succeed, no errors.
- [ ] **Step 2: Mobile scroll-through** (`npm run dev`, coarse emulation). Verify all of:
  - [ ] Hero **breathes when idle** (faint ambient reveal); touch/scroll still dominate; fully paused once scrolled past (no runaway rAF in the Performance panel).
  - [ ] RidesSection shows parallax + telemetry-revealed-on-scroll + active-slide emphasis + tracking progress; **no pin regression on desktop**.
  - [ ] Doctrine advances routes on scroll; Story centred-beat emphasis tracks scroll (2–3 sections now lively; +IABridge if Task 6 done).
  - [ ] THE LOG reads as an **odometer/instrument**: rolling digits + needle sweeping with the count, on a CSS/SVG background; **no WebGL context** in that section (live-context count is one lower than before this work).
- [ ] **Step 3: Reduced-motion pass.** Emulate `prefers-reduced-motion: reduce`, reload, scroll the whole page. Every new effect resolves to a static final state (hero = static base photo; Rides panels visible; Doctrine/Story static; odometer at `20,000`, needle full). No console errors.
- [ ] **Step 4: Desktop regression pass.** Fine-pointer viewport: hero WebGL reveal, Rides pinned horizontal scrub, Doctrine hover/auto-cycle, Story hover retreat all behave exactly as before.
- [ ] **Step 5: Final commit (only if a checklist fix was needed)**

```bash
git add src/components/sections/MobileRevealCanvas.jsx src/components/sections/StatRevealSection.jsx src/components/sections/RidesSection.jsx src/components/sections/DoctrineSection.jsx src/components/sections/StorySection.jsx src/components/ui/OdometerBackground.jsx src/components/ui/RollingOdometer.jsx src/components/sections/IABridgeSection.jsx
git commit -m "fix(mobile): integration polish after liveliness + odometer rework"
```

---

## Self-Review

**Spec coverage:** §4 Item 1 (mobile hero ambient) → Task 1. §7 Item 4 (odometer + remove StatReveal WebGL) → Task 2 (incl. `OdometerBackground`, `RollingOdometer` wiring, needle/digit sync). §5 Item 2 (Rides mobile: parallax + telemetry-on-scroll + active emphasis + sticky progress) → Task 3. §6 Item 3 (2–3 flat sections: Doctrine + Story committed, IABridge optional) → Tasks 4, 5, 6. §3/§11 constraints (transform/opacity-only, inView-gated, no new WebGL, reduced-motion final state, lime palette, no shader/Lenis/system edits) → Global Constraints + honored per task. §11 success criteria → Task 7 checklist. The §5 `scroll-snap` alternative is intentionally omitted (spec marks it optional, "only if it cooperates with Lenis").

**Placeholder scan:** No TBD/TODO; every code step shows exact content; verification steps give exact commands + expected observations. (No unit tests — project has no runner; verification is build/lint/manual per Global Constraints.)

**Type/name consistency:** `OdometerBackground` exposes `setProgress(p)` (Task 2 Step 1), called as `gaugeRef.current?.setProgress(v / 20000)` (Task 2 Step 5c). `RollingOdometer` exposes `setValue(v)` (existing file), called as `odometerRef.current?.setValue(v)`. The `.tele-item` class is added in Task 3 Step 1 before being queried in Step 2. `STAGGER` is added to the `@/motion/system` import in both Task 3 (RidesSection) and is already imported in StorySection. `prefersReduced`/`COARSE`/`isCoarse` use the existing project matchMedia patterns. `ROUTES`, `setActive`, `sectionRef` referenced in Task 4 all pre-exist in DoctrineSection.
