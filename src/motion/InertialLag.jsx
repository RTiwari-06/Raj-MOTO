import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useStore } from '@/store/useStore';
import { VELOCITY, EASE, DUR } from '@/motion/system';

/**
 * <InertialLag> — wraps children in a div whose Y-translate tracks Lenis
 * scroll velocity. Fast scrolls push content opposite the scroll direction;
 * when scroll settles, content snaps back with EASE.precision.
 *
 * The transform is owned by this wrapper, so any GSAP/CSS animation on the
 * child element (entrance reveals, hover lifts) is free of conflict.
 *
 *   <InertialLag strength={6}><h2>…</h2></InertialLag>
 */
export function InertialLag({ children, strength = VELOCITY.maxLag, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const setY = gsap.quickTo(el, 'y', { duration: DUR.fast, ease: EASE.precision });

    // Subscribe to velocity changes from the Zustand store
    const unsub = useStore.subscribe((state, prev) => {
      if (state.velocity === prev.velocity) return;
      // Opposite direction × strength, clamped to ±strength
      const offset = Math.max(
        -strength,
        Math.min(strength, -state.velocity * VELOCITY.velocityScale * 0.6)
      );
      setY(offset);
    });

    return () => {
      unsub();
      gsap.set(el, { y: 0 });
    };
  }, [strength]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
