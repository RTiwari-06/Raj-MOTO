import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DUR, ST, STAGGER } from '@/motion/system';
import { MEDIA } from '@/data/media';
import RollingOdometer from '@/components/ui/RollingOdometer';
import OdometerBackground from '@/components/ui/OdometerBackground';

// Gauge positions for the riding-state ladder documented in media.js.
// ⚠ 'MID-CORNER' (PostgreSQL, MongoDB) is NOT in that documented ladder, and
// the legend above the panel does not decode it either. Slotted mid-way on its
// plain meaning; the real fix is reconciling the data with the legend.
const LEVELS = {
  'REDLINE':       100,
  'FULL THROTTLE':  88,
  'HIGH GEAR':      76,
  'DAILY RIDER':    64,
  'MID-CORNER':     52,
  'ON THE GAS':     44,
  'WARMING UP':     30,
  'BREAK-IN':       16,
};
const levelOf = (l) => LEVELS[l] ?? 50;

const BAY_COUNT = MEDIA.technical.reduce((n, c) => n + c.skills.length, 0);

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

  // ── Pit garage shutter ─────────────────────────────────────────────────────
  const [garageOpen, setGarageOpen] = useState(false);
  const panelRef   = useRef(null);   // the height-animated wrapper
  const shutterRef = useRef(null);   // the roller door travelling over it
  const bodyRef    = useRef(null);   // bays + gauges inside

  useEffect(() => {
    const panel = panelRef.current;
    const shutter = shutterRef.current;
    if (!panel || !shutter) return;

    const reduced = prefersReduced();

    // Height must tween to a real value for the page below to reflow, so this
    // is the one place in the section that animates layout rather than pure
    // transform. It is a one-shot, user-initiated ~0.6s tween, not a loop —
    // the slats and gauges on top of it stay transform/opacity only.
    //
    // Deliberately NOT gsap.context/revert. revert() restores the inline styles
    // captured when the context was made, so closing would first snap height
    // back to 0 and the closing tween would then animate from 0 to 0 — the
    // door would vanish instead of rolling down. kill() leaves the DOM where
    // the previous tween left it, which is what a toggle needs.
    const bays = panel.querySelectorAll('.pg-bay');
    const fills = panel.querySelectorAll('.pg-fill');

    if (reduced) {
      gsap.set(panel, { height: garageOpen ? 'auto' : 0 });
      gsap.set(shutter, { yPercent: garageOpen ? -100 : 0 });
      gsap.set(bays, { opacity: 1, y: 0 });
      gsap.set(fills, { scaleX: 1 });
      return;
    }

    const tl = gsap.timeline();

    if (garageOpen) {
      tl.set(bays, { opacity: 0, y: 14 })
        .set(fills, { scaleX: 0 })
        .to(panel, { height: 'auto', duration: DUR.standard, ease: EASE.precision }, 0)
        // The door rides up over the opening gap at the same rate.
        .to(shutter, { yPercent: -100, duration: DUR.standard, ease: EASE.precision }, 0)
        .to(bays, { opacity: 1, y: 0, duration: DUR.fast, ease: EASE.precision, stagger: STAGGER.tight }, 0.3)
        .to(fills, { scaleX: 1, duration: DUR.considered, ease: EASE.precision, stagger: 0.03 }, 0.4);
    } else {
      tl.to(shutter, { yPercent: 0, duration: DUR.fast, ease: EASE.exit }, 0)
        .to(panel, { height: 0, duration: DUR.fast, ease: EASE.exit }, 0.05);
    }

    // Opening/closing changes document height, so pinned triggers below this
    // section must re-measure or their start/end distances go stale.
    tl.eventCallback('onComplete', () => ScrollTrigger.refresh());

    return () => tl.kill();
  }, [garageOpen]);

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
      className="relative w-full bg-black border-t border-line-subtle"
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
            <div className="w-[50px] h-[2px] bg-accent mx-auto mb-8" />
            <p
              className="font-serif font-black uppercase leading-none"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '-0.02em', color: 'var(--color-accent)' }}
            >
              RT•MOTO //
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
            <div className="h-px w-12 bg-surface-hover" />
            <p className="text-[8px] label-extreme uppercase font-black text-fg-muted">
              R T • M O T O &nbsp;//&nbsp; T H E &nbsp; L O G &nbsp;//&nbsp; 2 0 2 6
            </p>
            <div className="h-px w-12 bg-surface-hover" />
          </div>

          {/* The massive stat — mechanical odometer reels */}
          <div className="overflow-hidden">
            <RollingOdometer ref={odometerRef} digits={5} comma={2} unit="KM" ariaValue="20,000 kilometres clocked" />
          </div>

          {/* Counter label */}
          <div className="overflow-hidden mt-4">
            <p
              ref={labelRef}
              className="label-extreme text-[10px] md:text-[13px] font-black uppercase opacity-0"
              style={{ color: 'var(--color-accent)', letterSpacing: '0.3em' }}
            >
              K I L O M E T R E S &nbsp; C L O C K E D
            </p>
          </div>

          {/* Sub-footnote */}
          <p className="text-[9px] label-spaced uppercase font-bold text-fg-muted mt-10 max-w-md mx-auto leading-relaxed">
            VISION LOCKED. MOTION BLURRED. BENGALURU STREETS TO APEX CORNERS.
          </p>
        </div>

        {/* Corner precision glyphs */}
        {['top-8 left-8', 'top-8 right-8', 'bottom-8 left-8', 'bottom-8 right-8'].map((pos) => (
          <span
            key={pos}
            className={`absolute ${pos} text-[10px] font-black text-fg-faint select-none pointer-events-none z-20`}
          >
            [ + ]
          </span>
        ))}
      </div>

      {/* ── CARDS ZONE — supporting background info (reduced padding) ───────── */}
      <div className="relative z-10 bg-canvas border-t border-line-subtle px-8 md:px-16 py-14 md:py-20">

        {/* Section header — deliberately smaller; supports, doesn't dominate */}
        <div className="mb-10 md:mb-14">
          <div className="w-[44px] h-[2px] bg-accent mb-6" />
          <h2
            className="font-serif font-black uppercase leading-none"
            style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.6rem)', letterSpacing: '-0.02em', lineHeight: '0.95', color: 'var(--color-accent)' }}
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
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-fg-muted mt-8">
            GAUGE&nbsp;:&nbsp;<span className="text-accent">REDLINE</span> = mastered
            &nbsp;·&nbsp; FULL THROTTLE &nbsp;·&nbsp; HIGH GEAR &nbsp;·&nbsp; DAILY RIDER
            &nbsp;·&nbsp; <span className="text-fg-muted">BREAK-IN</span> = just started
          </p>
        </div>

        {/* ── THE PIT GARAGE ───────────────────────────────────────────────
            Was a card advertising a section that did not exist, with a link to
            #machine that dropped you at the top of an unrelated section. The
            stack now lives here, behind the door, and the button opens it in
            place instead of navigating away.

            Lime, not the KTM orange this block briefly wore inside #machine:
            --color-machine is fenced to that section, and carrying it out here
            would leak the machine palette into the rest of the page. */}
        <div id="pit-garage" className="mb-12 scroll-mt-24">

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-accent mb-2">
                // THE PIT GARAGE
              </p>
              <p className="font-mono text-[11px] text-fg-muted max-w-md leading-relaxed">
                The stack that builds and services this site — {BAY_COUNT} entries across four bays.
              </p>
            </div>

            {/* The door control. No chevron: the shutter itself reports state,
                and the lamp says which way the door is. */}
            <button
              type="button"
              onClick={() => setGarageOpen((v) => !v)}
              data-magnetic="cta"
              aria-expanded={garageOpen}
              aria-controls="pit-garage-panel"
              className="group inline-flex items-center gap-3 px-5 py-3 border border-line-strong font-mono text-[10px] uppercase tracking-[0.2em] text-accent transition-colors duration-300 hover:bg-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span
                aria-hidden="true"
                className="w-[6px] h-[6px] rounded-full transition-all duration-300"
                style={{
                  backgroundColor: garageOpen ? 'var(--color-accent)' : 'var(--color-line-strong)',
                  boxShadow: garageOpen ? '0 0 8px var(--color-accent)' : 'none',
                }}
              />
              {garageOpen ? 'Close the pit garage' : 'Open the pit garage'}
            </button>
          </div>

          {/* Height wrapper — overflow-hidden so the door can sit inside it */}
          <div
            id="pit-garage-panel"
            ref={panelRef}
            className="relative overflow-hidden"
            style={{ height: 0 }}
            aria-hidden={!garageOpen}
          >
            {/* The roller door, covering the opening until it rides up */}
            <div
              ref={shutterRef}
              aria-hidden="true"
              className="pg-shutter absolute inset-0 z-10 pointer-events-none"
            />

            <div ref={bodyRef} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-10 pt-8">
              {MEDIA.technical.map((group) => (
                <div key={group.category} className="pg-bay">
                  {/* Hairline only — no card. These read as bays taped out on a
                      workshop floor, not as four product tiers. */}
                  <p className="font-mono text-[9px] tracking-[0.25em] uppercase text-fg-2 pb-3 mb-4 border-b border-white/[0.08]">
                    {group.category}
                  </p>

                  <ul className="space-y-3.5">
                    {group.skills.map((s) => (
                      <li key={s.name}>
                        <div className="flex items-baseline justify-between gap-3 mb-1.5">
                          <span className="font-mono text-[11px] tracking-wider text-white truncate">
                            {s.name}
                          </span>
                          <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-accent-mid whitespace-nowrap">
                            {s.level}
                          </span>
                        </div>
                        <div
                          className="relative h-[3px] w-full bg-white/[0.07] overflow-hidden"
                          role="img"
                          aria-label={`${s.name}: ${s.level}`}
                        >
                          <span
                            className="pg-fill absolute inset-y-0 left-0 origin-left bg-gradient-to-r from-accent-soft to-accent"
                            style={{ width: `${levelOf(s.level)}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom footnote */}
        <div className="flex items-center gap-6 mt-20 pt-12 border-t border-line-subtle">
          <div className="h-px w-16 bg-surface-raised" />
          <p className="text-[9px] label-spaced uppercase font-bold text-fg-faint">
            Every build &nbsp;·&nbsp; Every ride
          </p>
        </div>
      </div>
    </section>
  );
}
