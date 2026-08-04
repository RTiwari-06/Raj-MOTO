import React, { useEffect, useRef, Suspense, useState, lazy } from 'react';
import { gsap } from 'gsap';
import { heroPointer } from '@/components/webgl/heroPointer';
import { useStore } from '@/store/useStore';
import { useUIStore } from '@/store/useUIStore';
import { MEDIA } from '@/data/media';
import { EASE, DUR, SCROLL } from '@/motion/system';
import { useParallax } from '@/hooks/useParallax';
import MobileRevealCanvas from './MobileRevealCanvas';

// The WebGL liquid reveal is desktop-only and code-split — three.js never
// loads on phones, and on desktop the chunk waits for an idle slot so it
// can't compete with the LCP image or fonts.
const HeroCanvas = lazy(() => import('./HeroCanvas'));

const Hero = ({ isLoaded = true }) => {
  const containerRef = useRef(null);
  const stageRef     = useRef(null);
  const uiLayerRef   = useRef(null);
  const cueRef       = useRef(null);
  const engageRef    = useRef(null);

  const setHovering      = useStore((s) => s.setHovering);
  const setImageHovering = useStore((s) => s.setImageHovering);
  const motionEnabled    = useUIStore((s) => s.motionEnabled);

  // Honor reduced motion: skip the canvas + all animation, show the still photograph.
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  // Touch devices get the lightweight 2D reveal — Three.js stays a desktop luxury.
  const [coarse] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches);
  
  const showWebGL = motionEnabled && !reduceMotion && !coarse;
  const showMobile = motionEnabled && !reduceMotion && coarse;

  // Fetch the WebGL chunk only once the browser is idle.
  const [canvasReady, setCanvasReady] = useState(false);
  useEffect(() => {
    if (!showWebGL || canvasReady) return;
    const arm = () => setCanvasReady(true);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(arm, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(arm, 1500);
    return () => window.clearTimeout(id);
  }, [showWebGL, canvasReady]);

  // 60fps gate — pause the render loop when the hero is off-screen.
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  // Subtle parallax on the type layer only — depth without moving the photograph.
  useParallax(containerRef, 8);

  // Pointer → module-scope target. Native + passive: zero React/Zustand churn per move.
  // Touch devices skip it entirely — these listeners exist only to feed the shader.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || coarse) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      heroPointer.x = (e.clientX - r.left) / r.width;
      heroPointer.y = 1 - (e.clientY - r.top) / r.height;
    };
    const onEnter = () => { heroPointer.active = true;  setHovering(true);  setImageHovering(true); };
    const onLeave = () => { heroPointer.active = false; setHovering(false); setImageHovering(false); };
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerenter', onEnter, { passive: true });
    el.addEventListener('pointerleave', onLeave, { passive: true });
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [setHovering, setImageHovering, coarse]);

  // One-time auto-sweep still present, but ambient emit also runs inside the mesh.
  const autoSweptRef = useRef(false);
  useEffect(() => {
    if (autoSweptRef.current || !showWebGL || reduceMotion || !isLoaded) return;
    const el = containerRef.current;
    if (!el) return;
    autoSweptRef.current = true;

    let userInteracted = false;
    const mark = () => { userInteracted = true; };
    el.addEventListener('pointerdown', mark, { passive: true, once: true });
    el.addEventListener('pointermove', mark, { passive: true, once: true });

    const proxy = { x: 0.30 };
    const tl = gsap.timeline({ delay: 1.2 });
    tl.add(() => { if (!userInteracted) heroPointer.active = true; });
    tl.to(proxy, {
      x: 0.64, duration: 1.8, ease: 'sine.inOut',
      onUpdate: () => {
        if (userInteracted) return;
        heroPointer.x = proxy.x;
        heroPointer.y = 0.52 + Math.sin(((proxy.x - 0.30) / 0.34) * Math.PI) * 0.05;
      },
    });
    tl.add(() => { if (!userInteracted) heroPointer.active = false; });

    return () => {
      tl.kill();
      el.removeEventListener('pointerdown', mark);
      el.removeEventListener('pointermove', mark);
    };
  }, [showWebGL, reduceMotion, isLoaded]);

  // Entrance — the photograph settles (scale only, never opacity → LCP stays fast),
  // then a subtle cue and the engage button appear.
  useEffect(() => {
    if (!containerRef.current || !isLoaded || reduceMotion) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });
      tl.from(stageRef.current, { scale: 1.06, duration: DUR.epic, ease: EASE.authority }, 0);
      tl.from([cueRef.current, engageRef.current], {
        autoAlpha: 0, y: 16, duration: DUR.standard, ease: EASE.momentum, stagger: 0.12,
      }, 0.85);
    }, containerRef);
    return () => ctx.revert();
  }, [isLoaded, reduceMotion]);

  // Scroll exit — the scene lifts and recedes into the dark.
  useEffect(() => {
    if (!containerRef.current || reduceMotion) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top', end: 'bottom top',
          scrub: SCROLL.FILM, invalidateOnRefresh: true,
        },
      });
      tl.to(uiLayerRef.current, { yPercent: -8,  opacity: 0, ease: EASE.scrub }, 0);
      tl.to(stageRef.current,   { scale: 1.07, opacity: 0.5, ease: EASE.scrub }, 0);
    }, containerRef);
    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <section id="hero" ref={containerRef} className="w-full relative overflow-hidden" style={{ minHeight: '100dvh' }}>

      {/* ── LAYER 0: the photograph — isolated grid prevents CLS ── */}
      <div ref={stageRef} className="absolute inset-0 z-0 overflow-hidden" style={{ willChange: 'transform, opacity' }}>
        <img
          src={MEDIA.hero.primary}
          srcSet={MEDIA.hero.srcSet}
          sizes="100vw"
          alt="Rider standing with the helmet off"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '43% 46%' }}
        />
        
        {/* WebGL Reveal (Desktop) */}
        {showWebGL && canvasReady && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <Suspense fallback={null}>
              <HeroCanvas inView={inView} />
            </Suspense>
          </div>
        )}

        {/* 2D Canvas Reveal (Mobile) */}
        {showMobile && (
          <div className="absolute inset-0 z-10">
            <MobileRevealCanvas inView={inView} />
          </div>
        )}
      </div>

      {/* ── LAYER 1: atmosphere ── */}
      <div className="absolute inset-0 z-[15] pointer-events-none">
        <div className="hero-keylight absolute inset-0" />
        <div className="hero-vignette absolute inset-0" />
        <div className="hero-floor    absolute inset-x-0 bottom-0 h-[62%]" />
      </div>

      {/* ── LAYER 2: UI content — independent from hydration ── */}
      <div
        ref={uiLayerRef}
        data-depth="-0.1"
        className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-end items-center px-8 md:px-16 pb-12 md:pb-16"
      >
        {/* No headline over the photograph. The oversized DEVELOPER & RIDER
            wordmark that sat here read as a label pasted over the image; the
            hero carries its meaning through the photo + reveal alone. The
            identity copy lives in THE PATH and the © line instead. */}

        <div className="pointer-events-auto mb-6">
          <button
            ref={engageRef}
            type="button"
            onClick={() => {
              const el = document.querySelector('#machine');
              if (!el) return;
              const lenis = window.__lenis;
              lenis ? lenis.scrollTo(el) : el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-rt inline-flex items-center gap-3 px-6 py-3 border border-line-strong text-white uppercase tracking-wider"
          >
            <span className="loader w-3 h-3 rounded-full bg-fg animate-pulse" />
            <span>Engage</span>
          </button>
        </div>

        <a
          ref={cueRef}
          href="#machine"
          aria-label="Scroll to explore"
          className="group pointer-events-auto flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[8px] tracking-[0.4em] uppercase text-fg-faint transition-colors duration-300 group-hover:text-fg-2">
            explore
          </span>
          <span className="block w-px h-9 bg-gradient-to-b from-line-strong to-transparent" />
        </a>
      </div>
    </section>
  );
};

export default Hero;
