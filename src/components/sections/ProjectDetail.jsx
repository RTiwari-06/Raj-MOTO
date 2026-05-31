import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { EASE, DUR } from '@/motion/system';
import { useRideStore } from '@/store/useRideStore';

export default function ProjectDetail() {
  const overlayRef    = useRef(null);
  const hudRef        = useRef(null);
  const contentRef    = useRef(null);
  const navFooterRef  = useRef(null);
  const isFirst       = useRef(true);

  const { detailRide: ride, rides, closeDetail, navigateRide } = useRideStore();
  const rideIndex = rides.findIndex(r => r.id === ride?.id);

  const hasPrev = rideIndex > 0;
  const hasNext = rideIndex < rides.length - 1;

  // ── ENTRY: overlay slides up from bottom, then content staggers in ────────
  useEffect(() => {
    if (!ride) return;
    const ctx = gsap.context(() => {
      gsap.timeline()
        .fromTo(overlayRef.current,
          { yPercent: 100 },
          { yPercent: 0, duration: DUR.cinematic, ease: EASE.authority }
        )
        .fromTo(hudRef.current,
          { opacity: 0 },
          { opacity: 1, duration: DUR.fast, ease: EASE.precision },
          '-=0.45'
        )
        .fromTo(contentRef.current,
          { opacity: 0, y: 36 },
          { opacity: 1, y: 0, duration: DUR.considered, ease: EASE.momentum },
          '-=0.35'
        )
        .fromTo(navFooterRef.current,
          { opacity: 0 },
          { opacity: 1, duration: DUR.fast },
          '-=0.45'
        );
    }, overlayRef);
    return () => ctx.revert();
  }, [!!ride]);

  // ── CROSSFADE: animate content when ride changes (not on mount) ───────────
  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    const el = contentRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.timeline()
        .to(el,   { opacity: 0, y: -12, duration: 0.18, ease: EASE.exit })
        .fromTo(el,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0,  duration: DUR.standard, ease: EASE.momentum }
        );
    });
    return () => ctx.revert();
  }, [ride?.id]);

  // ── EXIT ──────────────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    gsap.to(overlayRef.current, {
      yPercent: 100,
      duration: DUR.standard,
      ease: EASE.exit,
      onComplete: closeDetail,
    });
  }, [closeDetail]);

  // ── KEYBOARD ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape')     handleClose();
      if (e.key === 'ArrowLeft'  && hasPrev) navigateRide(-1);
      if (e.key === 'ArrowRight' && hasNext) navigateRide(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleClose, hasPrev, hasNext, navigateRide]);

  if (!ride) return null;

  return (
    <div
      ref={overlayRef}
      data-lenis-prevent
      className="fixed inset-0 bg-black overflow-y-auto"
      style={{ zIndex: 9950, transform: 'translateY(100%)' }}
    >

      {/* ── HUD BAR — sticky top ─────────────────────────────────────────── */}
      <div
        ref={hudRef}
        className="sticky top-0 z-10 flex items-center justify-between px-8 md:px-16 py-5 opacity-0"
        style={{
          backgroundColor: 'rgba(0,0,0,0.88)',
          backdropFilter:  'blur(12px)',
          borderBottom:    '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <button
          onClick={handleClose}
          data-magnetic
          className="flex items-center gap-3 text-[9px] font-black tracking-[0.3em] uppercase text-white/40 hover:text-accent transition-colors duration-200"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#D2FF00')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >
          ← &nbsp;Fleet
        </button>

        <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/15">
          RT•MOTO // DETAIL
        </span>

        <span
          className="text-[8px] font-black uppercase tracking-[0.4em]"
          style={{ color: `${ride.accent}55` }}
        >
          {String(rideIndex + 1).padStart(2, '0')} / {String(rides.length).padStart(2, '0')}
        </span>
      </div>

      {/* ── ANIMATED CONTENT ─────────────────────────────────────────────── */}
      <div ref={contentRef} style={{ opacity: 0 }}>

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden" style={{ height: '100svh' }}>

          {/* Full-bleed image */}
          <img
            src={ride.src}
            alt={ride.model}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Directional gradients */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,  rgba(0,0,0,0.82) 0%, transparent 55%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,    rgba(0,0,0,0.95) 0%, transparent 52%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 22%)' }} />

          {/* Corner precision glyphs */}
          <span className="absolute top-8 left-8 md:left-16 text-[8px] font-black text-white/10 select-none pointer-events-none">[ + ]</span>
          <span className="absolute top-8 right-8 md:right-16 text-[8px] font-black text-white/10 select-none pointer-events-none">[ + ]</span>

          {/* ── SPEC PANEL — right side ────────────────────────────────── */}
          <div className="hidden md:block absolute right-16 top-1/2 -translate-y-1/2 w-[300px]">
            <p
              className="text-[8px] font-black uppercase tracking-[0.5em] mb-5"
              style={{ color: `${ride.accent}60` }}
            >
              RT•MOTO // TECH SPEC
            </p>
            <div style={{ border: `1px solid ${ride.accent}22` }}>
              {ride.specs.map((spec, j) => (
                <div
                  key={spec.label}
                  className="flex items-center justify-between px-5 py-4"
                  style={{
                    borderBottom: j < ride.specs.length - 1
                      ? `1px solid ${ride.accent}15`
                      : 'none',
                  }}
                >
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/25">
                    {spec.label}
                  </span>
                  <span className="text-sm font-black tracking-tight text-white">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 h-px w-full" style={{ backgroundColor: `${ride.accent}22` }} />
          </div>

          {/* ── TITLE BLOCK — bottom left ──────────────────────────────── */}
          <div className="absolute bottom-16 md:bottom-20 left-8 md:left-16 max-w-[70vw] md:max-w-[55vw]">
            <p
              className="text-[9px] font-black uppercase tracking-[0.45em] mb-5"
              style={{ color: ride.accent }}
            >
              {ride.year} &nbsp;·&nbsp; {ride.category}
            </p>

            <h1
              className="font-black uppercase tracking-tighter leading-none text-white"
              style={{ fontSize: 'clamp(2.8rem, 8vw, 9rem)' }}
            >
              {ride.model}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-6">
              <span
                className="inline-block text-[8px] font-black uppercase tracking-[0.35em] px-4 py-2"
                style={{ backgroundColor: ride.accent, color: '#000' }}
              >
                {ride.tag}
              </span>
              {ride.odometer && (
                <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/30">
                  {ride.odometer} km on the clock
                </span>
              )}
            </div>
          </div>

          {/* Scroll cue */}
          <div className="hidden md:flex absolute bottom-9 left-1/2 -translate-x-1/2 items-center gap-3 pointer-events-none">
            <div className="w-6 h-px bg-white/12" />
            <p className="text-[8px] font-black uppercase tracking-[0.45em] text-white/20">Scroll</p>
            <div className="w-6 h-px bg-white/12" />
          </div>
        </div>

        {/* ── STORY SECTION ─────────────────────────────────────────────── */}
        <div
          className="px-8 md:px-16 py-24 md:py-32 border-t border-white/5"
          style={{ backgroundColor: '#1C1F15' }}
        >
          <div className="max-w-screen-xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-start">

              {/* ── Story copy ─────────────────────────────────────────── */}
              <div>
                <div className="flex items-center gap-3 mb-10">
                  <span className="text-[8px] font-black text-accent">[ + ]</span>
                  <p className="text-[9px] font-black uppercase tracking-[0.45em] text-accent">
                    RT•MOTO // The Machine
                  </p>
                </div>

                {ride.tagline && (
                  <blockquote
                    className="text-light font-black italic leading-tight mb-10"
                    style={{
                      fontSize:      'clamp(1.5rem, 3.5vw, 2.75rem)',
                      letterSpacing: '-0.025em',
                      fontFamily:    "'Playfair Display', serif",
                    }}
                  >
                    "{ride.tagline}"
                  </blockquote>
                )}

                <div className="space-y-5">
                  {ride.story?.map((para, i) => (
                    <p key={i} className="text-base leading-relaxed" style={{ color: 'rgba(244,244,237,0.55)' }}>
                      {para}
                    </p>
                  ))}
                </div>

                {/* Mobile spec list */}
                <div className="md:hidden mt-12">
                  <p className="text-[8px] font-black uppercase tracking-[0.5em] mb-5 text-white/30">
                    RT•MOTO // SPEC
                  </p>
                  <div style={{ border: `1px solid ${ride.accent}22` }}>
                    {ride.specs.map((spec, j) => (
                      <div
                        key={spec.label}
                        className="flex items-center justify-between px-5 py-4"
                        style={{
                          borderBottom: j < ride.specs.length - 1
                            ? `1px solid ${ride.accent}15`
                            : 'none',
                        }}
                      >
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/25">
                          {spec.label}
                        </span>
                        <span className="text-sm font-black tracking-tight" style={{ color: ride.accent }}>
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Full spec table — desktop ───────────────────────────── */}
              <div className="hidden lg:block">
                <p className="text-[9px] font-black uppercase tracking-[0.45em] mb-8 text-white/25">
                  RT•MOTO // Full Specification
                </p>
                <div style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  {ride.specs.map((spec, j) => (
                    <div
                      key={spec.label}
                      className="flex items-center justify-between px-6 py-5"
                      style={{
                        borderBottom: j < ride.specs.length - 1
                          ? '1px solid rgba(255,255,255,0.04)'
                          : 'none',
                      }}
                    >
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">
                        {spec.label}
                      </span>
                      <span
                        className="text-xl font-black tracking-tight"
                        style={{ color: ride.accent }}
                      >
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Precision line + glyph */}
                <div className="flex items-center gap-4 mt-6">
                  <div className="h-px flex-1" style={{ backgroundColor: `${ride.accent}18` }} />
                  <span className="text-[8px] font-black text-white/15">[ + ]</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
      {/* end contentRef */}

      {/* ── NAVIGATION FOOTER ────────────────────────────────────────────── */}
      <div
        ref={navFooterRef}
        className="px-8 md:px-16 py-14 border-t border-white/5 opacity-0"
        style={{ backgroundColor: '#111112' }}
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">

          {hasPrev ? (
            <button
              data-magnetic
              onClick={() => navigateRide(-1)}
              className="group flex items-center gap-3 text-[10px] font-black tracking-[0.35em] uppercase transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F4F4ED')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
            >
              <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
              Prev Ride
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleClose}
            data-magnetic="cta"
            className="text-[10px] font-black tracking-[0.35em] uppercase px-8 py-3 border transition-all duration-300"
            style={{
              borderColor:     `${ride.accent}45`,
              color:           ride.accent,
              borderRadius:    '1px',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = ride.accent;
              e.currentTarget.style.color = '#000';
              e.currentTarget.style.borderColor = ride.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = ride.accent;
              e.currentTarget.style.borderColor = `${ride.accent}45`;
            }}
          >
            Back to Fleet
          </button>

          {hasNext ? (
            <button
              data-magnetic
              onClick={() => navigateRide(1)}
              className="group flex items-center gap-3 text-[10px] font-black tracking-[0.35em] uppercase transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F4F4ED')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
            >
              Next Ride
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          ) : (
            <div />
          )}

        </div>
      </div>

    </div>
  );
}
