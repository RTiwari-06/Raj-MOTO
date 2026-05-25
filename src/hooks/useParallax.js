import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useStore } from '../store/useStore';

/**
 * Attaches holographic DOM parallax to a container ref.
 * Each child with data-depth="N" floats by N * mouse offset pixels.
 * Uses gsap.quickTo for zero-rerender smooth updates.
 *
 * @param {React.RefObject} containerRef - parent container
 * @param {number} [maxShift=18]         - max pixel shift at depth 1
 */
export function useParallax(containerRef, maxShift = 18) {
  const quickXMap = useRef(new Map());
  const quickYMap = useRef(new Map());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const layers = [...container.querySelectorAll('[data-depth]')];
    if (!layers.length) return;

    layers.forEach((el) => {
      const depth = parseFloat(el.dataset.depth) || 1;
      quickXMap.current.set(el, gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' }));
      quickYMap.current.set(el, gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' }));
    });

    const unsub = useStore.subscribe((state) => {
      const { x, y } = state.mouse;
      // Normalize to -1 … 1 from center of viewport
      const nx = (x / window.innerWidth  - 0.5) * 2;
      const ny = (y / window.innerHeight - 0.5) * 2;

      layers.forEach((el) => {
        const depth = parseFloat(el.dataset.depth) || 1;
        const qx = quickXMap.current.get(el);
        const qy = quickYMap.current.get(el);
        if (qx) qx(nx * maxShift * depth);
        if (qy) qy(ny * maxShift * depth);
      });
    });

    return () => {
      unsub();
      quickXMap.current.clear();
      quickYMap.current.clear();
    };
  }, [containerRef, maxShift]);
}
