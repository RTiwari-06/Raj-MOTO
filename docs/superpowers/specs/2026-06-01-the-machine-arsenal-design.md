# THE MACHINE — Arsenal / Telemetry Redesign (Spec)

**Date:** 2026-06-01
**File:** `src/components/sections/TheMachine.jsx` (the `#machine` section) + `src/index.css`
**Source:** user's 6-point frontend-design brief.

## Goal
Elevate visual hierarchy & spatial pacing of the spec headline and maintenance log with a scoped "machine arsenal" palette and live-telemetry treatment.

## Palette decision (the one judgment call)
The brief introduces **KTM Orange `#FF6600`**, **High-RPM Red `#FF0000`**, **Gunmetal Grey `#808080`**, and a **teal+orange** image grade. The rest of the site uses a single lime accent (`#D2FF00`). These new colours are **scoped to TheMachine only** (section-local CSS classes / inline) — global `--color-accent` and every other section stay lime. Thematically justified: this section is a KTM (orange is KTM's brand). The `SectionHeader` tick-rule stays lime (shared chrome).

## Requirements

1. **Dynamic "Arsenal" headline** — the three spec lines (`SINGLE-CYLINDER.` / `30 HORSES.` / `AGGRESSIVE GEOMETRY.`) continuously cycle colour through grey → orange → red via a moving `linear-gradient` + `background-clip: text` (`.arsenal-text`, CSS keyframes, ~6s loop, "breathing pulse"). Paused under `.motion-off` / `prefers-reduced-motion` (static gradient).

2. **HUD numbering alignment** — `01 / 02 / 03` indices bound to the **vertical centre** of each headline row (`items-center`), opacity **40%**, mono, neutral (telemetry markers, not primary text). They sit outside the line's clip so they fade (don't wipe).

3. **Cinematic image hover** — add a grain overlay (`.grain-layer`, `mix-blend: overlay`) + faint scanlines inside the portrait. On hover, the image transitions from B&W (`grayscale(1)`) to a **teal+orange cinematic grade** (CSS filter to colour + a teal→orange gradient overlay at `mix-blend: soft-light`). Smooth `filter`/`opacity` transition.

4. **Technical framing** — the four corner registration brackets on the image wrapper recoloured **KTM Orange `#FF6600`** (section-local `.brk--mch` variant) to match the headline.

5. **Telemetry maintenance log** — data values (`Motul 7100`, etc.) in **monospace** (`--font-mono`); label→value connected by a **1px dashed** leader (`border-bottom: 1px dashed rgba(255,255,255,0.2)`); on row hover the **value lights up orange** (`#FF6600`).

6. **GSAP scroll-triggered entrance** (replaces the generic `.tm-reveal` stagger):
   - Headline lines **wipe up from the bottom** (each line in `overflow-hidden`, inner `yPercent 110 → 0`, staggered).
   - The `01/02/03` numbers **fade in simultaneously** with their lines (to 40% opacity).
   - Maintenance-log rows **fade in with upward y-translation**, staggered, **after** the headline locks.
   - One pinned-free `ScrollTrigger` timeline, `once: true`, using `motion/system` constants. Section still nests under the existing outer `<ScanReveal>` in Home.

## Constraints
- Preserve the section's structure, `id="machine"`, SectionHeader, image source, and copy.
- No new dependency. Reduced-motion respected. Build must stay green.

## Success criteria
Headline visibly breathes through the arsenal palette; indices centred at 40%; image grades to teal-orange on hover with orange brackets + grain; log reads as live telemetry with dashed connectors and orange value hover; everything reveals on scroll in the specified order. Rest of site remains lime.

## Out of scope
Changing other sections' palette; the GLB/helmet; data/content changes beyond styling.
