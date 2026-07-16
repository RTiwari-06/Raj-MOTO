import { forwardRef, useImperativeHandle, useRef } from 'react';

// Mechanical geared odometer. Each place's drum rotates at 1/10 the speed of
// the place to its right — exactly like a real bike odometer — so a continuous
// count value produces an authentic rolling read. Driven imperatively by the
// parent's GSAP counter (setValue) so there are zero React re-renders per frame.
// Transform-only (translateY) → cheap on mobile; honors the project motion doctrine.
//
// Each digit is an 11-cell strip (0-9 plus a trailing 0) so the 9→0 wrap rolls
// forward instead of snapping backward. Cells are 1em tall, so translateY is
// expressed directly in `em` = cell counts.
const STRIP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

const RollingOdometer = forwardRef(function RollingOdometer(
  { digits = 5, comma = 2, unit = 'KM', ariaValue = '' },
  ref,
) {
  const strips = useRef([]);

  useImperativeHandle(ref, () => ({
    setValue(v) {
      for (let i = 0; i < digits; i++) {
        const strip = strips.current[i];
        if (!strip) continue;
        const place = Math.pow(10, digits - 1 - i); // leftmost = highest place
        const drumVal = (v / place) % 10;           // continuous 0..10
        strip.style.transform = `translateY(${-drumVal}em)`;
      }
    },
  }), [digits]);

  return (
    <div
      role="img"
      aria-label={ariaValue}
      className="flex items-end justify-center text-white"
      style={{ fontSize: 'clamp(3.5rem, 16vw, 12rem)', letterSpacing: 0 }}
    >
      {Array.from({ length: digits }).map((_, i) => (
        <span key={i} className="flex items-end">
          {i === comma && (
            <span className="font-black leading-none text-fg-muted mx-[0.02em]">,</span>
          )}
          <span
            className="relative overflow-hidden"
            style={{ height: '1em', width: '0.62em' }}
          >
            <span
              ref={(el) => (strips.current[i] = el)}
              className="absolute inset-x-0 top-0 flex flex-col items-center font-black leading-none will-change-transform"
              style={{ transform: 'translateY(0em)' }}
            >
              {STRIP.map((d, j) => (
                <span
                  key={j}
                  className="flex items-center justify-center tabular-nums"
                  style={{ height: '1em', width: '100%' }}
                >
                  {d}
                </span>
              ))}
            </span>
          </span>
        </span>
      ))}
      <span
        className="font-mono font-black uppercase tracking-[0.18em] text-accent ml-[0.16em] mb-[0.16em]"
        style={{ fontSize: '0.1em' }}
      >
        {unit}
      </span>
    </div>
  );
});

export default RollingOdometer;
