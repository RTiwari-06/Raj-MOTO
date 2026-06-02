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

  // ─── APPROACH B — PINNED CLIP-PATH REVEAL (single scrubbed timeline) ──────────
  // ONE pinned ScrollTrigger over +=220%, scrub 2.5. Timeline TOTAL duration = 10
  // so position maps directly to progress (progress = position / 10):
  //   0.00 → 0.05  HOLD    — base image holds; the user settles in.
  //   0.05 → 0.65  REVEAL  — reveal.jpg clip wipes top→bottom (ease none, cinematic).
  //   0.00 → 0.08  wireframe ghost appears (0 → peak); holds to 0.45.
  //   0.45 → 0.65  wireframe fades peak → 0.02.
  //   0.55 → 0.75  UI text (ENGAGE / subtitle / tagline) fades + lifts away.
  //   0.65 → 0.80  title lines (RAJ / TIWARI) split apart + fade.
  //   0.80 → 1.00  subject scales 1 → 0.95 + fades; hero exits, pin releases.
  useEffect(() => {
    if (!containerRef.current) return;

    // Builds the full pinned timeline for one breakpoint. `wirePeak` caps the
    // wireframe-ghost opacity (lower on mobile). Total timeline duration = 10.
    const buildRevealTimeline = (scrubValue, wirePeak) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger:             containerRef.current,
          start:               'top top',
          end:                 '+=220%',
          scrub:               scrubValue,
          pin:                 true,
          anticipatePin:       1,
          invalidateOnRefresh: true,
        },
      });

      // ── HOLD (0.0 → 0.5) ──────────────────────────────────────────────────
      // No tween before position 0.5 → base image simply holds for the first 5%.

      // ── REVEAL (0.5 → 6.5 | progress 0.05 → 0.65) ─────────────────────────
      // Reveal image descends: clip bottom 100% → 0% (top → bottom wipe). Slow.
      tl.fromTo(
        revealRef.current,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', duration: 6 },
        0.5
      );

      // ── WIREFRAME GHOST ───────────────────────────────────────────────────
      // Appears 0 → peak over the first 0.8 (progress 0 → 0.08), holds, then
      // fades peak → 0.02 across 4.5 → 6.5 (progress 0.45 → 0.65).
      tl.fromTo(
        wireframeRef.current,
        { opacity: 0 },
        { opacity: wirePeak, ease: 'none', duration: 0.8 },
        0
      );
      tl.to(
        wireframeRef.current,
        { opacity: 0.02, ease: 'none', duration: 2 },
        4.5
      );

      // ── UI TEXT EXIT (5.5 → 7.5 | progress 0.55 → 0.75) ───────────────────
      // Foreground text (ENGAGE / subtitle / tagline) stays fully visible until
      // 55%, then fades + lifts. Eased so it doesn't pop.
      tl.to(
        uiLayerRef.current,
        { opacity: 0, yPercent: -8, ease: 'power2.in', duration: 2 },
        5.5
      );

      // ── TITLE SPLIT (6.5 → 8.0 | progress 0.65 → 0.80) ────────────────────
      // RAJ rises, TIWARI drops, both fade — reveal image held fully visible.
      tl.to(line1Ref.current, { yPercent: -55, opacity: 0, ease: 'none', duration: 1.5 }, 6.5);
      tl.to(line2Ref.current, { yPercent:  55, opacity: 0, ease: 'none', duration: 1.5 }, 6.5);

      // ── EXIT (8.0 → 10.0 | progress 0.80 → 1.00) ──────────────────────────
      // Subject stage scales down + fades; hero clears for the next section.
      tl.to(
        canvasWrapRef.current,
        { scale: 0.95, opacity: 0, ease: 'none', duration: 2 },
        8.0
      );

      return tl;
    };

    // gsap.matchMedia() (NOT the removed ScrollTrigger.matchMedia) builds the
    // trigger fresh per breakpoint and auto-reverts on breakpoint change.
    const mm = gsap.matchMedia();

    // Desktop — scrub 2.5, wireframe peak 0.10.
    mm.add('(min-width: 769px)', () => {
      const tl = buildRevealTimeline(2.5, 0.10);
      return () => tl.scrollTrigger?.kill();
    });

    // Mobile — slightly snappier scrub (1.5), wireframe peak capped at 0.08.
    mm.add('(max-width: 768px)', () => {
      const tl = buildRevealTimeline(1.5, 0.08);
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
          {/* Opacity is GSAP-driven via the wrapper (wireframeRef): 0 → peak → 0.02.
              No opacity attr on the svg itself, else it would multiply with the
              wrapper and the ghost would be ~0.01 (effectively invisible). */}
          <svg
            viewBox="0 0 200 220"
            preserveAspectRatio="xMidYMid meet"
            className="absolute w-[32%] left-1/2 -translate-x-1/2 top-[8%]"
            fill="none"
            stroke="#D2FF00"
            strokeWidth="0.4"
          >
            {/* Main helmet dome */}
            <path d="M100 20
              C 140 20, 175 55, 175 100
              C 175 135, 165 155, 150 165
              L 50 165
              C 35 155, 25 135, 25 100
              C 25 55, 60 20, 100 20 Z"/>

            {/* Visor slot */}
            <path d="M42 110
              C 42 102, 48 96, 58 94
              L 142 94
              C 152 96, 158 102, 158 110
              C 158 118, 152 124, 142 126
              L 58 126
              C 48 124, 42 118, 42 110 Z"/>

            {/* Center ridge */}
            <line x1="100" y1="20" x2="100" y2="90" strokeWidth="0.3"/>

            {/* Vent lines left */}
            <line x1="38" y1="75" x2="30" y2="72" strokeWidth="0.3"/>
            <line x1="36" y1="85" x2="28" y2="84" strokeWidth="0.3"/>

            {/* Vent lines right */}
            <line x1="162" y1="75" x2="170" y2="72" strokeWidth="0.3"/>
            <line x1="164" y1="85" x2="172" y2="84" strokeWidth="0.3"/>
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
