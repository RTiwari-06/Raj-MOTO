// DOCTRINE (05) — route-map telemetry dashboard (F1-inspired).
// The Canvas (left): a living map — a faint ghost network of every route, the
// active one traced bright, a live GPS dot running it, origin + completion
// nodes, and glitch-fetch DIST/TIME readouts.
// The Schedule (right): hover/auto-cycled route list + live elevation profile
// and surface/bearing/climb telemetry.
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { runScramble } from '@/utils/scramble';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EASE } from '@/motion/system';

// Hand-authored route maps within a 0 0 400 250 viewBox.
const ROUTES = [
  {
    id: '01', name: 'Hebbal Midnight Runs', meta: 'CITY LOOP // 00:30',
    dist: '42 KM', time: '00:38:24',
    path: 'M40,210 C70,140 120,150 150,110 S210,40 250,95 S320,170 360,118',
    detail: 'Empty flyovers, sodium lights, throttle wide. After midnight the city belongs to the riders.',
    surface: 'CITY TARMAC', bearing: '012°', climb: 'ROLLING',
    elev: [22, 40, 28, 46, 30, 52, 38, 30],
  },
  {
    id: '02', name: 'Highway Sprints', meta: 'NH-44 // PRE-DAWN',
    dist: '180 KM', time: '02:18:05',
    path: 'M28,135 C120,128 160,128 220,130 S330,120 384,116',
    detail: 'Long straights, zero traffic, sustained high-rev cruising. Pure two-wheeled meditation.',
    surface: 'OPEN TARMAC', bearing: '348°', climb: 'FLAT',
    elev: [16, 18, 15, 20, 17, 19, 16, 18],
  },
  {
    id: '03', name: 'Nandi Dawn Patrol', meta: 'HILL CLIMB // 04:00',
    dist: '62 KM', time: '01:05:12',
    path: 'M40,228 C90,206 70,164 120,164 S150,108 200,120 S210,58 262,70 S304,30 368,46',
    detail: '47 hairpins to the summit for sunrise. Cold air, hot tyres, a clear head.',
    surface: 'HILL TARMAC', bearing: '034°', climb: '+1478 m',
    elev: [12, 24, 30, 48, 58, 74, 86, 96],
  },
];

const CYCLE = 6; // seconds the dashboard dwells on a route before auto-advancing

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Touch devices render the resolved static dashboard (no rAF GPS-dot loop, no
// infinite ping/reticle tweens, no off-driver auto-cycle) — tap still switches
// routes. Treated exactly like reduced motion for the expensive ambient motion.
const COARSE =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: coarse)').matches;

