import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useStore } from '@/store/useStore';
import { DUR, EASE } from '@/motion/system';

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
      quickXMap.current.set(el, gsap.quickTo(el, 'x', { duration: DUR.fast, ease: EASE.momentum }));
      quickYMap.current.set(el, gsap.quickTo(el, 'y', { duration: DUR.fast, ease: EASE.momentum }));
    });

    const unsub = useStore.subscribe(
      (state) => state.mouse,
      (mouse) => {
        const { x, y } = mouse;
        
        // Use normalized values directly from the store [-1, 1]
        // state.mouse in useStore is updated by Cursor.jsx using:
        // (mx / width) * 2 - 1
        const nx = x;
        const ny = y;

        layers.forEach((el) => {
          const depth = parseFloat(el.dataset.depth) || 1;
          const qx = quickXMap.current.get(el);
          const qy = quickYMap.current.get(el);
          if (qx) qx(nx * maxShift * depth);
          if (qy) qy(ny * maxShift * depth);
        });
      }
    );

    return () => {
      unsub();
      quickXMap.current.clear();
      quickYMap.current.clear();
    };
  }, [containerRef, maxShift]);
}
