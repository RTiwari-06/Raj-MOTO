import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { DUR, EASE } from '@/motion/system';
import { MEDIA } from '@/data/media';

function statusLabel(p) {
  if (p < 20) return 'SYSTEM INIT...';
  if (p < 50) return 'LOADING ASSETS...';
  if (p < 80) return 'CALIBRATING HUD...';
  if (p < 100) return '⚠ REDLINE IMMINENT';
  return 'IGNITION';
}

// Colour zones: lime → orange → redline as the needle climbs
const zoneColor = (p) => (p < 65 ? '#D2FF00' : p < 85 ? '#FFA500' : '#FF4444');

// How long the loader may hold the page, no matter what is still in flight.
const HARD_CAP_MS = 1800;

export default function Loader({ onComplete }) {
  const loaderRef = useRef(null);
  const gaugeRef  = useRef(null);
  const animated  = useRef({ value: 0 });

  // Per-tick gauge updates write straight to the DOM — a setState per GSAP
  // tick re-rendered the whole loader ~60×/s and blocked touch input on
  // throttled mobile CPUs during the intro.
  const numRef    = useRef(null);
  const pctRef    = useRef(null);
  const statusRef = useRef(null);
  const fillRef   = useRef(null);

  const [done, setDone] = useState(false);

  // Readiness gate — hero image decoded + fonts ready, hard-capped. The old
  // drei useProgress source pulled three.js into the eager bundle and never
  // resolved when the WebGL canvas didn't mount (reduced motion / mobile).
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const finish = () => { if (!cancelled) setReady(true); };

    const img = new Image();
    img.src = MEDIA.hero.primary;
    const imgReady = img.decode ? img.decode().catch(() => {}) : Promise.resolve();
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    Promise.all([imgReady, fontsReady]).then(finish);

    const cap = setTimeout(finish, HARD_CAP_MS);
    return () => { cancelled = true; clearTimeout(cap); };
  }, []);

  // Gauge ramp — climbs toward redline while loading, slams to 100 when ready.
  useEffect(() => {
    let lastShown = -1;
    const tween = gsap.to(animated.current, {
      value: ready ? 100 : 92,
      duration: ready ? DUR.fast : 1.5,
      ease: EASE.momentum,
      overwrite: 'auto',
      onUpdate: () => {
        const d = Math.round(animated.current.value);
        if (d === lastShown) return;
        lastShown = d;

        const color = zoneColor(d);
        if (numRef.current) {
          numRef.current.textContent = String(d).padStart(3, '0');
          numRef.current.style.textShadow = `0 0 32px ${color}33`;
        }
        if (pctRef.current) pctRef.current.style.color = color;
        if (statusRef.current) {
          statusRef.current.textContent = statusLabel(d);
          statusRef.current.style.color = color + 'cc';
        }
        if (fillRef.current) {
          fillRef.current.style.width = `${d}%`;
          fillRef.current.style.background = color;
          fillRef.current.style.boxShadow = `0 0 18px ${color}99`;
        }

        if (d >= 100) setDone(true);
      },
    });
    return () => tween.kill();
  }, [ready]);

  // Exit sequence when 100%
  useEffect(() => {
    if (!done) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ onComplete })
        // Fill bar redline flash
        .to('#rt-fill', {
          boxShadow: '0 0 30px #ff4444, 0 0 60px #ff4444',
          duration: DUR.instant,
          repeat: 5,
          yoyo: true,
          ease: 'none',
        }, 0)
        // Gauge slams + skews out
        .to(gaugeRef.current, {
          scale: 1.08,
          skewX: -8,
          opacity: 0,
          duration: DUR.feedback,
          ease: EASE.exit,
        }, 0.35)
        // Curtain lifts
        .to(loaderRef.current, {
          yPercent: -100,
          duration: DUR.standard,
          ease: EASE.precision,
        }, 0.5);
    }, loaderRef);
    return () => ctx.revert();
  }, [done, onComplete]);

  return (
    <div
      ref={loaderRef}
      className="loader-shell fixed inset-0 z-[9950] flex flex-col items-center justify-center select-none px-8"
    >
      <div ref={gaugeRef} className="w-full max-w-2xl flex flex-col gap-7">

        {/* Top status row */}
        <div className="flex items-center justify-between">
          <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/35">
            RT-MOTO // IGNITION SEQUENCE
          </p>
          <p
            ref={statusRef}
            className="font-mono text-[8px] uppercase tracking-[0.3em] transition-colors duration-300"
            style={{ color: '#D2FF00cc' }}
          >
            SYSTEM INIT...
          </p>
        </div>

        {/* Huge % readout */}
        <div className="flex items-end gap-4">
          <span
            ref={numRef}
            className="font-serif font-black leading-none text-white"
            style={{
              fontSize: 'clamp(4rem, 14vw, 9rem)',
              letterSpacing: '-0.04em',
              textShadow: '0 0 32px #D2FF0033',
              transition: 'text-shadow 0.25s ease',
            }}
          >
            000
          </span>
          <span
            ref={pctRef}
            className="mb-3 font-mono text-xl font-bold"
            style={{ color: '#D2FF00', transition: 'color 0.25s ease' }}
          >
            %
          </span>
          <span className="ml-auto mb-3 font-mono text-[10px] tracking-[0.3em] uppercase text-white/25">
            RPM ×10³
          </span>
        </div>

        {/* Horizontal RPM / throttle bar */}
        <div className="relative w-full">
          <div className="relative h-4 w-full overflow-hidden bg-white/[0.06]">
            {/* Permanent redline zone (last 15%) */}
            <div className="absolute right-0 top-0 h-full" style={{ width: '15%', background: 'rgba(255,68,68,0.18)' }} />
            {/* Active fill */}
            <div
              id="rt-fill"
              ref={fillRef}
              className="absolute left-0 top-0 h-full"
              style={{
                width: '0%',
                background: '#D2FF00',
                boxShadow: '0 0 18px #D2FF0099',
                transition: 'width 0.25s ease, background 0.25s ease',
              }}
            />
          </div>
          {/* Tick marks */}
          <div className="absolute inset-0 flex justify-between pointer-events-none">
            {Array.from({ length: 11 }).map((_, i) => (
              <span
                key={i}
                className="h-full"
                style={{ width: '1px', background: i >= 9 ? 'rgba(255,68,68,0.5)' : 'rgba(255,255,255,0.18)' }}
              />
            ))}
          </div>
        </div>

        {/* Scale labels */}
        <div className="flex justify-between font-mono text-[8px] tracking-[0.25em] text-white/25">
          <span>0</span>
          <span>IDLE</span>
          <span>CRUISE</span>
          <span style={{ color: 'rgba(255,68,68,0.7)' }}>REDLINE</span>
        </div>
      </div>

      {/* Corner brackets */}
      {['top-6 left-6', 'top-6 right-6', 'bottom-6 left-6', 'bottom-6 right-6'].map((pos, i) => {
        const isRight  = pos.includes('right');
        const isBottom = pos.includes('bottom');
        return (
          <div key={i} className={`absolute ${pos} w-5 h-5`} aria-hidden="true">
            <div className={`absolute ${isBottom ? 'bottom-0' : 'top-0'} ${isRight ? 'right-0' : 'left-0'} w-full h-px bg-[#D2FF00]/28`} />
            <div className={`absolute ${isBottom ? 'bottom-0' : 'top-0'} ${isRight ? 'right-0' : 'left-0'} w-px h-full bg-[#D2FF00]/28`} />
          </div>
        );
      })}
    </div>
  );
}
