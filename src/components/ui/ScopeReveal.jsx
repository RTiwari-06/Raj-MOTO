import { useEffect, useRef } from 'react';

/**
 * ScopeReveal — a cursor-driven "thermal scope" reveal lens.
 *
 * At rest the panel shows a cold, desaturated STANDBY feed. The pointer becomes a
 * lime reticle that carves a circular live-colour window through it (radial mask),
 * with a crosshair, a spinning dashed ring and a coordinate-lock readout chip that
 * tracks the cursor. Fully self-contained — no GSAP, no shared store, no global refs.
 *
 * Drop it anywhere:
 *   <ScopeReveal base="/base.jpg" reveal="/reveal.jpg" label="SECTOR 07" />
 *
 * Props
 *   base    standby image src (shown desaturated)              default "/base.jpg"
 *   reveal  live image src (revealed inside the scope circle)  default "/reveal.jpg"
 *   radius  scope radius in px                                 default 150
 *   label   top-left HUD tag                                   default "SECTOR 07"
 *   coord   bottom-left coordinate readout                     default Leh, Ladakh
 *   ghost   oversized outlined backdrop word                   default "SCAN"
 *   className  extra classes for the outer panel
 */
export default function ScopeReveal({
  base = '/base.jpg',
  reveal = '/reveal.jpg',
  radius = 150,
  label = 'SECTOR 07',
  coord = '34.1°N · 77.6°E',
  ghost = 'SCAN',
  className = '',
}) {
  const elRef = useRef(null);
  const xRef = useRef(null);
  const yRef = useRef(null);
  const rafRef = useRef(0);
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    // Touch / no-hover devices use the CSS fallback (full reveal, no scope).
    if (window.matchMedia('(hover: none)').matches) return;

    const flush = () => {
      rafRef.current = 0;
      const { x, y } = posRef.current;
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
      if (xRef.current) xRef.current.textContent = String(Math.round(x)).padStart(4, '0');
      if (yRef.current) yRef.current.textContent = String(Math.round(y)).padStart(4, '0');
    };

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      posRef.current.x = e.clientX - rect.left;
      posRef.current.y = e.clientY - rect.top;
      if (!rafRef.current) rafRef.current = requestAnimationFrame(flush);
    };
    const onEnter = () => {
      el.style.setProperty('--r', `${radius}px`);
      el.classList.add('is-scanning');
    };
    const onLeave = () => {
      el.style.setProperty('--r', '0px');
      el.classList.remove('is-scanning');
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [radius]);

  return (
    <div ref={elRef} className={`scope ${className}`}>
      <img className="scope__layer scope__base" src={base} alt="" draggable="false" />
      <img className="scope__layer scope__reveal" src={reveal} alt="" draggable="false" />

      <div className="scope__scan" aria-hidden="true" />
      <div className="grain-layer" aria-hidden="true" />
      <div className="scope__vignette" aria-hidden="true" />

      <span className="brk tl" aria-hidden="true" />
      <span className="brk tr" aria-hidden="true" />
      <span className="brk bl" aria-hidden="true" />
      <span className="brk br" aria-hidden="true" />

      <span className="scope__ghost ghost-mark" aria-hidden="true">{ghost}</span>

      <div className="scope__hud-top">
        <span className="scope__tag">▣ {label}</span>
        <span className="scope__status">
          <span className="scope__status-standby">SIGNAL // STANDBY</span>
          <span className="scope__status-live">● LIVE FEED</span>
        </span>
      </div>

      <div className="scope__hud-bot">
        <span>{coord}</span>
        <span className="scope__hint">◂ MOVE TO SCAN ▸</span>
      </div>

      <div className="scope__reticle" aria-hidden="true">
        <div className="scope__ring" />
        <div className="scope__ring scope__ring--spin" />
        <div className="scope__cross" />
      </div>

      <div className="scope__readout" aria-hidden="true">
        <span className="scope__readout-live">LOCK</span>
        <span className="scope__readout-xy">
          X:<b ref={xRef}>0000</b> Y:<b ref={yRef}>0000</b>
        </span>
      </div>
    </div>
  );
}
