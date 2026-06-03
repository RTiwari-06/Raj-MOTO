// DOCTRINE (05) — route-map telemetry dashboard (F1-inspired).
// The Canvas (left): deep-dark container with a glowing SVG route that draws in
// on selection + live DIST/TIME readouts that glitch-fetch on change.
// The Schedule (right): minimalist hover-to-select route list.
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { runScramble } from '@/utils/scramble';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EASE } from '@/motion/system';

// Hand-authored route maps within a 0 0 400 250 viewBox.
const ROUTES = [
  {
    id: '01', name: 'Hebbal Midnight Runs', meta: 'CITY LOOP // 00:30',
    dist: '42 KM', time: '00:38:24',
    path: 'M40,210 C70,140 120,150 150,110 S210,40 250,95 S320,170 360,118',
  },
  {
    id: '02', name: 'Highway Sprints', meta: 'NH-44 // PRE-DAWN',
    dist: '180 KM', time: '02:18:050',
    path: 'M28,135 C120,128 160,128 220,130 S330,120 384,116',
  },
  {
    id: '03', name: 'Nandi Dawn Patrol', meta: 'HILL CLIMB // 04:00',
    dist: '62 KM', time: '01:05:12',
    path: 'M40,228 C90,206 70,164 120,164 S150,108 200,120 S210,58 262,70 S304,30 368,46',
  },
];

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function DoctrineSection() {
  const pathRef = useRef(null);
  const distRef = useRef(null);
  const timeRef = useRef(null);
  const wpPosRef = useRef(null);      // positions the marker at the route end
  const wpRevealRef = useRef(null);   // reveal scale/opacity
  const wpRingRef = useRef(null);     // pulsing radar ring
  const wpReticleRef = useRef(null);  // rotating reticle
  const cancels = useRef([]);
  const [active, setActive] = useState(0);

  // Draw the active route path (stroke-dashoffset trace) + completion waypoint.
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    const end = path.getPointAtLength(len);

    // Pin the waypoint marker to the route's final coordinate.
    if (wpPosRef.current) gsap.set(wpPosRef.current, { x: end.x, y: end.y });

    if (prefersReduced()) {
      gsap.set(path, { strokeDasharray: 'none', strokeDashoffset: 0 });
      gsap.set(wpRevealRef.current, { scale: 1, opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // Trace the line over 1.5s.
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, { strokeDashoffset: 0, duration: 1.5, ease: EASE.precision });

      // Waypoint reveals only once the trace completes (delay = draw duration).
      gsap.fromTo(
        wpRevealRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)', delay: 1.5 },
      );

      // Live GPS ping — outer ring expands + fades on an infinite loop.
      gsap.fromTo(
        wpRingRef.current,
        { scale: 1, opacity: 0.8 },
        { scale: 1.5, opacity: 0, duration: 1.2, ease: 'power1.out', repeat: -1, delay: 1.5 },
      );

      // Reticle slowly rotates — digital targeting marker.
      gsap.to(wpReticleRef.current, { rotation: 360, duration: 6, ease: 'none', repeat: -1 });
    });
    return () => ctx.revert();
  }, [active]);

  // Data-glitch: scramble DIST + TIME like a terminal fetching coordinates.
  useEffect(() => {
    const r = ROUTES[active];
    cancels.current.forEach((c) => c && c());
    cancels.current = [];
    if (prefersReduced()) {
      if (distRef.current) distRef.current.textContent = r.dist;
      if (timeRef.current) timeRef.current.textContent = r.time;
      return;
    }
    if (distRef.current) cancels.current.push(runScramble(distRef.current, r.dist, 0.4));
    if (timeRef.current) cancels.current.push(runScramble(timeRef.current, r.time, 0.4));
    return () => cancels.current.forEach((c) => c && c());
  }, [active]);

  const route = ROUTES[active];

  return (
    <section className="relative min-h-screen w-full bg-darker px-6 md:px-16 py-24 md:py-32 border-t border-white/5 z-20 overflow-hidden flex flex-col justify-center">
      <div className="grain-layer" />

      <div className="relative z-10 max-w-screen-2xl mx-auto w-full">
        <SectionHeader index="05" kicker="ROUTE DOCTRINE" readout="TURF // BENGALURU" panning className="mb-10 md:mb-14" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch">

          {/* ── THE CANVAS ─────────────────────────────────────────────── */}
          <div className="lg:col-span-8 relative aspect-[16/10] bg-[#080808] border border-white/10 overflow-hidden">
            <div className="absolute inset-0 hairline-grid opacity-40 pointer-events-none" />
            <div className="absolute inset-0 scan-lines opacity-40 pointer-events-none" />

            {/* Orange targeting brackets */}
            <span className="brk brk--mch tl" /><span className="brk brk--mch tr" />
            <span className="brk brk--mch bl" /><span className="brk brk--mch br" />

            {/* Route map */}
            <svg
              viewBox="0 0 400 250"
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 w-full h-full p-8"
              aria-hidden="true"
            >
              <path
                ref={pathRef}
                d={route.path}
                fill="none"
                stroke="#FF6600"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 0 10px rgba(255,102,0,0.8))' }}
              />

              {/* Completion waypoint — HUD targeting marker at the route's end */}
              <g ref={wpPosRef}>
                <g ref={wpRevealRef} style={{ opacity: 0 }}>
                  {/* pulsing radar ring */}
                  <circle ref={wpRingRef} r="11" fill="none" stroke="#FF6600" strokeWidth="1.2" />
                  {/* rotating reticle */}
                  <rect ref={wpReticleRef} x="-8" y="-8" width="16" height="16" fill="none" stroke="#FF6600" strokeWidth="1" />
                  {/* core node */}
                  <circle r="4" fill="#FF6600" style={{ filter: 'drop-shadow(0 0 6px rgba(255,102,0,0.95))' }} />
                </g>
              </g>
            </svg>

            {/* Corner telemetry readouts */}
            <div className="absolute top-4 left-5 font-mono text-[9px] tracking-[0.3em] uppercase text-[#FF6600]">
              ROUTE {route.id}
            </div>
            <div className="absolute top-4 right-5 font-mono text-[9px] tracking-[0.3em] uppercase text-white/40 text-right max-w-[55%] truncate">
              {route.meta}
            </div>
            <div className="absolute bottom-4 left-5">
              <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-white/35">Distance</p>
              <p ref={distRef} className="font-mono text-[15px] md:text-[18px] font-bold text-white tabular-nums tracking-wider">
                {route.dist}
              </p>
            </div>
            <div className="absolute bottom-4 right-5 text-right">
              <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-white/35">Est. Time</p>
              <p ref={timeRef} className="font-mono text-[15px] md:text-[18px] font-bold text-[#FF6600] tabular-nums tracking-wider">
                {route.time}
              </p>
            </div>
          </div>

          {/* ── THE SCHEDULE ───────────────────────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col justify-center" onMouseLeave={() => {}}>
            <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-white/35 mb-5">
              // ROUTE INDEX
            </p>

            <ul className="border-t border-white/10">
              {ROUTES.map((r, i) => {
                const isActive = i === active;
                return (
                  <li
                    key={r.id}
                    data-magnetic
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setActive(i)}
                    className="group relative cursor-pointer border-b border-white/10 py-5 pl-4 flex items-baseline gap-4"
                  >
                    {/* Active left accent bar */}
                    <span
                      className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#FF6600] origin-center transition-transform duration-300"
                      style={{ transform: isActive ? 'scaleY(1)' : 'scaleY(0)', boxShadow: isActive ? '0 0 10px rgba(255,102,0,0.8)' : 'none' }}
                    />
                    <span className={`font-mono text-[11px] tabular-nums transition-colors duration-300 ${isActive ? 'text-[#FF6600]' : 'text-white/30'}`}>
                      [{r.id}]
                    </span>
                    <span
                      className={`flex-1 font-sans font-light uppercase text-[13px] md:text-[15px] transition-all duration-300 ${isActive ? 'text-white' : 'text-white/45'}`}
                      style={{ letterSpacing: '0.18em', transform: isActive ? 'translateX(4px)' : 'translateX(0)' }}
                    >
                      {r.name}
                    </span>
                    <span className={`font-mono text-[11px] tracking-wider whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-[#FF6600]' : 'text-white/30'}`}>
                      — {r.dist}
                    </span>
                  </li>
                );
              })}
            </ul>

            <p className="font-mono text-[8px] tracking-[0.35em] uppercase text-white/20 mt-6 leading-relaxed">
              Hover to trace · {String(ROUTES.length).padStart(2, '0')} routes logged
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
