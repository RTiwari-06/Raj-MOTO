import { forwardRef, useImperativeHandle, useRef } from 'react';

// CSS/SVG instrument cluster that sits BEHIND the odometer reels — a dark
// gauge-face vignette, faint concentric arcs + tick marks, and a thin lime
// needle that sweeps as the count climbs. Driven imperatively (setProgress
// 0..1) by the parent's GSAP counter so there are zero React re-renders per
// frame; the needle is a single SVG transform → cheap on mobile. No WebGL.
const SWEEP_DEG = 240;   // total needle travel
const START_DEG = -120;  // needle angle at progress 0
const TICKS = 41;        // tick marks across the sweep (every 5th is major)

const OdometerBackground = forwardRef(function OdometerBackground(_props, ref) {
  const needleRef = useRef(null);

  useImperativeHandle(ref, () => ({
    setProgress(p) {
      const clamped = Math.max(0, Math.min(1, p));
      const a = START_DEG + clamped * SWEEP_DEG;
      needleRef.current?.setAttribute('transform', `rotate(${a} 100 100)`);
    },
  }), []);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* instrument vignette */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 46%, rgba(22,22,22,0.9) 0%, #060606 58%, #000 100%)' }}
      />
      <svg
        viewBox="0 0 200 200"
        className="relative w-[130vw] max-w-[820px] aspect-square opacity-50"
        aria-hidden="true"
      >
        {/* concentric gauge arcs */}
        <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
        <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.4" />

        {/* tick marks */}
        {Array.from({ length: TICKS }).map((_, i) => {
          const aRad = ((START_DEG + (i / (TICKS - 1)) * SWEEP_DEG) * Math.PI) / 180;
          const major = i % 5 === 0;
          const r1 = 92;
          const r2 = major ? 82 : 87;
          const x1 = 100 + r1 * Math.sin(aRad);
          const y1 = 100 - r1 * Math.cos(aRad);
          const x2 = 100 + r2 * Math.sin(aRad);
          const y2 = 100 - r2 * Math.cos(aRad);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={major ? 'rgba(210,255,0,0.45)' : 'rgba(255,255,255,0.15)'}
              strokeWidth={major ? 1 : 0.5}
            />
          );
        })}

        {/* needle */}
        <g ref={needleRef} transform={`rotate(${START_DEG} 100 100)`}>
          <line
            x1="100" y1="100" x2="100" y2="18"
            stroke="#D2FF00" strokeWidth="1.4" strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 4px rgba(210,255,0,0.7))' }}
          />
          <circle cx="100" cy="100" r="3" fill="#D2FF00" />
        </g>
      </svg>
    </div>
  );
});

export default OdometerBackground;
