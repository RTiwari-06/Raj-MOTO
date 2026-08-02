# Borrowed Elements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land three elements borrowed from external Figma references — a ring, a bleeding headline, and logo-strip metrics — rendered in RT•MOTO's existing black/lime/Playfair language without regressing any existing behaviour.

**Architecture:** Every change is additive and local. No new `ScrollTrigger` is created: the ring joins `HelmetSection`'s existing pin timeline, and the headline lives inside `Hero`'s existing `uiLayerRef` so it inherits the scroll-exit tween. The marquee change is a metric edit inside `LogoMarquee` plus one new optional prop. Nothing touches `useMarquee`'s engine or `RidesSection`.

**Tech Stack:** React 19, Vite 8, Tailwind 4 (`@theme` tokens in `index.css`), GSAP 3 + ScrollTrigger, Playwright + pixelmatch (visual regression).

**Spec:** `docs/superpowers/specs/2026-08-02-borrowed-elements-design.md`

## Global Constraints

- **There is no unit test framework in this repo.** No vitest, no jest. Do not add one — it is not in scope and these are visual/motion changes that unit tests cover poorly. Verification is `npm run lint`, `npm run build`, and `npm run verify:visual`.
- `npm run verify:visual` **refuses to run with uncommitted changes in `src/`** (`scripts/visual/run.mjs:20-26`) — it checks out the baseline over `src/` and would destroy them. Therefore: **commit first, then run it.** Default baseline is `HEAD~1`, which is exactly the pre-task state.
- A non-zero visual diff is **not** automatically a regression. These tasks intentionally change pixels. Open `.visual/diff/*.png` and confirm the change is the intended one. `shoot.mjs` fails loudly on `pageerror` — a page error IS a hard failure.
- Screenshot targets are `hero`, `thesis`, `machine`, `gear`, `doctrine`, `rides`, `story`, `gallery`, `connect`. `HelmetSection` is `#gear` (`HelmetSection.jsx:264`).
- **Colours must come from tokens.** `--color-accent: #D2FF00`, `--color-accent-mid` (.60), `--color-accent-soft` (.35), `--color-accent-dim` (.14), `--color-accent-wash` (.06), `--color-fg` (.90), `--color-fg-faint` (.15). For arbitrary alpha use `rgb(var(--color-accent-rgb) / <alpha>)`.
- **`var()` fails silently in GSAP/THREE/canvas contexts.** Any colour that is a GSAP tween target must be a literal. All colours in this plan are CSS-only, so `var()` is correct throughout — do not "helpfully" convert them to literals.
- Never use `filter: blur()` for glow. Use `box-shadow`. Blur is a repaint; box-shadow composites.
- Every new decorative element carries `pointer-events: none`.
- Do not change `HelmetSection`'s pin distance (`end: '+=300%'`) or `pinSpacing`.

---

## File Structure

| File | Change | Responsibility after change |
|---|---|---|
| `src/components/ui/LogoMarquee.jsx` | Modify `:62`, `:70`, `:76-81` | Logo loop + metrics + optional heading |
| `src/components/sections/PartnersSection.jsx` | Modify `:20` | Supplies partner logos + heading copy |
| `src/components/sections/Hero.jsx` | Modify `:197-201` region | Hero stage + UI layer + bleeding headline |
| `src/components/sections/HelmetSection.jsx` | Add ref, add 1 timeline line, add markup | Pinned helmet sequence + ignition ring |

---

## Task 1: Logo strip metrics + optional heading

Lowest-risk change, done first so later tasks diff against a settled baseline.

**Files:**
- Modify: `src/components/ui/LogoMarquee.jsx:62`, `:70`, `:76-81`
- Modify: `src/components/sections/PartnersSection.jsx:20`

**Interfaces:**
- Produces: `LogoMarquee` gains prop `heading?: string` (default `undefined` → renders nothing). Existing props `logos`, `speed`, `ariaLabel`, `className` keep their current signatures and defaults.

