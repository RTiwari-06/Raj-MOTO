import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from '@/store/useStore';

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }) {
  const setScroll = useStore((state) => state.setScroll);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      document.documentElement.classList.add('motion-off');
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: !reducedMotion,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    // Expose the instance so UI (Navbar smooth-scroll + menu scroll-lock) can drive it.
    window.__lenis = lenis;

    lenis.on('scroll', (e) => {
      setScroll(e.scroll, e.velocity);
      // Keep ScrollTrigger in sync with Lenis — prevents jitter on pinned
      // sections. Done here (only while scroll actually moves) instead of on
      // every rAF tick, which kept the main thread busy even at idle.
      ScrollTrigger.update();
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Refresh ScrollTrigger after fonts load to recalculate layouts correctly
    if (document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      if (window.__lenis === lenis) window.__lenis = null;
    };
  }, [setScroll]);

  return <>{children}</>;
}
