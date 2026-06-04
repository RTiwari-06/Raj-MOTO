# Hero Narrative Experience (Direction 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the RT•MOTO hero from a framed "technical dashboard" into a full-bleed, atmospheric narrative experience where the gear→self reveal is the emotional core — using only subtraction, composition, light, scale, and timing.

**Architecture:** Keep every existing system (the `HeroShaderMesh` reveal shader, `FluidBackground`, `useStore`, `useParallax`, the motion token system). No new effects, no new uniforms, no rebuilds. The shader already computes object-fit `cover`, so the canvas simply sizes to the viewport. Premium feel comes from a "darkness-envelope" composition: the lit subject sits in the sharp focal center while CSS vignette/scrim layers run black to the viewport edges — which simultaneously hides the temporary assets' low resolution, edge artifacts, and the `reveal.jpg` watermark.

**Tech Stack:** React 18, @react-three/fiber, GSAP + ScrollTrigger, Tailwind, GLSL, Zustand. Tokens from `src/motion/system.js` and CSS vars in `src/index.css`.

---

## Constraints (from the user — do not violate)

- **Subtraction first.** Remove garnish; do not add decorative elements or effects.
- **Reuse existing systems.** No new shader uniforms, no new stores, no new animation mechanisms.
- **Future-proof assets.** Hero must read paths from `src/data/media.js` (`MEDIA.hero.primary` / `.reveal`) only. Swapping in higher-res files later must require **zero** structural change.
- **Honor reduced motion.** New CSS layers must respect the existing `.motion-off` pattern; `.grain-layer` already does.

## Asset reality (validated — Priority 1 complete)

- `public/base.jpg` 1024×768, `public/reveal.jpg` 1195×896, both 4:3, dark night backgrounds. Duality confirmed: casual self (face) ↔ armored lime-accented rider.
- **Watermark:** `reveal.jpg` has a "Genspark" mark bottom-right → **buried** by `.hero-scrim-bottom` (Task 2). No image edit required now; a future clean asset drops in via `media.js`.
- **Misalignment:** base/reveal are not pixel-registered → the reveal **must stay a soft dissolve** (the existing soft lens). Priority 7 amplifies it via timing/scale/atmosphere only — never a harder edge.

## Priority → Task coverage map

| User priority | Task |
|---|---|
| 1 Asset & crop validation | Done above (pre-plan) + Task 0 guards |
| 2 Environmental composition | Task 1 |
| 3 Atmospheric darkness | Task 2 |
| 4 Subject-focused lighting | Task 2 (vignette focal pool) |
| 5 Typography hierarchy | Task 3 |
| 6 Removal of HUD noise | Task 1 (folded into the rewrite) |
| 7 Cinematic pacing | Task 4 |
| 8 Reveal as emotional storytelling | Task 5 |
| Verification across breakpoints / motion-off | Task 6 |

## File map

- **Modify** `src/components/sections/Hero.jsx` — full `return` rewrite (Task 1), typography (Task 3), entrance timeline (Task 4), reveal narrative effects (Task 5). This is the only JSX file touched.
- **Modify** `src/index.css` — append a scoped `/* HERO — Direction 3 */` block of composition/light utilities (Task 2).
- **Unchanged (intentionally):** `HeroShaderMesh.jsx`, `heroFragment.glsl`, `FluidBackground.jsx`, `useStore.js`, `media.js`, `motion/system.js`. The asset-swap path lives in `media.js` and stays as-is.

---

## Task 0: Branch + safety net

**Files:** none (git only)

- [ ] **Step 1: Branch off main** (we are on the default branch)

```bash
git checkout -b feat/hero-narrative
```

- [ ] **Step 2: Confirm baseline builds**

Run: `npm run build`
Expected: `✓ built` with no errors.

- [ ] **Step 3: Confirm asset paths are indirected through media.js**

Run: `rg "base.jpg|reveal.jpg" src` 
Expected: matches ONLY in `src/data/media.js` (the future-proof swap point). If any component hard-codes the path, stop and fix that first.

---

## Task 1: Environmental composition + HUD removal (Priorities 2 & 6)

Full-bleed the subject, delete all garnish, scaffold the new three-layer composition. Entrance motion is intentionally deferred to Task 4 — here elements are simply visible and correctly placed.

**Files:**
- Modify: `src/components/sections/Hero.jsx` (replace entire file)

- [ ] **Step 1: Replace `Hero.jsx` with the new composition**

