import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DUR, ST, HOVER } from '@/motion/system';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Footer() {
  const year = new Date().getFullYear();

  const rootRef    = useRef(null);
  const headingRef = useRef(null);
  const arrowRef   = useRef(null);
  const ruleRef    = useRef(null);

  const handleScrollContact = (e) => {
    e.preventDefault();
    const el = document.querySelector('#connect');
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ── Horizontal reveal ──────────────────────────────────────────────────────
  // clip-path wipes the headline in left→right, the same direction the arrow
  // points, so the reveal and the affordance agree. EASE.precision is
  // power4.out: a hard brake with zero overshoot — the motorsport read. No
  // back/elastic here on purpose.
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReduced()) {
        gsap.set(headingRef.current, { clipPath: 'inset(0 0% 0 0)', opacity: 1 });
        gsap.set(arrowRef.current, { opacity: 1, x: 0 });
        gsap.set(ruleRef.current, { scaleX: 1 });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: { trigger: rootRef.current, start: ST.start.section, once: true },
      });

      tl.fromTo(headingRef.current,
        { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
        { clipPath: 'inset(0 0% 0 0)', duration: DUR.cinematic, ease: EASE.precision }, 0);

      // The arrow arrives after the wipe has passed its position, so it reads
      // as the thing the wipe delivered rather than a separate element.
      tl.fromTo(arrowRef.current,
        { opacity: 0, x: -14 },
        { opacity: 1, x: 0, duration: DUR.standard, ease: EASE.precision }, 0.45);

      tl.fromTo(ruleRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: DUR.considered, ease: EASE.precision }, 0.2);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // ── Arrow hover ────────────────────────────────────────────────────────────
  // GSAP rather than group-hover:translate-x, because the entrance tween above
  // also writes `x` on this element — a CSS transform on the same property
  // would clobber whichever ran last.
  useEffect(() => {
    const link = rootRef.current?.querySelector('[data-cta-link]');
    const arrow = arrowRef.current;
    if (!link || !arrow || prefersReduced()) return;

    const xTo = gsap.quickTo(arrow, 'x', { duration: DUR.feedback, ease: EASE.hover });
    const sTo = gsap.quickTo(arrow, 'scale', { duration: DUR.feedback, ease: EASE.hover });
    const onEnter = () => { xTo(12); sTo(HOVER.scale); };
    const onLeave = () => { xTo(0); sTo(1); };

    link.addEventListener('pointerenter', onEnter);
    link.addEventListener('pointerleave', onLeave);
    link.addEventListener('focus', onEnter);
    link.addEventListener('blur', onLeave);

    return () => {
      link.removeEventListener('pointerenter', onEnter);
      link.removeEventListener('pointerleave', onLeave);
      link.removeEventListener('focus', onEnter);
      link.removeEventListener('blur', onLeave);
    };
  }, []);

  return (
    <footer ref={rootRef} className="w-full bg-black border-t border-line px-[var(--container-padding)] py-16">
      <div className="max-w-screen-xl mx-auto relative">

        {/* Centered, bold CTA.
            The arrow is sized in `em`, not text-2xl/md:text-4xl. Those were
            fixed steps sitting next to a fluid clamp() headline, so the arrow
            was proportionally oversized at 375px and undersized at 1440px, and
            the fixed `mb-2` nudge drifted off the optical centre at every width
            in between. At 0.62em it holds one ratio to the headline at every
            size, and items-center keeps it centred even when the text wraps to
            two lines on narrow screens. */}
        <div className="flex justify-center">
          <a
            href="#connect"
            data-cta-link
            data-magnetic="cta"
            onClick={handleScrollContact}
            className="group inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-serif font-black uppercase leading-none text-white transition-colors duration-200 hover:text-accent focus-visible:text-accent focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-accent"
            style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', letterSpacing: '-0.02em' }}
            aria-label="Drop a pin — go to contact"
          >
            <span ref={headingRef} className="inline-block">
              DROP A PIN <span className="text-accent">//</span> CONTACT
            </span>
            <span
              ref={arrowRef}
              aria-hidden="true"
              className="inline-block will-change-transform"
              style={{ fontSize: '0.62em' }}
            >
              →
            </span>
          </a>
        </div>

        {/* Minimal divider */}
        <div
          ref={ruleRef}
          className="mt-10 h-px w-full bg-line-subtle origin-left"
        />

        {/* Bottom corner sign-off */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-faint">
            &copy; {year} RT•MOTO // ALL RIGHTS RESERVED
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-muted flex items-center">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2" style={{ animation: 'vfPulse 2.4s ease-in-out infinite' }} />
            Crafted for the streets. Engine running.
          </p>
        </div>

      </div>
    </footer>
  );
}
