import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useStore } from '@/store/useStore';
import { EASE, DUR } from '@/motion/system';

// Magnetic radius in px — elements with [data-magnetic] pull the cursor within this distance
const MAGNETIC_RADIUS = 100;

export function Cursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const setMouse = useStore((s) => s.setMouse);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // quickTo for zero-overhead position updates — no React re-renders, ever
    const dotX  = gsap.quickTo(dot,  'x', { duration: 0.06 });
    const dotY  = gsap.quickTo(dot,  'y', { duration: 0.06 });
    const ringX = gsap.quickTo(ring, 'x', { duration: DUR.fast, ease: EASE.momentum });
    const ringY = gsap.quickTo(ring, 'y', { duration: DUR.fast, ease: EASE.momentum });

    let mx = 0;
    let my = 0;
    let activeMagnetic = null;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;

      // Update WebGL store for shader consumption
      setMouse(
        (mx / window.innerWidth)  *  2 - 1,
        -(my / window.innerHeight) * 2 + 1,
      );

      dotX(mx);
      dotY(my);

      // Magnetic pull — lerp ring toward element center when close enough
      if (activeMagnetic) {
        const rect = activeMagnetic.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = mx - cx;
        const dy   = my - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAGNETIC_RADIUS) {
          const pull = 1 - dist / MAGNETIC_RADIUS;
          ringX(mx - dx * pull * 0.45);
          ringY(my - dy * pull * 0.45);
          return;
        }
      }

      ringX(mx);
      ringY(my);
    };

    const onEnter = (e) => {
      const magnetic = e.target.closest('[data-magnetic]');
      if (magnetic) {
        activeMagnetic = magnetic;
        const type = magnetic.dataset.magnetic || 'default';

        if (type === 'cta') {
          gsap.to(ring, {
            width: 44, height: 44,
            backgroundColor: 'rgba(210,255,0,0.12)',
            borderColor: 'rgba(210,255,0,0.9)',
            duration: DUR.feedback, ease: EASE.momentum,
          });
        } else if (type === 'image') {
          gsap.to(ring, {
            width: 52, height: 52,
            borderColor: 'rgba(210,255,0,0.5)',
            duration: DUR.feedback, ease: EASE.momentum,
          });
        } else {
          // default — link hover
          gsap.to(ring, {
            width: 40, height: 40,
            borderColor: 'rgba(210,255,0,0.7)',
            duration: DUR.feedback, ease: EASE.momentum,
          });
        }
        gsap.to(dot, { scale: 0, duration: DUR.instant, ease: EASE.hover });
        return;
      }

      // Non-magnetic interactive elements still get a subtle ring scale
      if (e.target.closest('a, button')) {
        gsap.to(ring, {
          width: 38, height: 38,
          borderColor: 'rgba(210,255,0,0.6)',
          duration: DUR.feedback, ease: EASE.momentum,
        });
      }
    };

    const onLeave = (e) => {
      if (activeMagnetic && activeMagnetic.contains(e.relatedTarget)) return;

      if (activeMagnetic && !activeMagnetic.contains(e.relatedTarget)) {
        activeMagnetic = null;
      }

      // Reset to default state
      gsap.to(ring, {
        width: 36, height: 36,
        backgroundColor: 'rgba(0,0,0,0)',
        borderColor: 'rgba(210,255,0,0.35)',
        duration: DUR.fast, ease: EASE.momentum,
      });
      gsap.to(dot, { scale: 1, duration: DUR.feedback, ease: EASE.spring });
    };

    // Hide cursor when it leaves the window
    const onWindowLeave = () => {
      gsap.to([dot, ring], { opacity: 0, duration: DUR.instant });
    };
    const onWindowEnter = () => {
      gsap.to([dot, ring], { opacity: 1, duration: DUR.instant });
    };

    window.addEventListener('mousemove',  onMove);
    document.addEventListener('mouseover',  onEnter);
    document.addEventListener('mouseout',   onLeave);
    document.addEventListener('mouseleave', onWindowLeave);
    document.addEventListener('mouseenter', onWindowEnter);

    return () => {
      window.removeEventListener('mousemove',  onMove);
      document.removeEventListener('mouseover',  onEnter);
      document.removeEventListener('mouseout',   onLeave);
      document.removeEventListener('mouseleave', onWindowLeave);
      document.removeEventListener('mouseenter', onWindowEnter);
    };
  }, [setMouse]);

  return (
    <>
      {/* Precision dot — tracks exact mouse position */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width:           4,
          height:          4,
          borderRadius:    '50%',
          backgroundColor: '#D2FF00',
          transform:       'translate(-50%, -50%)',
          willChange:      'transform',
        }}
      />

      {/* Lagging ring — magnetic, morphs per context */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          width:        36,
          height:       36,
          borderRadius: '50%',
          border:       '1.5px solid rgba(210,255,0,0.35)',
          transform:    'translate(-50%, -50%)',
          willChange:   'transform',
        }}
      />
    </>
  );
}
