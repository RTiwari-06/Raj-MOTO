import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DUR, ST } from '@/motion/system';
import RollingOdometer from '@/components/ui/RollingOdometer';
import OdometerBackground from '@/components/ui/OdometerBackground';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function StatRevealSection() {
  const sectionRef   = useRef(null);
  const labelRef     = useRef(null);
  const subRef       = useRef(null);
  const counterRef   = useRef({ value: 0 });
  const odometerRef  = useRef(null);
  const gaugeRef     = useRef(null);

  useEffect(() => {
    if (prefersReduced()) {
      odometerRef.current?.setValue(20000);
      gaugeRef.current?.setProgress(1);
      gsap.set([labelRef.current, subRef.current], { opacity: 1, yPercent: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: ST.start.late, once: true },
      });

      tl.to(counterRef.current, {
        value: 20000,
        duration: DUR.breath,
        ease: EASE.momentum,
        onUpdate: () => {
          const v = counterRef.current.value;
          odometerRef.current?.setValue(v);
          gaugeRef.current?.setProgress(v / 20000);
        },
      }, 0);

      tl.fromTo(labelRef.current,
        { yPercent: 60, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: DUR.considered, ease: EASE.momentum }, 0.2);

      tl.fromTo(subRef.current,
        { opacity: 0 },
        { opacity: 1, duration: DUR.standard, ease: EASE.momentum }, 0.9);
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

        {/* Instrument-cluster background — CSS/SVG gauge, no WebGL */}
        <div className="absolute inset-0 z-0">
          <OdometerBackground ref={gaugeRef} />
        </div>

        {/* Counter content */}
        <div className="relative z-20 text-center px-8 select-none">

          {/* Section title — stacked caps above counter */}
          <div className="mb-16">
            <div className="w-[50px] h-[2px] bg-[#D2FF00] mx-auto mb-8" />
            <p
              className="font-serif font-black uppercase leading-none"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '-0.02em', color: '#D2FF00' }}
            >
              RT-MOTO //
            </p>
            <p
              className="font-serif font-black uppercase text-white leading-none"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}
            >
              THE LOG
            </p>
          </div>

          {/* Micro label */}
          <div ref={subRef} className="opacity-0 mb-8 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-white/15" />
            <p className="text-[8px] label-extreme uppercase font-black text-white/30">
              R T • M O T O &nbsp;//&nbsp; T H E &nbsp; L O G &nbsp;//&nbsp; 2 0 2 6
            </p>
            <div className="h-px w-12 bg-white/15" />
          </div>

          {/* The massive stat — mechanical odometer reels */}
          <div className="overflow-hidden">
            <RollingOdometer ref={odometerRef} digits={5} comma={2} unit="KM" ariaValue="20,000 kilometers clocked" />
          </div>

          {/* Counter label */}
          <div className="overflow-hidden mt-4">
            <p
              ref={labelRef}
              className="label-extreme text-[10px] md:text-[13px] font-black uppercase opacity-0"
              style={{ color: '#D2FF00', letterSpacing: '0.3em' }}
            >
              K I L O M E T E R S &nbsp; C L O C K E D
            </p>
          </div>

          {/* Sub-footnote */}
          <p className="text-[9px] label-spaced uppercase font-bold text-white/30 mt-10 max-w-md mx-auto leading-relaxed">
            VISION LOCKED. MOTION BLURRED. BENGALURU STREETS TO APEX CORNERS.
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

      {/* ── CARDS ZONE — supporting background info (reduced padding) ───────── */}
      <div className="relative z-10 bg-[#0a0a0a] border-t border-white/5 px-8 md:px-16 py-14 md:py-20">

        {/* Section header — deliberately smaller; supports, doesn't dominate */}
        <div className="mb-10 md:mb-14">
          <div className="w-[44px] h-[2px] bg-[#D2FF00] mb-6" />
          <h2
            className="font-serif font-black uppercase leading-none"
            style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.6rem)', letterSpacing: '-0.02em', lineHeight: '0.95', color: '#D2FF00' }}
          >
            THE BUILD //
          </h2>
          <h2
            className="font-serif font-black uppercase text-white leading-none"
            style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.6rem)', letterSpacing: '-0.02em', lineHeight: '0.95' }}
          >
            DIGITAL TELEMETRY
          </h2>

          {/* Gauge legend — decodes the riding-state labels */}
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30 mt-8">
            GAUGE&nbsp;:&nbsp;<span className="text-[#D2FF00]">REDLINE</span> = mastered
            &nbsp;·&nbsp; FULL THROTTLE &nbsp;·&nbsp; HIGH GEAR &nbsp;·&nbsp; DAILY RIDER
            &nbsp;·&nbsp; <span className="text-white/40">BREAK-IN</span> = just started
          </p>
        </div>

        {/* Developer stack is intentionally hidden — discover it in THE PIT GARAGE (inline under THE MACHINE). */}
        <div className="mb-12 py-12 rounded-md bg-[#050505] border border-white/[0.04] text-center">
          <p className="font-serif font-black uppercase text-white" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.6rem)' }}>
            ENGINE MAPPING // DIGITAL TELEMETRY
          </p>
          <p className="text-[12px] mt-4 text-white/40 max-w-xl mx-auto">The technical stack and telemetry tools are tucked away in <strong className="text-[#D2FF00]">THE PIT GARAGE</strong> — the engine running the site, intentionally obscured from the main editorial spread.</p>
          <a href="#machine" className="inline-block mt-6 px-5 py-3 border border-white/6 text-[#D2FF00] font-mono uppercase tracking-[0.2em] hover:bg-white/2 transition-colors">OPEN THE PIT GARAGE</a>
        </div>

        {/* Bottom footnote */}
        <div className="flex items-center gap-6 mt-20 pt-12 border-t border-white/5">
          <div className="h-px w-16 bg-white/10" />
          <p className="text-[9px] label-spaced uppercase font-bold text-white/20">
            Every build &nbsp;·&nbsp; Every ride
          </p>
        </div>
      </div>
    </section>
  );
}
