import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ScanReveal({
  children,
  className = '',
  delay    = 0,
  duration = 1.1,
  start    = 'top 78%',
}) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const lineRef  = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        delay,
        scrollTrigger: {
          trigger: outerRef.current,
          start,
          once: true,
        },
      });

      tl.fromTo(
        innerRef.current,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration, ease: 'power2.inOut' }
      )
      .fromTo(
        lineRef.current,
        { top: '0%', opacity: 1 },
        { top: '95%', opacity: 0, duration, ease: 'power2.inOut' },
        '<'
      );
    }, outerRef);

    return () => ctx.revert();
  }, [delay, duration, start]);

  return (
    <div ref={outerRef} className={`relative ${className}`}>
      <div
        ref={innerRef}
        style={{ clipPath: 'inset(0% 0% 100% 0%)', willChange: 'clip-path' }}
      >
        {children}
      </div>

      {/* Scan line — outside the clipped div so it stays visible during the reveal */}
      <div
        ref={lineRef}
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: '0%',
          height: '2px',
          background: '#D2FF00',
          boxShadow: '0 0 8px rgba(210,255,0,0.9), 0 0 24px rgba(210,255,0,0.4)',
          zIndex: 100,
          opacity: 0,
        }}
      />
    </div>
  );
}
