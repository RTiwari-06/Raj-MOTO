// DOCTRINE (05) — route-map telemetry dashboard (F1-inspired).
// The Canvas (left): a living map — a faint ghost network of every route, the
// active one traced bright, a live GPS dot running it, origin + completion
// nodes, and counting DIST/TIME readouts.
// The Schedule (right): hover/auto-cycled route list, a terrain-typed elevation
// profile, surface/bearing telemetry, and the route's doctrine line —
// the thing the section is named after: each ride mapped to an engineering
// principle, in the same lowercase terminal voice as THE THESIS (System Log).
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EASE } from '@/motion/system';

// ── Elevation profiles, keyed by terrain type ───────────────────────────────
// The chart used to read from a hand-typed `elev` array per route, which made
// every profile an accident: route 02's [16,18,15,20,17,19,16,18] was noise
// around a flat line and read as broken data rather than as "no gradient".
// Terrain is now a type, and each type owns one deliberate signature:
//
//   FLAT    — a perfectly level band. Uniform ON PURPOSE, which only reads as
//             intentional because the mean rule sits exactly on top of it and
//             the caption states the net gain. Fake jitter is what looked buggy.
//   ROLLING — a repeating sawtooth: crest, dip, crest. Rhythm you can count.
//   CLIMB   — a monotonic ramp to the summit at 100. Never dips.
//
// `bars` are percentages of the chart box; `mean` positions the dashed average
// rule. profileOf() falls back to FLAT, so a route with a missing or malformed
// terrain key still renders a valid chart instead of an empty track.
//
// `name` + `note` describe the SHAPE and belong to the terrain type. The
// measured figure lives on the route as `gain`, because only the route knows
// it. That split is why the old `climb` field is gone: it carried 'FLAT' and
// 'ROLLING' (shape — already stated by the profile) for two routes and
// '+1478 m' (a measurement — stated nowhere else) for the third, so it was
// duplicating one axis and load-bearing on another.
const PROFILES = {
  FLAT: {
    name: 'FLAT',
    note: 'ZERO GRADIENT HELD',
    mean: 34,
    bars: [34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34],
  },
  ROLLING: {
    name: 'ROLLING',
    note: 'CREST · DIP · REPEAT',
    mean: 48,
    bars: [30, 62, 34, 70, 38, 66, 30, 72, 36, 64, 32, 58],
  },
  CLIMB: {
    name: 'CLIMB',
    note: 'SUSTAINED TO SUMMIT',
    mean: 53,
    bars: [10, 16, 24, 30, 39, 47, 56, 66, 74, 83, 91, 100],
  },
};

const profileOf = (terrain) => PROFILES[terrain] || PROFILES.FLAT;

// Hand-authored route maps within a 0 0 400 250 viewBox.
// `distKm` / `timeSec` are numeric so the readouts can COUNT between routes
// (see the count-up effect below) rather than scramble through junk glyphs.
const ROUTES = [
  {
    id: '01', name: 'Hebbal Midnight Runs', meta: 'CITY LOOP // 00:30',
    distKm: 42, timeSec: 2304,
    path: 'M40,210 C70,140 120,150 150,110 S210,40 250,95 S320,170 360,118',
    detail: 'Empty flyovers, sodium lights, throttle wide. After midnight the city belongs to the riders.',
    doctrine: ['empty road, empty head.', 'strip the variables and the fault has nowhere to hide.'],
    surface: 'CITY TARMAC', bearing: '012°', terrain: 'ROLLING', gain: '±40 M SWING',
  },
  {
    id: '02', name: 'Highway Sprints', meta: 'NH-44 // PRE-DAWN',
    distKm: 180, timeSec: 8285,
    path: 'M28,135 C120,128 160,128 220,130 S330,120 384,116',
    detail: 'Long straights, zero traffic, sustained high-rev cruising. Pure two-wheeled meditation.',
    doctrine: ['one gear, one heading, two hours.', 'flow is just throttle held open.'],
    surface: 'OPEN TARMAC', bearing: '348°', terrain: 'FLAT', gain: '0 M NET',
  },
  {
    id: '03', name: 'Nandi Dawn Patrol', meta: 'HILL CLIMB // 04:00',
    distKm: 62, timeSec: 3912,
    path: 'M40,228 C90,206 70,164 120,164 S150,108 200,120 S210,58 262,70 S304,30 368,46',
    detail: '47 hairpins to the summit for sunrise. Cold air, hot tyres, a clear head.',
    doctrine: ['forty-seven corners to the summit.', 'nobody ships the hard thing in one commit.'],
    surface: 'HILL TARMAC', bearing: '034°', terrain: 'CLIMB', gain: '+1478 M NET',
  },
];

