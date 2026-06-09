# RT•MOTO — Full Code Audit & Optimization Punch List

> Prepared for execution by **Claude CLI** and **Gemini CLI** against the live repository.
> Every item is tagged with a severity, the target file, line refs where verified, the concrete fix, and an effort estimate.

---

## 0. Scope & confidence

This audit was produced from the following materials only:

| Verified (read line-by-line) | NOT available (must verify in repo) |
| --- | --- |
| `index.html`, `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `eslint.config.js`, `.gitignore`, `README.md` | Everything under `src/` — components, Zustand stores, hooks, `main.jsx`, global CSS |
| `shaders/heroVertex.glsl`, `heroFragment.glsl`, `fluidVertex.glsl`, `fluidFragment.glsl` | Image assets (`base.jpg`, `reveal.jpg`), 3D models |
| Vercel Speed Insights (Desktop + Mobile, P75, last 7 days) | Runtime behavior, network waterfall, DevTools traces |

**Confidence tags used below:**
- `[VERIFIED]` — exact code was read; line numbers are real.
- `[VERIFY]` — directive inferred from configs/README/field data; the CLI **must** confirm against the actual file before editing. Do not blind-apply.

**Severity:** `P0` = breaks build/prod or destroys a core metric · `P1` = real bug or quality defect · `P2` = cleanup/polish.

---

## 1. How CLI agents should use this

1. Work top-down: **P0 → P1 → P2**.
2. For any `[VERIFY]` item, first open the real file and confirm the described condition exists. If it does not, mark the item N/A and move on — **never invent the code**.
3. After Priority 0 changes, redeploy and re-check Vercel Speed Insights before touching P1/P2. CLS and LCP fixes should move the RES first.
4. Run `npm run lint` and `npm run build` after each batch; do not land a batch that fails either.
5. Keep changes atomic per item ID so they're individually revertable.

---

## 2. PRIORITY 0 — Field performance triage

Current field scores (P75): **Desktop RES 16**, **Mobile RES 36** (both "Poor"). Desktop is *worse* than mobile, which is abnormal and points at desktop-specific CLS and INP. Core Web Vitals status:

| Metric | Mobile | Desktop | Bar (good / poor) | Status |
| --- | --- | --- | --- | --- |
| LCP | 6.9 s | 5.93 s | ≤2.5s / >4.0s | Poor (both) |
| INP | 1,384 ms | 3,200 ms | ≤200ms / >500ms | Poor (catastrophic) |
| CLS | 0.1 | 2.02 | ≤0.1 / >0.25 | Catastrophic on desktop |
| FCP | 2.63 s | 2.07 s | ≤1.8s / >3.0s | Needs improvement |
| FID | 13 ms | 9 ms | ≤100ms | Green — but deprecated; ignore |

> Sample size is small (43 mobile / 56 desktop on the "Unknown" route), so exact digits are noisy — but the magnitudes are far too extreme to be noise. The problems are real.

### P0-1 `[P0]` Eliminate desktop CLS (2.02) — font swap on giant display text
**Cause (high confidence):** `index.html:16` loads 3 Google Font families with `display=swap`, and `tailwind.config.js:25` sets `display-xl` to **160px**. When `Saira Expanded` swaps in late, it reflows enormous headings — far larger on desktop than mobile, which explains 2.02 vs 0.1.
**Fix:**
- Preload (or self-host) the display font so it arrives before first paint.
- Switch the headings from `font-display: swap` to `optional` or `fallback`, and add a `@font-face` `size-adjust` / `ascent-override` metric override so the fallback occupies the same space (no reflow on swap).
- `[VERIFY]` Reserve explicit height / `aspect-ratio` on the hero `<canvas>` wrapper and on every lazy-loaded section + Suspense fallback so nothing pops in without reserved space.
- `[VERIFY]` Audit `ScrollTrigger.refresh()` timing — call it after fonts are ready (`document.fonts.ready`) and after layout settles, not mid-scroll.
**Effort:** M. **Expected impact:** Largest single RES gain, especially desktop.

### P0-2 `[P0]` Fix LCP (~6–7 s) — WebGL hero is not a fast LCP element
**Cause:** The hero is a WebGL canvas; pixels don't paint until three.js + gsap + app JS download, parse, R3F boots, the shader compiles, and the texture uploads. `index.html:12` preloads `base.jpg` over the network but the *render* is still gated behind all the JS.
**Fix:**
- `[VERIFY]` Paint a real decoded `<img src="/base.jpg">` (or `<picture>` with AVIF/WebP) as the hero's first frame, sized to fill, **underneath** the canvas. Fade the WebGL layer in once `gl` + textures are ready. The browser then gets a fast, real LCP element instead of waiting on the 3D pipeline.
- `[VERIFY]` Audit the "tachometer boot sequence" — if it delays meaningful paint, shorten it or run it as an overlay above already-painted content.
- `[VERIFY]` Confirm `base.jpg`/`reveal.jpg` are compressed and served as AVIF/WebP at appropriate resolution (a large JPEG inflates decode + LCP).
**Effort:** M–L. **Expected impact:** High.

### P0-3 `[P0]` Fix INP (1.4 s mobile / 3.2 s desktop) — multi-second long task on interaction
**Cause:** INP this high is not per-frame cost — a single interaction blocks the main thread for seconds. Prime suspects: the 3D helmet (R3F + drei + model) or a lazy section instantiating *synchronously* on first scroll/hover, or a second shader compiling on first reveal.
**Fix:**
- `[VERIFY]` Lazy-load and code-split the 3D helmet so it is **not** constructed during the interaction that triggers it; mount it behind `Suspense` with a reserved-height fallback (also helps CLS).
- `[VERIFY]` Break heavy interaction work across frames (`requestIdleCallback` / chunked init) instead of one synchronous block.
- `[VERIFY]` Precompile shaders during idle (`renderer.compile(scene, camera)`), not on first hover.
- `[VERIFY]` Confirm the README's "zero-rerender" claim is real: high-frequency `pointermove` data (`uMouse`, `u_points`) must update via Zustand transient subscription (`api.subscribe` / `subscribeWithSelector`) or a ref, **never** `setState` per move — a re-render storm here would also spike INP.
**Effort:** L. **Expected impact:** High; required to ever hit the README's "negligible INP" claim.

---

## 3. PRIORITY 1 — Correctness & config bugs

### P1-1 `[P0]` `[VERIFY]` Tailwind v4 config may be silently ignored
`tailwind.config.js` is written in **v3 style** (`theme.extend`, `content`, `plugins`) but the project is on **Tailwind v4** (`package.json:38` + `@tailwindcss/postcss`). In v4 the JS config only loads if your CSS contains `@config "./tailwind.config.js"`. If that line is missing, your custom tokens (`accent #D2FF00`, the `display-*` sizes, the `Saira Expanded`/`JetBrains Mono` font families) **do not apply**.
**Fix:** In the main CSS, confirm `@import "tailwindcss";` is present, then either add `@config "../tailwind.config.js";` (match the real filename/path), or — preferred for v4 — migrate the tokens into a CSS `@theme { ... }` block and delete the JS config. Verify `bg-accent`, `font-serif`, `text-display-xl` actually render after build.
**File:** `tailwind.config.js` + global CSS. **Effort:** S–M.

