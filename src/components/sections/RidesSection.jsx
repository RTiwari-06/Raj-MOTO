import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MEDIA } from '@/data/media';
import { EASE, DUR, ST } from '@/motion/system';
import { useRideStore } from '@/store/useRideStore';

const RIDES = MEDIA.rides;

// Lando DNA: one accent only. Per-ride colors in media.js are intentionally
// left in the data but overridden to lime here so nothing competes.
const ACCENT = '#D2FF00';

export default function RidesSection() {
  const sectionRef = useRef(null);
  const trackRef   = useRef(null);
  const slideRefs  = useRef([]);
  const specRefs   = useRef([]);
  const nameRefs   = useRef([]);
  const dotRefs    = useRef([]);
  const imgWrapRefs = useRef([]);   // parallax wrapper per slide
  const dimRefs    = useRef([]);    // active-slide emphasis overlay per slide
  const labelRef   = useRef(null);

  const setDetailRide = useRideStore((state) => state.setDetailRide);

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;

    const ctx = gsap.context(() => {

      // ── DESKTOP ───────────────────────────────
      if (isDesktop && RIDES.length > 1) {
        // Function-based so the pin distance + track travel recompute on every
        // ScrollTrigger.refresh() (invalidateOnRefresh) instead of freezing the
        // viewport width captured at mount — the source of the broken horizontal
        // scrub when the page is refreshed after images/lazy mounts settle.
        const totalX = () => window.innerWidth * (RIDES.length - 1);

        const hTween = gsap.to(trackRef.current, {
          x:    () => -totalX(),
          ease: EASE.scrub,
          scrollTrigger: {
            trigger:           sectionRef.current,
            start:             'top top',
            end:               () => '+=' + totalX(),
            pin:               true,
            anticipatePin:     1,
            invalidateOnRefresh: true,
            scrub:             ST.scrub.tight,
            onUpdate: (self) => {
              // Continuous slide position (0 → RIDES.length-1) for centred emphasis.
              const pos = self.progress * (RIDES.length - 1);
              const idx = Math.min(Math.round(pos), RIDES.length - 1);
              dotRefs.current.forEach((dot, i) => {
                if (!dot) return;
                gsap.set(dot, {
                  opacity:         i === idx ? 1 : 0.25,
                  scaleX:          i === idx ? 1.8 : 1,
                  backgroundColor: i === idx ? ACCENT : 'rgba(255,255,255,0.25)',
                });
              });
              // Active-slide pop: the centred slide is clear; neighbours darken.
              dimRefs.current.forEach((dim, i) => {
                if (!dim) return;
                const d = Math.min(1, Math.abs(pos - i));
                dim.style.opacity = (d * 0.55).toFixed(3);
              });
            },
          },
        });

        // Spec + name animations keyed to the horizontal container
        specRefs.current.forEach((spec, i) => {
          if (!spec || !slideRefs.current[i]) return;
          gsap.fromTo(spec,
            { x: 50, opacity: 0 },
            {
              x: 0, opacity: 1, duration: DUR.considered, ease: EASE.momentum,
              scrollTrigger: {
                containerAnimation: hTween,
                trigger:            slideRefs.current[i],
                start:              'left 70%',
                once:               true,
              },
            },
          );
        });

        nameRefs.current.forEach((name, i) => {
          if (!name || !slideRefs.current[i]) return;
          gsap.fromTo(name,
            { y: 30, opacity: 0 },
            {
              y: 0, opacity: 1, duration: DUR.considered, ease: EASE.momentum,
              scrollTrigger: {
                containerAnimation: hTween,
                trigger:            slideRefs.current[i],
                start:              'left 80%',
                once:               true,
              },
            },
          );
        });

        // Image parallax — the over-scaled image drifts as its slide crosses the
        // viewport, giving each slide depth as you scroll to it.
        imgWrapRefs.current.forEach((wrap, i) => {
          if (!wrap || !slideRefs.current[i]) return;
          gsap.fromTo(wrap,
            { xPercent: -6 },
            {
              xPercent: 6, ease: 'none',
              scrollTrigger: {
                containerAnimation: hTween,
                trigger:            slideRefs.current[i],
                start:              'left right',
                end:                'right left',
                scrub:              true,
              },
            },
          );
        });
      } else if (isDesktop && RIDES.length === 1) {
        specRefs.current.forEach((spec) => {
          if (!spec) return;
          gsap.fromTo(spec,
            { x: 50, opacity: 0 },
            {
              x: 0, opacity: 1, duration: DUR.considered, ease: EASE.momentum,
              scrollTrigger: { trigger: sectionRef.current, start: 'top 50%', once: true },
            }
          );
        });
        nameRefs.current.forEach((name) => {
          if (!name) return;
          gsap.fromTo(name,
            { y: 30, opacity: 0 },
            {
              y: 0, opacity: 1, duration: DUR.considered, ease: EASE.momentum,
              scrollTrigger: { trigger: sectionRef.current, start: 'top 50%', once: true },
            }
          );
        });
      }

      // ── MOBILE: Vertical reveal ────────────────────────────────────────────
      if (!isDesktop) {
        slideRefs.current.forEach((slide) => {
          if (!slide) return;
          gsap.fromTo(slide,
            { y: 50, opacity: 0 },
            {
              y: 0, opacity: 1, duration: DUR.considered, ease: EASE.momentum,
              scrollTrigger: { trigger: slide, start: ST.start.section, once: true },
            },
          );
        });
      }

      // Section label
      if (labelRef.current) {
        gsap.fromTo(labelRef.current,
          { opacity: 0, y: -10 },
          {
            opacity: 1, y: 0, duration: DUR.standard, ease: EASE.precision,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
          },
        );
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="rides"
      ref={sectionRef}
      className="relative bg-black overflow-hidden"
    >
      {/* ── HUD overlay — top bar with section title + progress ─────────────── */}
      <div
        ref={labelRef}
        className="absolute top-0 left-0 right-0 z-20 pointer-events-none flex items-end justify-between px-10 md:px-16 py-9 opacity-0"
      >
        {/* SELECTED / WORK stacked title */}
        <div>
          <div className="w-8 h-[1.5px] bg-[#D2FF00] mb-3" />
          <p
            className="font-serif font-black uppercase leading-none"
            style={{ fontSize: 'clamp(1.1rem, 2.2vw, 1.6rem)', letterSpacing: '-0.02em', color: '#D2FF00' }}
          >
            RIDES /
          </p>
          <p
            className="font-serif font-black uppercase text-white leading-none"
            style={{ fontSize: 'clamp(1.1rem, 2.2vw, 1.6rem)', letterSpacing: '-0.02em' }}
          >
            ARCHIVE
          </p>
        </div>

        {/* Slide progress dashes */}
        <div className="flex items-center gap-2.5 pb-1">
          {RIDES.map((ride, i) => (
            <div
              key={ride.id}
              ref={(el) => (dotRefs.current[i] = el)}
              className="h-[2px] w-6"
              style={{
                backgroundColor: i === 0 ? ACCENT : 'rgba(255,255,255,0.25)',
                transformOrigin: 'left center',
                display: RIDES.length > 1 ? 'block' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Scroll cue (only if > 1 ride) */}
      {RIDES.length > 1 && (
        <div className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none items-center gap-3">
          <div className="w-6 h-[1px] bg-white/15" />
          <p className="text-[8px] font-black uppercase tracking-[0.45em] text-white/25">Scroll</p>
          <div className="w-6 h-[1px] bg-white/15" />
        </div>
      )}

      {/* ── Horizontal track ─────────────────────────────────────────────────── */}
      <div
        ref={trackRef}
        className="flex flex-col md:flex-row"
        style={{ willChange: 'transform' }}
      >
        {RIDES.map((ride, i) => (
          <div
            key={ride.id}
            ref={(el) => (slideRefs.current[i] = el)}
            className="group relative flex-shrink-0 w-full md:w-screen h-[80vh] md:h-screen overflow-hidden"
          >
            {/* Full-bleed image in an over-scaled parallax wrapper (negative inset
                gives drift headroom so edges never show). CSS zoom on hover. */}
            <div
              ref={(el) => (imgWrapRefs.current[i] = el)}
              className="absolute -inset-[8%] will-change-transform"
            >
              <img
                src={ride.src}
                alt={ride.model}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                style={{ filter: 'contrast(1.1) saturate(1.2) sepia(0.2) hue-rotate(-15deg)' }}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </div>

            {/* Gradient overlays — dark pockets for legible typography */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #0a0a0a 0%, transparent 50%, #0a0a0a 100%)', opacity: 0.85 }} />

            {/* Active-slide emphasis — darkens when this slide is off-centre */}
            <div
              ref={(el) => (dimRefs.current[i] = el)}
              className="absolute inset-0 bg-black pointer-events-none"
              style={{ opacity: 0 }}
            />

            {/* ── TOP-LEFT: category label in mono ─────────────────────────── */}
            <div className="absolute top-[76px] left-10 md:left-16 z-10 pointer-events-none">
              <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-white/35">
                {ride.category}
              </p>
            </div>

            {/* Slide index (hidden if only 1 ride) */}
            {RIDES.length > 1 && (
              <div className="absolute top-[76px] right-10 md:right-16 pointer-events-none z-10">
                <p className="text-[8px] font-black uppercase tracking-[0.5em]" style={{ color: 'rgba(210,255,0,0.5)' }}>
                  0{i + 1}&nbsp;/&nbsp;0{RIDES.length}
                </p>
              </div>
            )}

            {/* ── BOTTOM-LEFT: nameRef — Playfair title + tag + CTA ────────── */}
            <div
              ref={(el) => (nameRefs.current[i] = el)}
              className="absolute bottom-14 left-10 md:left-16 z-10 opacity-0"
            >
              <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-white/40 mb-4">
                {ride.year}
              </p>
              <h3
                className="font-serif font-black uppercase text-white leading-none max-w-[55vw] md:max-w-[38vw]"
                style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', letterSpacing: '-0.03em' }}
              >
                {ride.model}
              </h3>
              <span
                className="inline-block mt-5 text-[8px] font-black uppercase tracking-[0.35em] px-4 py-1.5"
                style={{ backgroundColor: ride.accent || ACCENT, color: '#000' }}
              >
                {ride.tag}
              </span>

              <button
                onClick={() => setDetailRide(ride)}
                data-magnetic="cta"
                className="btn-accent mt-5 flex items-center gap-3 text-[9px] font-black tracking-[0.35em] uppercase px-6 py-3"
                style={{
                  borderRadius: '1px',
                  '--btn-accent': ride.accent || ACCENT,
                  '--btn-accent-dim': `${ride.accent || ACCENT}45`
                }}
              >
                View Ride
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>
            </div>

            {/* ── BOTTOM-RIGHT: specRef — accent arrow, revealed by GSAP ──────── */}
            <div
              ref={(el) => (specRefs.current[i] = el)}
              className="absolute bottom-14 right-10 md:right-16 z-10 opacity-0 flex flex-col items-end gap-3"
            >
              <span
                className="text-3xl leading-none transition-transform duration-300 group-hover:translate-x-1"
                style={{ fontWeight: 900, color: ride.accent || ACCENT }}
              >
                →
              </span>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/25">
                {ride.odometer} GP raced
              </p>
              <div className="h-px w-12 bg-white/10" />
            </div>

            {/* ── HOVER CURTAIN: diagonal corner-wipe revealing tagline + specs ─ */}
            <div className="absolute bottom-0 right-0 z-20 pointer-events-none w-[min(420px,72vw)]">
              <div className="ride-reveal relative bg-black/85 backdrop-blur-md pl-8 pr-10 md:pr-16 py-10 overflow-hidden border-l border-white/5">
                {/* Cinematic textures */}
                <div className="grain-layer opacity-10" />
                <div className="absolute inset-0 scan-lines opacity-20" />

                {/* Registration brackets */}
                <span className="brk tl !w-3 !h-3" style={{ top: '12px', left: '12px', opacity: 0.4 }} />
                <span className="brk br !w-3 !h-3" style={{ bottom: '12px', right: '12px', opacity: 0.4 }} />

                <div className="relative z-10">
                  <p
                    className="font-mono text-[8px] tracking-[0.4em] uppercase mb-5 transition-all duration-500 opacity-0 translate-y-2 group-hover:opacity-60 group-hover:translate-y-0 delay-100"
                    style={{ color: ride.accent || ACCENT }}
                  >
                    Telemetry // 0{i + 1}
                  </p>
                  <p className="font-serif italic text-white/90 text-base leading-snug mb-8 max-w-[32ch] transition-all duration-500 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 delay-200">
                    {ride.tagline}
                  </p>
                  <div className="flex flex-col gap-1 transition-all duration-500 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 delay-300">
                    {ride.specs?.map((s) => (
                      <div key={s.label} className="flex items-baseline group/spec">
                        <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/35 whitespace-nowrap transition-colors duration-300 group-hover/spec:text-white/60">
                          {s.label}
                        </span>
                        <span className="lead-dots opacity-20" />
                        <span className="font-mono text-[11px] tracking-[0.1em] text-white/80 whitespace-nowrap transition-colors duration-300 group-hover/spec:text-white">
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* The moving leading edge */}
              <div 
                className="ride-reveal-edge z-30" 
                style={{ backgroundColor: ride.accent || ACCENT, boxShadow: `0 0 15px ${ride.accent || ACCENT}80` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
