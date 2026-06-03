import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DUR, ST, STAGGER } from '@/motion/system';
import { SectionHeader } from '@/components/ui/SectionHeader';

// Two stacked display lines + one subtitle — all animate via the same staggered lineRefs
const LINES = [
  { text: 'REDEFINING',                                                                   style: 'display-accent' },
  { text: 'LIMITS.',                                                                      style: 'display'        },
  { text: "The screen is the circuit. Code is the engine. Momentum is everything.",        style: 'subtitle'       },
];

export default function ManifestoSection() {
  const sectionRef = useRef(null);
  const lineRefs   = useRef([]);
  const labelRef   = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered lines from below — unchanged animation logic
      gsap.fromTo(
        lineRefs.current.filter(Boolean),
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: DUR.cinematic,
          ease: EASE.precision,
          stagger: STAGGER.elements,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: ST.start.late,
            once: true,
          },
        }
      );

      gsap.fromTo(
        labelRef.current,
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
          duration: DUR.cinematic,
          ease: EASE.momentum,
          delay: 0.5,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: ST.start.late,
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-black flex flex-col justify-center overflow-hidden border-t border-white/5"
    >
      {/* Hairline grid overlay */}
      <div className="absolute inset-0 pointer-events-none hairline-grid opacity-20" />
      <div className="grain-layer" />

      {/* Ghost background mark — oversized outlined word for depth */}
      <span
        className="ghost-mark absolute -right-[4vw] bottom-[6vh] pointer-events-none select-none hidden md:block"
        style={{ fontSize: 'clamp(180px, 30vw, 460px)' }}
        aria-hidden="true"
      >
        RT
      </span>

      {/* Right-side vertical label — updated copy */}
      <div
        ref={labelRef}
        className="absolute right-10 md:right-16 top-1/2 -translate-y-1/2 flex flex-col items-end gap-4 opacity-0 pointer-events-none z-10"
      >
        <div
          className="text-[8px] label-extreme uppercase font-black text-white/20 tracking-widest"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          R T • M O T O &nbsp;/ / &nbsp; M O T I O N &nbsp;/ / &nbsp; 2 0 2 6
        </div>
        <div className="w-px h-24 bg-white/10" />
        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-8 md:px-16 w-full py-32">

        {/* Instrument header — replaces the legacy lime eyebrow bar */}
        <SectionHeader
          index="03"
          kicker="IDENTITY"
          readout="PORTFOLIO // PHILOSOPHY"
          className="mb-12 md:mb-16 max-w-3xl"
        />

        {/* Stacked lines — each wrapped in overflow-hidden so yPercent clip works */}
        <div className="space-y-0">
          {LINES.map((line, i) => (
            <div key={i} className="overflow-hidden">
              <div
                ref={(el) => (lineRefs.current[i] = el)}
                className="opacity-0"
              >
                {line.style === 'display' && (
                  <p
                    className="font-serif font-black uppercase text-white leading-none"
                    style={{
                      fontSize:      'clamp(60px, 10vw, 140px)',
                      letterSpacing: '-0.03em',
                      lineHeight:    '0.9',
                    }}
                  >
                    {line.text}
                  </p>
                )}

                {line.style === 'display-accent' && (
                  <p
                    className="font-serif font-black uppercase leading-none"
                    style={{
                      fontSize:      'clamp(60px, 10vw, 140px)',
                      letterSpacing: '-0.03em',
                      lineHeight:    '0.9',
                      color:         '#D2FF00',
                    }}
                  >
                    {line.text}
                  </p>
                )}

                {line.style === 'subtitle' && (
                  <p
                    className="font-sans font-light text-white/50 leading-relaxed max-w-md"
                    style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', marginTop: '2rem' }}
                  >
                    {line.text}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom footnote — updated copy */}
        <div className="flex items-center gap-6 mt-20">
          <div className="h-px w-16 bg-white/10" />
          <p className="text-[9px] label-spaced uppercase font-bold text-white/20">
            Code is the engine &nbsp;·&nbsp; Bengaluru
          </p>
          <div className="h-px flex-1 bg-white/5 max-w-[200px]" />
        </div>
      </div>
    </section>
  );
}
