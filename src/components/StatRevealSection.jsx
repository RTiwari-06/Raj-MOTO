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
              className="font-serif font-black uppercase leading-none"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '-0.02em', color: '#D2FF00' }}
            >
              DEV /
            </p>
            <p
              className="font-serif font-black uppercase text-white leading-none"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}
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

        {/* Section header — stacked editorial (lime-first per DNA) */}
        <div className="mb-16 md:mb-24">
          <div className="w-[60px] h-[2px] bg-[#D2FF00] mb-8" />
          <h2
            className="font-serif font-black uppercase leading-none"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 6rem)', letterSpacing: '-0.03em', lineHeight: '0.9', color: '#D2FF00' }}
          >
            TECHNICAL
          </h2>
          <h2
            className="font-serif font-black uppercase text-white leading-none"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 6rem)', letterSpacing: '-0.03em', lineHeight: '0.9' }}
          >
            ARSENAL
          </h2>
        </div>

        {TECHNICAL.map((group) => (
          <div key={group.category} className="mb-16 last:mb-0">

            {/* Category sub-header */}
            <div className="border-b border-white/10 pb-4 mb-6">
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#D2FF00]">
                {group.category}
              </p>
            </div>

            {/* Skill cards — auto-fill grid, border-bottom reacts to lime on hover */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
              {group.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="bg-[#1a1a1a] border border-white/8 border-b-2 border-b-transparent px-5 py-4 transition-all duration-200 ease-out hover:bg-[#1f1f1f] hover:border-b-[#D2FF00] hover:-translate-y-0.5 cursor-default select-none"
                >
                  <p className="text-white font-semibold text-[13px] leading-none mb-2">
                    {skill.name}
                  </p>
                  <p
                    className="text-[10px] font-black uppercase tracking-[0.2em]"
                    style={{ color: '#D2FF00' }}
                  >
                    {skill.level}
                  </p>
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
