import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DUR, ST } from '@/motion/system';


/**
 * <LetterboxReveal> — wraps a section in two black bars that sweep in from
 * top + bottom on enter (anamorphic 2.39:1 crop) and retract on exit.
 *
 * The wrapper is `position: relative`; the bars are absolutely positioned
 * inside it and use translate3d so they composite on the GPU.
 *
 *   <LetterboxReveal barHeight="12vh"><GallerySection /></LetterboxReveal>
 *
 * Hold the cinematic frame past the trigger by setting `hold` (multiplier of
 * the section height — 1 = full section). Defaults to 0.6.
 */
export function LetterboxReveal({
  children,
  barHeight = '12vh',
  hold      = 0.6,
  className = '',
}) {
  const rootRef = useRef(null);
  const topRef  = useRef(null);
  const botRef  = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const top  = topRef.current;
    const bot  = botRef.current;
    if (!root || !top || !bot) return;

    gsap.set(top, { yPercent: -100 });
    gsap.set(bot, { yPercent:  100 });

    const ctx = gsap.context(() => {
      const enterTl = gsap.timeline({ paused: true })
        .to(top, { yPercent: 0, duration: DUR.cinematic, ease: EASE.authority }, 0)
        .to(bot, { yPercent: 0, duration: DUR.cinematic, ease: EASE.authority }, 0);

      const exitTl = gsap.timeline({ paused: true })
        .to(top, { yPercent: -100, duration: DUR.standard, ease: EASE.exit }, 0)
        .to(bot, { yPercent:  100, duration: DUR.standard, ease: EASE.exit }, 0);

      ScrollTrigger.create({
        trigger: root,
        start:   ST.start.section,
        end:     `+=${window.innerHeight * hold}`,
        onEnter:       () => enterTl.restart(),
        onLeave:       () => exitTl.restart(),
        onEnterBack:   () => enterTl.restart(),
        onLeaveBack:   () => exitTl.restart(),
      });
    }, root);

    return () => ctx.revert();
  }, [hold]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {children}
      {/* Bars sit above content but ignore pointer events */}
      <div
        ref={topRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 w-full bg-black z-[60]"
        style={{ height: barHeight, willChange: 'transform' }}
      />
      <div
        ref={botRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 bottom-0 w-full bg-black z-[60]"
        style={{ height: barHeight, willChange: 'transform' }}
      />
    </div>
  );
}
