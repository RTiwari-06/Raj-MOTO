import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Hardware-accelerated SVG path animation component.
 * Animates the stroke-dashoffset on scroll to create a "drawing" effect.
 */
export default function SignatureDraw({ 
  path, 
  viewBox = "0 0 200 100", 
  className = "", 
  color = "#D2FF00",
  strokeWidth = 2,
  duration = 1.5,
  delay = 0
}) {
  const svgRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;

    // Get the total length of the path
    const length = el.getTotalLength();

    // Set up the dash array/offset for the drawing effect
    gsap.set(el, {
      strokeDasharray: length,
      strokeDashoffset: length,
      visibility: 'visible',
    });

    const ctx = gsap.context(() => {
      gsap.to(el, {
        strokeDashoffset: 0,
        duration: duration,
        delay: delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: svgRef.current,
          start: 'top 85%', // Trigger slightly before it hits the 75% line for a natural feel
          once: true,
        },
      });
    });

    return () => ctx.revert();
  }, [duration, delay]);

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      className={`overflow-visible ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        ref={pathRef}
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ willChange: 'stroke-dashoffset', visibility: 'hidden' }}
      />
    </svg>
  );
}
