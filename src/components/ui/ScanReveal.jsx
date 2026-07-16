import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE } from '@/motion/system';

// Coarse-pointer (touch) devices get a compositor-only fade instead of the
// clip-path + scan-line sweep: animating a clip inset repaints the entire
// wrapped section every frame, which stutters and can freeze mobile GPUs.
const SIMPLE_REVEAL =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

export default function ScanReveal({
  children,
  className = '',
  delay    = 0,
  duration = 0.6,
  start    = 'top 78%',
}) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const lineRef  = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (SIMPLE_REVEAL) {
        gsap.fromTo(
          innerRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            delay,
            duration,
            ease: EASE.authority,
            clearProps: 'opacity',
            scrollTrigger: {
              trigger: outerRef.current,
              start,
              once: true,
            },
          }
        );
        return;
      }

      const tl = gsap.timeline({
        delay,
        scrollTrigger: {
          trigger: outerRef.current,
          start,
          once: true,
        },
        onComplete: () => {
          // Release the clip + compositor hint once revealed, otherwise every
          // wrapped section holds a render layer for the rest of the session.
          gsap.set(innerRef.current, { clearProps: 'clipPath,willChange' });
          gsap.set(lineRef.current, { display: 'none' });
        },
      });

      tl.fromTo(
        innerRef.current,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration, ease: EASE.authority }
      )
      .fromTo(
        lineRef.current,
        // Sweep via transform — animating `top` forces layout every frame.
        { y: 0, opacity: 1 },
        {
          y: () => (outerRef.current ? outerRef.current.offsetHeight * 0.95 : 0),
          opacity: 0,
          duration,
          ease: EASE.authority,
        },
        '<'
      );
    }, outerRef);

    return () => ctx.revert();
  }, [delay, duration, start]);

  return (
    <div ref={outerRef} className={`relative ${className}`}>
      <div
        ref={innerRef}
        style={
          SIMPLE_REVEAL
            ? { opacity: 0 }
            : { clipPath: 'inset(0% 0% 100% 0%)', willChange: 'clip-path' }
        }
      >
        {children}
      </div>

      {/* Scan line — outside the clipped div so it stays visible during the reveal */}
      {!SIMPLE_REVEAL && (
        <div
          ref={lineRef}
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            top: 0,
            height: '2px',
            background: 'var(--color-accent)',
            boxShadow: '0 0 8px var(--color-accent), 0 0 24px var(--color-accent-soft)',
            zIndex: 100,
            opacity: 0,
          }}
        />
      )}
    </div>
  );
}
