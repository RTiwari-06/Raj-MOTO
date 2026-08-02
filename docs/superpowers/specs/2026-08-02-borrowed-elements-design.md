# Borrowed Elements — Design Spec

**Date:** 2026-08-02
**Status:** APPROVED — not yet implemented
**Scope:** Three elements lifted from three external Figma references, re-rendered
in RT•MOTO's existing language (black canvas, `--color-accent` lime, Playfair
display + mono utility).

---

## Provenance

Three Community files were supplied as references. None of them is an RT•MOTO
design, and all three are mutually incompatible visual systems — one is a *white*
portfolio. They were explicitly **not** adopted wholesale. Three elements were
selected; everything else (palettes, typefaces, corner radii, copy, gradient
orbs, glassmorphic cards) was rejected.

| Ref | File | Taken | Rejected |
|---|---|---|---|
| 1 | `lgDuaCawoBXyFLrFVmkdJY` — *Infinite Scroll / The loop* | logo strip metrics | acid-lime SaaS palette, geometric sans, blurred orb, glass card, placeholder copy |
| 2 | `tK1HadduuVHBU9naGsLXdI` — *Portfolio 2 / ANONYMS* | the ring | crimson neon, duplicated vertical nav, one-frame-only scope |
| 3 | `OWsYznYwL0705rdyL1XtJS` — *Portfoloio / Ashwin* | bleeding headline | white canvas, blue accent, grotesque type, rounded cards |

Ref 1's loop *mechanic* was also rejected: it fakes a loop with two hardcoded
frames and a variant swap. `useMarquee.js:44-82` already does it properly, with
off-screen pause, reduced-motion and coarse-pointer handling the Figma has no
concept of. Nothing in the reference improves on it.

---

## 1 · The ring → `HelmetSection`

### The correction that shaped this

The first draft of this spec proposed *adding* a ring to `HelmetSection`. That
was wrong: `HelmetSection.jsx:301-310` already renders one — `reticleRef`, two
concentric `rounded-full` borders in `accent-dim` with crosshairs and corner
brackets, sized `min(60vh, 60vw)`, centred on the helmet. Adding a second ring
would have stacked a near-identical element on top of it.

Recorded rather than silently fixed, because the near-miss is the instructive
part: a borrowed element that duplicates an existing one is the most likely way
this whole exercise degrades the page instead of improving it. Every remaining
item below was re-checked against the codebase for the same failure.

### What ships instead

The existing pin timeline already contains an ignition beat:

```
0.63  reticleRef   → opacity 0, scale 0.7   (instrument exits)
0.66  bloomRef     → opacity 0 → 1          (radial accent bloom enters)
0.66  accentMix / igniteMix → 1
```

The borrowed ring becomes the element that arrives **at** ignition, alongside the
bloom. The reticle is the instrument; the ring is the headlight. Measurement
turns off, light turns on.

- Ref 2's ring is a thick, saturated, glowing band — deliberately unlike the
  reticle's hairline `accent-dim` strokes, so the two never read as the same object.
- Glow is a `box-shadow`, **not** `filter: blur()`. One composited layer, no
  repaint. Ref 2's version is a very large blur radius; rendered naively that is
  an expensive composite, and this project's doctrine already rejects that class
  of effect as "impressive effect, not expensive feel."
- Colour is `var(--color-accent)`. This is CSS, not a GSAP tween target, so the
  custom property resolves correctly — unlike the GSAP/THREE/canvas contexts
  documented in the token spec, which fail silently on `var()`.
- Added to the **existing** timeline at `0.66`. No new `ScrollTrigger`.

### Constraints

- Must not extend the pin distance (`end: '+=300%'`) or alter `pinSpacing`.
- Must respect the section's existing reduced-motion path.
- Renders at `z-30`, above the bloom (`z-20`) and below the HUD frame (`z-40`).
  Sharing `z-30` with the reticle is safe and intended: the reticle has fully
  exited by `0.63`, before the ring enters at `0.66`, so the two never composite
  together.

---

## 2 · The bleeding headline → `Hero`

Oversized **`DEVELOPER & RIDER`** in Playfair black, set large enough to bleed
off *both* viewport edges, crossing the rider at roughly chest height.

### Why it earns its place

The Hero currently renders **no text at all** except the Engage button and the
scroll cue. Separately, `MEDIA.hero.name` (`media.js:14`) holds `'RAJ TIWARI'`
and is never rendered anywhere in the app.

