// THE MACHINE — arsenal / live-telemetry spec sheet. Scoped KTM-orange palette
// (orange/red/grey — #machine only; rest of the site stays lime). Headline
// breathes through the arsenal palette; portrait grades B&W → teal+orange on
// hover inside orange targeting brackets; maintenance log reads as live data.
// Headline lines wipe up on scroll, HUD numbers fade with them, log staggers in.
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DUR, STAGGER, ST } from '@/motion/system';
import { SectionHeader } from '@/components/ui/SectionHeader';

// Touch devices skip the cursor-follow popup entirely (no hover, and a tap can
// otherwise pin it frozen at the corner).
const COARSE =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: coarse)').matches;

const SPECS = ['SINGLE-CYLINDER', '30 AGGRESSIVE HORSES', 'GEOMETRICALLY AUSTRIAN'];

// `img` → optional part preview (drop files at these paths to populate; a
// telemetry "STANDBY" placeholder shows until then).
const LOG = [
  { k: 'BLOODLINE',      v: 'Motul 7100 15W50 Synthetic', img: '/media/log/motul-800.webp' },
  { k: 'STOPPING POWER', v: 'BREMBO Sintered Pads // F&R',  img: '/media/log/brakes.jpg' },
  { k: 'ELECTRONICS',    v: 'TFT Display Calibration',     img: '/media/log/tft.jpg' },
  { k: 'EXHAUST',        v: 'Pipe Alignment & Heat Cycle', img: '/media/log/exhaust.jpg' },
  { k: 'RED CHIP',        v: 'ECU REV LIMIT Override',  img: '/media/log/sensor.jpg' },
];