### P1-2 `[P0]` `[VERIFIED]` `react-router-dom` is a runtime dep placed in `devDependencies`
`package.json:37` lists `react-router-dom` under `devDependencies`, but `vite.config.js:28` bundles it (`vendor-libs`), so it's used at runtime. A production install with `--omit=dev` will break the build.
**Fix:** Decide:
- If routing is used → move `react-router-dom` to `dependencies`.
- If unused (README describes a single continuous-scroll page with no routes) → remove it from `package.json` **and** from the `vendor-libs` branch in `vite.config.js:28`.
**Effort:** S.

### P1-3 `[P1]` `[VERIFIED]` Duplicate `preconnect` tags
`index.html:8-9` and `index.html:14-15` preconnect to `fonts.googleapis.com` and `fonts.gstatic.com` twice.
**Fix:** Delete the duplicate pair (lines 14–15). **Effort:** S.

### P1-4 `[P1]` `[VERIFIED]` Missing SEO / social meta
`index.html` has no `<meta name="description">`, no Open Graph, no Twitter Card, no canonical, no `theme-color`. For a showcase meant to be shared, link previews are blank.
**Fix:** Add to `<head>` (adjust copy/URLs):
```html
<meta name="description" content="RT•MOTO — a cinematic interactive experience on the duality of rider identity.">
<meta name="theme-color" content="#111112">
<link rel="canonical" href="https://rt-moto.vercel.app/">
<meta property="og:type" content="website">
<meta property="og:title" content="RT•MOTO — Same Rider, Two Machines">
<meta property="og:description" content="A cinematic WebGL experience. Code and velocity.">
<meta property="og:image" content="https://rt-moto.vercel.app/og.jpg">
<meta property="og:url" content="https://rt-moto.vercel.app/">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://rt-moto.vercel.app/og.jpg">
```
Add a `public/og.jpg` (1200×630). **Effort:** S.