**Deviation from the spec, deliberate:** the spec's table says a flat `40px` height and `96px` gap. Those are read off a **1366px desktop** Figma frame. Applied flat, a 96px gap on a 375px phone shows about two logos. Desktop takes the Figma numbers exactly; mobile scales proportionally. Uniformity — the actual defect being fixed — is preserved, because each breakpoint is internally uniform.

- [ ] **Step 1: Add the `heading` prop and widen the metrics**

In `src/components/ui/LogoMarquee.jsx`, change the signature (`:27-32`):

```jsx
export default function LogoMarquee({
  logos,
  speed = 42,
  ariaLabel = 'Logos',
  heading,
  className = '',
}) {
```

- [ ] **Step 2: Update the per-logo gap and size**

Replace the wrapper `className` at `:62`:

```jsx
        className="group flex flex-shrink-0 items-center justify-center px-6 md:px-12"
```

`px-12` = 48px each side = **96px between adjacent marks**, matching the reference exactly. `px-6` = 48px between on mobile.

Replace the `img` `className` at `:70`:

```jsx
          className="logo-mark h-[30px] w-auto max-w-[120px] object-contain md:h-[40px] md:max-w-[188px]"
```

- [ ] **Step 3: Render the heading when provided**

In the returned JSX, insert directly above the `<div ref={wrapRef} …>` (currently `:82`):

```jsx
      {heading && (
        <p className="mb-4 text-center font-mono text-[9px] uppercase tracking-[0.35em] text-fg-muted md:mb-5">
          {heading}
        </p>
      )}
```

- [ ] **Step 4: Pass a heading from `PartnersSection`**

In `src/components/sections/PartnersSection.jsx`, replace `:20`:

```jsx
  return (
    <LogoMarquee
      logos={PARTNERS}
      speed={45}
      ariaLabel="Tech and culture"
      heading="Off track // the daily stack"
    />
  );
```

Leave `TextMarquee.jsx:22` alone. It passes no `heading` and must stay headingless.

- [ ] **Step 5: Lint and build**

```bash
npm run lint
npm run build
```

Expected: both clean. A failure here is a real failure — fix before continuing.

- [ ] **Step 6: Verify the loop is still gapless at the extremes**

```bash
npm run dev
```

Open the page and check the partner strip at **375px**, **1440px**, and **2560px** widths. Confirm no blank gap appears after the last logo at any width. This is the one behaviour the metric change could break: bigger marks and wider gaps make each set ~1.9× wider, so `reps` (`LogoMarquee.jsx:42-49`) settles on fewer repetitions. That logic re-measures on resize and SVG load, so it should absorb the change — this step confirms it did.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/LogoMarquee.jsx src/components/sections/PartnersSection.jsx
git commit -m "feat(marquee): widen logo metrics and add optional heading

Marks 26/31px -> 30/40px, gutters 40/80px -> 48/96px uniform. Desktop
matches the reference frame exactly; mobile scales proportionally rather
than showing two logos at a time.

Heading is opt-in: PartnersSection takes one, TextMarquee stays bare."
```

- [ ] **Step 8: Visual regression**

```bash
npm run verify:visual
```

Expected: `connect` and `story` may move (the strip sits between them). Open `.visual/diff/*.png` and confirm the only change is the strip's proportions. **Any `PAGEERROR` or `CONSOLE` output is a hard failure.**

---

## Task 2: Hero bleeding headline

**Files:**
- Modify: `src/components/sections/Hero.jsx` — inside the `uiLayerRef` block (`:197-230`)

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: nothing consumed by Task 3.

- [ ] **Step 1: Add the headline inside the existing UI layer**

In `src/components/sections/Hero.jsx`, insert as the **first child** of the `uiLayerRef` div (immediately after the opening tag that currently ends at `:201`):

```jsx
        {/* The hero's only headline. Sits inside uiLayerRef so it inherits the
            scroll-exit tween at :150 — no new ScrollTrigger. It reads THROUGH
            the rider on purpose: the section is built on human<->machine
            duality, and the ampersand — the join — lands on the person. */}
        <p
          className="pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-serif font-black uppercase leading-none"
          style={{
            fontSize: 'clamp(4rem, 15vw, 14rem)',
            letterSpacing: '-0.045em',
            color: 'var(--color-fg)',
            opacity: 0.28,
          }}
        >
          Developer <span style={{ color: 'var(--color-accent)' }}>&amp;</span> Rider
        </p>
