import React, { useEffect, useRef, Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas } from '@react-three/fiber';
import { HeroShaderMesh } from './HeroShaderMesh';
import { FluidBackground } from './FluidBackground';
import { useStore } from '../store/useStore';
import { runScramble } from '../utils/scramble';
import { EASE, DUR, VELOCITY, ST } from '../motion/system';
import { useParallax } from '../hooks/useParallax';

const Hero = ({ isLoaded = true }) => {
  const containerRef  = useRef(null);
  const canvasWrapRef = useRef(null);
  const watermarkRef  = useRef(null);   // Layer 0 wrapper — outlined RAJ / TIWARI
  const uiLayerRef    = useRef(null);   // Layer 2 wrapper — HUD + identity + cue
  const line1Ref      = useRef(null);   // Layer 0: outlined "RAJ"
  const line2Ref      = useRef(null);   // Layer 0: outlined "TIWARI"
  const ctaRef        = useRef(null);
  const hudRef        = useRef(null);
  const scrollCueRef  = useRef(null);
  const taglineRef    = useRef(null);   // HUD bottom-left tagline (Layer 2)

  const setHovering      = useStore((state) => state.setHovering);
  const setImageMouse    = useStore((state) => state.setImageMouse);
  const setImageHovering = useStore((state) => state.setImageHovering);
  const setFluidIntensity = useStore((state) => state.setFluidIntensity);

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

  // ─── G-FORCE VELOCITY SKEW ───────────────────────────────────────────────────
  // Lenis velocity → canvas skewX via quickTo. Zero React re-renders.
  useEffect(() => {
    if (!canvasWrapRef.current) return;

    const quickSkew = gsap.quickTo(canvasWrapRef.current, 'skewX', {
      duration: 0.6,
      ease: EASE.hover,
    });

    const unsub = useStore.subscribe((state, prev) => {
      if (state.velocity === prev.velocity) return;
      quickSkew(
        gsap.utils.clamp(-VELOCITY.maxSkew, VELOCITY.maxSkew, state.velocity * VELOCITY.velocityScale)
      );
    });

    return () => unsub();
  }, []);

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

      // 1a. Canvas wrapper fades in with scale (cinematic entrance)
      tl.fromTo(
        canvasWrapRef.current,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
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

      // 2a. Layer 0 — "RAJ" outlined scrambles in + scales down from larger
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

      // 3a. Layer 0 — "TIWARI" outlined scrambles in, overlapping line 1
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

      // 4a. HUD tagline fades + scales in (Layer 2 metadata)
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

  // ─── SCROLL DEPTH PARALLAX ───────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasWrapRef.current || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // One pinned timeline drives every layer in lockstep, so the entire hero
      // recedes as a single locked composition — nothing detaches on scroll.
      const exit = gsap.timeline({
        defaults: { ease: EASE.scrub },
        scrollTrigger: {
          trigger:             containerRef.current,
          start:               ST.start.hero,
          end:                 'bottom top',
          scrub:               ST.scrub.standard,
          pin:                 true,
          pinSpacing:          true,
          anticipatePin:       1,
          invalidateOnRefresh: true,
        },
      });

      // Subject recedes into depth
      exit.to(canvasWrapRef.current, { scale: 0.82, yPercent: -6, opacity: 0.5 }, 0);

      // Background typography pulls back with it — locked, never drifting away
      if (watermarkRef.current) {
        exit.to(watermarkRef.current, { scale: 0.94, yPercent: -4, opacity: 0 }, 0);
      }

      // Foreground HUD lifts and clears as the frame powers down
      if (uiLayerRef.current) {
        exit.to(uiLayerRef.current, { yPercent: -10, opacity: 0 }, 0);
      }

      // Scroll cue is first to go — a quick acknowledgement of input
      if (scrollCueRef.current) {
        gsap.to(scrollCueRef.current, {
          opacity: 0,
          ease:    EASE.scrub,
          scrollTrigger: {
            trigger: containerRef.current,
            start:   'top top',
            end:     '+=180',
            scrub:   true,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden">

      {/* ── LAYER 0: Background outlined typography (z-0) — depth only ─────── */}
      <div data-depth="0.4" className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none">
        <div ref={watermarkRef} className="text-center" style={{ lineHeight: '0.82' }}>
          <p
            ref={line1Ref}
            className="font-serif font-black uppercase leading-none block"
            style={{
              fontSize:         'clamp(7rem, 24vw, 24rem)',
              letterSpacing:    '-0.045em',
              WebkitTextStroke: '1px rgba(255,255,255,0.04)',
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
              WebkitTextStroke: '1px rgba(210,255,0,0.05)',
              color:            'transparent',
              opacity:          0,
            }}
          >
            TIWARI
          </p>
        </div>
      </div>

      {/* ── LAYER 1: WebGL canvas (z-10) — the dominant subject ────────────── */}
      <div data-depth="0.7" className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div
          ref={canvasWrapRef}
          className="relative w-[94vw] max-w-[1400px] aspect-[16/9] flex-shrink-0 rounded-sm shadow-2xl pointer-events-auto"
          style={{ willChange: 'transform, opacity' }}
          onMouseEnter={() => { setHovering(true);  setImageHovering(true);  }}
          onMouseLeave={() => { setHovering(false); setImageHovering(false); }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setImageMouse(
              (e.clientX - rect.left) / rect.width,
              1 - (e.clientY - rect.top) / rect.height
            );
          }}
        >
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-sm">
            <Canvas
              camera={{ position: [0, 0, 3], fov: 45, near: 0.1, far: 100 }}
              gl={{ antialias: true, alpha: true }}
              dpr={[1, 2]}
            >
              <Suspense fallback={null}>
                <FluidBackground />
                <HeroShaderMesh />
              </Suspense>
            </Canvas>
          </div>

          {/* Corner registration marks */}
          <div className="absolute top-3 left-3 w-5 h-[1px] bg-white/10 pointer-events-none" />
          <div className="absolute top-3 left-3 w-[1px] h-5 bg-white/10 pointer-events-none" />
          <div className="absolute top-3 right-3 w-5 h-[1px] bg-white/10 pointer-events-none" />
          <div className="absolute top-3 right-3 w-[1px] h-5 bg-white/10 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-5 h-[1px] bg-white/10 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-[1px] h-5 bg-white/10 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-5 h-[1px] bg-white/10 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-[1px] h-5 bg-white/10 pointer-events-none" />

          <div
            className="absolute -bottom-8 left-0 right-0 h-20 pointer-events-none z-20"
            style={{ background: 'linear-gradient(to bottom, transparent 0%, #000 80%)' }}
          />
        </div>
      </div>

      {/* ── LAYER 2: Foreground UI (z-30) — tagline, labels, metadata ──────── */}
      <div ref={uiLayerRef} data-depth="-0.2" className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between px-10 md:px-20 py-10 md:py-14">

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
          <div className="flex flex-col items-start gap-6 pb-2">

            <div ref={taglineRef} style={{ opacity: 0 }}>
              <p className="font-serif font-black uppercase text-white leading-none"
                 style={{ fontSize: '19px', letterSpacing: '-0.01em' }}>
                Raj Tiwari.
              </p>
              <p className="font-mono text-[10px] tracking-[0.4em] uppercase mt-2.5"
                 style={{ color: '#D2FF00', opacity: 0.65 }}>
                MOTION / ENGINEER
              </p>
              <p className="font-sans text-[12px] leading-relaxed text-white/45 mt-3 max-w-[34ch]">
                I build high-performance web interfaces — fluid, fast, and
                engineered down to the last frame.
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