const CYCLE = 6; // seconds the dashboard dwells on a route before auto-advancing

const fmtDist = (km) => `${Math.round(km)} KM`;
const fmtTime = (s) =>
  [Math.floor(s / 3600), Math.floor((s % 3600) / 60), Math.floor(s % 60)]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');

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
  const doctrineRef = useRef(null);   // doctrine line (crossfades per route)
  // Live numeric state behind the DIST/TIME readouts — GSAP tweens this object
  // and writes the formatted result to the DOM, so no re-render per frame.
  const readout = useRef({ dist: ROUTES[0].distKm, time: ROUTES[0].timeSec });

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
      gsap.set(doctrineRef.current, { opacity: 1, y: 0 });
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

      // Elevation bars grow in, left to right, so the profile reads as it draws.
      gsap.fromTo('.dx-bar', { scaleY: 0 },
        { scaleY: 1, transformOrigin: 'bottom', duration: 0.5, ease: 'power2.out', stagger: 0.035, delay: 0.25 });

      // The doctrine line crossfades rather than cutting — it is prose, and a
      // hard swap mid-sentence is the one thing that would read as a glitch.
      gsap.fromTo(doctrineRef.current, { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.55, ease: EASE.precision, delay: 0.15 });
    }, sectionRef);
    return () => ctx.revert();
  }, [active]);

  // DIST + TIME count between routes. This replaced a character-scramble that
  // ran junk glyphs through both readouts on every switch — including the
  // 6-second auto-cycle, so the dashboard spent a chunk of its life looking
  // like corrupted data. Counting reads as an instrument settling instead:
  // the digits are legible the whole way, and TIME counts in real seconds and
  // re-formats to HH:MM:SS each frame rather than tweening a string.
  useEffect(() => {
    const r = ROUTES[active];
    const write = () => {
      if (distRef.current) distRef.current.textContent = fmtDist(readout.current.dist);
      if (timeRef.current) timeRef.current.textContent = fmtTime(readout.current.time);
    };

    if (prefersReduced()) {
      readout.current.dist = r.distKm;
      readout.current.time = r.timeSec;
      write();
      return;
    }

    const tl = gsap.timeline();
    tl.to(readout.current, {
      dist: r.distKm,
      time: r.timeSec,
      duration: 0.75,
      ease: EASE.precision,
      onUpdate: write,
    }, 0);
    // A short lift on the stat block so the count reads as a deliberate
    // hand-off rather than digits twitching on their own.
    tl.fromTo([distRef.current, timeRef.current],
      { opacity: 0.45 }, { opacity: 1, duration: 0.45, ease: EASE.precision }, 0);

    return () => tl.kill();
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
  const profile = profileOf(route.terrain);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full bg-canvas-raised px-6 md:px-16 py-24 md:py-32 border-t border-line-subtle z-20 overflow-hidden flex flex-col justify-center"
    >
      <div className="grain-layer" />

      {/* Pause-on-hover lives here, not on the dashboard grid. The doctrine
          band sits outside that grid now, and it is the longest thing to read
          in the section — leaving it uncovered meant the sentence could swap
          mid-read on the 6-second cycle. */}
      <div
        onMouseEnter={hold}
        onMouseLeave={release}
        className="relative z-10 max-w-screen-2xl mx-auto w-full"
      >
        <SectionHeader index="05" total="11" kicker="ROUTE DOCTRINE" readout="ON TRACK // 03 ROUTES · BENGALURU" panning className="mb-10 md:mb-14" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch">

          {/* ── THE CANVAS ─────────────────────────────────────────────── */}
          {/* self-start + w-full are load-bearing. The grid is items-stretch, so
              without them this panel's height is set by the taller schedule
              column and `aspect-[16/10]` then derives WIDTH from that height
              (833px from 521px at 1280) — overflowing the 8-col track and
              clipping the schedule column's left edge. Pinning the width makes
              the aspect ratio drive height instead, which is the intent. */}
          <div className="lg:col-span-8 relative w-full min-w-0 self-start aspect-[16/10] bg-canvas-deep border border-line overflow-hidden">
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
                    stroke="var(--color-line)"
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
                {fmtDist(route.distKm)}
              </p>
            </div>
            <div className="absolute bottom-4 right-5 text-right">
              {/* "Est. Time" was wrong — these are logged rides, not planned
                  ones. The number is what the ride actually took. */}
              <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-fg-muted">Elapsed</p>
              <p ref={timeRef} className="font-mono text-[15px] md:text-[18px] font-bold text-accent tabular-nums tracking-wider">
                {fmtTime(route.timeSec)}
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
                  <li key={r.id} className="border-b border-line">
                    {/* A real <button>: these were <li onClick>, which meant the
                        only way to change route was a mouse. Now they tab, take
                        Enter/Space, and announce their selected state. */}
                    <button
                      type="button"
                      data-magnetic
                      aria-pressed={isActive}
                      onMouseEnter={() => select(i)}
                      onFocus={() => select(i)}
                      onClick={() => select(i)}
                      className={`dx-route group relative w-full cursor-pointer py-5 pl-5 pr-1 flex items-baseline gap-4 text-left
                        transition-colors duration-300
                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
                        ${isActive ? 'bg-accent/[0.07]' : 'hover:bg-accent/[0.035]'}`}
                    >
                      {/* Active rail — thicker and lit when selected, and a dim
                          stub on hover so an unselected row still shows it is a
                          control rather than a caption. */}
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-0 bottom-0 origin-center transition-all duration-300"
                        style={{
                          width: isActive ? '3px' : '2px',
                          backgroundColor: 'var(--color-accent)',
                          transform: isActive ? 'scaleY(1)' : 'scaleY(0)',
                          boxShadow: isActive ? '0 0 12px var(--color-accent-mid)' : 'none',
                        }}
                      />
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 bg-accent-soft opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ opacity: isActive ? 0 : undefined }}
                      />

                      <span className={`font-mono text-[11px] tabular-nums transition-colors duration-300 ${
                        isActive ? 'text-accent' : 'text-fg-muted group-hover:text-accent-mid'
                      }`}>
                        [{r.id}]
                      </span>
                      <span
                        className={`flex-1 font-sans font-light uppercase text-[13px] md:text-[15px] transition-all duration-300 ${
                          isActive ? 'text-white' : 'text-fg-2 group-hover:text-white'
                        }`}
                        style={{ letterSpacing: '0.18em', transform: isActive ? 'translateX(4px)' : 'translateX(0)' }}
                      >
                        {r.name}
                      </span>
                      {/* The lit rail, the background wash and the accent type
                          already say "selected" three times over; a fourth
                          `◂ LIVE` token was noise, so it is gone. */}
                      <span className={`font-mono text-[11px] tracking-wider whitespace-nowrap transition-colors duration-300 ${
                        isActive ? 'text-accent' : 'text-fg-muted'
                      }`}>
                        — {fmtDist(r.distKm)}
                      </span>
                    </button>
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

            {/* Live elevation profile — shape comes from the terrain TYPE, so
                every route gets a signature the eye can name at a glance. The
                dashed mean rule is what makes FLAT legible: without a reference
                line, a level band is indistinguishable from a chart that failed
                to load, which is exactly how the old jittered version read. */}
            <div className="mt-7">
              <div className="flex items-baseline justify-between mb-2">
                <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-fg-muted">Elevation profile</p>
                <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-accent-mid">{route.gain}</p>
              </div>

              <div className="relative flex h-16 items-end gap-[3px]">
                {/* Mean rule — same dashed language as the ghost route lines.
                    z-10 is load-bearing: the bars are `relative`, so without it
                    they paint over this line. On FLAT the rule lands exactly on
                    the crest of the band, which is the whole point — the ride
                    never leaves its own average. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-line-strong"
                  style={{ bottom: `${profile.mean}%` }}
                />
                {profile.bars.map((h, i) => (
                  <span
                    key={`${route.id}-${i}`}
                    className="dx-bar relative flex-1 rounded-sm bg-gradient-to-t from-accent-soft to-accent"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <p className="font-mono text-[8px] tracking-[0.25em] uppercase text-fg-muted">
                  {profile.name}
                </p>
                <p className="font-mono text-[8px] tracking-[0.25em] uppercase text-fg-faint">
                  {profile.note}
                </p>
              </div>
            </div>

            {/* Surface / bearing telemetry. A third `Routes — 03 LOGGED` cell
                used to sit here: a constant that never changed with the route
                and restated the 01/03 counter directly above it. Dropped. */}
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-4">
              {[
                { label: 'Surface', value: route.surface },
                { label: 'Bearing', value: route.bearing, accent: true },
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

        {/* ── THE DOCTRINE ─────────────────────────────────────────────────
            The payload the section is named for, and the only place it speaks
            at display scale. It used to sit at the bottom of the schedule
            column at 12px mono — the smallest thing in a stack of six
            identically-weighted mono blocks, which meant the section called
            ROUTE DOCTRINE buried its doctrine. Full width, below both panels,
            so the reading order is instrument → telemetry → conclusion.

            Lowercase against an otherwise all-caps section is deliberate: the
            instruments shout in caps because instruments do, and this is the
            one human sentence here. The case change marks the speaker change.

            The two clauses are not styled for rhythm — white is the ride, lime
            is the principle it maps to. The accent performs the translation
            the section exists to make. */}
        <div ref={doctrineRef} className="mt-10 md:mt-14 border-t border-line pt-7 md:pt-9">
          <div className="flex items-baseline gap-4 mb-5 md:mb-6">
            <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-accent">
              Doctrine
            </span>
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-fg-muted tabular-nums">
              {route.id} / {String(ROUTES.length).padStart(2, '0')}
            </span>
          </div>

          {/* Set in JetBrains Mono at display scale — not the `font-serif`
              display face, deliberately. Two reasons:

              1. `--font-serif` is 'Saira Expanded', which does not exist on
                 Google Fonts (see index.html) and silently falls back to
                 Arial Narrow — or plain Arial where that is missing. At 52px
                 that reads as generic body copy enlarged. A signature element
                 cannot rest on a font that may never load.
              2. Mono at this size is the one register the site has never used:
                 JetBrains Mono appears everywhere here, but only ever at
                 8–11px as instrument labels. Promoting it to display scale
                 makes the doctrine unmistakably the same voice as THE THESIS
                 while giving it the weight the section's name promises.

              Weight 500, not 900: everything else on this site shouts in black
              caps, and a fourth shouting headline would just be more noise. */}
          <p
            className="font-mono lowercase max-w-5xl"
            style={{
              fontSize: 'clamp(1.05rem, 2.9vw, 2.35rem)',
              fontWeight: 500,
              lineHeight: '1.32',
              letterSpacing: '-0.015em',
            }}
          >
            <span className="text-fg">{route.doctrine[0]} </span>
            <span style={{ color: 'var(--color-accent)' }}>{route.doctrine[1]}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