The section is built on human↔machine duality — the WebGL liquid reveal exists to
show the rider emerging from beneath the person. A headline the viewer must read
*through* the figure states that duality in type. The ampersand is positioned
over the rider: the join between the two halves sits on the person.

This is Ref 3's one genuinely confident move (`Developer &` bleeding across a
portrait). It transfers because the crop is meaningful here, not just stylish.

### Implementation constraints

- Lives inside the existing `uiLayerRef` (`Hero.jsx:197`) so it inherits the
  scroll-exit tween at `Hero.jsx:150` for free. **No new ScrollTrigger.**
- Set in `--color-fg` at low opacity — the photograph stays the subject. The
  headline is atmosphere, not a banner.
- `pointer-events: none`. It must never intercept clicks intended for the
  WebGL reveal or the Engage button.
- Must not affect LCP. The Hero image is `fetchPriority="high"`; the headline is
  text and must not be promoted above it or introduce layout shift.
- Reduced motion: resolves to its static end state, consistent with the rest of
  the Hero.

---

## 3 · Marquee metrics → `LogoMarquee`

Ref 1's strip is better proportioned than the current implementation. Three
measured values transfer:

| | Current | Ref 1 | Ships |
|---|---|---|---|
| Logo height | `h-[26px] md:h-[31px]` (`:70`) | 40px | 40px |
| Gap between marks | `px-5 md:px-10` → 40/80px (`:62`) | 96px uniform | 96px uniform |
| Anchoring heading | none | "Meet our customers" | optional prop |

`26px` marks read as timid. Uniform spacing matters more than the exact number —
the current asymmetry between mobile and desktop gutters is the real defect.

### Consequence to accept

`LogoMarquee` has **two** call sites:

- `PartnersSection.jsx:20` — 10 logos, `speed={45}`
- `TextMarquee.jsx:22` — `speed={38}`

Both inherit the metric change. Larger marks plus wider gaps make each set
roughly 1.9× wider, so the `reps` measurement (`LogoMarquee.jsx:42-49`) will
settle on fewer repetitions. That logic is already dynamic and re-measures on
resize and SVG load, so it absorbs the change without modification — but this
must be verified at narrow and ultra-wide widths, since `reps` is exactly the
mechanism that prevents a visible gap after the last mark.

The heading is an **optional prop**, defaulting to none. A heading suits
`PartnersSection`; it would be wrong on `TextMarquee`.

### Explicitly unchanged

`useMarquee.js` in full — the `xPercent: -50` seamless loop, the off-screen
pause, the `motionEnabled` subscription, the reduced-motion bail, and the
coarse-pointer branch that skips scroll-velocity reactivity. Ref 1 offers
nothing here.

---

## Out of scope

**`RidesSection` alignment.** The work began as a request to refine the
scroll-to-slide gallery's alignment, but none of the three selected elements
targets it, and the finite-vs-infinite question was never resolved. The pinned
scrub is therefore left untouched rather than changed on a guess. If it is
wanted, it is its own pass with its own spec.

---

## Preserved — verification checklist

No item below may regress. Each is load-bearing and was confirmed present before
this spec was written.

**`RidesSection`** (untouched, but adjacent to the Helmet pin):
1. Pin + horizontal scrub with function-based `totalX()` and `invalidateOnRefresh`
2. `containerAnimation: hTween` on all per-slide triggers
3. Mobile vertical variant — no pin, transform/opacity/clip only
4. Progress dashes + active-slide dim, both driven off continuous `pos`
5. Hover curtain — CSS on desktop, GSAP timeline on mobile
6. `setDetailRide` → `ProjectDetail` overlay
7. Per-ride `accent` on tag, CTA, arrow, telemetry label, curtain edge

**`HelmetSection`:**
8. Pin distance `+=300%` and `pinSpacing` unchanged
9. The two `IntersectionObserver` gates (`near` mounts GL, `inView` runs the
   frameloop) — these prevent the Context-Lost blank screen
10. Existing reticle, scanline, bloom, and HUD beats keep their timeline positions

**`Hero`:**
11. WebGL desktop / 2D mobile reveal split; three.js never loads on phones
12. Idle-callback gating of the WebGL chunk
13. LCP image priority

**Global:**
14. `prefers-reduced-motion` honoured in every new element
15. Coarse-pointer fallbacks
16. `ScrollTrigger.refresh()` after lazy mount (`Home.jsx:53-63`) still correct
