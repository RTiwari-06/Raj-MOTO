// RT•MOTO — one-shot image optimizer (npm run images)
// Generates web-sized WebP variants next to the originals. Originals are never
// deleted; helmet_img* are the only in-place rewrites (their filenames are
// referenced by helmet.glb) and each gets a `.orig.jpg` backup first.
import sharp from 'sharp';
import { copyFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');

// [source, output, width, quality]
const WEBP_JOBS = [
  // Hero (LCP image + desktop shader textures)
  ['base.jpg',   'base-960.webp',    960, 78],
  ['base.jpg',   'base-1920.webp',  1920, 78],
  ['reveal.jpg', 'reveal-1920.webp', 1920, 78],

  // Contact rider cutout (alpha preserved)
  ['bike-2.png', 'bike-2-cutout.webp', 1000, 80],

  // Navbar brand mark (portrait; ~2x its ~36px render height)
  ['media/svgs/brand_logo.png', 'media/svgs/brand_logo.webp', 135, 90],

  // Rides / gallery
  ['bike-4.jpg', 'bike-4-1600.webp', 1600, 72],
  ['bike-4.jpg', 'bike-4-800.webp',   800, 72],
  ['moto-night-duo.webp', 'moto-night-duo-1600.webp', 1600, 72],

  // Maintenance log
  ['media/log/motul.jpg', 'media/log/motul-800.webp', 800, 72],

  // Archive raw feed + gallery tile
  ['media/gallery/biryani.jpg', 'media/gallery/biryani-1200.webp', 1200, 70],
  ['media/gallery/IMG_20230611_180844_045.webp', 'media/gallery/IMG_20230611_180844_045-1200.webp', 1200, 70],
  ['media/gallery/IMG_20230903_150642.jpg', 'media/gallery/IMG_20230903_150642-1200.webp', 1200, 70],
  ['media/gallery/IMG_20240831_195216304.jpg', 'media/gallery/IMG_20240831_195216304-1200.webp', 1200, 70],
  ['media/gallery/IMG_202408nenjwnj5098_HDR_AE.jpg', 'media/gallery/IMG_202408nenjwnj5098_HDR_AE-1200.webp', 1200, 70],
  ['media/gallery/IMG_20260110_001153088_HDR_AE.jpg', 'media/gallery/IMG_20260110_001153088_HDR_AE-1200.webp', 1200, 70],
  ['media/gallery/IMG20230903161035.jpg', 'media/gallery/IMG20230903161035-1200.webp', 1200, 70],
  ['media/gallery/Screenshot_2023-10-17-23-33-12-635_org.videolan.vlc.jpg', 'media/gallery/Screenshot_2023-10-17-23-33-12-635_org.videolan.vlc-1200.webp', 1200, 70],
];

// helmet.glb references these filenames directly — recompress in place
// (max 1024px, JPEG q72) with a .orig.jpg backup alongside.
const HELMET_JOBS = ['helmet_img0.jpg', 'helmet_img1.jpg', 'helmet_img3.jpg', 'helmet_img4.jpg'];

const kb = (n) => `${Math.round(n / 1024)}KB`;

async function run() {
  for (const [src, out, width, quality] of WEBP_JOBS) {
    const srcPath = path.join(PUBLIC, src);
    const outPath = path.join(PUBLIC, out);
    if (!existsSync(srcPath)) { console.warn(`SKIP (missing): ${src}`); continue; }
    await sharp(srcPath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toFile(outPath);
    const [a, b] = await Promise.all([stat(srcPath), stat(outPath)]);
    console.log(`${src} ${kb(a.size)} -> ${out} ${kb(b.size)}`);
  }

  for (const name of HELMET_JOBS) {
    const srcPath = path.join(PUBLIC, name);
    if (!existsSync(srcPath)) { console.warn(`SKIP (missing): ${name}`); continue; }
    const backup = srcPath.replace(/\.jpg$/, '.orig.jpg');
    if (!existsSync(backup)) await copyFile(srcPath, backup);
    const buf = await sharp(backup)
      .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 72, mozjpeg: true })
      .toBuffer();
    const before = (await stat(srcPath)).size;
    if (buf.length < before) {
      await sharp(buf).toFile(srcPath);
      console.log(`${name} ${kb(before)} -> ${kb(buf.length)} (in place, backup: ${path.basename(backup)})`);
    } else {
      console.log(`${name} already optimal (${kb(before)})`);
    }
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
