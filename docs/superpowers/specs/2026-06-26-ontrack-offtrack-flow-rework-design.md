# ON TRACK // OFF TRACK — Narrative Flow & Pacing Rework

**Date:** 2026-06-26
**Scope:** `src/pages/Home.jsx` section sequence + the sections it composes
**Type:** Information-architecture / narrative-arc redesign (not a visual reskin)
**Status:** Approved direction — ready for implementation plan

---

## 1. Problem

The homepage is 16 sections. Scrolled top-to-bottom it has four confirmed pacing faults:

1. **Thesis lands too late.** The one section that explains *why a software engineer's portfolio is all motorcycles* (`IABridgeSection` — "mechanical performance extends to the browser / the discipline transfers") sits at position **#9**. The first half plays as unexplained moto content.
2. **Back third sags.** `ActionGallery → Story → Gallery → Partners` is photo-heavy with little narrative propulsion before the CTA.
3. **Redundant middle beats.** Most glaring: **`DoctrineSection` and `TheGrid` render the same three routes** (Hebbal Midnight Runs 42KM, Highway Sprints/NH-44 180KM, Nandi Dawn Patrol 62KM) back-to-back in two different presentations. Separately, `ManifestoSection` and `IABridgeSection` both occupy "here's my philosophy" territory.
4. **No clear climax/arc.** Order reads as arbitrary; the two expensive pinned set-pieces (`HelmetSection`, `RidesSection`) aren't placed for build/peak/resolution.

## 2. Decision

Re-author the page as a single dual-identity arc modeled on **Lando Norris's official site** (OFF+BRAND, Awwwards SOTD), whose organizing principle is **"Personality in Motion": ON TRACK ↔ OFF TRACK** — the performance self vs. the person behind the visor, anchored by a Helmets showcase and premium restraint.

Mapped onto Raj Tiwari (AI engineer who rides a KTM Duke 250): **the motorcycle is the performance self; the engineering is what that performance produces.**

- **ON TRACK** = everything at speed — the machine, gear, the work, the telemetry — *opened by the thesis* so the riding metaphor is justified immediately.
- **OFF TRACK** = the person behind the visor — origin, lifestyle, the human invitation.
- **The hinge** = the visor lifting (machine → human), a full-page payoff of the Hero's existing helmet-on↔off dual-identity mechanic. **Helmet ON at ignition → VISOR UP at the act break.**

Latitude granted by the user: **merge & tighten** (consolidate/cut, net fewer sections). Result: **16 → 11 content beats** (+ footer).

## 3. The Arc (canonical beat order)

| Beat | Title | Source section | Role / change |
|------|-------|----------------|---------------|
| | **— ON TRACK —** | | *the performance self* |
| 01 | Ignition | `Hero` | unchanged; name monument, helmet ON |
| 02 | The Thesis | `IABridgeSection` | **MOVED 9→2.** Frames all riding as engineering. Fixes pain #1. |
| 03 | The Machine | `TheMachine` | unchanged content (KTM orange exception stays) |
| — | *(breather)* | `TextMarquee` | retained as On Track kinetic connective tissue |
| 04 | Gear Check | `HelmetSection` *(pinned)* | unchanged; suit-up boot sequence |
| 05 | Turf | `DoctrineSection` ⊕ `TheGrid` | **MERGE 1** → one routes beat |
| 06 | Selected Work | `RidesSection` *(pinned)* | ◀ **CLIMAX** — projects ridden hard |
| 07 | Telemetry | `StatRevealSection` | arsenal · lines shipped |
| — | **▲ VISOR UP ▲** | *new hinge* | ON TRACK → OFF TRACK transition |
| | **— OFF TRACK —** | | *the person* |
| 08 | The Path | `StorySection` | origin / how he got here |
| 09 | The Archive | `Gallery` ⊕ `ActionGallery` | **MERGE 2** → one lifestyle reel |
| 10 | Paddock | `PartnersSection` | culture / kinetic breather |
| 11 | Connect | `ContactSection` | the human invitation |
| — | — | `Footer` | unchanged |

