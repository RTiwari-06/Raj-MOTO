import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DUR, ST } from '@/motion/system';

const BODY_COPY = `the philosophy remains identical — whether tuning a 250cc power plant or refining a component tree. eliminate drag. maximize output. the discipline transfers.`;

export default function IABridgeSection() {
  const sectionRef = useRef(null);
  const titleRef   = useRef(null);
  const bodyRef    = useRef(null);
  const lineRef    = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(lineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: DUR.considered,
          ease: EASE.precision,
          transformOrigin: 'left center',
          scrollTrigger: { trigger: sectionRef.current, start: ST.start.section, once: true },
        }
      );

      gsap.fromTo(titleRef.current,
        { y: 70, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: DUR.cinematic,
          ease: EASE.precision,
          delay: 0.1,
          scrollTrigger: { trigger: titleRef.current, start: ST.start.section, once: true },
        }
      );

      const isCoarse =
        typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
      const reduced =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduced) {
        gsap.set(bodyRef.current, { y: 0, opacity: 1 });
      } else if (isCoarse) {
        gsap.fromTo(bodyRef.current,
          { opacity: 0.15 },
          {
            opacity: 1, ease: 'none',
            scrollTrigger: { trigger: bodyRef.current, start: 'top 85%', end: 'top 45%', scrub: true },
          }
        );
      } else {
        gsap.fromTo(bodyRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: DUR.standard,
            ease: EASE.momentum,
            delay: 0.3,
            scrollTrigger: { trigger: bodyRef.current, start: ST.start.section, once: true },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="thesis"
      className="relative w-full bg-black border-t border-line-subtle px-6 md:px-16 py-36 md:py-48 overflow-hidden"
    >
      {/* Hairline grid */}
      <div className="absolute inset-0 pointer-events-none hairline-grid opacity-50" />

      <div className="max-w-screen-xl mx-auto relative z-10">

        {/* Accent bar */}
        <div
          ref={lineRef}
          className="w-[60px] h-[2px] bg-accent mb-10"
          style={{ transformOrigin: 'left center' }}
        />

        {/* Section tag */}
        <p className="font-mono text-[9px] font-black uppercase tracking-[0.45em] text-fg-faint mb-10">
          ON TRACK &nbsp;//&nbsp; THE THESIS
        </p>

        {/* Main title */}
        <div className="overflow-hidden mb-12">
          <h2
            ref={titleRef}
            className="font-serif font-black uppercase text-white leading-none"
            style={{
              fontSize: 'clamp(2rem, 6vw, 5.5rem)',
              letterSpacing: '-0.03em',
              lineHeight: '0.9',
            }}
          >
            MECHANICAL PERFORMANCE
            <br />
            <span style={{ color: 'var(--color-accent)' }}>EXTENDS TO THE BROWSER.</span>
          </h2>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-6 mb-10">
          <div className="h-px w-16 bg-surface-raised" />
          <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-fg-faint">
            SYSTEM LOG
          </span>
          <div className="h-px flex-1 bg-line-subtle max-w-[160px]" />
        </div>

        {/* Body copy */}
        <p
          ref={bodyRef}
          className="font-mono font-normal text-fg-2 max-w-2xl leading-relaxed"
          style={{ fontSize: 'clamp(0.75rem, 1.2vw, 0.9rem)', letterSpacing: '0.02em' }}
        >
          <span className="text-accent-mid mr-2">&gt;_</span>
          {BODY_COPY}
        </p>

        {/* Bottom telemetry */}
        <div className="flex items-center gap-6 mt-20 pt-8 border-t border-line-subtle">
          <span className="font-mono text-[8px] uppercase tracking-[0.4em] text-fg-faint">
            KTM DUKE 250 BS6
          </span>
          <div className="h-px w-8 bg-surface-raised" />
          <span className="font-mono text-[8px] uppercase tracking-[0.4em] text-fg-faint">
            REACT · GSAP · R3F · VITE
          </span>
          <div className="h-px flex-1 bg-line-subtle max-w-[120px]" />
          <span className="font-mono text-[8px] uppercase tracking-[0.4em] text-fg-faint">
            BENGALURU // 2026
          </span>
        </div>

      </div>
    </section>
  );
}
