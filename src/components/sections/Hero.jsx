import React, { useEffect, useRef, Suspense, useState } from 'react';
import { gsap } from 'gsap';
import { Canvas } from '@react-three/fiber';
import { HeroShaderMesh } from '@/components/webgl/HeroShaderMesh';
import { FluidBackground } from '@/components/webgl/FluidBackground';
import { useStore } from '@/store/useStore';
import { EASE, DUR, SCROLL } from '@/motion/system';
import { useParallax } from '@/hooks/useParallax';

const Hero = ({ isLoaded = true }) => {
  const containerRef   = useRef(null);
  const canvasWrapRef  = useRef(null);
  const uiLayerRef     = useRef(null);
  const nameRef        = useRef(null);
  const line1Ref       = useRef(null);
  const line2Ref       = useRef(null);
  const kickerRef      = useRef(null);
  const ctaRef         = useRef(null);
  const scrollCueRef   = useRef(null);
  const atmosphereRef  = useRef(null);

  const setHovering       = useStore((s) => s.setHovering);
  const setImageMouse     = useStore((s) => s.setImageMouse);
  const setImageHovering  = useStore((s) => s.setImageHovering);

  // 60fps gate — pause the render loop when the hero is off-screen.
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  // Subtle DOM parallax on the UI layer only (the subject's depth comes from the
  // shader's internal parallax, so the full-bleed canvas never shifts and never
  // exposes an edge).
  useParallax(containerRef, 10);

  // Scroll exit — the composition lifts away; the subject recedes into the dark.
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top', end: 'bottom top',
          scrub: SCROLL.SCENE, invalidateOnRefresh: true,
        },
      });
      if (nameRef.current)    tl.to(nameRef.current,    { yPercent: -14, opacity: 0, ease: EASE.scrub }, 0);
      if (uiLayerRef.current) tl.to(uiLayerRef.current, { yPercent: -8,  opacity: 0, ease: EASE.scrub }, 0);
      if (canvasWrapRef.current) tl.to(canvasWrapRef.current, { scale: 1.04, opacity: 0.55, ease: EASE.scrub }, 0);
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden"
      onMouseEnter={() => { setHovering(true); setImageHovering(true); }}
      onMouseLeave={() => { setHovering(false); setImageHovering(false); }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setImageMouse((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
      }}
    >
      {/* ── LAYER 1: full-bleed WebGL subject (z-0) ─────────────────────────── */}
      <div ref={canvasWrapRef} className="absolute inset-0 z-0" style={{ willChange: 'transform, opacity' }}>
        <Canvas
          camera={{ position: [0, 0, 3], fov: 45, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          frameloop={inView ? 'always' : 'demand'}
        >
          <Suspense fallback={null}>
            <FluidBackground />
            <HeroShaderMesh />
          </Suspense>
        </Canvas>
      </div>

      {/* ── LAYER 2: atmosphere — darkness, vignette, scrims, grain (z-10) ───── */}
      <div ref={atmosphereRef} className="absolute inset-0 z-10 pointer-events-none">
        <div className="hero-vignette    absolute inset-0" />
        <div className="hero-scrim-bottom absolute inset-x-0 bottom-0 h-[55%]" />
        <div className="hero-scrim-left   absolute inset-y-0 left-0 w-[55%]" />
        <div className="hero-scrim-top    absolute inset-x-0 top-0 h-[22%]" />
        <div className="grain-layer" />
      </div>

      {/* ── LAYER 3: UI / typography (z-20) ─────────────────────────────────── */}
      <div
        ref={uiLayerRef}
        data-depth="-0.12"
        className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between px-8 md:px-16 py-8 md:py-12"
      >
        {/* top: single quiet credit */}
        <div className="flex items-start justify-between pt-10">
          <span className="font-mono text-[9px] tracking-[0.35em] uppercase" style={{ color: 'var(--color-accent)', opacity: 0.4 }}>
            Bengaluru · 2026
          </span>
        </div>

        {/* center-left: NAME MONUMENT (final treatment set in Task 3) */}
        <div ref={nameRef} className="absolute left-8 md:left-16 top-1/2 -translate-y-1/2 max-w-[70vw]">
          <div className="overflow-hidden">
            <span ref={line1Ref} className="block font-serif font-black uppercase text-white"
                  style={{ fontSize: 'clamp(3.5rem, 12vw, 13rem)', lineHeight: 0.84, letterSpacing: '-0.04em' }}>
              RAJ
            </span>
          </div>
          <div className="overflow-hidden">
            <span ref={line2Ref} className="block font-serif font-black uppercase"
                  style={{ fontSize: 'clamp(3.5rem, 12vw, 13rem)', lineHeight: 0.84, letterSpacing: '-0.04em',
                           color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.85)' }}>
              TIWARI
            </span>
          </div>
        </div>

        {/* bottom: kicker + CTA (left) · scroll cue (right) */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-6">
            <div ref={kickerRef}>
              <p className="font-mono text-[10px] tracking-[0.4em] uppercase" style={{ color: 'var(--color-accent)', opacity: 0.7 }}>
                Motion / Engineer
              </p>
              <p className="font-sans text-[12px] leading-relaxed text-white/45 mt-3 max-w-[26ch]">
                Same rider, two machines — the web and the road.
              </p>
            </div>
            <div ref={ctaRef} className="pointer-events-auto">
              <a href="#rides" data-magnetic="cta"
                 className="group btn-rt relative inline-flex items-center gap-3 px-7 py-3 text-[10px] font-black tracking-[0.35em] uppercase text-white border border-[#D2FF00]"
                 style={{ borderRadius: '1px' }}>
                ENGAGE
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </a>
            </div>
          </div>

          <div ref={scrollCueRef} className="hidden md:flex flex-col items-center gap-2">
            <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-white/20">scroll</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
