# Visual regression harness

Screenshots every section at two git revisions and pixel-diffs them.

```bash
npm run verify:visual                 # baseline = HEAD~1
npm run verify:visual -- <git-ref>    # baseline = <git-ref>
```

Output lands in `.visual/{before,after,diff}/` (gitignored) plus a table of how
much each section moved.

## Why this exists

Colour/token refactors are exactly the kind of change where `npm run build` and
`eslint` both pass while the page is broken. During the 2026-07-16 token
migration a `sed` produced:

```js
const DOT_IDLE = DOT_IDLE;   // TDZ — crashes RidesSection at module evaluation
```

Build: green. Lint: clean. The page would have thrown on load. A sibling error
produced a circular `--color-accent-soft: var(--color-accent-soft)`, which
silently resolves to nothing. Static checks do not cover this category — only
loading the page does. `shoot.mjs` fails loudly on `pageerror`.

## Reading the output

**A non-zero diff is not automatically a regression.** Known sources of noise,
confirmed during the token migration:

- `.arsenal-text` (TheMachine) runs `arsenalPulse` on an infinite loop gated on a
  `.motion-off` class, *not* `prefers-reduced-motion` — so the two runs catch it
  at different phases. Showed ~0.21% with zero colour change.
- Lazy-loaded images settle at slightly different moments → a strip of diff at
  whichever edge was mid-load. Showed ~0.39% in the gallery.
- Navbar scramble text resolves on its own clock.

So: **always open the diff PNG before calling something a regression.** The
percentage tells you where to look, not what happened.

## Gotchas

- Scripts must live inside the project — run from a scratch dir, Node cannot
  resolve `playwright` from `node_modules`.
- `DoctrineSection` has **no `id`** (it is wrapped in `<ScanReveal>`), so it is
  targeted via `.dx-bar`. If that class ever moves, the shot silently skips —
  and Doctrine is usually the section you most want to see.
- Section anchors are `hero thesis machine gear story gallery connect`.
  Note it is `#connect`, not `#contact` — the navbar labels it "COORDINATES".
