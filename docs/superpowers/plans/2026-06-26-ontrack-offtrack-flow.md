# ON TRACK // OFF TRACK Flow Rework — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-sequence the homepage into a Lando-style ON TRACK // OFF TRACK dual-identity arc — thesis at beat 02, two content merges, one cut, a visor-up act break — without altering any section's internal GSAP/scroll machinery.

**Architecture:** This is a *composition* change centered on `src/pages/Home.jsx` (the section list), plus three small in-section content edits (Doctrine prose, IABridge framing, SectionHeader renumber) and one new lightweight CSS/GSAP component (`VisorUpHinge`). No WebGL, no shader, no motion-system changes. Sections keep their existing ScrollTrigger/Zustand wiring; only their order and a few labels change.

**Tech Stack:** React 19 · Vite 8 · Tailwind 4 · GSAP 3.15 + ScrollTrigger · Lenis · Zustand 5. Spec: `docs/superpowers/specs/2026-06-26-ontrack-offtrack-flow-rework-design.md`.

## Global Constraints

- **Branch:** all work lands on `design/ontrack-offtrack-flow` (already checked out; spec committed there).
- **No unit-test framework exists** (`package.json` scripts: `dev`, `build`, `lint`, `preview`). The verification cycle for every task is: `npm run build` (must succeed) → `npm run lint` (no new errors) → for UI-visible tasks, `npm run dev` + manual check → commit. Do **not** add a test runner.
- **Do not touch:** `src/motion/system.js`, `src/utils/Lenis.jsx`, `src/shaders/*`, `FluidBackground` logic, `HeroShaderMesh` logic, Hero internals.
- **Preserve** every GSAP `ScrollTrigger` instance and Zustand subscription inside reordered sections, and `Home.jsx`'s `restReady` idle-mount + double-`requestAnimationFrame` `ScrollTrigger.refresh()` logic.
- **No new WebGL context** — the app caps/recovers contexts (commit `6f1e0f9`); the hinge is CSS/2D only.
- **Restraint:** *expensive feel, not impressive effect.* No glitch/aberration/noise. Honor `prefers-reduced-motion` / `.motion-off`.
- **Palette:** site accent is lime `#D2FF00`; KTM-orange exception stays scoped to `TheMachine` and `DoctrineSection` only.
- **Canonical beat order (11 beats + footer):** 01 Hero · 02 Thesis (IABridge) · 03 The Machine · [TextMarquee breather] · 04 Gear Check (Helmet) · 05 Turf (Doctrine) · 06 Selected Work (Rides) · 07 Telemetry (StatReveal) · [VISOR UP hinge] · 08 The Path (Story) · 09 The Archive (Gallery) · 10 Paddock (Partners) · 11 Connect (Contact) · Footer. **Cut:** ManifestoSection, TheGrid, ActionGallery.

---

### Task 1: Fold TheGrid's route prose into DoctrineSection (MERGE 1)

`DoctrineSection` and `TheGrid` render the same three routes. Doctrine (the richer route-map dashboard) becomes the single "Turf" beat; before TheGrid is dropped (Task 3), preserve its evocative per-route prose here.

**Files:**
- Modify: `src/components/sections/DoctrineSection.jsx` (ROUTES array ~lines 12-28; THE SCHEDULE column ~lines 211-215)

**Interfaces:**
- Produces: each `ROUTES[i]` gains a `detail: string`; the active route's `detail` renders in THE SCHEDULE column.

- [ ] **Step 1: Add `detail` to each route**

In `src/components/sections/DoctrineSection.jsx`, add a `detail` field to each of the three `ROUTES` objects (prose taken verbatim from the section being retired):

```js
// id '01' Hebbal Midnight Runs — add:
    detail: 'Empty flyovers, sodium lights, throttle wide. After midnight the city belongs to the riders.',
// id '02' Highway Sprints — add:
    detail: 'Long straights, zero traffic, sustained high-rev cruising. Pure two-wheeled meditation.',
// id '03' Nandi Dawn Patrol — add:
    detail: '47 hairpins to the summit for sunrise. Cold air, hot tyres, a clear head.',
```

- [ ] **Step 2: Render the active route's detail in THE SCHEDULE column**

`const route = ROUTES[active];` already exists. Insert this `<p>` immediately AFTER the closing `</ul>` and BEFORE the `Hover to trace ·` footer `<p>` in the THE SCHEDULE column:

```jsx
            <p className="font-sans text-[13px] md:text-sm leading-relaxed text-white/55 mt-6 max-w-sm">
              {route.detail}
            </p>
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: builds successfully, no errors.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no new errors in `DoctrineSection.jsx`.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/DoctrineSection.jsx
git commit -m "feat(doctrine): absorb TheGrid route prose into Turf dashboard"
```

