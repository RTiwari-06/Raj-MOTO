# Token Truth — Design Spec

**Date:** 2026-07-16
**Status:** IMPLEMENTED (`ef4d4a7`, `b06a8e0`) — see "As-built corrections" below
**Scope:** Sub-project A of a 3-part visual-system overhaul

---

## As-built corrections

Implementation disproved four things this spec asserted. Recorded here rather
than quietly edited above, because the errors are instructive.

**1. The audit under-counted the accent ramp.** "17 alpha variants" counted only
`rgba(210,255,0,·)` forms and missed the Tailwind alpha-modifier forms entirely
(`bg-[#D2FF00]/25`, `text-[#D2FF00]/70`, …), which added 12 more steps —
`/0 /5 /10 /15 /25 /28 /30 /40 /50 /60 /70 /80`. The real figure was ~29 → 5.

**2. The audit missed JSX inline styles.** It counted Tailwind `white/N`
utilities (174) but not `rgba(255,255,255,·)` inside `style={{…}}`, so several
components held private white literals the first migration pass walked straight
past.

**3. `index.css` kept its own ladder.** ~10 raw white literals (`.022 .06 .12
.16 .18`) still bypassed the tokens after the first pass — the exact two-ladder
disease this spec exists to cure, still live in CSS.

**4. Nine tokens became eleven.** `bg-white/5` and `/6` turned out to be `h-px`
hairlines, not surfaces — same role as `border-white/5`, different mechanism —
so they unified onto the line tokens. That required a `--color-surface` for the
one true wash (`hover:bg-white/2`), and `--color-ink` was promoted from `:root`
into `@theme` so a `text-ink` utility exists for type-on-lime (previously the
green-tinted one-off `text-[#141913]`).

**Also found, not predicted:**
- Tailwind 4 auto-scanning `docs/**.md` emitted phantom utilities (`text-white/45`,
  `/55`) from JSX samples in old plan documents. Fixed with `@source not "../docs"`.
- `--color-black: #111112` **overrides Tailwind's built-in `black`**, so all 34
  `bg-black` sites render *lighter* than the `#0a0a0a` canvas. Flagged, not fixed.
