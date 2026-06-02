import React, { useEffect, useRef, Suspense, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas } from '@react-three/fiber';
import { FluidBackground } from '@/components/webgl/FluidBackground';
import { useStore } from '@/store/useStore';
import { runScramble } from '@/utils/scramble';
import { EASE, DUR } from '@/motion/system';
import { useParallax } from '@/hooks/useParallax';

const Hero = ({ isLoaded = true }) => {
  const containerRef  = useRef(null);
  const canvasWrapRef = useRef(null);   // Subject stage — base + reveal + wireframe
  const watermarkRef  = useRef(null);   // Editorial outlined RAJ / TIWARI (over photo)
  const uiLayerRef    = useRef(null);   // HUD + identity + scroll cue
  const line1Ref      = useRef(null);   // Outlined "RAJ"
  const line2Ref      = useRef(null);   // Outlined "TIWARI"
  const ctaRef        = useRef(null);
  const hudRef        = useRef(null);
  const scrollCueRef  = useRef(null);
  const taglineRef    = useRef(null);
  const revealRef     = useRef(null);   // Approach B — clip-path reveal image
  const wireframeRef  = useRef(null);   // Approach B — helmet wireframe ghost

  const setHovering       = useStore((state) => state.setHovering);
  const setImageHovering  = useStore((state) => state.setImageHovering);
  const setFluidIntensity = useStore((state) => state.setFluidIntensity);

  // ─── INTERSECTION OBSERVER FOR 60FPS LOCK ──────────────────────────────────
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useParallax(containerRef, 14);

  // ─── SCROLLTRIGGER REFRESH — forces recalculation after fonts/images settle ──
  useEffect(() => {
    if (!isLoaded) return;
    let raf;
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        ScrollTrigger.refresh(true);
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [isLoaded]);

  // ─── CINEMATIC ENTRY SEQUENCE ────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;

    let cancelHud, cancelLine1, cancelLine2;
    const intensityObj = { value: 0 };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.25 });

      // 0. Fluid background fades in smoothly over entire entrance (base layer)
      tl.to(
        intensityObj,
        {
          value: 0.85,
          duration: 2.2,
          ease: 'power2.inOut',
          onUpdate: () => setFluidIntensity(intensityObj.value),
        },
        0
      );

      // 1a. Subject stage fades in with scale (cinematic entrance)
      tl.fromTo(
        canvasWrapRef.current,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          duration: DUR.standard,
          ease: EASE.precision,
        },
        0.15
      );

      // 1b. HUD status online — scrambles in first with fade
      tl.to(
        hudRef.current,
        {
          opacity: 1,
          duration: DUR.feedback,
          ease: EASE.precision,
          onStart: () => {
            cancelHud = runScramble(hudRef.current, 'RT•MOTO // 2026', 0.55);
          },
        },
        0.4
      );

      // 2a. "RAJ" outlined scrambles in + scales down from larger
      tl.fromTo(
        line1Ref.current,
        { opacity: 0, scale: 1.08 },
        {
          opacity: 1,
          scale: 1,
          duration: DUR.feedback,
          ease: EASE.precision,
          onStart: () => {
            cancelLine1 = runScramble(line1Ref.current, 'RAJ', 0.65);
          },
        },
        0.5
      );

      // 2b. Fluid pulse when RAJ appears
      tl.to(
        intensityObj,
        {
          value: 1,
          duration: 0.3,
          ease: 'power2.out',
          onUpdate: () => setFluidIntensity(intensityObj.value),
        },
        0.5
      );

      // 3a. "TIWARI" outlined scrambles in, overlapping line 1
      tl.fromTo(
        line2Ref.current,
        { opacity: 0, scale: 1.08 },
        {
          opacity: 1,
          scale: 1,
          duration: DUR.feedback,
          ease: EASE.precision,
          onStart: () => {
            cancelLine2 = runScramble(line2Ref.current, 'TIWARI', 0.65);
          },
        },
        `-=${DUR.feedback * 0.4}`
      );

      // 3b. Fluid pulse when TIWARI appears
      tl.to(
        intensityObj,
        {
          value: 1.05,
          duration: 0.25,
          ease: 'power2.out',
          onUpdate: () => setFluidIntensity(intensityObj.value),
        },
        `-=${DUR.feedback * 0.4}`
      );

      // 4a. HUD tagline fades + scales in
      tl.fromTo(
        taglineRef.current,
        { opacity: 0, y: 12, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: DUR.standard, ease: EASE.precision },
        '+=0.08'
      );

      // 4b. Subtle fluid pulse on tagline
      tl.to(
        intensityObj,
        {
          value: 0.9,
          duration: 0.2,
          ease: 'power2.inOut',
          onUpdate: () => setFluidIntensity(intensityObj.value),
        },
        '-=0.15'
      );

      // 5. CTA — horizontal clip-path wipe + scale entrance
      tl.fromTo(
        ctaRef.current,
        { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          opacity: 1,
          duration: DUR.standard,
          ease: EASE.precision,
        },
        '+=0.22'
      );

      // Final fluid settle
      tl.to(
        intensityObj,
        {
          value: 0.8,
          duration: 0.5,
          ease: 'power2.inOut',
          onUpdate: () => setFluidIntensity(intensityObj.value),
        },
        '-=0.1'
      );
    }, containerRef);

    return () => {
      ctx.revert();
      cancelHud?.();
      cancelLine1?.();
      cancelLine2?.();
    };
  }, [isLoaded, setFluidIntensity]);

  // ─── INTERACTIVE DEPTH — dim the editorial type when inspecting the photo ─────
  const imageHovering = useStore((s) => s.imageHovering);
  useEffect(() => {
    if (!watermarkRef.current) return;
    gsap.to(watermarkRef.current, {
      opacity: imageHovering ? 0.4 : 1,
      scale: imageHovering ? 0.98 : 1,
      duration: DUR.standard,
      ease: EASE.momentum,
    });
  }, [imageHovering]);

  const handleTaglineHover = () => {
    runScramble(taglineRef.current.querySelector('.tagline-text'), 'MOTION / ENGINEER', 0.4);
  };

  // ─── APPROACH B — PINNED CLIP-PATH REVEAL (single timeline, 3 acts) ───────────
  // ONE pinned ScrollTrigger over +=180%. The legacy unpinned SYSTEM-01 scroll-out
  // is folded in as Act 2 (no two triggers fighting the same element).
  //
  //   ACT 1 (progress 0.00 → 0.40) — reveal.jpg clip-path wipes top→bottom
  //                                  (helmet descends); wireframe ghost appears
  //                                  then fades as the real image arrives.
  //   ACT 2 (progress 0.40 → 0.70) — title lines split apart + UI lifts away.
  //   ACT 3 (progress 0.70 → 1.00) — subject scales 1 → 0.96 and fades; hero exits.
  useEffect(() => {
    if (!containerRef.current) return;

    // Builds the full pinned timeline for one breakpoint. `wirePeak` caps the
    // wireframe-ghost opacity (lower on mobile per spec).
    const buildRevealTimeline = (scrubValue, wirePeak) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger:             containerRef.current,
          start:               'top top',
          end:                 '+=180%',
          scrub:               scrubValue,
          pin:                 true,
          anticipatePin:       1,
          invalidateOnRefresh: true,
        },
      });

      // ── ACT 1 (0.00 → 0.40) ───────────────────────────────────────────────
      // Reveal image descends: clip bottom 100% → 0% (top → bottom wipe).
      tl.fromTo(
        revealRef.current,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', duration: 0.4 },
        0
      );
      // Wireframe ghost flashes in...
      tl.fromTo(
        wireframeRef.current,
        { opacity: 0 },
        { opacity: wirePeak, ease: 'none', duration: 0.12 },
        0
      );
      // ...then fades down as the real (revealed) image takes over.
      tl.to(
        wireframeRef.current,
        { opacity: 0.04, ease: 'none', duration: 0.28 },
        0.12
      );

      // ── ACT 2 (0.40 → 0.70) ───────────────────────────────────────────────
      // Folded SYSTEM-01: title lines separate vertically + fade, UI lifts away.
      tl.to(line1Ref.current,  { yPercent: -55, opacity: 0, ease: 'none', duration: 0.3 }, 0.4);
      tl.to(line2Ref.current,  { yPercent:  55, opacity: 0, ease: 'none', duration: 0.3 }, 0.4);
      tl.to(uiLayerRef.current, { yPercent: -12, opacity: 0, ease: 'none', duration: 0.3 }, 0.4);

      // ── ACT 3 (0.70 → 1.00) ───────────────────────────────────────────────
      // Subject stage scales down + fades; hero clears for the next section.
      tl.to(
        canvasWrapRef.current,
        { scale: 0.96, opacity: 0, ease: 'none', duration: 0.3 },
        0.7
      );

      return tl;
    };

    // gsap.matchMedia() (NOT the removed ScrollTrigger.matchMedia) builds the
    // trigger fresh per breakpoint and auto-reverts on breakpoint change.
    const mm = gsap.matchMedia();

    // Desktop — full scrub, full-strength wireframe ghost.
    mm.add('(min-width: 769px)', () => {
      const tl = buildRevealTimeline(2.0, 0.18);
      return () => tl.scrollTrigger?.kill();
    });

    // Mobile — faster scrub (1.2), wireframe capped at 0.10. Same clip direction.
    mm.add('(max-width: 768px)', () => {
      const tl = buildRevealTimeline(1.2, 0.10);
      return () => tl.scrollTrigger?.kill();
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden">

      {/* ── z-0: WebGL ATMOSPHERE (FluidBackground only — subject reveal is DOM) ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 3], fov: 45, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          frameloop={inView ? 'always' : 'demand'}
        >
          <Suspense fallback={null}>
            <FluidBackground />
          </Suspense>
        </Canvas>
      </div>

      {/* ── SUBJECT STAGE — entry fades/scales in (z-10); Act 3 scales it out ───── */}
      <div
        ref={canvasWrapRef}
        data-depth="0.7"
        className="absolute inset-0 z-10"
        style={{ willChange: 'transform, opacity' }}
        onMouseEnter={() => { setHovering(true);  setImageHovering(true);  }}
        onMouseLeave={() => { setHovering(false); setImageHovering(false); }}
      >
        {/* BASE IMAGE — bare-head rider, never moves, always visible */}
        <img
          src="/base.jpg"
          className="absolute inset-0 w-full h-full object-cover object-top"
          alt="Raj Tiwari — rider"
          draggable="false"
        />

        {/* REVEAL IMAGE — geared/helmeted, hidden by clip-path until scroll. */}
        {/* clip starts inset(0% 0% 100% 0%): bottom 100% = fully hidden. */}
        {/* Act 1 animates → inset(0% 0% 0% 0%): wipes downward (helmet descends). */}
        <div
          ref={revealRef}
          className="absolute inset-0 z-20"
          style={{ clipPath: 'inset(0% 0% 100% 0%)', willChange: 'clip-path' }}
        >
          <img
            src="/reveal.jpg"
            className="absolute inset-0 w-full h-full object-cover object-top"
            alt="Raj Tiwari — geared up"
            draggable="false"
          />
        </div>

        {/* WIREFRAME GHOST — helmet outline (Lando signature). Opacity driven by GSAP. */}
        <div
          ref={wireframeRef}
          className="absolute inset-0 z-30 pointer-events-none select-none"
          style={{ opacity: 0 }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            className="absolute w-[35%] left-1/2 -translate-x-1/2 top-[5%]"
            fill="none"
            stroke="#D2FF00"
            strokeWidth="0.25"
          >
            {/* Helmet dome */}
            <ellipse cx="50" cy="38" rx="24" ry="28" />
            {/* Visor opening */}
            <rect x="26" y="44" width="48" height="10" rx="2" />
            {/* Chin guard */}
            <path d="M30 54 Q50 62 70 54" />
            {/* Vents — left */}
            <line x1="28" y1="36" x2="24" y2="36" />
            <line x1="28" y1="40" x2="24" y2="40" />
            {/* Vents — right */}
            <line x1="72" y1="36" x2="76" y2="36" />
            <line x1="72" y1="40" x2="76" y2="40" />
          </svg>
        </div>

        {/* Legibility scrim over the photo — keeps HUD + identity readable */}
        <div
          className="absolute inset-0 z-[31] pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 42%, rgba(0,0,0,0) 64%, rgba(0,0,0,0.42) 100%)',
          }}
        />

        {/* Corner registration marks */}
        <div className="absolute top-3 left-3 w-5 h-[1px] bg-white/10 pointer-events-none z-[32]" />
        <div className="absolute top-3 left-3 w-[1px] h-5 bg-white/10 pointer-events-none z-[32]" />
        <div className="absolute top-3 right-3 w-5 h-[1px] bg-white/10 pointer-events-none z-[32]" />
        <div className="absolute top-3 right-3 w-[1px] h-5 bg-white/10 pointer-events-none z-[32]" />
        <div className="absolute bottom-3 left-3 w-5 h-[1px] bg-white/10 pointer-events-none z-[32]" />
        <div className="absolute bottom-3 left-3 w-[1px] h-5 bg-white/10 pointer-events-none z-[32]" />
        <div className="absolute bottom-3 right-3 w-5 h-[1px] bg-white/10 pointer-events-none z-[32]" />
        <div className="absolute bottom-3 right-3 w-[1px] h-5 bg-white/10 pointer-events-none z-[32]" />
      </div>

      {/* ── EDITORIAL OUTLINED NAME — sits OVER the portrait (z-35) ───────────── */}
      <div data-depth="0.4" className="absolute inset-0 z-[35] flex items-center justify-center pointer-events-none select-none">
        <div ref={watermarkRef} className="text-center" style={{ lineHeight: '0.82' }}>
          <p
            ref={line1Ref}
            className="font-serif font-black uppercase leading-none block"
            style={{
              fontSize:         'clamp(7rem, 24vw, 24rem)',
              letterSpacing:    '-0.045em',
              WebkitTextStroke: '1px rgba(255,255,255,0.12)',
              color:            'transparent',
              opacity:          0,
            }}
          >
            RAJ
          </p>
          <p
            ref={line2Ref}
            className="font-serif font-black uppercase leading-none block"
            style={{
              fontSize:         'clamp(7rem, 24vw, 24rem)',
              letterSpacing:    '-0.045em',
              WebkitTextStroke: '1px rgba(210,255,0,0.14)',
              color:            'transparent',
              opacity:          0,
            }}
          >
            TIWARI
          </p>
        </div>
      </div>

      {/* ── FOREGROUND UI (z-40) — tagline, labels, metadata, CTA, scroll cue ──── */}
      <div ref={uiLayerRef} data-depth="-0.2" className="absolute inset-0 z-40 pointer-events-none flex flex-col justify-between px-10 md:px-20 py-10 md:py-14">

        {/* Top row — whisper-quiet metadata, never competing with navbar */}
        <div className="w-full max-w-screen-2xl mx-auto flex items-center justify-between pt-12">
          <span className="font-mono text-[9px] tracking-[0.3em] text-[#D2FF00]/30">
            Bengaluru, India · 2026
          </span>
          <span
            ref={hudRef}
            className="text-[8px] uppercase font-black tracking-[0.3em] text-white/10"
            style={{ opacity: 0 }}
          >
            RT•MOTO // 2026
          </span>
        </div>

        {/* Bottom row — tagline + signature + CTA left / scroll cue right */}
        <div className="w-full max-w-screen-2xl mx-auto flex justify-between items-end">

          {/* Left: identity block with intentional breathing room */}
          <div
            className="flex flex-col items-start gap-6 pb-2 pointer-events-auto"
            onMouseEnter={handleTaglineHover}
          >
            <div ref={taglineRef} style={{ opacity: 0 }}>
              <p className="font-serif font-black uppercase text-white leading-none"
                 style={{ fontSize: '19px', letterSpacing: '-0.01em' }}>
                Raj Tiwari.
              </p>
              <p className="tagline-text font-mono text-[10px] tracking-[0.4em] uppercase mt-2.5"
                 style={{ color: '#D2FF00', opacity: 0.65 }}>
                MOTION / ENGINEER
              </p>
              <p className="font-sans text-[12px] leading-relaxed text-white/45 mt-3 max-w-[30ch]">
                High-performance web interfaces, engineered in motion.
              </p>
              <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/25 mt-3">
                React · GSAP · Three.js · WebGL
              </p>
            </div>

            <svg
              width="164" height="46"
              viewBox="0 0 164 46"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="hidden md:block"
              aria-hidden="true"
              style={{ opacity: 0.4 }}
            >
              <path
                d="M4 34 C14 18 24 44 38 28 C48 16 60 40 76 26 C86 16 96 36 112 22 C124 10 138 38 154 24 C160 18 163 28 164 26"
                stroke="#D2FF00" strokeWidth="1.4" strokeLinecap="round" fill="none"
              />
              <path
                d="M4 42 C22 38 46 44 70 40 C94 36 118 43 142 39"
                stroke="#D2FF00" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.5"
              />
            </svg>

            {/* CTA — horizontal clip-path wipe */}
            <div
              ref={ctaRef}
              className="pointer-events-auto"
              style={{ clipPath: 'inset(0% 100% 0% 0%)' }}
            >
              <a
                href="#rides"
                data-magnetic="cta"
                className="group btn-rt relative inline-flex items-center gap-3 px-7 py-3 text-[10px] font-black tracking-[0.35em] uppercase text-white border border-[#D2FF00]"
                style={{ borderRadius: '1px' }}
              >
                ENGAGE
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </a>
            </div>
          </div>

          {/* Right: scroll cue — peripheral, never dominant */}
          <div ref={scrollCueRef} className="flex flex-col items-center gap-3">
            <p
              className="text-[7px] font-black tracking-[0.45em] uppercase text-white/12"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.38em' }}
            >
              ENGAGE THROTTLE
            </p>
            <svg
              width="10" height="18"
              viewBox="0 0 10 18"
              fill="none"
              className="animate-bounce"
              aria-hidden="true"
            >
              <path
                d="M5 0 L5 13 M1 8 L5 13 L9 8"
                stroke="rgba(210,255,0,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