Removed vs. the old hero: the 16:9 frame, rounded corners, `shadow-2xl`, all 8 corner registration marks, the squiggle SVG signature, the vertical "ENGAGE THROTTLE" text, the redundant 19px name, the top-right scramble HUD, and the `runScramble` import/usage.

```jsx
import React, { useEffect, useRef, Suspense, useState } from 'react';
import { gsap } from 'gsap';
import { Canvas } from '@react-three/fiber';
import { HeroShaderMesh } from '@/components/webgl/HeroShaderMesh';
import { FluidBackground } from '@/components/webgl/FluidBackground';
import { useStore } from '@/store/useStore';
import { EASE, DUR, SCROLL } from '@/motion/system';
import { useParallax } from '@/hooks/useParallax';

const Hero = ({ isLoaded = true }) => {
  const containerRef   = useRef(null);
  const canvasWrapRef  = useRef(null);
  const uiLayerRef     = useRef(null);
  const nameRef        = useRef(null);
  const line1Ref       = useRef(null);
  const line2Ref       = useRef(null);
  const kickerRef      = useRef(null);
  const ctaRef         = useRef(null);
  const scrollCueRef   = useRef(null);
  const atmosphereRef  = useRef(null);

  const setHovering       = useStore((s) => s.setHovering);
  const setImageMouse     = useStore((s) => s.setImageMouse);
  const setImageHovering  = useStore((s) => s.setImageHovering);

  // 60fps gate — pause the render loop when the hero is off-screen.
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  // Subtle DOM parallax on the UI layer only (the subject's depth comes from the
  // shader's internal parallax, so the full-bleed canvas never shifts and never
  // exposes an edge).
  useParallax(containerRef, 10);

  // Scroll exit — the composition lifts away; the subject recedes into the dark.
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top', end: 'bottom top',
          scrub: SCROLL.SCENE, invalidateOnRefresh: true,
        },
      });
      if (nameRef.current)    tl.to(nameRef.current,    { yPercent: -14, opacity: 0, ease: EASE.scrub }, 0);
      if (uiLayerRef.current) tl.to(uiLayerRef.current, { yPercent: -8,  opacity: 0, ease: EASE.scrub }, 0);
      if (canvasWrapRef.current) tl.to(canvasWrapRef.current, { scale: 1.04, opacity: 0.55, ease: EASE.scrub }, 0);
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden"
      onMouseEnter={() => { setHovering(true); setImageHovering(true); }}
      onMouseLeave={() => { setHovering(false); setImageHovering(false); }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setImageMouse((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
      }}
    >
      {/* ── LAYER 1: full-bleed WebGL subject (z-0) ─────────────────────────── */}
      <div ref={canvasWrapRef} className="absolute inset-0 z-0" style={{ willChange: 'transform, opacity' }}>
        <Canvas
          camera={{ position: [0, 0, 3], fov: 45, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          frameloop={inView ? 'always' : 'demand'}
        >
          <Suspense fallback={null}>
            <FluidBackground />
            <HeroShaderMesh />
          </Suspense>
        </Canvas>
      </div>

      {/* ── LAYER 2: atmosphere — darkness, vignette, scrims, grain (z-10) ───── */}
      <div ref={atmosphereRef} className="absolute inset-0 z-10 pointer-events-none">
        <div className="hero-vignette    absolute inset-0" />
        <div className="hero-scrim-bottom absolute inset-x-0 bottom-0 h-[55%]" />
        <div className="hero-scrim-left   absolute inset-y-0 left-0 w-[55%]" />
        <div className="hero-scrim-top    absolute inset-x-0 top-0 h-[22%]" />
        <div className="grain-layer" />
      </div>

      {/* ── LAYER 3: UI / typography (z-20) ─────────────────────────────────── */}
      <div
        ref={uiLayerRef}
        data-depth="-0.12"
        className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between px-8 md:px-16 py-8 md:py-12"
      >
        {/* top: single quiet credit */}
        <div className="flex items-start justify-between pt-10">
          <span className="font-mono text-[9px] tracking-[0.35em] uppercase" style={{ color: 'var(--color-accent)', opacity: 0.4 }}>
            Bengaluru · 2026
          </span>
        </div>

        {/* center-left: NAME MONUMENT (final treatment set in Task 3) */}
        <div ref={nameRef} className="absolute left-8 md:left-16 top-1/2 -translate-y-1/2 max-w-[70vw]">
          <div className="overflow-hidden">
            <span ref={line1Ref} className="block font-serif font-black uppercase text-white"
                  style={{ fontSize: 'clamp(3.5rem, 12vw, 13rem)', lineHeight: 0.84, letterSpacing: '-0.04em' }}>
              RAJ
            </span>
          </div>
          <div className="overflow-hidden">
            <span ref={line2Ref} className="block font-serif font-black uppercase text-white"
                  style={{ fontSize: 'clamp(3.5rem, 12vw, 13rem)', lineHeight: 0.84, letterSpacing: '-0.04em' }}>
              TIWARI
            </span>
          </div>
        </div>

        {/* bottom: kicker + CTA (left) · scroll cue (right) */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-6">
            <div ref={kickerRef}>
              <p className="font-mono text-[10px] tracking-[0.4em] uppercase" style={{ color: 'var(--color-accent)', opacity: 0.7 }}>
                Motion / Engineer
              </p>
              <p className="font-sans text-[12px] leading-relaxed text-white/45 mt-3 max-w-[26ch]">
                High-performance web interfaces, engineered in motion.
              </p>
            </div>
            <div ref={ctaRef} className="pointer-events-auto">
              <a href="#rides" data-magnetic="cta"
                 className="group btn-rt relative inline-flex items-center gap-3 px-7 py-3 text-[10px] font-black tracking-[0.35em] uppercase text-white border border-[#D2FF00]"
                 style={{ borderRadius: '1px' }}>
                ENGAGE
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </a>
            </div>
          </div>

          <div ref={scrollCueRef} className="hidden md:flex flex-col items-center gap-2">
            <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-white/20">scroll</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `✓ built`, no errors, no unused-import warnings for `runScramble`/`ScrollTrigger` (both removed from this file).

- [ ] **Step 3: Visual check**

Run: `npm run dev`, open http://localhost:5173.
Expected: the rider image fills the entire viewport (no frame/box/shadow/corner ticks); the name reads on the left; one credit top-left; kicker + ENGAGE bottom-left; thin scroll cue bottom-right. Atmosphere divs are present but inert (unstyled until Task 2).

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Hero.jsx
git commit -m "feat(hero): full-bleed environmental composition, strip HUD garnish"
```