- `#FFA500` / `#FF4444` in `Loader` are undocumented status colours no token covers.
- `#FFD9B0` (Doctrine's GPS-dot core) was a warm peach chosen to pair with orange;
  against lime it read as cream-in-green. Changed to white.

**Measured result:** compiled CSS went 97 → 75 distinct colours, 22 → 10 white
alphas, zero `white/N` utilities generated, build green, lint clean, dev 200.

**NOT done: the screenshot diff.** See Verification below.

---

## Context

A visual audit of RT•MOTO was requested, benchmarked against the Design Studio
Landonorris site, with a brief that also proposed rebuilding the palette in the
language of Stripe / Linear / Bloomberg Terminal ("no neon").

**Resolved:** that pivot was rejected. The Stripe/Linear *rigor* applies — one
accent, hierarchy from type and spacing rather than brightness, consistent
neutrals, nothing decorative without purpose — but lime `#D2FF00` stays as the
single accent and the cinematic/telemetry identity is retained. An institutional
repalette would have contradicted both the Landonorris reference and the
project's own design doctrine.

The original brief was 7 phases. That is not one project. It decomposes into:

- **A — Token truth** (this spec): reconcile the styling systems, one enforced token set.
- **B — The slide gallery**: four-accent fix, navigation cues, unified reveal, photo grade.
- **C — Showcase + docs**: only meaningful once A and B are real.

A is first because B's accent inconsistency is a *symptom* of A's missing
enforcement — doing B first means redoing it.

---

## The problem

### Two parallel styling worlds

The root cause is not that developers ignored the tokens. It is that the token
layer was designed independently of what components needed, and was therefore
never adoptable.

| Existing token | Value | What JSX actually uses |
|---|---|---|
| `--surface-1` | `0.025` | `bg-white/5` = `0.05` |
| `--surface-2` | `0.04` | `bg-white/10` = `0.10` |
| `--surface-3` | `0.06` | `bg-white/15` = `0.15` (12 uses — dominant) |
| `--surface-border` | `0.08` | `border-white/5` = `0.05` (19 uses) |
| `--surface-border-hover` | `0.14` | `border-white/10` = `0.10` (13 uses) |

Not one token matches its real-world counterpart. CSS component classes in
`index.css` consume `var(--surface-*)` (10 call sites, lines 528–815). JSX
consumes Tailwind `white/N` literals. Same intent, two values, two layers. A card
styled by a CSS class does not match a card styled by Tailwind.

Adopting the tokens as-valued would have changed how everything looked. That is
why ~160 literals route around them.

### Measured spread

- **Text:** 16 distinct tiers, 106 uses. `/25 /30 /35 /40` alone = **68 of 106**,
  packed into a 15-point band that is perceptually one color.
- **Border:** 5 tiers, 39 uses. `/5` and `/10` = 32 of 39. `/6` and `/12` are
  single-use strays, imperceptible against their neighbors.
- **Background:** 7 tiers, 28 uses. `/15` dominates at 12. `/2`, `/6`, `/80` are one-offs.
- **Accent:** 17 alpha variants of `rgba(210,255,0,·)`. `.9` / `.95` / `1` are the same color.
- **Neutrals:** 14 near-black literals. `#0a0a0a` / `#0b0b0b` / `#0d0d0d` are
  indistinguishable. `#141913` and `#1c1f15` are **green-tinted**; `#15171a` is
  **blue-tinted**. The canvas does not agree on hue.
- `--color-accent` is **defined twice** — once in the Tailwind `@theme` block,
  once in `:root`, with different neighboring ramps.

---

## Approach

**Snap to observed reality.** Each token takes the value of its dominant existing
usage. ~85% of migrations become visual no-ops, verifiable by screenshot diff.
Only stray one-offs shift, each by an imperceptible amount.

Rejected alternatives:
- *Idealized perceptual ramp* — changes contrast in ~160 places at once; every
  section needs re-review by eye and regressions are unattributable.
- *Snap now, retune later* — cleaner separation, but the retune step has no
  demand behind it. Deferred, not refused; can be revisited after A lands.

The value of snapping is that **anything that moves visibly is a bug, not a
feature.** That is the verification method, not a nice-to-have.

---

## The token set

### Neutral alpha ladder (9 tokens)

```css
--text-primary    rgba(255,255,255,.90)   /* ← /80 /85 /90        (6 uses)  */
--text-secondary  rgba(255,255,255,.60)   /* ← /45 /50 /55 /60 /65 (14)     */
--text-muted      rgba(255,255,255,.35)   /* ← /25 /30 /35 /40    (68)      */
--text-faint      rgba(255,255,255,.15)   /* ← /10 /15 /18 /20    (18)      */

--border-subtle   rgba(255,255,255,.05)   /* ← /5 /6              (20)      */
--border          rgba(255,255,255,.10)   /* ← /10 /12            (14)      */
--border-strong   rgba(255,255,255,.20)   /* ← /20                (5)       */

--surface-raised  rgba(255,255,255,.10)   /* ← /10                (6)       */
--surface-hover   rgba(255,255,255,.15)   /* ← /15                (12)      */
```

`--surface-1/2/3` and `--surface-border*` are **re-valued and renamed, not
deleted** — they have 10 live consumers in `index.css`. Those 10 call sites will
shift slightly (e.g. `0.025 → 0.05`). This is a real visual change, small but not
a no-op, and is the one accepted deviation from "no-op consolidation".

### Accent ramp (17 → 5)

```css
--accent          #D2FF00                 /* ← .9 .95 1          (9 uses)  */
--accent-mid      rgba(210,255,0,.60)     /* ← .5 .6 .7 .75      (13)      */
--accent-soft     rgba(210,255,0,.35)     /* ← .3 .35 .4 .45     (9)       */
--accent-dim      rgba(210,255,0,.14)     /* ← .1 .12 .16        (5)       */
--accent-wash     rgba(210,255,0,.06)     /* ← .03 .04 .07       (5)       */
```

`--accent` **is** the full-opacity step — there is no separate `--accent-full`.
An opaque `rgba(210,255,0,1)` and `#D2FF00` are the same color, and shipping both
would reintroduce exactly the duplicate-responsibility problem this spec exists to
remove. Sites at `.9` and `.95` resolve to `--accent`.

`--accent` has a **single definition**, replacing the current pair (one in the
Tailwind `@theme` block, one in `:root`).

`--color-accent-dim` already exists at `0.12` and is close enough to fold into
`--accent-dim`.

### Canvas neutrals (14 → 3, all true-neutral)

```css
--canvas-deep     #050505   /* ← #050505 #060606 #080808              (5)  */
--canvas          #0a0a0a   /* ← #0a0a0a #0b0b0b #0d0d0d              (14) */
--canvas-raised   #141414   /* ← #141414 #141913 #15171a #1a1a1a
                                  #111112 #1c1f15 #1f1f1f             (11) */
```

This **removes the green and blue tints**. `#141913` / `#1c1f15` (green-tinted,
from the Tailwind `@theme` block) and `#15171a` (blue-tinted) all become true
neutral `#141414`. This is an intentional, visible change.

`--color-ink` (`#111112`, documented as "near-black ink on light surfaces") is a
**different role** — ink on light, not canvas on dark — and stays separate.

### Accent scope

KTM orange `#FF6600` is re-fenced to `#machine` **only**, per its own existing
documentation (`"scoped to #machine + Turf only"`).

Current reality contradicts that: `DoctrineSection.jsx` has **20** occurrences,
`TheMachine.jsx` has **18**. The exception is more prevalent in the section it was
never meant to touch.

**Approved:** Doctrine's 20 orange occurrences become lime — route map, GPS dot,
elevation bars, active bars. TheMachine stays orange as the deliberate exception.
This is A's most visible change.

`#FF6B35` (a fifth orange, near-duplicate of `#FF6600`, used as a per-ride accent)
is **out of scope for A** — it belongs to sub-project B.

---

## Also folded into A

Two one-line fixes in files already being touched:

- **`DoctrineSection.jsx:28`** — `time: '02:18:050'` is malformed (three-digit
  seconds). `runScramble` faithfully resolves to the broken value. **Fix to
  `'02:18:05'`** — a trailing-zero typo is the most likely origin, and it is
  consistent with the sibling routes' `HH:MM:SS` format (`00:38:24`, `01:05:12`)
  and with a 180 KM run at the section's implied pace.

- **Memory correction** — `rgbGlitch` (`index.css:1065`, red/cyan RGB-split
  chromatic aberration, fired by `.tm-portrait:hover .tm-img`) contradicts the
  stored design doctrine's ban on glitch/chromatic aberration. **Decision: keep
  it.** The doctrine memory is updated to record TheMachine as a sanctioned
  exception so future sessions stop flagging it. No code change.

---

## Explicitly out of scope

| Item | Goes to |
|---|---|
| Four-accent gallery inconsistency (`#D2FF00` / `#C0C0C0` / `#4FA8D5` / `#FF6B35`) | B |
| Slide navigation cues (dashes are `pointer-events-none` — unclickable) | B |
| Desktop-CSS vs mobile-GSAP reveal split | B |
| Hardcoded photo grade (`sepia(0.2) hue-rotate(-15deg)`) | B |
| Showcase page, process documentation | C |

---

## Constraints

Stays entirely inside the project's standing fence:

- **Change only:** JSX structure, Tailwind classes, CSS, copy, layout grids, data values.
- **Preserve:** all GSAP ScrollTrigger instances, all Zustand subscriptions.
- **Do not touch:** `motion/system.js`, `Lenis.jsx`, `shaders/*`, `HeroShaderMesh`
  logic, `FluidBackground` logic.

A carries **zero motion risk** — it is a color/token migration only.

(For reference, sub-project B was granted a wider fence: it may unify the
`.ride-reveal` / `.tele-item` paradigm across desktop and mobile, but the pinned
horizontal scrub, `containerAnimation`, `invalidateOnRefresh` and all parallax
stay untouched. Not applicable to A.)

---

## Verification

**Status: static verification done; visual verification NOT done.**

Done:
- `npm run build` green, `eslint` clean, dev server 200.
- Every token utility used in JSX confirmed present in the compiled CSS and
  resolving to its `var()` — a missing utility would silently drop colour while
  the build still passed.
- Compiled-CSS colour diff against the baseline commit (`272263d`): 97 → 75
  distinct colours, 22 → 10 white alphas. Every newly-introduced value was traced
  and explained; nothing unaccounted for.

NOT done — **the screenshot diff this spec called for.** The repo has no browser
automation (no Playwright/Puppeteer, no test runner), so before/after screenshots
were never captured. Static evidence is strong but is *not* the same claim.

This matters more than it looks. During implementation a `sed` produced
`const DOT_IDLE = DOT_IDLE;` — a temporal-dead-zone reference that would crash
RidesSection at module evaluation — and **both `npm run build` and `eslint`
passed it.** The same class of error also produced a circular
`--color-accent-soft: var(--color-accent-soft)`. Static checks demonstrably do
not catch this category; only running the page does.

**Pass criteria, still outstanding:**
- `--color-fg-muted`'s 68 sites move by at most 5 alpha points — imperceptible.
- The only intentionally visible diffs are: Doctrine orange → lime (+ its white
  GPS-dot core); the ~10 re-valued `--surface-*` CSS call sites; the green/blue
  tint removal (Doctrine + Story section backgrounds, `bg-darker` → `bg-canvas-raised`).
- Anything else that moves visibly is a **bug**.

---

## Open questions

None blocking. Deferred by choice:

- Whether to retune the 9 token values to an idealized ramp after A lands
  (the "snap now, retune later" option) — revisit once the tokens are enforced
  and the site can be judged as one system.
