import { useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MEDIA } from '@/data/media';

/**
 * Liquid 2D reveal for touch devices — the mobile counterpart of the desktop
 * WebGL shader, without three.js.
 *
 * Three reveal drivers, composed each frame:
 *   1. AUTO-SWEEP — once the reveal image decodes, a soft blob sweeps across
 *      the rider's face (same path as the desktop auto-sweep) so every visitor
 *      sees the human→rider duality without knowing to touch.
 *   2. TOUCH — the blob follows the finger with LERP lag; it swells on contact
 *      and recedes after release.
 *   3. SCROLL — as the hero scrolls away, the reveal expands to cover the
 *      frame: the rider fully emerges as you ride into the site.
 *
 * The rAF loop is demand-driven: it runs only while something is actually
 * changing (sweeping, converging toward a touch, radius settling, scroll
 * progressing) and stops dead otherwise.
 */

// Reveal geometry (fractions of the larger canvas dimension)
const R_TOUCH = 0.24;  // blob radius while a finger is down
const R_SWEEP = 0.20;  // blob radius at the peak of the auto-sweep
const FEATHER = 0.45;  // portion of the radius that fades to transparent
const LERP_POS = 0.10; // follow lag
const LERP_RAD = 0.08; // swell/recede lag

const SWEEP_DELAY_MS = 700;
const SWEEP_DURATION_S = 2.4;

// Focal point used to bias the scroll-driven reveal toward the rider
const FOCAL = { x: 0.45, y: 0.42 };

// Ambient idle life — a few always-present, low-strength blobs that drift on
// cheap sine paths so faint slivers of the rider (MEDIA.hero.reveal) keep
// breathing through the base photo when nothing else is happening. The mobile
// analog of the desktop shader's autonomous curl-noise cells. Touch + scroll
// still dominate (they set larger radius/alpha); ambient is the resting state,
// replacing today's "radius→0, dead." Honors the dual-identity reveal: drift
// stays bound to exploring the rider's face, never decorative chaos.
const AMBIENT = [
  { bx: 0.42, by: 0.40, ax: 0.05, ay: 0.04, fx: 0.16, fy: 0.11, ph: 0.0 },
  { bx: 0.52, by: 0.52, ax: 0.06, ay: 0.05, fx: 0.11, fy: 0.15, ph: 2.1 },
  { bx: 0.38, by: 0.55, ax: 0.04, ay: 0.05, fx: 0.13, fy: 0.09, ph: 4.2 },
];
const R_AMBIENT = 0.085; // ambient blob radius (fraction of maxDim)
const A_AMBIENT = 0.16;  // ambient blob peak alpha