### P1-5 `[P1]` `[VERIFIED]` No `<noscript>` fallback for a JS/WebGL-gated experience
`index.html:20-23` mounts everything via JS only.
**Fix:** Add a `<noscript>` block inside `<body>` with a short message and a static image, so non-JS / crawler / WebGL-failure visitors see something.
**Effort:** S.

### P1-6 `[P1]` `[VERIFIED]` Hero shader output color management is unconfirmed
`heroFragment.glsl:40-41,72-73` writes computed color straight to `gl_FragColor`. With a custom `ShaderMaterial`, modern three.js (r152+) does **not** auto-apply sRGB output encoding. If `u_texBase`/`u_texReveal` are flagged `SRGBColorSpace`, samples are linearized but never re-encoded → the hero renders **too dark**.
**Fix:** `[VERIFY]` in the JS that builds the material — pick ONE consistent path:
- Keep textures in default color space and output as-is (math in sRGB; usually "looks right"), **or**
- Flag textures `THREE.SRGBColorSpace`, set `renderer.outputColorSpace = THREE.SRGBColorSpace`, and manually encode the output (apply the sRGB OETF before `gl_FragColor`).
**Effort:** S–M.

### P1-7 `[P1]` `[VERIFIED]` Shader time/offset uniforms grow unbounded → long-session precision drift
- `heroFragment.glsl:49` `u_time * 0.15`
- `fluidFragment.glsl:56` `sin(uTime * tw …)`, `:67` `p.y += uTime*0.004`, `:70` `snoise(... + uTime*…)`
- `fluidFragment.glsl:76-78` `uFallOffset` added into star UVs

As these floats grow large, `sin()` and `fract(uv*scale)` lose precision → choppy twinkle and jittering stars after the tab is open a while.
**Fix:** `[VERIFY]` In JS, wrap before upload: feed `time % LARGE_PERIOD` (e.g. `% 1000.0`) and periodically rebase/reset `uFallOffset` so the shader never sees huge magnitudes.
**Effort:** S.

### P1-8 `[P1]` `[VERIFIED]` Fluid nebula banding
`fluidFragment.glsl:71-72,81,90` builds a very dark gradient (`vec3(0.008,0.010,0.024)` → `0.05,0.07,0.03`) over a large area → visible 8-bit banding, which reads as cheap on a "cinematic" background.
**Fix:** Add a cheap triangular/ordered dither just before output:
```glsl
float dither = (hash21(gl_FragCoord.xy) - 0.5) / 255.0;
gl_FragColor = vec4(color + dither, 1.0);
```
**Effort:** S.

