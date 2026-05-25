import { useEffect, useState, useRef } from 'react';
import { useProgress } from '@react-three/drei';
import { gsap } from 'gsap';

// ── Arc geometry helpers ────────────────────────────────────────────────────
function polar(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arc(cx, cy, r, a1, a2) {
  const s = polar(cx, cy, r, a1);
  const e = polar(cx, cy, r, a2);
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

// Tachometer constants
const CX = 120, CY = 120, R = 88;
const START = 135, SWEEP = 270;

// 9 major tick positions (0 → max RPM)
const TICKS = Array.from({ length: 10 }, (_, i) => {
  const deg = START + (i / 9) * SWEEP;
  return {
    inner: polar(CX, CY, R - 12, deg),
    outer: polar(CX, CY, R + 3,  deg),
    isRed: i >= 8,
  };
});

function statusLabel(p) {
  if (p < 20) return 'SYSTEM INIT...';
  if (p < 50) return 'LOADING ASSETS...';
  if (p < 80) return 'CALIBRATING HUD...';
  if (p < 100) return '⚠ REDLINE IMMINENT';
  return 'IGNITION';
}

export default function Loader({ onComplete }) {
  const { progress }  = useProgress();
  const [display, setDisplay] = useState(0);

  const loaderRef  = useRef(null);
  const gaugeRef   = useRef(null);
  const animated   = useRef({ value: 0 });

  // Smooth the displayed progress
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(animated.current, {
        value: Math.round(progress),
        duration: 1.1,
        ease: 'power2.out',
        onUpdate: () => setDisplay(Math.round(animated.current.value)),
      });
    });
    return () => ctx.revert();
  }, [progress]);

  // Exit sequence when 100%
  useEffect(() => {
    if (display < 100) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ onComplete })
        // Needle redline flash (3×)
        .to('#rt-needle', {
          filter: 'drop-shadow(0 0 10px #ff4444) drop-shadow(0 0 20px #ff4444)',
          duration: 0.12,
          repeat: 5,
          yoyo: true,
          ease: 'none',
        }, 0)
        // Gauge slams + skews out
        .to(gaugeRef.current, {
          scale: 1.45,
          skewX: -12,
          opacity: 0,
          duration: 0.38,
          ease: 'power4.in',
        }, 0.35)
        // Curtain lifts
        .to(loaderRef.current, {
          yPercent: -100,
          duration: 0.72,
          ease: 'power4.inOut',
        }, 0.5);
    }, loaderRef);
    return () => ctx.revert();
  }, [display, onComplete]);

  // Live arc geometry
  const currentEnd = START + (display / 100) * SWEEP;
  const arcColor   = display < 65 ? '#D2FF00' : display < 85 ? '#FFA500' : '#FF4444';
  const needleTip  = polar(CX, CY, R - 8, currentEnd);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[9950] bg-black flex flex-col items-center justify-center select-none"
    >
      {/* ── TACHOMETER GAUGE ─────────────────────────────────────────────── */}
      <div ref={gaugeRef} className="flex flex-col items-center gap-6">

        {/* SVG gauge */}
        <div className="relative w-[240px] h-[240px]">
          <svg
            viewBox="0 0 240 240"
            className="absolute inset-0 w-full h-full overflow-visible"
          >
            {/* Track — full sweep ghost */}
            <path
              d={arc(CX, CY, R, START, START + SWEEP)}
              fill="none" stroke="rgba(255,255,255,0.06)"
              strokeWidth="2.5" strokeLinecap="round"
            />

            {/* Permanent redline zone overlay */}
            <path
              d={arc(CX, CY, R, START + SWEEP * 0.85, START + SWEEP)}
              fill="none" stroke="rgba(255,68,68,0.18)"
              strokeWidth="4" strokeLinecap="round"
            />

            {/* Active progress arc */}
            {display > 0 && (
              <path
                d={arc(CX, CY, R, START, currentEnd)}
                fill="none" stroke={arcColor}
                strokeWidth="2.5" strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 4px ${arcColor}66)`, transition: 'stroke 0.25s ease' }}
              />
            )}

            {/* Tick marks */}
            {TICKS.map(({ inner, outer, isRed }, i) => (
              <line
                key={i}
                x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                stroke={isRed ? 'rgba(255,68,68,0.5)' : 'rgba(255,255,255,0.18)'}
                strokeWidth={i === 0 || i === 9 ? 1.8 : 1}
              />
            ))}

            {/* Needle */}
            {display > 0 && (
              <line
                id="rt-needle"
                x1={CX} y1={CY}
                x2={needleTip.x} y2={needleTip.y}
                stroke={arcColor} strokeWidth="1.5" strokeLinecap="round"
                opacity="0.9"
                style={{ filter: `drop-shadow(0 0 3px ${arcColor}80)` }}
              />
            )}

            {/* Center hub */}
            <circle cx={CX} cy={CY} r="5" fill={display > 0 ? arcColor : 'rgba(255,255,255,0.15)'}
              style={{ transition: 'fill 0.25s ease' }} />
            <circle cx={CX} cy={CY} r="2" fill="#000" />
          </svg>

          {/* Center text overlay — uses real DOM so font renders correctly */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className="font-mono font-black leading-none"
              style={{
                fontSize: '38px',
                color: '#ffffff',
                letterSpacing: '-0.04em',
                textShadow: `0 0 20px ${arcColor}40`,
                transition: 'text-shadow 0.25s ease',
              }}
            >
              {String(display).padStart(3, '0')}
            </span>
            <span
              className="font-mono font-bold text-[10px] tracking-[0.3em] mt-1"
              style={{ color: arcColor, transition: 'color 0.25s ease' }}
            >
              %
            </span>
          </div>
        </div>

        {/* Status labels */}
        <div className="text-center space-y-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.48em] text-white/35">
            RT•MOTO // IGNITION SEQUENCE
          </p>
          <p
            className="font-mono text-[8px] uppercase tracking-[0.3em] transition-colors duration-300"
            style={{ color: arcColor + 'cc' }}
          >
            {statusLabel(display)}
          </p>
        </div>
      </div>

      {/* ── CORNER BRACKETS ──────────────────────────────────────────────── */}
      {[
        'top-6 left-6',
        'top-6 right-6',
        'bottom-6 left-6',
        'bottom-6 right-6',
      ].map((pos, i) => {
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