export default function MobileRevealCanvas({ inView }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const kickRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = MEDIA.hero.reveal;
    const ready = () => {
      imageRef.current = img;
      kickRef.current?.('image');
    };
    if (img.decode) img.decode().then(ready).catch(ready);
    else img.onload = ready;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const el = containerRef.current;
    if (!canvas || !el) return;
    const ctx = canvas.getContext('2d');

    const size = () => {
      canvas.width = el.clientWidth || window.innerWidth;
      canvas.height = el.clientHeight || window.innerHeight;
    };
    size();

    // ── reveal state ──────────────────────────────────────────────────────
    const pos = { x: 0.5, y: 0.5 };
    const target = { x: 0.5, y: 0.5 };
    let radius = 0;          // px, lerped
    let targetRadius = 0;    // px
    let scrollMix = 0;       // 0..1, hero exit progress
    let drawnScrollMix = -1;
    let touching = false;
    let userInteracted = false;

    // auto-sweep
    let sweepT = -1;         // -1 idle, 0..1 running, 2 done
    let sweepTimer = 0;

    // liquid tail — a few decaying ghost blobs behind the main one
    const trail = [];
    let lastTrail = { x: -1, y: -1 };

    let rafId = 0;
    let lastTs = 0;
    let tSec = 0;            // seconds elapsed, drives ambient drift

    const maxDim = () => Math.max(canvas.width, canvas.height);

    const drawBlob = (cx, cy, r, alpha) => {
      if (r < 1 || alpha <= 0.01) return;
      const g = ctx.createRadialGradient(cx, cy, r * (1 - FEATHER), cx, cy, r);
      g.addColorStop(0, `rgba(255,255,255,${alpha})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = () => {
      const { width, height } = canvas;
      const img = imageRef.current;
      ctx.clearRect(0, 0, width, height);
      if (!img) return;

      // Scroll-driven expansion: blends the blob toward a frame-covering
      // circle centred on the rider as the hero exits.
      const sm = scrollMix * scrollMix * (3 - 2 * scrollMix); // smoothstep
      const coverR = maxDim() * 1.15;
      const cx = (pos.x + (FOCAL.x - pos.x) * sm) * width;
      const cy = (pos.y + (FOCAL.y - pos.y) * sm) * height;
      const r = Math.max(radius, coverR * sm);
      const hasMain = r >= 1;

      // ── mask ──
      ctx.save();

      // Ambient idle blobs — faded out as the scroll reveal takes over (sm→1).
      const ambientAlpha = A_AMBIENT * (1 - sm);
      if (ambientAlpha > 0.01) {
        const ar = R_AMBIENT * maxDim();
        for (const a of AMBIENT) {
          const axp = (a.bx + Math.sin(tSec * a.fx * Math.PI * 2 + a.ph) * a.ax) * width;
          const ayp = (a.by + Math.cos(tSec * a.fy * Math.PI * 2 + a.ph) * a.ay) * height;
          drawBlob(axp, ayp, ar, ambientAlpha);
        }
      }

      for (const t of trail) drawBlob(t.x * width, t.y * height, r * 0.55 * t.s, 0.85 * t.s);
      if (hasMain) drawBlob(cx, cy, r, 1);

      // keep only the image inside the mask
      ctx.globalCompositeOperation = 'source-in';

      // object-cover math (matches the <img> object-position 43% 46%)
      const imgRatio = img.width / img.height;
      const canvasRatio = width / height;
      let drawW, drawH, drawX, drawY;
      if (imgRatio > canvasRatio) {
        drawH = height;
        drawW = height * imgRatio;
        drawX = (width - drawW) * 0.43;
        drawY = 0;
      } else {
        drawW = width;
        drawH = width / imgRatio;
        drawX = 0;
        drawY = (height - drawH) * 0.46;
      }
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      // lime rim — fades out as the scroll reveal takes over
      const rimAlpha = 0.30 * (1 - sm) * Math.min(1, radius / 40);
      if (rimAlpha > 0.02) {
        ctx.strokeStyle = `rgba(210,255,0,${rimAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.92, 0, Math.PI * 2);
        ctx.stroke();
      }

      drawnScrollMix = scrollMix;
    };

    const render = (ts) => {
      rafId = 0;
      if (!imageRef.current) return; // image decode kicks again

      const dt = Math.min((ts - lastTs) / 1000 || 0.016, 0.05);
      lastTs = ts;
      tSec += dt;

      // auto-sweep drives target + radius until done or interrupted
      if (sweepT >= 0 && sweepT < 1 && !userInteracted) {
        sweepT = Math.min(1, sweepT + dt / SWEEP_DURATION_S);
        const p = sweepT;
        target.x = 0.30 + 0.34 * p;
        target.y = 0.52 + Math.sin(p * Math.PI) * 0.05;
        targetRadius = Math.sin(p * Math.PI) * R_SWEEP * maxDim();
        if (sweepT >= 1) { sweepT = 2; targetRadius = 0; }
      }

      // LERP toward targets
      pos.x += (target.x - pos.x) * LERP_POS;
      pos.y += (target.y - pos.y) * LERP_POS;
      radius += (targetRadius - radius) * LERP_RAD;

      // liquid tail bookkeeping (only while the blob is alive and moving)
      if (radius > 2) {
        const moved = Math.hypot(pos.x - lastTrail.x, pos.y - lastTrail.y);
        if (moved > 0.02) {
          trail.push({ x: pos.x, y: pos.y, s: 1 });
          if (trail.length > 5) trail.shift();
          lastTrail = { x: pos.x, y: pos.y };
        }
      }
      const dk = Math.exp(-dt * 2.6);
      for (const t of trail) t.s *= dk;
      while (trail.length && trail[0].s < 0.04) trail.shift();

      draw();

      // Ambient keeps the loop ticking while the hero is on screen; once the
      // hero is essentially scrolled away (sm→1) there's nothing to breathe,
      // so we allow settling (and the inView teardown cancels the rAF anyway).
      const ambientActive = scrollMix < 0.999;
      const settled =
        !ambientActive &&
        (sweepT < 0 || sweepT >= 2 || userInteracted) &&
        !touching &&
        Math.abs(target.x - pos.x) < 0.002 &&
        Math.abs(target.y - pos.y) < 0.002 &&
        Math.abs(targetRadius - radius) < 0.5 &&
        trail.length === 0 &&
        Math.abs(scrollMix - drawnScrollMix) < 0.002;
      if (!settled) rafId = requestAnimationFrame(render);
    };

    const kick = () => {
      if (!rafId && inView) {
        lastTs = performance.now();
        rafId = requestAnimationFrame(render);
      }
    };
    kickRef.current = kick;

    // ── touch ────────────────────────────────────────────────────────────
    const onTouchStart = (e) => {
      userInteracted = true;
      touching = true;
      targetRadius = R_TOUCH * maxDim();
      const t = e.touches[0];
      const rct = el.getBoundingClientRect();
      target.x = (t.clientX - rct.left) / rct.width;
      target.y = (t.clientY - rct.top) / rct.height;
      // first contact teleports the blob under the finger instead of gliding
      if (radius < 2) { pos.x = target.x; pos.y = target.y; }
      kick();
    };
    const onTouchMove = (e) => {
      const t = e.touches[0];
      const rct = el.getBoundingClientRect();
      target.x = (t.clientX - rct.left) / rct.width;
      target.y = (t.clientY - rct.top) / rct.height;
      kick();
    };
    const onTouchEnd = () => {
      touching = false;
      targetRadius = 0; // recede gracefully
      kick();
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    // ── auto-sweep arming ────────────────────────────────────────────────
    sweepTimer = window.setTimeout(() => {
      if (!userInteracted && sweepT < 0) {
        sweepT = 0;
        kick();
      }
    }, SWEEP_DELAY_MS);

    // ── scroll-driven reveal ─────────────────────────────────────────────
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: '85% top',
      onUpdate: (self) => {
        scrollMix = self.progress;
        kick();
      },
    });

    const onResize = () => { size(); kick(); };
    window.addEventListener('resize', onResize);

    kick(); // no-op until the image is decoded

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('resize', onResize);
      window.clearTimeout(sweepTimer);
      st.kill();
      if (rafId) cancelAnimationFrame(rafId);
      kickRef.current = null;
    };
  }, [inView]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-auto">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
