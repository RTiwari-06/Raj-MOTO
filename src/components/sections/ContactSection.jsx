import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const CONTACT_EMAIL = 'darksoft52@gmail.com';

const MENU_LINKS = [
  { label: 'IGNITION', href: '#hero' },
  { label: 'MACHINE',  href: '#machine' },
  { label: 'TARMAC',   href: '#rides' },
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

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          once: true,
        },
      });

      // Background Typography scales and fades in subtly
      tl.fromTo(
        bgTextRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: 'power3.out' }
      );

      // Center Anchor Visual (Rider) slides upward
      tl.fromTo(
        riderRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out' },
        '-=0.7'
      );

      // Left Column elements stagger reveal
      if (leftColRef.current) {
        const leftItems = leftColRef.current.children;
        tl.fromTo(
          leftItems,
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
          '-=1.0'
        );
      }

      // Right Column elements stagger reveal
      if (rightColRef.current) {
        const rightItems = rightColRef.current.children;
        tl.fromTo(
          rightItems,
          { x: 20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
          '-=0.8'
        );
      }

      // CTA fades and slides up
      tl.fromTo(
        ctaRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.6'
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="connect"
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden bg-[#141913] select-none"
    >
      {/* =========================================================================
          LAYER 1: Deepest Background (Stylized Vector Graphic)
          ========================================================================= */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20 pointer-events-none">
        <svg viewBox="0 0 800 600" className="w-[120%] h-auto max-h-screen fill-none stroke-[#D2FF00] stroke-[1.5px] opacity-10">
          <path d="M-100,300 L200,100 L400,500 L600,200 L900,400" />
          <circle cx="400" cy="500" r="8" fill="#D2FF00" />
          <circle cx="200" cy="100" r="8" fill="#D2FF00" />
        </svg>
      </div>

      {/* =========================================================================
          LAYER 2: Background Typography (Scaled for 125% Density)
          ========================================================================= */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center pointer-events-none whitespace-nowrap flex flex-col items-center justify-center">
        <h1 
          ref={bgTextRef}
          className="font-serif font-black uppercase text-white/[0.03] tracking-tighter leading-none select-none text-[9vw]"
        >
          ALWAYS BRINGING<br />THE FIGHT.
        </h1>
      </div>

      {/* =========================================================================
          LAYER 3: Center Anchor Visual (Rider Cutout with Edge Dissolve)
          ========================================================================= */}
      <div 
        ref={riderRef}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40vw] min-w-[320px] h-[85vh] z-20 pointer-events-none flex flex-col items-center justify-end"
      >
        <img
          src="/bike-2-cutout.webp"
          alt="Rider Setup"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain object-bottom drop-shadow-2xl"
          style={{ filter: 'contrast(1.15) saturate(1.1)' }}
        />
        
        {/* Subtle Bottom Scrim just to ground the wheels */}
        <div className="absolute bottom-0 left-0 w-full h-[10vh] bg-gradient-to-t from-[#141913] to-transparent z-10" />
      </div>

      {/* =========================================================================
          LAYER 4: Interactive UI Elements
          ========================================================================= */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        
        {/* Left Column: Navigation */}
        <div className="absolute left-12 top-1/2 -translate-y-1/2 pointer-events-auto z-20">
          <div ref={leftColRef} className="flex flex-col space-y-4">
            <div className="mb-4">
              <span className="font-mono text-[9px] tracking-[0.3em] font-bold text-white/40 uppercase pointer-events-none">
                PAGES //
              </span>
            </div>
            {MENU_LINKS.map((link) => (
              <a 
                key={link.label}
                href={link.href}
                className="font-sans font-black text-xl text-white uppercase tracking-tighter hover:text-[#D7F700] hover:translate-x-2 transition-transform duration-300 relative z-50 pointer-events-auto origin-left"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Right Column: Socials */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 text-right pointer-events-auto z-20">
          <div ref={rightColRef} className="flex flex-col space-y-4 items-end">
            <div className="mb-4">
              <span className="font-mono text-[9px] tracking-[0.3em] font-bold text-white/40 uppercase pointer-events-none">
                FOLLOW ON //
              </span>
            </div>
            {SOCIAL_LINKS.map((link) => (
              <a 
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans font-black text-xl text-white uppercase tracking-tighter hover:text-[#D7F700] hover:-translate-x-2 transition-transform duration-300 relative z-50 pointer-events-auto origin-right"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Center CTA Button - Firmly anchored relative to viewport */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-auto z-50">
          <a
            ref={ctaRef}
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center justify-center px-8 py-3 bg-[#D7F700] text-[#141913] rounded-full font-sans font-black text-[11px] tracking-[0.2em] uppercase hover:bg-white hover:scale-105 transition-all duration-300 shadow-2xl relative z-50 cursor-pointer pointer-events-auto block"
          >
            TRANSMISSION
          </a>
        </div>

      </div>

    </section>
  );
}