**Cut entirely:** `ManifestoSection` (user decision — its "BUILD RELENTLESSLY" creed is *not* ported; the Thesis and Selected Work carry attitude).

```
intensity  ON TRACK ──────────────────►│ OFF TRACK ─────►
           ▁ ▃ ▄ █ ▅ █ ▆   │visor up│  ▄ ▅ ▃ ▂→■
           01 02 03 04 05 06 07          08 09 10 11
                       ▲pin   ▲pin·CLIMAX
```

## 4. Merges (precise)

### MERGE 1 — Turf (`DoctrineSection` ⊕ `TheGrid`)
- **Keep `DoctrineSection`** as the canonical Turf beat — it is the richer execution (interactive SVG route-map telemetry dashboard, scramble dist/time readouts, KTM-orange targeting reticle).
- **Remove `TheGrid`** from the flow.
- **Port forward** `TheGrid`'s evocative per-route `detail` prose (e.g. *"Empty flyovers, sodium lights, throttle wide…"*) into `DoctrineSection`'s route data as a one-line caption on the active route, so the stronger copy survives the cut. (Doctrine currently shows only dist+time.)
- `TheGrid.jsx` file may remain in the repo unused; it is removed from `Home.jsx`.

### MERGE 2 — The Archive (`Gallery` ⊕ `ActionGallery`)
- **Keep `Gallery`** as "The Archive" — it is the newer telemetry-deck visual archive (9-tile dense masonry, lightbox, keyboard nav, coords).
- **Remove `ActionGallery`** from the flow.
- **Audit:** confirm `ActionGallery`'s five labeled images (Fleet / Crew / Saddle Up / Night Run / Gear Up, all `moto-*.webp`) are represented in `MEDIA.gallery`; port any missing image as a tile so no photo is lost. (Per project memory `MEDIA.gallery` was already expanded to 9 incl. `moto-*` — verify, don't assume.)
- `ActionGallery.jsx` may remain in the repo unused; it is removed from `Home.jsx`.

## 5. New element — VISOR UP hinge

A lightweight transition beat between **07 Telemetry** and **08 The Path** that marks ON TRACK → OFF TRACK.

- **CSS/DOM only. Explicitly NOT a new WebGL context** — the codebase deliberately caps and recovers WebGL contexts (commit `6f1e0f9`); the hinge must not add one. Use a 2D crossfade (a helmet-on still → helmet-off still) and/or pure kinetic typography reading **"VISOR UP // OFF TRACK."**
- Conceptually a payoff of the Hero's dual-identity motif; it does **not** reuse the Hero's shader/`HeroShaderMesh` machinery.
- Respect `prefers-reduced-motion` / `.motion-off`: crossfade resolves to the final state with no animation.

## 6. Signature — the continuous index + act labels

Right now `SectionHeader` indices are arbitrary (`02`, `03`, `05`, `12`). Make the numbering *real*: a single ascending "lap counter" in scroll order that encodes the journey — structure as information.

- Renumber every `SectionHeader index` to its **canonical beat number** from §3 (`01`…`11`) with a shared `total` (`11`).
- Surface the act via the header `readout` (or a thin divider label): beats 01–07 read **ON TRACK**, beats 08–11 read **OFF TRACK**.
- `SectionHeader` is documented as drop-in (no refs/motion, safe inside GSAP-wired sections). Where a beat currently lacks a numbered header, adding one is in scope **for non-pinned beats**; pinned beats (`Helmet` 04, `Rides` 06) keep their existing internal headers but should display the matching canonical index. This propagation is what makes the dual-identity arc legible while scrolling.

## 7. Constraints (carried from project doctrine)