---

### Task 2: Create the VISOR UP hinge component

A lightweight CSS/GSAP act break between Telemetry (07) and The Path (08). Reuses the hero stills as a quiet bookend (machine → human) at low opacity. No WebGL.

**Files:**
- Create: `src/components/sections/VisorUpHinge.jsx`

**Interfaces:**
- Produces: `default export VisorUpHinge` — a self-contained `<section>`, no props.
- Consumes: `MEDIA.hero.reveal`, `MEDIA.hero.primary` from `@/data/media`; `EASE`, `DUR`, `ST` from `@/motion/system`.

- [ ] **Step 1: Write the component**

Create `src/components/sections/VisorUpHinge.jsx`:

```jsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MEDIA } from '@/data/media';
import { EASE, DUR, ST } from '@/motion/system';

// VISOR UP — the ON TRACK -> OFF TRACK act break. Pure CSS/GSAP, no WebGL
// context (the app caps WebGL contexts). The machine portrait (hero reveal)
// dissolves to the human (hero base) as the visor lifts. Reduced motion:
// resolve to final state, no scrub.
const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function VisorUpHinge() {
  const sectionRef = useRef(null);
  const machineRef = useRef(null); // helmet ON (reveal)
  const humanRef = useRef(null);   // helmet OFF (base)
  const tickRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(tickRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: DUR.considered, ease: EASE.precision,
          transformOrigin: 'left center',
          scrollTrigger: { trigger: sectionRef.current, start: ST.start.section, once: true } });

      gsap.fromTo(labelRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: DUR.cinematic, ease: EASE.precision, delay: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: ST.start.section, once: true } });

      if (prefersReduced()) {
        gsap.set(machineRef.current, { opacity: 0 });
        gsap.set(humanRef.current, { opacity: 0.16 });
        return;
      }

      gsap.fromTo(machineRef.current,
        { opacity: 0.16 },
        { opacity: 0, ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.fromTo(humanRef.current,
        { opacity: 0 },
        { opacity: 0.16, ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef}
      className="relative w-full overflow-hidden bg-black py-40 md:py-56 border-t border-white/5">
      <img ref={machineRef} src={MEDIA.hero.reveal} alt="" aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 [filter:grayscale(1)_contrast(1.1)]" />
      <img ref={humanRef} src={MEDIA.hero.primary} alt="" aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 [filter:grayscale(1)_contrast(1.1)]" />
      <div className="pointer-events-none absolute inset-0 bg-black/60" />

      <div className="relative z-10 mx-auto max-w-screen-xl px-6 md:px-16 text-center">
        <div ref={tickRef} className="mx-auto mb-8 h-px w-40 bg-[#D2FF00]"
          style={{ transformOrigin: 'left center' }} />
        <div ref={labelRef}>
          <p className="font-mono text-[10px] md:text-[11px] tracking-[0.5em] uppercase text-[#D2FF00] mb-6">
            VISOR UP
          </p>
          <h2 className="font-serif font-black uppercase text-white leading-none"
            style={{ fontSize: 'clamp(2.4rem, 8vw, 6.5rem)', letterSpacing: '-0.03em', lineHeight: '0.9' }}>
            OFF TRACK
          </h2>
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-white/40 mt-8">
            THE PERSON BEHIND THE MACHINE
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: builds successfully (component compiles; not yet rendered anywhere).

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors in `VisorUpHinge.jsx`.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/VisorUpHinge.jsx
git commit -m "feat(hinge): add VISOR UP act-break component (CSS/GSAP, no WebGL)"
```

---

### Task 3: Re-sequence Home.jsx — cut 3 sections, reorder, insert hinge

The core change. Reorder the lazy imports and the render block to the canonical beat order, drop `ManifestoSection` / `TheGrid` / `ActionGallery`, move `IABridgeSection` to beat 02, and insert `VisorUpHinge` after Telemetry.

**Files:**
- Modify: `src/pages/Home.jsx` (lazy imports ~lines 8-23; render block ~lines 80-95)

**Interfaces:**
- Consumes: `VisorUpHinge` default export (Task 2).
- Preserves: `restReady` state, idle-mount effect, double-rAF `ScrollTrigger.refresh()` effect — do not modify those.

- [ ] **Step 1: Replace the lazy-import block**

Replace the existing block of `const ... = lazy(...)` declarations (TheMachine through ScanReveal) with exactly this (drops Manifesto/TheGrid/ActionGallery, adds VisorUpHinge, ordered to match the flow):

