// Visual regression: screenshot every section at <baseline> and at the working
// tree, then pixel-diff. See ./README.md — a non-zero diff is not automatically
// a regression; open the diff PNG.
//
// Usage: node scripts/visual/run.mjs [baseline-ref]   (default HEAD~1)
import { execSync } from 'node:child_process';
import { rmSync, mkdirSync } from 'node:fs';

const baseline = process.argv[2] || 'HEAD~1';
const OUT = '.visual';
const PORT_AFTER = 4173;
const PORT_BEFORE = 4174;

const sh = (cmd, opts = {}) => execSync(cmd, { stdio: 'inherit', ...opts });
const quiet = (cmd) => execSync(cmd, { stdio: 'pipe' }).toString().trim();

// Refuse to run with a dirty tree: this script checks out `baseline` over src/
// and restores afterwards. Uncommitted work would be destroyed by the restore.
const dirty = quiet('git status --porcelain src/');
if (dirty) {
  console.error('src/ has uncommitted changes. Commit or stash first —\n' +
                'this script checks out the baseline over src/ and would lose them.\n' + dirty);
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const { spawn } = await import('node:child_process');

try {
  console.log(`\n── after (working tree) ─────────────────────────────`);
  sh('npm run build');
  const p1 = spawn('npx', ['vite', 'preview', '--port', String(PORT_AFTER)], { shell: true, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 5000));
  sh(`node scripts/visual/shoot.mjs ${OUT}/after http://localhost:${PORT_AFTER}`);
  p1.kill();

  console.log(`\n── before (${baseline}) ─────────────────────────────`);
  sh(`git checkout ${baseline} -- src/`);
  sh('npm run build');
  const p2 = spawn('npx', ['vite', 'preview', '--port', String(PORT_BEFORE)], { shell: true, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 5000));
  sh(`node scripts/visual/shoot.mjs ${OUT}/before http://localhost:${PORT_BEFORE}`);
  p2.kill();
} finally {
  // Always restore src/, even if a build or shoot threw — otherwise the working
  // tree is silently left at the baseline revision.
  sh('git checkout HEAD -- src/');
  console.log('\nsrc/ restored to HEAD');
}

console.log(`\n── diff ────────────────────────────────────────────`);
sh(`node scripts/visual/diff.mjs ${OUT}/before ${OUT}/after ${OUT}/diff`);
console.log(`\nDiff images: ${OUT}/diff/  — open them before calling anything a regression.`);