- **Do not touch:** `motion/system.js`, `Lenis.jsx`, `shaders/*`, `FluidBackground` logic, `HeroShaderMesh` logic. (Hero internals are out of scope for this rework.)
- **Preserve** every GSAP `ScrollTrigger` instance and Zustand subscription inside the sections being reordered — this is a *composition* change, not a rewrite of section internals (except the two merges and the new hinge).
- **Preserve** `Home.jsx`'s idle-mount (`restReady`) + double-rAF `ScrollTrigger.refresh()` logic; the reordered DOM must still mount below-fold at idle and refresh pins after layout settles.
- **KTM-orange palette exception** stays scoped to `TheMachine` (03) and `Doctrine`/Turf (05); rest of site stays lime `#D2FF00`.
- **Restraint:** *expensive feel, not impressive effect.* No new glitch/aberration/noise. This rework is a re-sequence + 2 merges + 1 CSS transition.
- **Reduced motion** honored throughout.

## 8. Implementation surface

- `src/pages/Home.jsx` — re-order the section list; drop `ManifestoSection`, `TheGrid`, `ActionGallery`; insert the VISOR UP hinge; keep `restReady`/refresh logic and `ScanReveal` wrappers (re-evaluate which beats still want `ScanReveal`).
- `src/components/sections/DoctrineSection.jsx` — absorb `TheGrid`'s `detail` copy; index → `05`.
- `src/components/sections/IABridgeSection.jsx` — light copy/heading pass for the "thesis at 02" role; add `id="thesis"`; index → `02`.
- `src/components/sections/Gallery.jsx` — confirm/port `ActionGallery` images; index → `09`.
- New `src/components/sections/VisorUpHinge.jsx` (or `ui/`) — the CSS/DOM transition.
- `src/components/ui/SectionHeader.jsx` consumers — renumber indices + act `readout` across beats.
- `src/components/layout/Navbar.jsx` — **verification only.** Anchors (`#machine`, `#rides`, `#story`, `#gallery`, `#connect`) survive and stay monotonic in the new order; confirm scroll-spy still lands. Optional: relabel nav items to ON TRACK/OFF TRACK language (polish, not required).

## 9. Risks

- **Pin spacing:** Gear Check (04) and Selected Work (06) are two beats apart with Turf (05, non-pinned) between — an intentional escalating On Track build. Verify the two pins don't fight on refresh.
- **ScrollTrigger after reorder:** new DOM order changes every trigger's start/end; rely on the existing post-mount `ScrollTrigger.refresh()`; re-test pinned sections specifically.
- **Lazy-mount order:** lazy imports in `Home.jsx` must follow the new sequence so idle-mounting still establishes a stable document height.
- **WebGL contexts:** the hinge must stay 2D (see §5).
- **Content loss:** the two merges must not silently drop images/copy — see the audit/port notes in §4.

## 10. Out of scope

- Palette / typographic reskin of individual sections (this is flow, not visual identity).
- Any new WebGL or "signature effect."
- Hero internals (shader, scramble, scroll refs).
- Mobile-specific redesign — inherits each section's existing responsive behavior.

## 11. Success criteria

- Scrolling top→bottom, the "why bikes?" question is answered by beat 02.
- No two adjacent (or near-adjacent) beats present the same content; routes appear once, photos appear once.
- A felt build to **Selected Work** as the peak, a clear **VISOR UP** act break, and an Off Track decel that ends on **Connect** — no dead stretch.
- All pinned sections and the smooth-scroll/spy system behave exactly as before the reorder (no layout lurch, no stuck nav highlight).
- Net **11 beats** + footer; `ManifestoSection`, `TheGrid`, `ActionGallery` no longer in the flow.

## Reference

- Lando Norris official site — structure & "On Track / Off Track" principle: <https://www.itsoffbrand.com/our-work/lando-norris>, <https://landonorris.com/>
- Project memory: `rtmoto-hero-dual-identity`, `rtmoto-design-restraint`.
