import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useStore } from '../store/useStore';

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
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.50, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.50, ease: 'power3.out' });

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
            width: 60, height: 60,
            backgroundColor: 'rgba(210,255,0,0.12)',
            borderColor: 'rgba(210,255,0,0.9)',
            duration: 0.35, ease: 'power3.out',
          });
        } else if (type === 'image') {
          gsap.to(ring, {
            width: 80, height: 80,
            borderColor: 'rgba(210,255,0,0.5)',
            duration: 0.35, ease: 'power3.out',
          });
        } else {
          // default — link hover
          gsap.to(ring, {
            width: 48, height: 48,
            borderColor: 'rgba(210,255,0,0.7)',
            duration: 0.3, ease: 'power3.out',
          });
        }
        gsap.to(dot, { scale: 0, duration: 0.2, ease: 'power2.out' });
        return;
      }

      // Non-magnetic interactive elements still get a subtle ring scale
      if (e.target.closest('a, button')) {
        gsap.to(ring, {
          width: 44, height: 44,
          borderColor: 'rgba(210,255,0,0.6)',
          duration: 0.25, ease: 'power3.out',
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
        duration: 0.4, ease: 'power3.out',
      });
      gsap.to(dot, { scale: 1, duration: 0.25, ease: 'back.out(2)' });
    };

    // Hide cursor when it leaves the window
    const onWindowLeave = () => {
      gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
    };
    const onWindowEnter = () => {
      gsap.to([dot, ring], { opacity: 1, duration: 0.2 });
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
