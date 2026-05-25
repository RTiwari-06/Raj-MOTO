import { useEffect, useRef, Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas } from '@react-three/fiber';
import { FluidBackground } from './FluidBackground';
import { MEDIA } from '../data/media';
import { EASE, DUR, ST } from '../motion/system';

const TECHNICAL = MEDIA.technical;

export default function StatRevealSection() {
  const sectionRef  = useRef(null);
  const statRef     = useRef(null);
  const labelRef    = useRef(null);
  const subRef      = useRef(null);
  const counterRef  = useRef({ value: 0 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: ST.start.late,
          once: true,
        },
      });

      tl.to(counterRef.current, {
        value: 847,
        duration: DUR.breath,
        ease: EASE.momentum,
        onUpdate: () => {
          if (statRef.current) {
            const v = Math.round(counterRef.current.value);
            statRef.current.textContent = v.toLocaleString();
          }
        },
      }, 0);

      tl.fromTo(
        labelRef.current,
        { yPercent: 60, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: DUR.considered, ease: EASE.momentum },
        0.2
      );

      tl.fromTo(
        subRef.current,
        { opacity: 0 },
        { opacity: 1, duration: DUR.standard, ease: EASE.momentum },
        0.9
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black border-t border-white/5"
    >

      {/* ── COUNTER ZONE — full-viewport with live WebGL bg ─────────────────── */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Live WebGL Fluid background */}
        <div className="absolute inset-0 z-0">
          <Canvas
            camera={{ position: [0, 0, 3], fov: 45 }}
            gl={{ antialias: false, alpha: false }}
            dpr={[1, 1.5]}
          >
            <Suspense fallback={null}>
              <FluidBackground />
            </Suspense>
          </Canvas>
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 z-10 bg-black/75" />

        {/* Counter content */}
        <div className="relative z-20 text-center px-8 select-none">

          {/* Section title — stacked caps above counter */}
          <div className="mb-16">
            <div className="w-[50px] h-[2px] bg-[#D2FF00] mx-auto mb-8" />
            <p
              className="font-serif font-black uppercase text-white leading-none"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}
            >
              DEV /
            </p>
            <p
              className="font-serif font-black uppercase leading-none"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '-0.02em', color: '#D2FF00' }}
            >
              STACK
            </p>
          </div>

          {/* Micro label */}
          <div ref={subRef} className="opacity-0 mb-8 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-white/15" />
            <p className="text-[8px] label-extreme uppercase font-black text-white/30">
              R T • M O T O &nbsp;//&nbsp; S T A C K &nbsp;//&nbsp; 2 0 2 6
            </p>
            <div className="h-px w-12 bg-white/15" />
          </div>

          {/* The massive stat */}
          <div className="overflow-hidden">
            <p
              ref={statRef}
              className="font-black leading-none text-white"
              style={{ fontSize: 'clamp(5rem, 22vw, 22rem)', letterSpacing: '-0.04em' }}
            >
              0
            </p>
          </div>

          {/* Counter label */}
          <div className="overflow-hidden mt-4">
            <p
              ref={labelRef}
              className="label-extreme text-[10px] md:text-[13px] font-black uppercase opacity-0"
              style={{ color: '#D2FF00', letterSpacing: '0.3em' }}
            >
              C O M M I T S &nbsp; P U S H E D
            </p>
          </div>

          {/* Sub-footnote */}
          <p className="text-[9px] label-spaced uppercase font-bold text-white/20 mt-10">
            Every commit. Maximum effort.
          </p>
        </div>

        {/* Corner precision glyphs */}
        {['top-8 left-8', 'top-8 right-8', 'bottom-8 left-8', 'bottom-8 right-8'].map((pos) => (
          <span
            key={pos}
            className={`absolute ${pos} text-[10px] font-black text-white/10 select-none pointer-events-none z-20`}
          >
            [ + ]
          </span>
        ))}
      </div>

      {/* ── CARDS ZONE — solid dark bg, no WebGL ────────────────────────────── */}
      <div className="relative z-10 bg-[#0d0d0d] border-t border-white/5 px-8 md:px-16 py-24 md:py-32">

        {TECHNICAL.map((group) => (
          <div key={group.category} className="mb-16 last:mb-0">

            {/* Category sub-header */}
            <div className="flex items-center gap-5 mb-8">
              <p className="text-[10px] font-black uppercase tracking-[0.45em] text-white/25">
                {group.category}
              </p>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            {/* Skill cards — 3-col desktop / 2-col tablet / 1-col mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="group relative bg-[#1a1a1a] px-6 py-5 border-b border-[#D2FF00]/15 transition-all duration-300 hover:-translate-y-1 hover:border-[#D2FF00]/70 hover:shadow-[0_4px_28px_rgba(210,255,0,0.07)] cursor-default select-none"
                >
                  {/* Tool name */}
                  <p className="text-white font-bold text-[18px] leading-none mb-2 transition-colors duration-300">
                    {skill.name}
                  </p>

                  {/* Level badge */}
                  <p
                    className="text-[10px] font-black uppercase tracking-[0.35em]"
                    style={{ color: '#D2FF00', opacity: 0.7 }}
                  >
                    {skill.level}
                  </p>

                  {/* Hover accent line — left edge */}
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#D2FF00] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Bottom footnote */}
        <div className="flex items-center gap-6 mt-20 pt-12 border-t border-white/5">
          <div className="h-px w-16 bg-white/10" />
          <p className="text-[9px] label-spaced uppercase font-bold text-white/20">
            Every build &nbsp;·&nbsp; Every commit
          </p>
        </div>
      </div>
    </section>
  );
}