```jsx
const IABridgeSection = lazy(() => import('@/components/sections/IABridgeSection'));
const TheMachine = lazy(() => import('@/components/sections/TheMachine'));
const TextMarquee = lazy(() => import('@/components/ui/TextMarquee'));
const HelmetSection = lazy(() => import('@/components/sections/HelmetSection'));
const DoctrineSection = lazy(() => import('@/components/sections/DoctrineSection'));
const RidesSection = lazy(() => import('@/components/sections/RidesSection'));
const StatRevealSection = lazy(() => import('@/components/sections/StatRevealSection'));
const VisorUpHinge = lazy(() => import('@/components/sections/VisorUpHinge'));
const StorySection = lazy(() => import('@/components/sections/StorySection'));
const GallerySection = lazy(() => import('@/components/sections/Gallery'));
const PartnersSection = lazy(() => import('@/components/sections/PartnersSection'));
const ContactSection = lazy(() => import('@/components/sections/ContactSection'));
const Footer = lazy(() => import('@/components/layout/Footer'));
const ScanReveal = lazy(() => import('@/components/ui/ScanReveal'));
```

- [ ] **Step 2: Replace the render block**

Replace the JSX between the `<Suspense fallback={<div className="h-screen bg-black" />}>` open tag and its `</Suspense>` close with exactly this (ON TRACK then OFF TRACK):

```jsx
          {/* ── ON TRACK ── the performance self ── */}
          <IABridgeSection />
          <ScanReveal><TheMachine /></ScanReveal>
          <TextMarquee dark={true} />
          <HelmetSection />
          <ScanReveal><DoctrineSection /></ScanReveal>
          <RidesSection />
          <StatRevealSection />

          {/* ── VISOR UP ── act break ── */}
          <VisorUpHinge />

          {/* ── OFF TRACK ── the person ── */}
          <ScanReveal><StorySection /></ScanReveal>
          <GallerySection />
          <PartnersSection />
          <ContactSection />
          <Footer />
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: builds successfully. No "is not defined" errors (confirms no dangling references to the removed sections).

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors. No `no-unused-vars` for removed imports (they're gone).

- [ ] **Step 5: Dev boot + scroll check**

Run: `npm run dev`
Then open the served URL and verify:
- Scroll order matches the canonical beats; **The Thesis (IABridge) appears right after the hero**.
- Routes appear **once** (no Doctrine-then-grid duplicate); photos appear **once** (no fan-card section before the archive).
- Both pinned sections (Gear Check / Helmet, Selected Work / Rides) pin and release cleanly; no page lurch under the navbar.
- Navbar links MACHINE / TARMAC / PIT LANE / ARCHIVE / COORDINATES still scroll-spy-highlight in order.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Home.jsx
git commit -m "feat(flow): re-sequence Home into ON TRACK // OFF TRACK arc; cut Manifesto/TheGrid/ActionGallery"
```

---

### Task 4: IABridge — frame as the beat-02 thesis

Light content pass so the moved section reads as the On Track opening statement, plus an anchor id.

**Files:**
- Modify: `src/components/sections/IABridgeSection.jsx` (section tag ~line 73-75; `<section>` open ~line 56-59)

- [ ] **Step 1: Add an anchor id to the section**

On the root `<section ref={sectionRef}` element, add `id="thesis"`:

```jsx
    <section
      ref={sectionRef}
      id="thesis"
      className="relative w-full bg-black border-t border-white/5 px-6 md:px-16 py-36 md:py-48 overflow-hidden"
    >
```

- [ ] **Step 2: Re-label the section tag to thread the act**

Replace the section-tag paragraph text `APPROACH &nbsp;//&nbsp; PHILOSOPHY` with:

```jsx
          ON TRACK &nbsp;//&nbsp; THE THESIS
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: builds successfully.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/IABridgeSection.jsx
git commit -m "feat(thesis): frame IABridge as the ON TRACK opener (beat 02) + #thesis anchor"
```

---

### Task 5: Renumber SectionHeader indices + thread the act label (signature)

Make the visible section indices honest to the new order (was `02/05/12`) and carry ON TRACK / OFF TRACK in their readouts.

**Files:**
- Modify: `src/components/sections/TheMachine.jsx:120-125`
- Modify: `src/components/sections/DoctrineSection.jsx:109`
- Modify: `src/components/sections/Gallery.jsx:126`

- [ ] **Step 1: TheMachine → index 03**

Replace the `<SectionHeader ... />` call (currently `index="02"`) with:

```jsx
        <SectionHeader
          index="03"
          total="11"
          kicker="THE MACHINE"
          readout="ON TRACK // KTM DUKE 250 · BS6"
          className="tm-head mb-14 md:mb-20"
        />
```

- [ ] **Step 2: Doctrine → keep index 05, add total + act**

Replace the Doctrine `<SectionHeader ... />` (line 109) with:

