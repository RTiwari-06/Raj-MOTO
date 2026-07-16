import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MEDIA } from '@/data/media';
import { EASE, DUR, ST } from '@/motion/system';

// VISOR UP — the ON TRACK -> OFF TRACK act break. Pure CSS/GSAP, no WebGL
// context (the app caps WebGL contexts). The machine portrait (hero reveal)
// dissolves to the human (hero base) as the visor lifts. Reduced motion:
// resolve to final state, no scrub.
const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function VisorUpHinge() {
  const sectionRef = useRef(null);
  const machineRef = useRef(null); // helmet ON (reveal)
  const humanRef = useRef(null);   // helmet OFF (base)
  const tickRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(tickRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: DUR.considered, ease: EASE.precision,
          transformOrigin: 'left center',
          scrollTrigger: { trigger: sectionRef.current, start: ST.start.section, once: true } });

      gsap.fromTo(labelRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: DUR.cinematic, ease: EASE.precision, delay: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: ST.start.section, once: true } });

      if (prefersReduced()) {
        gsap.set(machineRef.current, { opacity: 0 });
        gsap.set(humanRef.current, { opacity: 0.16 });
        return;
      }

      gsap.fromTo(machineRef.current,
        { opacity: 0.16 },
        { opacity: 0, ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.fromTo(humanRef.current,
        { opacity: 0 },
        { opacity: 0.16, ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef}
      className="relative w-full overflow-hidden bg-black py-40 md:py-56 border-t border-line-subtle">
      <img ref={machineRef} src={MEDIA.hero.reveal} alt="" aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 [filter:grayscale(1)_contrast(1.1)]" />
      <img ref={humanRef} src={MEDIA.hero.primary} alt="" aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 [filter:grayscale(1)_contrast(1.1)]" />
      <div className="pointer-events-none absolute inset-0 bg-black/60" />

      <div className="relative z-10 mx-auto max-w-screen-xl px-6 md:px-16 text-center">
        <div ref={tickRef} className="mx-auto mb-8 h-px w-40 bg-accent"
          style={{ transformOrigin: 'left center' }} />
        <div ref={labelRef}>
          <p className="font-mono text-[10px] md:text-[11px] tracking-[0.5em] uppercase text-accent mb-6">
            VISOR UP
          </p>
          <h2 className="font-serif font-black uppercase text-white leading-none"
            style={{ fontSize: 'clamp(2.4rem, 8vw, 6.5rem)', letterSpacing: '-0.03em', lineHeight: '0.9' }}>
            OFF TRACK
          </h2>
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-fg-muted mt-8">
            THE PERSON BEHIND THE MACHINE
          </p>
        </div>
      </div>
    </section>
  );
}