```

Notes an implementer will otherwise get wrong:

- The parent is `absolute inset-0` (`:200`), so `absolute` positioning here resolves against the full hero. It is intentionally **not** part of the parent's flex flow.
- `pointer-events-none` is mandatory — the parent enables pointer events for the Engage button, and this element spans the stage. Without it, it swallows clicks meant for the WebGL reveal.
- Not `aria-hidden`. It is the hero's only descriptive text, and it states what the person is. Keep it in the accessibility tree.
- `opacity: 0.28` keeps the photograph the subject while staying legible. It started at `0.16`, which a review flagged as the same "ghost headline" defect found elsewhere on the site — text dim enough to read as a smudge rather than a deliberate layer. Do not drop it back below ~0.25.
- The lime ampersand is the only accent colour here. Do not tint the words.

- [ ] **Step 2: Lint and build**

```bash
npm run lint
npm run build
```

Expected: both clean.

- [ ] **Step 3: Verify it does not intercept the reveal**

```bash
npm run dev
```

On desktop, move the pointer across the hero and confirm the WebGL liquid reveal still tracks it, and that the **Engage** button still hovers and clicks. If either is dead, `pointer-events-none` is missing.

Then scroll down and confirm the headline fades and lifts **with** the rest of the UI layer — it must inherit the exit tween, not sit still while the rest departs.

- [ ] **Step 4: Confirm LCP is unaffected**

In DevTools → Lighthouse (or Performance), confirm the LCP element is still the hero `<img>` (`fetchPriority="high"`, `:166`) and not the new text. If the headline has become LCP, its `font-size` is loading before the image — report it rather than working around it.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Hero.jsx
git commit -m "feat(hero): bleeding DEVELOPER & RIDER headline

The hero carried no text but the Engage button. Set to bleed off both
edges and read through the rider — the section is built on human/machine
duality, so the ampersand lands on the person.

Inside uiLayerRef, so it inherits the existing scroll-exit tween. No new
ScrollTrigger, no LCP change."
```

- [ ] **Step 6: Visual regression**

```bash
npm run verify:visual
```

Expected: `hero` moves. Note that `shoot.mjs` runs with `reducedMotion: 'reduce'`, so the screenshot shows the headline in its resolved state.

---

## Task 3: Helmet ignition ring

The most delicate task: it edits a pinned GSAP timeline. Do it last.

**Files:**
- Modify: `src/components/sections/HelmetSection.jsx` — add a ref near `:180`, one timeline line near `:244`, markup near `:299`

**Interfaces:**
- Consumes: nothing from Tasks 1-2.
- Produces: nothing.

**Context an implementer needs:** the section is pinned for `+=300%` with a scrubbed timeline whose positions are normalised 0→1. There is already an **ignition beat**:

```
0.63  reticleRef  → opacity 0, scale 0.7    instrument exits
0.66  bloomRef    → opacity 0 → 1           radial accent bloom enters
0.66  accentMix / igniteMix → 1
```

The ring joins **at 0.66**, with the bloom. The reticle is the instrument; the ring is the headlight. They never composite together, because the reticle has fully exited by 0.63 — which is why sharing `z-30` is safe.

**Do not** add a ring to `reticleRef` (`:301-310`). It already renders two concentric `rounded-full` borders. A second ring there is the failure mode this design was corrected to avoid.

- [ ] **Step 1: Add the ref**

In `src/components/sections/HelmetSection.jsx`, beside `const bloomRef = useRef(null);` (`:180`):

```jsx
  const ringRef   = useRef(null);
```

- [ ] **Step 2: Add one line to the existing timeline**

Immediately **after** the `bloomRef` line (`:244`), inside the same `gsap.timeline`:

```jsx
      tl.fromTo(ringRef.current, { opacity: 0, scale: 0.82 }, { opacity: 1, scale: 1, duration: 0.16, ease: EASE.momentum }, 0.66);
```