export default function DoctrineSection() {
  const sectionRef = useRef(null);
  const pathRef = useRef(null);
  const distRef = useRef(null);
  const timeRef = useRef(null);
  const wpPosRef = useRef(null);      // positions the marker at the route end
  const wpRevealRef = useRef(null);   // reveal scale/opacity
  const wpRingRef = useRef(null);     // pulsing radar ring
  const wpReticleRef = useRef(null);  // rotating reticle
  const originRef = useRef(null);     // origin node at the route start
  const dotRef = useRef(null);        // live GPS dot travelling the route
  const progressRef = useRef(null);   // auto-cycle progress bar
  const cancels = useRef([]);

  // Auto-cycle plumbing
  const cycleTween = useRef(null);
  const pausedRef = useRef(false);
  const inViewRef = useRef(true);
  const [active, setActive] = useState(0);

  // Draw the active route + nodes + live GPS dot. Keys on [active].
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    const end = path.getPointAtLength(len);
    const start = path.getPointAtLength(0);

    gsap.set(wpPosRef.current, { x: end.x, y: end.y });
    gsap.set(originRef.current, { x: start.x, y: start.y });

    if (prefersReduced() || COARSE) {
      gsap.set(path, { strokeDasharray: 'none', strokeDashoffset: 0 });
      gsap.set([wpRevealRef.current, originRef.current], { scale: 1, opacity: 1 });
      gsap.set(dotRef.current, { opacity: 0 });
      gsap.set('.dx-bar', { scaleY: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // Trace the active line over 1.5s.
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, { strokeDashoffset: 0, duration: 1.5, ease: EASE.precision });

      // Origin + completion nodes pop in.
      gsap.fromTo(originRef.current, { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)', delay: 0.2 });
      gsap.fromTo(wpRevealRef.current, { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)', delay: 1.5 });

      // Live GPS ping — outer ring expands + fades on a loop.
      gsap.fromTo(wpRingRef.current, { scale: 1, opacity: 0.8 },
        { scale: 1.5, opacity: 0, duration: 1.2, ease: 'power1.out', repeat: -1, delay: 1.5 });
      gsap.to(wpReticleRef.current, { rotation: 360, duration: 6, ease: 'none', repeat: -1 });

      // The GPS dot runs the route on a loop once the trace lands.
      const prog = { t: 0 };
      gsap.to(prog, {
        t: 1, duration: 3.4, ease: 'none', repeat: -1, delay: 1.4,
        onUpdate: () => {
          const pt = path.getPointAtLength(prog.t * len);
          gsap.set(dotRef.current, { x: pt.x, y: pt.y, opacity: 1 });
        },
      });

      // Elevation bars grow in.
      gsap.fromTo('.dx-bar', { scaleY: 0 },
        { scaleY: 1, transformOrigin: 'bottom', duration: 0.5, ease: 'power2.out', stagger: 0.05, delay: 0.25 });
    }, sectionRef);
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

  // Ambient auto-cycle: a progress bar fills over CYCLE seconds, then advances
  // to the next route. Pauses on hover and when off-screen; off under reduced
  // motion (the dashboard stays fully user-driven).
  useEffect(() => {
    if (prefersReduced() || COARSE) return;
    const bar = progressRef.current;
    if (!bar) return;
    gsap.set(bar, { scaleX: 0 });
    const tween = gsap.to(bar, {
      scaleX: 1, duration: CYCLE, ease: 'none',
      onComplete: () => setActive((a) => (a + 1) % ROUTES.length),
    });
    if (pausedRef.current || !inViewRef.current) tween.pause();
    cycleTween.current = tween;
    return () => tween.kill();
  }, [active]);

  // Pause the cycle while off-screen (don't churn an unseen section).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        const t = cycleTween.current;
        if (!t) return;
        if (entry.isIntersecting && !pausedRef.current) t.resume();
        else t.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Touch: advance the active route as the section scrolls past — the dashboard
  // is otherwise static on touch (no hover, no auto-cycle). Transform/opacity
  // only (the [active] effects redraw the route). Off under reduced motion.
  useEffect(() => {
    if (!COARSE || prefersReduced()) return;
    const el = sectionRef.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      end: 'bottom 20%',
      onUpdate: (self) => {
        const i = Math.min(ROUTES.length - 1, Math.floor(self.progress * ROUTES.length));
        setActive((cur) => (cur === i ? cur : i));
      },
    });
    return () => st.kill();
  }, []);

  const hold = () => {
    pausedRef.current = true;
    cycleTween.current && cycleTween.current.pause();
  };
  const release = () => {
    pausedRef.current = false;
    if (inViewRef.current) cycleTween.current && cycleTween.current.resume();
  };
  const select = (i) => {
    if (i === active) return;
    setActive(i); // restarts the cycle tween via the [active] effect
  };

  const route = ROUTES[active];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full bg-canvas-raised px-6 md:px-16 py-24 md:py-32 border-t border-line-subtle z-20 overflow-hidden flex flex-col justify-center"
    >
      <div className="grain-layer" />

      <div className="relative z-10 max-w-screen-2xl mx-auto w-full">
        <SectionHeader index="05" total="11" kicker="ROUTE DOCTRINE" readout="ON TRACK // TURF · BENGALURU" panning className="mb-10 md:mb-14" />

        <div
          onMouseEnter={hold}
          onMouseLeave={release}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch"
        >

          {/* ── THE CANVAS ─────────────────────────────────────────────── */}
          <div className="lg:col-span-8 relative aspect-[16/10] bg-canvas-deep border border-line overflow-hidden">
            <div className="absolute inset-0 hairline-grid opacity-40 pointer-events-none" />
            <div className="absolute inset-0 scan-lines opacity-40 pointer-events-none" />

            {/* Orange targeting brackets */}
            <span className="brk tl" /><span className="brk tr" />
            <span className="brk bl" /><span className="brk br" />

            {/* Route map */}
            <svg
              viewBox="0 0 400 250"
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 w-full h-full p-8"
              aria-hidden="true"
            >
              {/* Ghost network — every other route, faint + dotted */}
              {ROUTES.map((r, i) =>
                i === active ? null : (
                  <path
                    key={r.id}
                    d={r.path}
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1"
                    strokeDasharray="2 5"
                    strokeLinecap="round"
                  />
                ),
              )}

              {/* Active route */}
              <path
                ref={pathRef}
                d={route.path}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 0 10px var(--color-accent-mid))' }}
              />

              {/* Origin node */}
              <g ref={originRef} style={{ opacity: 0 }}>
                <circle r="5" fill="none" stroke="var(--color-accent)" strokeWidth="1.2" opacity="0.7" />
                <circle r="2" fill="var(--color-accent)" />
              </g>

              {/* Live GPS dot travelling the route */}
              <g ref={dotRef} style={{ opacity: 0 }}>
                <circle r="7" fill="var(--color-accent-dim)" />
                {/* White-hot core inside the lime halo. Was #FFD9B0 — a warm peach
                    picked to pair with the orange this section used to use; against
                    lime it read as a cream dot in a green glow. */}
                <circle r="3" fill="#FFFFFF" style={{ filter: 'drop-shadow(0 0 7px var(--color-accent))' }} />
              </g>

              {/* Completion waypoint — HUD targeting marker at the route's end */}
              <g ref={wpPosRef}>
                <g ref={wpRevealRef} style={{ opacity: 0 }}>
                  <circle ref={wpRingRef} r="11" fill="none" stroke="var(--color-accent)" strokeWidth="1.2" />
                  <rect ref={wpReticleRef} x="-8" y="-8" width="16" height="16" fill="none" stroke="var(--color-accent)" strokeWidth="1" />
                  <circle r="4" fill="var(--color-accent)" style={{ filter: 'drop-shadow(0 0 6px var(--color-accent))' }} />
                </g>
              </g>
            </svg>

            {/* Corner telemetry readouts */}
            <div className="absolute top-4 left-5 font-mono text-[9px] tracking-[0.3em] uppercase text-accent">
              ROUTE {route.id}
            </div>
            <div className="absolute top-4 right-5 font-mono text-[9px] tracking-[0.3em] uppercase text-fg-muted text-right max-w-[55%] truncate">
              {route.meta}
            </div>
            <div className="absolute bottom-4 left-5">
              <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-fg-muted">Distance</p>
              <p ref={distRef} className="font-mono text-[15px] md:text-[18px] font-bold text-white tabular-nums tracking-wider">
                {route.dist}
              </p>
            </div>
            <div className="absolute bottom-4 right-5 text-right">
              <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-fg-muted">Est. Time</p>
              <p ref={timeRef} className="font-mono text-[15px] md:text-[18px] font-bold text-accent tabular-nums tracking-wider">
                {route.time}
              </p>
            </div>
          </div>

          {/* ── THE SCHEDULE ───────────────────────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-fg-muted mb-5">
              // ROUTE INDEX
              {COARSE && <span className="text-accent-mid">&nbsp;&nbsp;· TAP A ROUTE</span>}
            </p>

            <ul className="border-t border-line">
              {ROUTES.map((r, i) => {
                const isActive = i === active;
                return (
                  <li
                    key={r.id}
                    data-magnetic
                    onMouseEnter={() => select(i)}
                    onClick={() => select(i)}
                    className="group relative cursor-pointer border-b border-line py-5 pl-4 flex items-baseline gap-4"
                  >
                    {/* Active left accent bar */}
                    <span
                      className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent origin-center transition-transform duration-300"
                      style={{ transform: isActive ? 'scaleY(1)' : 'scaleY(0)', boxShadow: isActive ? '0 0 10px var(--color-accent-mid)' : 'none' }}
                    />
                    <span className={`font-mono text-[11px] tabular-nums transition-colors duration-300 ${isActive ? 'text-accent' : 'text-fg-muted'}`}>
                      [{r.id}]
                    </span>
                    <span
                      className={`flex-1 font-sans font-light uppercase text-[13px] md:text-[15px] transition-all duration-300 ${isActive ? 'text-white' : 'text-fg-2'}`}
                      style={{ letterSpacing: '0.18em', transform: isActive ? 'translateX(4px)' : 'translateX(0)' }}
                    >
                      {r.name}
                    </span>
                    <span className={`font-mono text-[11px] tracking-wider whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-accent' : 'text-fg-muted'}`}>
                      — {r.dist}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* Auto-cycle progress — desktop only (cycle is off on touch) */}
            <div className="mt-5 flex items-center gap-3">
              <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-fg-muted">
                {COARSE ? 'Selected' : 'Auto-cycle'}
              </span>
              {!COARSE && (
                <div className="relative h-px flex-1 overflow-hidden bg-surface-raised">
                  <span ref={progressRef} className="absolute inset-0 origin-left bg-accent" style={{ transform: 'scaleX(0)' }} />
                </div>
              )}
              {COARSE && <div className="flex-1" />}
              <span className="font-mono text-[8px] tabular-nums text-fg-muted">
                {String(active + 1).padStart(2, '0')}/{String(ROUTES.length).padStart(2, '0')}
              </span>
            </div>

            {/* Live elevation profile */}
            <div className="mt-7">
              <div className="flex items-baseline justify-between mb-2">
                <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-fg-muted">Elevation profile</p>
                <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-accent-mid">{route.climb}</p>
              </div>
              <div className="flex h-12 items-end gap-[3px]">
                {route.elev.map((h, i) => (
                  <span
                    key={`${route.id}-${i}`}
                    className="dx-bar flex-1 rounded-sm bg-gradient-to-t from-accent-soft to-accent"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Surface / bearing telemetry */}
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-4">
              {[
                { label: 'Surface', value: route.surface },
                { label: 'Bearing', value: route.bearing, accent: true },
                { label: 'Routes', value: `${String(ROUTES.length).padStart(2, '0')} LOGGED` },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-mono text-[8px] tracking-[0.25em] uppercase text-fg-muted mb-1">{s.label}</p>
                  <p className={`font-mono text-[10px] md:text-[11px] tracking-wider uppercase ${s.accent ? 'text-accent' : 'text-fg-2'}`}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            <p className="font-sans text-[13px] md:text-sm leading-relaxed text-fg-2 mt-6 max-w-sm">
              {route.detail}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