### P1-9 `[P1]` `[VERIFIED]` Cursor aura is an ellipse, not a circle
`fluidFragment.glsl:84` uses `distance(uv, uMouse)` without aspect correction, so the lime aura stretches horizontally on widescreen. (The hero shader *does* aspect-correct its blobs — inconsistent.)
**Fix:** Correct the delta by aspect ratio:
```glsl
vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0); // pass resolution as a uniform, or reuse uMouse-space aspect
float dist = length((uv - uMouse) * aspect);
```
Apply the same correction to the `:66` parallax offset.
**Effort:** S. (Note: `fluidFragment` currently has no resolution uniform — add one.)

### P1-10 `[P1]` `[VERIFY]` `prefers-reduced-motion` not handled
A Lenis smooth-scroll + GSAP ScrollTrigger + scroll-jacked experience is hostile to motion-sensitive users and fails accessibility expectations. No handling is evident.
**Fix:** Gate Lenis/ScrollTrigger/heavy animation behind `window.matchMedia('(prefers-reduced-motion: reduce)')` and provide a static/native-scroll degraded path.
**Effort:** M.

### P1-11 `[P1]` `[VERIFIED]` `lucide-react@^1.8.0` version looks wrong
`package.json:19` — lucide-react has historically versioned in the `0.x` range; `1.8.0` is suspicious.
**Fix:** Run `npm view lucide-react version`, confirm the installed package is the intended one, and pin to a real current version.
**Effort:** S.

---

## 4. PRIORITY 2 — Cleanup & polish

### P2-1 `[P2]` `[VERIFIED]` Redundant `autoprefixer`
`postcss.config.js:4` + `package.json:31` — Tailwind v4 (Lightning CSS) handles vendor prefixing; autoprefixer is redundant and can conflict.
**Fix:** Remove `autoprefixer` from `postcss.config.js` and uninstall the devDependency. **Effort:** S.

### P2-2 `[P2]` `[VERIFIED]` React not split into its own chunk
`vite.config.js:20-33` splits three/gsap/libs but `react`+`react-dom` fall into the generic `vendor` chunk.
**Fix:** Add a branch:
```js
if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) return 'vendor-react';
```
(place before the generic `return 'vendor'`). Improves long-term caching. **Effort:** S.

### P2-3 `[P2]` `[VERIFIED]` Consolidate identical vertex shaders
`heroVertex.glsl` and `fluidVertex.glsl` are byte-for-byte identical.
**Fix:** Keep one shared `passthrough.vert.glsl`; import it in both materials. Consider factoring the noise primitives (`hash`/`vnoise`, Ashima `snoise`/`hash21`) into a shared `noise.glsl` and `#include` it (supported by `vite-plugin-glsl`). **Effort:** S.

### P2-4 `[P2]` `[VERIFIED]` Enable GLSL minification for production
The shaders are heavily commented. `vite-plugin-glsl` can strip comments/whitespace.
**Fix:** `vite.config.js:10` → `glsl({ compress: true })` (or guard on `mode === 'production'`). **Effort:** S.

### P2-5 `[P2]` `[VERIFIED]` ESLint inconsistency + missing a11y plugin
`eslint.config.js:17` sets `ecmaVersion: 2020` while `:19` sets parserOptions `'latest'`. Also no `eslint-plugin-jsx-a11y` for a heavily visual app.
**Fix:** Set `languageOptions.ecmaVersion` to `'latest'` (or `2022`+); add `eslint-plugin-jsx-a11y` (and optionally `@react-three/eslint-plugin` for R3F pitfalls). **Effort:** S.