Do not create a new timeline or `ScrollTrigger`. Do not alter any existing position value.

- [ ] **Step 3: Add the markup**

Immediately **after** the `bloomRef` div (`:299`) and before the `reticleRef` div:

```jsx
      {/* Ignition ring — the headlight the reticle hands off to. Glow is a
          box-shadow, never filter: blur(), so it composites instead of
          repainting. `hfx` gives reduced-motion handling for free
          (index.css:1106-1109 hides .hfx under motion-off and
          prefers-reduced-motion). */}
      <div
        ref={ringRef}
        className="hfx absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          opacity: 0,
          width:  'min(52vh, 52vw)',
          height: 'min(52vh, 52vw)',
          border: '3px solid var(--color-accent)',
          boxShadow: '0 0 70px 8px var(--color-accent-soft), inset 0 0 50px 4px var(--color-accent-dim)',
        }}
      />
```

The ring is `52vh/52vw` against the reticle's `60vh/60vw` (`:301`) — deliberately smaller and thicker, so the two never read as the same object.

- [ ] **Step 4: Lint and build**

```bash
npm run lint
npm run build
```

Expected: both clean.

- [ ] **Step 5: Verify the ignition beat**

```bash
npm run dev
```

Scroll slowly through `#gear` and confirm, in order:

1. The reticle fades out around 63% of the pinned scroll.
2. The bloom and the ring arrive together just after, around 66%.
3. The ring never appears at the same time as the reticle.
4. The pin still releases into `StatRevealSection` at the same place — the section must not have grown taller.

- [ ] **Step 6: Verify reduced motion**

In DevTools → Rendering → **Emulate CSS `prefers-reduced-motion: reduce`**, reload, and scroll to `#gear`. The ring must be **absent** (`.hfx` sets `display: none !important`). Also confirm the global motion toggle (`.motion-off`) hides it.

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/HelmetSection.jsx
git commit -m "feat(gear): ignition ring at the helmet's 0.66 beat

The reticle exits at 0.63 and the bloom enters at 0.66 — that handoff is
the ignition. The borrowed ring arrives there as the headlight the
instrument gives way to.

Joins the existing pin timeline; no new ScrollTrigger, no change to the
+=300% pin distance. box-shadow glow, not filter: blur(). Carries .hfx so
reduced-motion and motion-off hide it."
```

- [ ] **Step 8: Full visual regression against the pre-work baseline**

```bash
npm run verify:visual -- HEAD~3
```

This diffs all three tasks at once against the state before Task 1. Expected movement: `hero`, `gear`, `connect`, `story`. Expected **unchanged**: `thesis`, `machine`, `doctrine`, `rides`, `gallery`.

**`rides` must be pixel-identical.** `RidesSection` is explicitly out of scope, and it sits adjacent to the Helmet pin — any movement there means the pin distance shifted and must be investigated before this is called done.

---

## Verification checklist

Confirm before declaring the work complete. Each item is load-bearing; the spec's full list is at `docs/superpowers/specs/2026-08-02-borrowed-elements-design.md`.

`HEAD~3` below assumes exactly one commit per task. If any task needed a fix-up commit, capture the pre-work SHA first (`git rev-parse HEAD` before Task 1) and use that instead — do not just count backwards.

- [ ] `npm run lint` clean
- [ ] `npm run build` clean
- [ ] `npm run verify:visual -- HEAD~3` shows **zero** movement in `rides`
- [ ] No `PAGEERROR` or `CONSOLE` output from any `shoot.mjs` run
- [ ] Partner strip has no blank gap at 375 / 1440 / 2560px
- [ ] `TextMarquee` still renders without a heading
- [ ] Hero WebGL reveal still tracks the pointer; Engage still clicks
- [ ] Hero LCP is still the hero image
- [ ] Helmet pin still releases into `StatRevealSection` at the same scroll position
- [ ] Ring absent under `prefers-reduced-motion: reduce` and under `.motion-off`
- [ ] `RidesSection` source untouched — `git diff HEAD~3 --stat` lists no `RidesSection.jsx`