---

## Task 2: Atmospheric darkness + subject-focused lighting (Priorities 3 & 4)

Give the inert atmosphere divs their light. The vignette's transparent center is the "light pool" on the subject; the scrims darken edges, seat the type, and bury the watermark.

**Files:**
- Modify: `src/index.css` (append at end of file)

- [ ] **Step 1: Append the hero atmosphere utilities**

```css
/* ── HERO — Direction 3 atmosphere (darkness-envelope) ─────────────────────── */
/* Vignette: a soft light pool sits on the subject (centre-right, slightly high);
   darkness deepens to the viewport edges → focus without any added effect. */
.hero-vignette {
  background: radial-gradient(ellipse 78% 72% at 60% 45%,
    transparent 0%, transparent 36%,
    rgba(0, 0, 0, 0.45) 72%, rgba(0, 0, 0, 0.92) 100%);
}
/* Bottom scrim — seats the kicker/CTA AND buries the reveal.jpg watermark. */
.hero-scrim-bottom {
  background: linear-gradient(to top,
    #000 0%, rgba(0, 0, 0, 0.85) 18%, rgba(0, 0, 0, 0) 100%);
}
/* Left scrim — anchors the name monument over dark negative space. */
.hero-scrim-left {
  background: linear-gradient(to right,
    rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.30) 45%, transparent 70%);
}
/* Top scrim — blends into the navbar, calms top metadata. */
.hero-scrim-top {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `✓ built`, CSS bundle size ticks up slightly.

- [ ] **Step 3: Visual check (the make-or-break moment)**

Reload http://localhost:5173.
Expected: the scene now reads cinematic — edges fall into black, light pools on the rider, the left name sits in darkness, and the bottom-right "Genspark" watermark is no longer visible under the scrim. If the watermark peeks, raise the `18%` stop in `.hero-scrim-bottom` toward `24%`.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat(hero): darkness-envelope atmosphere — vignette, scrims, focal light pool"
```

---

## Task 3: Typography hierarchy — one focal monument (Priority 5)

Resolve the old conflict (invisible giant name + tiny real name) into a single confident statement: `RAJ` filled, `TIWARI` outlined — an editorial contrast that has presence without becoming a flat block over the photo.

**Files:**
- Modify: `src/components/sections/Hero.jsx` (the two name `<span>`s + the kicker copy line)

- [ ] **Step 1: Make `TIWARI` an outline to contrast the filled `RAJ`**

Replace the `line2Ref` span from Task 1 with:

