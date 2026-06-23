import { useRef } from 'react';
import { gsap } from 'gsap';
import { DUR, EASE } from '@/motion/system';

// THE GRID // TURF — interactive route cards. GSAP cursor-tilt + glowing border;
// route detail reveals on hover.
const ROUTES = [
  { id: '01', name: 'Hebbal Midnight Runs', meta: 'CITY LOOP // 00:30 AM', dist: '42 KM',
    detail: 'Empty flyovers, sodium lights, throttle wide. After midnight the city belongs to the riders.' },
  { id: '02', name: 'Highway Sprints', meta: 'NH 44 // PRE-DAWN', dist: '180 KM',
    detail: 'Long straights, zero traffic, sustained high-rev cruising. Pure two-wheeled meditation.' },
  { id: '03', name: 'Nandi Dawn Patrol', meta: 'HILL CLIMB // 04:00 AM', dist: '62 KM',
    detail: '47 hairpins to the summit for sunrise. Cold air, hot tyres, a clear head.' },
];

export default function TheGrid() {
  const cardRefs = useRef([]);

  const handleMove = (e, i) => {
    const el = cardRefs.current[i];
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, {
      rotateY: px * 10,
      rotateX: -py * 10,
      duration: DUR.fast,
      ease: EASE.hover,
      transformPerspective: 900,
      transformOrigin: 'center',
    });
  };

  const handleEnter = (i) => {
    gsap.to(cardRefs.current[i], {
      scale: 1.03,
      borderColor: 'rgba(210,255,0,0.8)',
      boxShadow: '0 30px 70px rgba(0,0,0,0.6), 0 0 34px rgba(210,255,0,0.35)',
      duration: DUR.fast,
      ease: EASE.hover,
    });
  };

  const handleLeave = (i) => {
    gsap.to(cardRefs.current[i], {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
      duration: DUR.standard,
      ease: EASE.momentum,
    });
  };

  return (
    <section
      className="relative w-full bg-[#0a0a0a] border-t border-white/5 px-6 md:px-16 py-28 md:py-36"
      style={{ perspective: '1200px' }}
    >
      <div className="max-w-screen-xl mx-auto">

        {/* Header */}
        <div className="mb-14 md:mb-20">
          <div className="w-[60px] h-[2px] bg-[#D2FF00] mb-6" />
          <h2
            className="font-serif font-black uppercase leading-none"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 5rem)', letterSpacing: '-0.03em', lineHeight: '0.9' }}
          >
            <span style={{ color: '#D2FF00' }}>THE GRID</span> <span className="text-white">// TURF</span>
          </h2>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/35 mt-6">
            Routes carved into muscle memory
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROUTES.map((r, i) => (
            <div
              key={r.id}
              ref={(el) => (cardRefs.current[i] = el)}
              onMouseMove={(e) => handleMove(e, i)}
              onMouseEnter={() => handleEnter(i)}
              onMouseLeave={() => handleLeave(i)}
              data-magnetic
              className="group relative flex min-h-[300px] cursor-pointer flex-col justify-between overflow-hidden border bg-[#0f0f0f] p-7 md:p-8"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                willChange: 'transform',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] tracking-[0.3em] text-[#D2FF00]">{r.id}</span>
                <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-white/30">{r.meta}</span>
              </div>

              <div>
                <h3
                  className="font-serif font-black uppercase leading-none text-white"
                  style={{ fontSize: 'clamp(1.4rem, 2.4vw, 2rem)', letterSpacing: '-0.01em' }}
                >
                  {r.name}
                </h3>
                {/* Detail is an absolute overlay (out of flow) so revealing it on
                    hover never grows the card / shifts the page. Anchored above the
                    distance row; fades + slides in. Card is `relative overflow-hidden`. */}
                <p className="pointer-events-none absolute inset-x-7 bottom-[5.5rem] translate-y-2 text-sm leading-relaxed text-white/50 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 md:inset-x-8">
                  {r.detail}
                </p>
              </div>

              <div className="flex items-end justify-between pt-6">
                <span className="font-serif font-black text-white/80" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
                  {r.dist}
                </span>
                <span className="text-2xl text-[#D2FF00] transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