export default function TheMachine() {
  const sectionRef = useRef(null);
  const popupRef = useRef(null);
  const [activeLog, setActiveLog] = useState(null);

  // Cursor-following part preview popup (position imperative — no re-render).
  useEffect(() => {
    if (COARSE) return;
    const el = popupRef.current;
    if (!el) return;
    const xTo = gsap.quickTo(el, 'x', { duration: DUR.fast, ease: EASE.momentum });
    const yTo = gsap.quickTo(el, 'y', { duration: DUR.fast, ease: EASE.momentum });
    const onMove = (e) => { xTo(e.clientX); yTo(e.clientY); };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: ST.start.late, once: true },
      });

      // Header + portrait settle in first.
      tl.fromTo('.tm-head', { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: DUR.standard, ease: EASE.precision });
      tl.fromTo('.tm-portrait-wrap', { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: DUR.standard, ease: EASE.precision }, '<');

      // Headline: each line wipes up from its clip; HUD numbers fade in with them.
      tl.fromTo('.tm-line-inner', { yPercent: 110 },
        { yPercent: 0, duration: DUR.cinematic, ease: EASE.precision, stagger: STAGGER.elements }, '-=0.35');
      tl.fromTo('.tm-num', { opacity: 0 },
        { opacity: 0.4, duration: DUR.standard, ease: EASE.momentum, stagger: STAGGER.elements }, '<');

      // Maintenance log locks in after the headline.
      tl.fromTo('.tm-log-head', { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: DUR.standard, ease: EASE.momentum }, '-=0.15');
      tl.fromTo('.tm-log-row', { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: DUR.standard, ease: EASE.momentum, stagger: STAGGER.cards }, '-=0.1');
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="machine"
      ref={sectionRef}
      className="relative w-full bg-[#0a0a0a] border-t border-white/5 px-6 md:px-16 py-24 md:py-32 overflow-hidden"
    >
      <div className="grain-layer" />

      {/* Maintenance-log part preview — follows the cursor (desktop only) */}
      {!COARSE && (
      <div ref={popupRef} className="fixed top-0 left-0 z-[9996] pointer-events-none will-change-transform">
        <div
          className="transition-opacity duration-200"
          style={{ transform: 'translate(-112%, -55%)', opacity: activeLog !== null ? 1 : 0 }}
        >
          {activeLog !== null && (
            <div key={activeLog} className="relative w-[240px] h-[135px] bg-[#0b0b0b] border border-[#FF6600]/45 overflow-hidden">
              {/* STANDBY placeholder (fallback if an image fails to load) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                <span className="font-mono text-[8px] tracking-[0.35em] text-white/25">IMG // STANDBY</span>
                <span className="font-mono text-[9px] tracking-[0.2em] text-[#FF6600]/80">{LOG[activeLog].k}</span>
              </div>
              {/* object-contain → full part shown in original colour, never cropped */}
              <img
                src={LOG[activeLog].img}
                alt=""
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="feed-lock absolute inset-0 w-full h-full object-contain p-4"
                style={{ filter: 'contrast(1.05) saturate(1.05)' }}
              />
              <div className="absolute inset-0 scan-lines pointer-events-none opacity-40" />

              {/* Corner telemetry overlay — status + raw filename */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 font-mono text-[7px] tracking-[0.25em] uppercase text-[#FF6600]">
                <span className="w-1 h-1 bg-[#FF6600] animate-pulse" />
                PART_SECURE // OK
              </div>
              <span className="absolute top-2.5 right-2.5 font-mono text-[7px] tracking-[0.15em] text-white/40 max-w-[42%] truncate text-right">
                {LOG[activeLog].img.split('/').pop()}
              </span>

              <div className="absolute bottom-0 left-0 right-0 px-2.5 py-2 bg-gradient-to-t from-black/95 to-transparent">
                <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-white/85">{LOG[activeLog].v}</span>
              </div>
              <span className="brk brk--mch tl" /><span className="brk brk--mch tr" />
              <span className="brk brk--mch bl" /><span className="brk brk--mch br" />
            </div>
          )}
        </div>
      </div>
      )}

      <div className="relative max-w-screen-xl mx-auto">

        <SectionHeader
          index="03"
          total="11"
          kicker="THE MACHINE"
          readout="ON TRACK // KTM DUKE 250 · BS6"
          className="tm-head mb-14 md:mb-20"
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-start">

          {/* LEFT — targeting-system portrait: grain + scanlines, orange brackets,
              B&W → teal+orange grade on hover */}
          <div className="tm-portrait-wrap md:col-span-5">
            <div className="tm-portrait group relative aspect-[4/5] overflow-hidden bg-black">
              {/* Engine-idle jitter wrapper */}
              <div className="tm-vibrate absolute inset-0">
                <img
                  src="/moto-night-helmet.webp"
                  alt="KTM Duke 250 BS6"
                  className="tm-img w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Cinematic teal+orange grade (revealed on hover) */}
              <div
                className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,90,105,0.55) 0%, transparent 48%, rgba(255,102,0,0.5) 100%)',
                  mixBlendMode: 'soft-light',
                }}
              />

              {/* Telemetry texture */}
              <div className="grain-layer" />
              <div className="absolute inset-0 scan-lines pointer-events-none opacity-50" />

              {/* Orange targeting brackets */}
              <span className="brk brk--mch tl" /><span className="brk brk--mch tr" />
              <span className="brk brk--mch bl" /><span className="brk brk--mch br" />

              {/* Top HUD strip */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between font-mono text-[9px] tracking-[0.3em] uppercase">
                <span className="flex items-center gap-1.5 text-[#FF6600]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6600] animate-pulse" />
                  REC
                </span>
                <span className="text-white/40">34.1°N · 77.6°E</span>
              </div>

              {/* Bottom scrim + machine tag */}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black to-transparent pointer-events-none" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#FF6600]">
                  KTM DUKE 250 BS6
                </span>
                <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-white/35">
                  UNIT 01
                </span>
              </div>
            </div>

            {/* Sub-portrait readout */}
            <div className="mt-4 flex items-center gap-3 font-mono text-[9px] tracking-[0.25em] uppercase text-white/30">
              <span className="text-[#FF6600]/80">NUMBER SERIAL</span>
              <span className="flex-1 border-b border-dashed border-white/20" />
              <span className="text-white/55">BR01FZ1138 </span>
            </div>
          </div>

          {/* RIGHT — arsenal headline + telemetry maintenance table */}
          <div className="md:col-span-7 md:pl-6">

            <div className="space-y-1">
              {SPECS.map((s, i) => (
                <div key={s} className="flex items-center gap-4 md:gap-6">
                  <span className="tm-num font-mono text-[11px] tracking-[0.2em] text-white tabular-nums" style={{ opacity: 0.4 }}>
                    0{i + 1}
                  </span>
                  <span className="overflow-hidden block">
                    <span className="tm-line-inner arsenal-text spec-line block">
                      {s}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            {/* Maintenance log — live telemetry table */}
            <div className="mt-12 md:mt-16 pt-8 border-t border-white/10">
              <div className="tm-log-head flex items-center justify-between mb-6">
                <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-[#FF6600]">
                  // MAINTENANCE LOG
                </p>
                <p className="font-mono text-[9px] tracking-[0.25em] uppercase text-white/25">
                  LAST SYNC : 2026 <span className="term-cursor text-[#FF6600]">█</span>
                </p>
              </div>

              <div className="border border-white/[0.08]">
                {LOG.map((item, i) => (
                  <div
                    key={item.k}
                    onMouseEnter={() => !COARSE && setActiveLog(i)}
                    onMouseLeave={() => !COARSE && setActiveLog(null)}
                    onClick={() => COARSE && setActiveLog(activeLog === i ? null : i)}
                    aria-current={COARSE && activeLog === i ? 'true' : undefined}
                    className={`tm-log-row group flex items-center px-5 py-4 transition-colors duration-300 hover:bg-[#FF6600]/[0.04] touch-buffer ${
                      activeLog === i ? 'bg-[#FF6600]/[0.06]' : ''
                    } ${i !== LOG.length - 1 ? 'border-b border-white/[0.06]' : ''}`}
                  >
                    <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/40 w-8 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/55 w-[90px] sm:w-[150px] shrink-0">
                      {item.k}
                    </span>
                    {/* dashed leader connecting label → value (fixed key width keeps starts aligned) */}
                    <span className="hidden sm:flex flex-1 mx-3 border-b border-dashed border-white/20" />
                    <span className="flex-1 sm:flex-none font-mono text-[10px] sm:text-[11px] font-semibold leading-snug text-right text-white transition-colors duration-300 group-hover:text-[#FF6600]">
                      {item.v}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mobile part preview — touch has no cursor popup, so a tapped row
                  reveals its part inline here. */}
              {COARSE && activeLog !== null && (
                <div key={activeLog} className="mt-5 relative w-full aspect-video bg-[#0b0b0b] border border-[#FF6600]/45 overflow-hidden">
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                    <span className="font-mono text-[8px] tracking-[0.35em] text-white/25">IMG // STANDBY</span>
                    <span className="font-mono text-[9px] tracking-[0.2em] text-[#FF6600]/80">{LOG[activeLog].k}</span>
                  </div>
                  <img
                    src={LOG[activeLog].img}
                    alt=""
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    className="absolute inset-0 w-full h-full object-contain p-4"
                    style={{ filter: 'contrast(1.05) saturate(1.05)' }}
                  />
                  <div className="absolute inset-0 scan-lines pointer-events-none opacity-40" />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 font-mono text-[7px] tracking-[0.25em] uppercase text-[#FF6600]">
                    <span className="w-1 h-1 bg-[#FF6600] animate-pulse" />
                    PART_SECURE // OK
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-2.5 py-2 bg-gradient-to-t from-black/95 to-transparent">
                    <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-white/85">{LOG[activeLog].v}</span>
                  </div>
                  <span className="brk brk--mch tl" /><span className="brk brk--mch tr" />
                  <span className="brk brk--mch bl" /><span className="brk brk--mch br" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
