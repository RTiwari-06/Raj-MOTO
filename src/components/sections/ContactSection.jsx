import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DUR, STAGGER, ST, HOVER } from '@/motion/system';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const CONTACT_EMAIL = 'darksoft52@gmail.com';

const MENU_LINKS = [
  { label: 'IGNITION', href: '#hero' },
  { label: 'MACHINE',  href: '#machine' },
  { label: 'ARCHIVE',  href: '#gallery' },
];

const SOCIAL_LINKS = [
  { label: 'GITHUB',    href: 'https://github.com/RTiwari-06/Raj-MOTO' },
  { label: 'LINKEDIN',  href: 'https://www.linkedin.com/in/raj-tiwari-061203rt' },
  { label: 'INSTAGRAM', href: 'https://www.instagram.com/rajxxt_/' },
];

export default function ContactSection() {
  const sectionRef = useRef(null);
  const bgTextRef  = useRef(null);
  const riderRef   = useRef(null);
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);
  const ctaRef     = useRef(null);
  const ctaGlowRef = useRef(null);

  // ── Entrance ───────────────────────────────────────────────────────────────
  // One ScrollTrigger'd timeline for the whole section. Durations/eases come
  // from the motion system rather than the hard-coded 'power3.out'/1.2s values
  // this section used to carry — EASE.precision is power4.out, a sharp brake
  // with no overshoot, which is the house voice and explicitly not bouncy.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = (el) => (el ? Array.from(el.children) : []);
      const leftItems = items(leftColRef.current);
      const rightItems = items(rightColRef.current);

      // Reduced motion: resolve straight to the end state. Everything below
      // animates opacity/transform only, so there is nothing else to undo.
      if (prefersReduced()) {
        gsap.set([bgTextRef.current, riderRef.current, ctaRef.current], { opacity: 1, scale: 1, y: 0 });
        gsap.set([...leftItems, ...rightItems], { opacity: 1, y: 0 });
        gsap.set(ctaGlowRef.current, { opacity: 0.55, scale: 1 });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: ST.start.late, once: true },
      });

      // Ghost headline settles first — it is the backdrop everything lands on.
      tl.fromTo(bgTextRef.current,
        { scale: 0.94, opacity: 0 },
        { scale: 1, opacity: 1, duration: DUR.considered, ease: EASE.momentum }, 0);

      // The machine rises into frame and settles to full size.
      tl.fromTo(riderRef.current,
        { scale: 1.06, y: 60, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: DUR.cinematic, ease: EASE.precision }, 0.15);

      // Both rails stagger in on the SAME beat — they are a matched pair, and
      // offsetting them (as the old '-=1.0' / '-=0.8' overlaps did) made the
      // page look like the right column was lagging rather than answering.
      tl.fromTo([...leftItems, ...rightItems],
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: DUR.standard, ease: EASE.precision, stagger: STAGGER.elements },
        0.35);

      tl.fromTo(ctaRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: DUR.standard, ease: EASE.precision }, 0.7);

      // Glow blooms in behind the button once it has landed.
      tl.fromTo(ctaGlowRef.current,
        { opacity: 0, scale: 0.82 },
        { opacity: 0.55, scale: 1, duration: DUR.considered, ease: EASE.momentum }, 0.85);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ── Ambient pulse + hover on TRANSMISSION ──────────────────────────────────
  // The pulse animates opacity/scale on a separate halo element whose
  // box-shadow is static. Tweening the box-shadow itself would repaint every
  // frame forever; this way the loop is pure compositor work. Paused while
  // off-screen so an unseen button costs nothing.
  useEffect(() => {
    const btn = ctaRef.current;
    const glow = ctaGlowRef.current;
    if (!btn || !glow || prefersReduced()) return;

    const pulse = gsap.to(glow, {
      opacity: 0.95, scale: 1.09,
      duration: 1.6, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true,
    });

    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? pulse.play() : pulse.pause()),
      { threshold: 0 },
    );
    io.observe(btn);

    const scaleTo = gsap.quickTo(btn, 'scale', { duration: DUR.feedback, ease: EASE.hover });
    const onEnter = () => { scaleTo(HOVER.scale); gsap.to(glow, { opacity: 1, duration: DUR.feedback }); };
    const onLeave = () => { scaleTo(1); gsap.to(glow, { opacity: 0.55, duration: DUR.feedback }); };

    btn.addEventListener('pointerenter', onEnter);
    btn.addEventListener('pointerleave', onLeave);
    btn.addEventListener('focus', onEnter);
    btn.addEventListener('blur', onLeave);

    return () => {
      pulse.kill();
      io.disconnect();
      btn.removeEventListener('pointerenter', onEnter);
      btn.removeEventListener('pointerleave', onLeave);
      btn.removeEventListener('focus', onEnter);
      btn.removeEventListener('blur', onLeave);
    };
  }, []);

  return (
    <section
      id="connect"
      ref={sectionRef}
      // h-screen (100vh) was measuring the viewport WITHOUT mobile browser
      // chrome, so on phones the bottom ~80px of this section — the CTA and the
      // lower half of both link rails — sat behind the URL bar. dvh tracks the
      // visible viewport, matching the Hero.
      className="relative w-full min-h-[100dvh] overflow-hidden bg-canvas-raised select-none"
    >
      {/* =========================================================================
          LAYER 1: Deepest Background (Stylized Vector Graphic)
          ========================================================================= */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20 pointer-events-none">
        <svg viewBox="0 0 800 600" className="w-[120%] h-auto max-h-screen fill-none stroke-accent stroke-[1.5px] opacity-10">
          <path d="M-100,300 L200,100 L400,500 L600,200 L900,400" />
          <circle cx="400" cy="500" r="8" fill="var(--color-accent)" />
          <circle cx="200" cy="100" r="8" fill="var(--color-accent)" />
        </svg>
      </div>

      {/* =========================================================================
          LAYER 2: Background Typography (Scaled for 125% Density)
          ========================================================================= */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center pointer-events-none whitespace-nowrap flex flex-col items-center justify-center">
        {/* Was an <h1>. At 3% opacity inside a pointer-events-none decorative
            layer this is texture, not a heading — but being an h1 made it the
            homepage's ONLY top-level heading, so the document outline and every
            screen reader announced the page as "ALWAYS BRINGING THE FIGHT."
            Demoted to a <p> and hidden from the a11y tree. No visual change:
            index.css has no h1 rules, all styling is on the class list. */}
        <p
          ref={bgTextRef}
          aria-hidden="true"
          className="font-serif font-black uppercase text-white/[0.03] tracking-tighter leading-none select-none text-[9vw]"
        >
          ALWAYS BRINGING<br />THE FIGHT.
        </p>
      </div>

      {/* =========================================================================
          LAYER 3: Center Anchor Visual (Rider Cutout with Edge Dissolve)
          ========================================================================= */}
      <div 
        ref={riderRef}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40vw] min-w-[320px] h-[85vh] z-20 pointer-events-none flex flex-col items-center justify-end"
      >
        {/* ⚠ /bike-2-cutout.webp is NOT a cutout. Despite the name it is the full
            rectangular photo — sunset sky, road, bystanders — with no alpha
            (simple lossy VP8, which cannot carry an alpha channel at all; the
            bike-2.png source has an alpha channel but zero non-opaque pixels).
            Nobody ever removed the background.

            So the "Rider Cutout" above was rendering as an opaque rectangle
            parked over LAYER 2's ghost headline, bisecting it into
            "ALWAY[block]NGING / TH[block]HT." — unreadable, and reading as a
            pasted-in accident rather than a composition.

            The edge dissolve this layer's heading has always promised is done
            here, in CSS: fade the top (kills the hard sky edge) and both sides,
            leaving the bottom to the existing scrim. That turns the rectangle
            into a vignette that melts into the canvas and lets the ghost type
            read at the periphery.

            This is a mitigation, not the fix. The real fix is a genuine alpha
            cutout asset; when one exists, drop the mask. */}
        <img
          src="/bike-2-cutout.webp"
          alt="Rider Setup"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain object-bottom drop-shadow-2xl"
          style={{
            filter: 'contrast(1.15) saturate(1.1)',
            // The side stops start at 26%/74% rather than at the edges because
            // object-contain LETTERBOXES: the box is 40vw (~576px) but the photo
            // renders ~433px wide, centred. A mask is box-relative, so edge-anchored
            // stops fall on empty letterbox and never touch the image — which is
            // exactly what happened at 14%/86%: the top faded, the sides stayed hard.
            // 26%/74% clears the widest letterbox (~16% per side at 1920x1080) and
            // still bites into the photo at narrow widths, where it fits by width
            // and there is no horizontal letterbox at all.
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, #000 34%), linear-gradient(to right, transparent 18%, #000 30%, #000 70%, transparent 82%)',
            maskImage:
              'linear-gradient(to bottom, transparent 0%, #000 34%), linear-gradient(to right, transparent 18%, #000 30%, #000 70%, transparent 82%)',
            WebkitMaskComposite: 'source-in',
            maskComposite: 'intersect',
          }}
        />
        
        {/* Bottom scrim — grounds the wheels; taller on phones where the link
            columns sit over the cutout and need contrast. */}
        <div className="absolute bottom-0 left-0 w-full h-[45vh] md:h-[10vh] bg-gradient-to-t from-canvas-raised via-canvas-raised/70 md:via-transparent to-transparent z-10" />
      </div>

      {/* =========================================================================
          LAYER 4: Interactive UI Elements
          ========================================================================= */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        
        {/* ── LINK RAIL ────────────────────────────────────────────────────
            PAGES and FOLLOW ON now share ONE row. They used to be two
            independent absolutely-positioned boxes pinned to opposite edges,
            which meant their headers only lined up while both lists happened
            to hold the same number of items — removing a single link from
            either side silently knocked the two headers out of alignment (and
            did, when TARMAC went). A shared row with items-start makes the
            alignment structural instead of coincidental, and one inset pair
            guarantees the gutters stay symmetrical at every width. */}
        {/* bottom-44 (176px), not 40. The CTA sits at bottom-24 (96px) and is
            ~40px tall, so its top edge lands at 136px; 176 keeps the original
            40px of clearance between the button and the rails on phones.
            Dropping to bottom-40 would have quietly halved that to 24px. */}
        <div className="absolute inset-x-6 md:inset-x-12 bottom-44 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-20 flex items-start justify-between gap-8">

          {/* PAGES */}
          <div ref={leftColRef} className="flex flex-col space-y-2.5 md:space-y-4 pointer-events-auto">
            <span className="font-mono text-[9px] tracking-[0.3em] font-bold text-fg-muted uppercase pointer-events-none mb-1 md:mb-2">
              PAGES //
            </span>
            {MENU_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="link-wipe self-start font-sans font-black text-base md:text-xl text-white uppercase tracking-tighter hover:text-accent focus-visible:text-accent transition-colors duration-300 focus-visible:outline-none"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* FOLLOW ON */}
          <div ref={rightColRef} className="flex flex-col space-y-2.5 md:space-y-4 items-end text-right pointer-events-auto">
            <span className="font-mono text-[9px] tracking-[0.3em] font-bold text-fg-muted uppercase pointer-events-none mb-1 md:mb-2">
              FOLLOW ON //
            </span>
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-wipe link-wipe--from-right self-end font-sans font-black text-base md:text-xl text-white uppercase tracking-tighter hover:text-accent focus-visible:text-accent transition-colors duration-300 focus-visible:outline-none"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* ── TRANSMISSION ─────────────────────────────────────────────────
            The class list previously carried BOTH `inline-flex` and `block`;
            which one won depended on their order in the generated stylesheet,
            not the order written here. Now it declares one display mode.
            hover:scale-105 + transition-all also went: GSAP drives the scale,
            and a CSS transition on the same transform fights it mid-tween. */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-auto z-50">
          <a
            ref={ctaRef}
            data-magnetic="cta"
            href={`mailto:${CONTACT_EMAIL}`}
            aria-label="Send an email"
            className="relative inline-flex items-center justify-center px-8 py-3 bg-accent text-ink rounded-full font-sans font-black text-[11px] tracking-[0.2em] uppercase cursor-pointer will-change-transform focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {/* Static box-shadow; GSAP only touches opacity/scale on this layer. */}
            <span
              ref={ctaGlowRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{ boxShadow: '0 0 30px 6px var(--color-accent-soft)', opacity: 0 }}
            />
            <span className="relative">TRANSMISSION</span>
          </a>
        </div>

      </div>

    </section>
  );
}