```jsx
          <div className="overflow-hidden">
            <span ref={line2Ref} className="block font-serif font-black uppercase"
                  style={{ fontSize: 'clamp(3.5rem, 12vw, 13rem)', lineHeight: 0.84, letterSpacing: '-0.04em',
                           color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.85)' }}>
              TIWARI
            </span>
          </div>
```

- [ ] **Step 2: Replace the spec-y descriptor with one evocative duality line**

Replace the kicker's `<p className="font-sans ...">` text with:

```jsx
              <p className="font-sans text-[12px] leading-relaxed text-white/45 mt-3 max-w-[26ch]">
                Same rider, two machines — the web and the road.
              </p>
```

- [ ] **Step 3: Build + visual check**

Run: `npm run build` (expect `✓ built`). Reload and confirm: one unmistakable focal name (filled `RAJ` over outlined `TIWARI`), no competing second name anywhere, the descriptor now tells the duality story. Tune `clamp()` max if `TIWARI` overflows on very wide screens (drop `13rem` → `11rem`).

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Hero.jsx
git commit -m "feat(hero): single typographic monument (filled RAJ / outline TIWARI) + duality line"
```

---

## Task 4: Cinematic entrance pacing (Priority 6)

Replace the techy scramble entrance with a paced, editorial arrival: darkness → subject rises from black → atmosphere settles → the name clips up line-by-line → kicker/CTA → scroll cue. All timing from motion tokens (also fixes the old hard-coded durations).

**Files:**
- Modify: `src/components/sections/Hero.jsx` (add `setFluidIntensity` selector + an entrance `useEffect`; add initial hidden inline styles)

- [ ] **Step 1: Add the fluid setter selector**

Below the existing `setImageHovering` selector, add:

```jsx
  const setFluidIntensity = useStore((s) => s.setFluidIntensity);
```

- [ ] **Step 2: Set entrance start-states inline** so there is no flash before GSAP runs.

Add `style={{ opacity: 0 }}` to the `atmosphereRef` div, the `kickerRef` div, and the `scrollCueRef` div; add `style={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}` to the `ctaRef` div. (The name spans start hidden via the `overflow-hidden` masks + the `yPercent` set in Step 3, so no inline style needed there.)

- [ ] **Step 3: Add the entrance timeline `useEffect`** (place after the `useParallax` call)

```jsx
  // ─── CINEMATIC ENTRANCE — paced arrival, no scramble ───────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    const intensity = { value: 0 };
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      // Background breathes up over the whole arrival.
      tl.to(intensity, { value: 0.85, duration: DUR.epic, ease: EASE.authority,
        onUpdate: () => setFluidIntensity(intensity.value) }, 0);

      // Subject rises out of black.
      tl.fromTo(canvasWrapRef.current, { opacity: 0, scale: 1.06 },
        { opacity: 1, scale: 1, duration: DUR.cinematic, ease: EASE.precision }, 0.1);

      // Atmosphere settles in.
      tl.fromTo(atmosphereRef.current, { opacity: 0 },
        { opacity: 1, duration: DUR.cinematic, ease: EASE.precision }, 0.3);

      // Name monument clips up, line by line.
      tl.fromTo([line1Ref.current, line2Ref.current], { yPercent: 115 },
        { yPercent: 0, duration: DUR.considered, ease: EASE.precision, stagger: 0.12 }, '>-0.3');

      // Kicker, then CTA wipe, then scroll cue.
      tl.fromTo(kickerRef.current, { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: DUR.standard, ease: EASE.precision }, '>-0.1');
      tl.fromTo(ctaRef.current, { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: DUR.standard, ease: EASE.precision }, '<0.12');
      tl.to(scrollCueRef.current, { opacity: 1, duration: DUR.standard, ease: EASE.precision }, '<0.1');

      // Fluid settles to its resting intensity.
      tl.to(intensity, { value: 0.8, duration: DUR.standard, ease: EASE.hover,
        onUpdate: () => setFluidIntensity(intensity.value) });
    }, containerRef);
    return () => ctx.revert();
  }, [isLoaded, setFluidIntensity]);
```

- [ ] **Step 4: Build + visual check**

Run: `npm run build` (expect `✓ built`). Hard-reload: the hero should now *arrive* — black, then the rider emerges, atmosphere blooms, the name clips up with weight, supporting elements follow. No character-scramble anywhere.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Hero.jsx
git commit -m "feat(hero): cinematic token-based entrance, retire scramble"
```

---

## Task 5: Reveal as the emotional moment (Priority 7)

Two subtractive touches that make the reveal the story — both reuse the existing `imageHovering` plumbing; no new uniforms or effects.