```jsx
        <SectionHeader index="05" total="11" kicker="ROUTE DOCTRINE" readout="ON TRACK // TURF · BENGALURU" panning className="mb-10 md:mb-14" />
```

- [ ] **Step 3: Gallery → index 09 + OFF TRACK**

Replace the Gallery `<SectionHeader ... />` (line 126) with:

```jsx
          <SectionHeader index="09" total="11" kicker="VISUAL ARCHIVE" readout="OFF TRACK // THE FULL LIFESTYLE" className="mb-8 max-w-3xl" />
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: builds successfully.

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/TheMachine.jsx src/components/sections/DoctrineSection.jsx src/components/sections/Gallery.jsx
git commit -m "feat(signature): renumber section indices to the new arc + thread ON/OFF TRACK"
```

---

### Task 6 (optional cleanup): Remove dead sections & unused data

Only after Tasks 3-5 are verified. Removes code no longer referenced by any route. Skip if you prefer to keep the files for reference.

**Files:**
- Delete: `src/components/sections/TheGrid.jsx`, `src/components/sections/ActionGallery.jsx`, `src/components/sections/ManifestoSection.jsx`
- Modify: `src/data/media.js` (remove the `actionCards` array, lines 173-180) — verified safe: all six `actionCards` images already exist in `MEDIA.gallery` by `src`.

- [ ] **Step 1: Confirm nothing imports them**

Run: `git grep -n "ActionGallery\|TheGrid\|ManifestoSection\|actionCards" -- src/`
Expected: no matches outside the files being deleted. If any other file references them, STOP and resolve before deleting.

- [ ] **Step 2: Delete the three section files and the `actionCards` array**

```bash
git rm src/components/sections/TheGrid.jsx src/components/sections/ActionGallery.jsx src/components/sections/ManifestoSection.jsx
```
Then remove the `actionCards: [ ... ],` block from `src/data/media.js`.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: builds successfully (no missing-module errors).

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(flow): remove retired ActionGallery/TheGrid/Manifesto + unused actionCards data"
```

---

### Task 7: Final integration verification

Whole-arc check before declaring done.

**Files:** none (verification only).

- [ ] **Step 1: Clean build + lint**

Run: `npm run build` then `npm run lint`
Expected: both succeed, no errors.

- [ ] **Step 2: Full scroll-through checklist** (`npm run dev`)

Verify all of:
- [ ] "Why bikes?" is answered by **beat 02** (The Thesis directly after the hero).
- [ ] No duplicate content: routes appear once (Turf), photos appear once (Archive).
- [ ] Build → peak → resolution reads: momentum builds through On Track, **Selected Work** lands as the peak, **VISOR UP** is a clear act break, Off Track decelerates and ends on **Connect**.
- [ ] Both pinned sections behave exactly as before (pin, scrub, release; no lurch).
- [ ] Navbar scroll-spy highlights advance correctly and every nav link scrolls to its target.
- [ ] Indices read 03 (Machine), 05 (Turf), 09 (Archive), each `/ 11`, with ON/OFF TRACK readouts.

- [ ] **Step 3: Reduced-motion check**

In DevTools, emulate `prefers-reduced-motion: reduce`, reload, and scroll to VISOR UP.
Expected: the hinge shows its final state (human still faintly visible, label shown) with no scrub animation; no console errors.

- [ ] **Step 4: Final commit (if any checklist fix was needed)**

```bash
git add -A
git commit -m "fix(flow): integration polish after ON TRACK // OFF TRACK rework"
```

---

## Self-Review

**Spec coverage:**
- §3 sequence → Task 3. §4 MERGE 1 (Turf) → Tasks 1 + 3. §4 MERGE 2 (Archive) → Task 3 (removal) + Task 6 (data cleanup); image-loss audit resolved (all `actionCards` ⊂ `gallery`). §2/§3 Manifesto cut → Task 3 (render) + Task 6 (file). §3 IABridge move 9→02 → Task 3; framing → Task 4. §5 Visor-up hinge → Tasks 2 + 3. §6 signature renumber + act labels → Task 5. §7 constraints → Global Constraints + preserved in Task 3. §11 success criteria → Task 7 checklist. All covered.

**Placeholder scan:** No TBD/TODO; every code step shows exact content; verification steps give exact commands + expected results.

**Type/name consistency:** `VisorUpHinge` default export created in Task 2, imported with the same name in Task 3. `route.detail` defined (Task 1 Step 1) before it is rendered (Task 1 Step 2). `SectionHeader` prop names (`index`, `total`, `kicker`, `readout`, `panning`, `className`) match the component definition. `id="thesis"` is additive (navbar relies on `#machine/#rides/#story/#gallery/#connect`, all retained).