### P2-6 `[P2]` `[VERIFIED]` Unused TypeScript types / generic package name
`package.json:31-32` ship `@types/react`/`@types/react-dom` but there's no `typescript` dep and sources are `.jsx`. `package.json:2` name is the generic `"website-designing"`.
**Fix:** Either adopt TS or drop the `@types`; rename the package to `rt-moto`. Optionally add `"engines": { "node": ">=18" }`. **Effort:** S.

### P2-7 `[P2]` `[VERIFY]` Texture wrap / memory hygiene
`heroFragment.glsl:36` `coverUv` can exceed `[0,1]` at edges.
**Fix:** Confirm hero textures use `THREE.ClampToEdgeWrapping` (avoids edge bleed). Separately, verify all geometries/materials/textures are `dispose()`d on unmount and that GSAP tweens / ScrollTriggers are killed on unmount to prevent leaks. Wrap the R3F `<Canvas>` in an error boundary + handle `webglcontextlost`. **Effort:** S–M.

### P2-8 `[P2]` `[VERIFIED]` README accuracy
- Replace all `via.placeholder.com` banner/showcase images (lines 9, 125, 129, 133) with real screenshots.
- Fix duplicated word "Horizontal Archive **Archive**" (line 135).
- Reconcile branding: README tagline "SAME RIDER TWO MACHINES" vs `index.html` title "Redefining Limits"; clone URL is `Raj-MOTO` vs product `RT•MOTO`.
- The "60FPS across all devices" / "negligible INP" claims (lines 54, 59) currently contradict field data (RES 16/36). Either land the P0 fixes first, or soften the claims to aspirational.
**Effort:** S.

---

## 5. `src/` verification checklist (no code access — confirm in repo)

These are not yet line-located. Open the real files, confirm, then fix.

- [ ] **Global CSS:** contains `@import "tailwindcss";` and either `@config` or `@theme` (see P1-1).
- [ ] **`main.jsx`:** `<StrictMode>` double-invokes effects in dev — ensure R3F/GSAP/Lenis setup is idempotent and cleaned up.
- [ ] **Lenis ↔ ScrollTrigger wiring:** single RAF loop, `lenis.on('scroll', ScrollTrigger.update)`, `ScrollTrigger.refresh()` after `document.fonts.ready`.
- [ ] **R3F frameloop culling:** README claims IntersectionObserver pausing — confirm `frameloop="demand"` or visibility-gated rendering is actually implemented (directly affects mobile thermals + INP).
- [ ] **Zustand:** high-frequency pointer/scroll data uses transient subscriptions / refs, not `setState` per event (see P0-3).
- [ ] **Lazy loading:** below-fold sections are `React.lazy` + `Suspense` with **reserved-height** fallbacks (CLS), and the helmet is split out (INP).
- [ ] **Assets:** `base.jpg`/`reveal.jpg` served as AVIF/WebP, correctly sized, with `decoding`/`fetchpriority` set; reserve their box to avoid shift.
- [ ] **Accessibility:** semantic landmarks, focus order, keyboard navigability, `prefers-reduced-motion` (P1-10), and contrast of `accent #D2FF00` text on dark backgrounds.
- [ ] **Mobile shader path:** confirm reduced star layers / point count / resolution on mobile (the `highp` full-screen fluid pass is the likely thermal offender).
- [ ] **Disposal:** geometries, materials, textures `dispose()`d; GSAP/ScrollTrigger killed on unmount.

---

## 6. Suggested execution order

1. **P0-1 (CLS), then P0-2 (LCP), then P0-3 (INP)** — redeploy and re-check Speed Insights after each.
2. **P1-1 (Tailwind v4 wiring)** and **P1-2 (router dep)** — these can silently break styling/builds; do early.
3. **P1-3 → P1-11** — head hygiene, shader correctness, reduced-motion.
4. **P2-x** — chunking, shader consolidation, lint, README.
5. Re-run the full `src/` checklist; re-measure field metrics over a fresh 7-day window (and gather a larger sample than the current 43/56 before trusting exact digits).





















---
*End of audit.*

