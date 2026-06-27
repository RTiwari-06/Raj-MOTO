import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useUIStore } from '@/store/useUIStore';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Touch devices skip scroll-velocity reactivity: firing a quickTo every frame
// of a momentum scroll, over a masked will-change layer, is the stutter source.
// The strip just cruises at a constant speed instead.
const isCoarsePointer = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: coarse)').matches;

/**
 * Shared marquee engine.
 *
 * The track must render its content TWICE so translating it -50% lands exactly
 * one sequence forward — a seamless, width-agnostic loop that runs forever.
 *
 * Behaviour:
 *  - Plays only while on-screen AND the global motion toggle is on (off-screen
 *    pause keeps the GSAP ticker idle — mobile battery).
 *  - Scroll velocity briefly accelerates the loop (one reused quickTo), desktop
 *    only — touch devices cruise at constant speed to avoid scroll stutter.
 *  - Honours prefers-reduced-motion (static strip, no engine).
 *
 * @returns {{ wrapRef, trackRef }}
 */
export function useMarquee({ speed = 38 } = {}) {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    if (prefersReducedMotion()) return;

    const tween = gsap.to(track, {
      xPercent: -50,
      duration: speed,
      ease: 'none',
      repeat: -1,
      paused: true,
      force3D: true,
    });

    let inView = false;
    const sync = () => {
      if (inView && useUIStore.getState().motionEnabled) tween.play();
      else tween.pause();
    };

    const reactive = !isCoarsePointer();
    const velocityProxy = { scale: 1 };
    const setScale = reactive
      ? gsap.quickTo(velocityProxy, 'scale', {
          duration: 0.5,
          ease: 'power2.out',
          onUpdate: () => tween.timeScale(velocityProxy.scale),
        })
      : null;

    const st = ScrollTrigger.create({
      trigger: wrap,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        inView = self.isActive;
        sync();
      },
      onUpdate: reactive
        ? (self) => {
            setScale(1 + Math.min(Math.abs(self.getVelocity()) * 0.0008, 3.0));
          }
        : undefined,
    });

    inView = st.isActive;
    sync();
    const unsub = useUIStore.subscribe(sync);

    return () => {
      unsub();
      st.kill();
      tween.kill();
      gsap.set(track, { clearProps: 'transform' });
    };
  }, [speed]);

  return { wrapRef, trackRef };
}

export default useMarquee;
