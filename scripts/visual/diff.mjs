// Pixel-diff before/ vs after/ screenshots.
// Usage: node diff.mjs <beforeDir> <afterDir> <outDir>
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';

const [, , beforeDir, afterDir, outDir] = process.argv;
mkdirSync(outDir, { recursive: true });

const names = readdirSync(beforeDir).filter((f) => f.endsWith('.png'));
const rows = [];

for (const n of names) {
  const bp = `${beforeDir}/${n}`, ap = `${afterDir}/${n}`;
  if (!existsSync(ap)) { rows.push([n, 'MISSING in after', '']); continue; }
  const b = PNG.sync.read(readFileSync(bp));
  const a = PNG.sync.read(readFileSync(ap));
  if (b.width !== a.width || b.height !== a.height) {
    rows.push([n, `SIZE MISMATCH ${b.width}x${b.height} vs ${a.width}x${a.height}`, '']);
    continue;
  }
  const d = new PNG({ width: b.width, height: b.height });
  // threshold 0.1 is sensitive; we WANT to catch small alpha shifts.
  const changed = pixelmatch(b.data, a.data, d.data, b.width, b.height, { threshold: 0.1 });
  const total = b.width * b.height;
  const pct = (changed / total) * 100;
  writeFileSync(`${outDir}/${n}`, PNG.sync.write(d));
  rows.push([n, `${changed} px`, `${pct.toFixed(2)}%`]);
}

console.log('section'.padEnd(14), 'changed'.padEnd(14), 'of frame');
console.log('-'.repeat(42));
for (const [n, c, p] of rows) console.log(n.replace('.png', '').padEnd(14), String(c).padEnd(14), p);