**Files:**
- Modify: `src/components/sections/Hero.jsx` (one effect + one timeline call)

- [ ] **Step 1: The "first breath" — auto-reveal the armored self once on load**

At the END of the entrance timeline in Task 4 (after the fluid-settle `.to`), append:

```jsx
      // THE FIRST BREATH — reveal the hidden armored self once, then let it rest,
      // so the duality greets the visitor instead of waiting to be discovered.
      tl.add(() => {
        setImageHovering(true);
        gsap.delayedCall(1.4, () => setImageHovering(false));
      }, '>0.3');
```

(`setImageHovering` is already a dependency of the entrance effect; the soft bloom/recede comes from the shader's existing `K_HOVER_IN`/`K_HOVER_OUT` easing.)

- [ ] **Step 2: Reveal-linked focus pull — recede the name when the visitor explores**

Add this effect after the entrance effect:

```jsx
  // When the visitor explores the reveal, the name recedes — focus pulls to the
  // rider and the hidden self. Reuses imageHovering; fires on enter/leave only.
  const imageHovering = useStore((s) => s.imageHovering);
  useEffect(() => {
    if (!nameRef.current) return;
    gsap.to(nameRef.current, {
      opacity: imageHovering ? 0.45 : 1,
      duration: DUR.considered,
      ease: EASE.momentum,
    });
  }, [imageHovering]);
```

- [ ] **Step 3: Build + visual check**

Run: `npm run build` (expect `✓ built`). Reload: after the entrance, the rider should bloom once into the armored/lime self and settle back — without touching the mouse. Then, moving the cursor over the scene drives the soft reveal, and the name dims to pull focus. Confirm the dissolve stays soft (no visible jump from the base/reveal misalignment).

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Hero.jsx
git commit -m "feat(hero): reveal as narrative moment — first-breath + focus-pull"
```

---

## Task 6: Cross-cut verification & polish

**Files:** none (verification); small tuning edits to `Hero.jsx`/`index.css` only if a check fails.

- [ ] **Step 1: Breakpoints.** In DevTools device toolbar, check ~390px (mobile portrait), 768px, 1440px. Expected: subject stays framed by darkness at every size; name never overflows; kicker/CTA legible. If the 4:3 crop loses the subject on narrow portrait, nudge the vignette focus (`at 60% 45%`) and/or `.hero-scrim-*` widths — composition only.
- [ ] **Step 2: Reduced motion.** DevTools → Rendering → "Emulate prefers-reduced-motion: reduce". Expected: `.grain-layer` is hidden (already guarded). Note any GSAP entrance that still runs; if the user later wants it gated, that is a separate task (out of scope here).
- [ ] **Step 3: Performance.** FPS meter while sweeping the cursor: expect ~60fps; `HeroShaderMesh` must not re-render (React DevTools highlight). If full-bleed dpr 2 dips on low-end GPUs, cap `dpr={[1, 1.75]}` — one-line, optional.
- [ ] **Step 4: Asset-swap dry run (future-proofing proof).** Temporarily point `MEDIA.hero.primary` at `'/reveal.jpg'` in `media.js`, reload, confirm the hero updates with no layout change, then revert. This proves higher-res assets will drop in cleanly.
- [ ] **Step 5: Final build + commit any tuning**

```bash
npm run build
git add -A
git commit -m "fix(hero): responsive + perf polish pass"
```

---

## Self-Review

**Spec coverage:** All 7 user priorities map to Tasks 1–5 (+ validation in Task 6); the Priority→Task table above is the checklist. ✅
**Placeholders:** Every code step contains complete, paste-ready JSX/CSS — no TBD/"handle edge cases". ✅
**Type/name consistency:** Ref names (`canvasWrapRef`, `atmosphereRef`, `uiLayerRef`, `nameRef`, `line1Ref`, `line2Ref`, `kickerRef`, `ctaRef`, `scrollCueRef`) and CSS classes (`hero-vignette`, `hero-scrim-bottom/left/top`, `grain-layer`, `btn-rt`) are defined in Task 1/2 and reused unchanged in Tasks 3–5. ✅
**Reuse:** No new shader uniforms, stores, or effects; `grain-layer`/`btn-rt`/motion tokens/CSS vars reused; asset paths stay in `media.js`. ✅

## Risks / watch-items

- Soft dissolve depends on misaligned assets staying *soft* — do not sharpen the reveal edge (would expose the jump). Replacement aligned assets remove this constraint.
- `clamp()` name sizing may need a max tweak per final font metrics.
- Reduced-motion gating of the GSAP entrance is explicitly out of scope (the user's priorities did not include it).
