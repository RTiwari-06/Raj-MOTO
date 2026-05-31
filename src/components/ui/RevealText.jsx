import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DUR, STAGGER, ST } from '@/motion/system';

export function RevealText({ text, className }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const words = containerRef.current.querySelectorAll('.word');
      gsap.fromTo(words,
        { y: '110%', opacity: 0 },
        {
          y: '0%',
          opacity: 1,
          duration: DUR.cinematic,
          stagger: STAGGER.words,
          ease: EASE.precision,
          scrollTrigger: {
            trigger: containerRef.current,
            start: ST.start.section,
            once: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const wordElements = text.split(' ').map((word, i) => (
    <span key={i} className="overflow-hidden inline-block mr-[0.2em] mb-[0.1em]">
      <span className="word inline-block">{word}</span>
    </span>
  ));

  return (
    <div ref={containerRef} className={className}>
      {wordElements}
    </div>
  );
}
