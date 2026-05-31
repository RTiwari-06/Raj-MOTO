import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MEDIA } from '@/data/media';
import { EASE, DUR, STAGGER, ST } from '@/motion/system';

const CARDS   = MEDIA.actionCards;
const CARD_W  = 180;
const CARD_H  = 270;

export default function ActionGallery() {
  const sectionRef  = useRef(null);
  const wrapperRefs = useRef([]);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      CARDS.forEach((card, i) => {
        gsap.fromTo(
          wrapperRefs.current[i],
          { x: 0, y: 40, rotate: 0, opacity: 0, scale: 0.85 },
          {
            x:       card.x,
            y:       card.y,
            rotate:  card.rotate,
            opacity: 1,
            scale:   1,
            duration: DUR.cinematic,
            ease:    EASE.momentum,
            delay:   i * STAGGER.cards,
            scrollTrigger: {
              trigger: sectionRef.current,
              start:   ST.start.section,
              once:    true,
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden py-36 md:py-44"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      {/* Header */}
      <div className="text-center mb-20 px-8">
        <div className="w-[60px] h-[2px] bg-[#D2FF00] mx-auto mb-8" />
        <p className="text-[9px] tracking-[0.45em] uppercase font-bold mb-5" style={{ color: '#9a9a9a' }}>
          OFF TRACK
        </p>
        <h2
          className="font-serif font-black uppercase leading-none"
          style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', letterSpacing: '-0.03em', lineHeight: '0.9', color: '#f0f0f0' }}
        >
          Moments
        </h2>
      </div>

      {/* Fan container */}
      <div className="flex items-center justify-center">
        <div
          className="relative"
          style={{ width: CARD_W, height: CARD_H }}
          onMouseLeave={() => setHovered(null)}
        >
          {CARDS.map((card, i) => {
            const isHovered  = hovered === card.id;
            const anyHovered = hovered !== null;

            return (
              <div
                key={card.id}
                ref={(el) => (wrapperRefs.current[i] = el)}
                className="absolute"
                style={{
                  top:       '50%',
                  left:      '50%',
                  marginTop:  -(CARD_H / 2),
                  marginLeft: -(CARD_W / 2),
                  width:      CARD_W,
                  height:     CARD_H,
                  zIndex:     isHovered ? 50 : 0,
                  opacity:    0,
                }}
              >
                <div
                  data-magnetic="image"
                  className="w-full h-full rounded-[1.5rem] overflow-hidden select-none"
                  style={{
                    transform:  isHovered ? 'scale(1.12) translateY(-20px)' : anyHovered ? 'scale(0.95)' : 'scale(1)',
                    transition: `transform ${DUR.standard * 1000}ms cubic-bezier(0.25,0.46,0.45,0.94), filter 0.35s ease, box-shadow 0.35s ease`,
                    filter:     anyHovered && !isHovered ? 'brightness(0.65)' : 'brightness(1)',
                    boxShadow:  isHovered
                      ? '0 40px 90px rgba(0,0,0,0.7), 0 0 44px rgba(210,255,0,0.22)'
                      : '0 16px 48px rgba(0,0,0,0.6)',
                    willChange: 'transform',
                  }}
                  onMouseEnter={() => setHovered(card.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <img
                    src={card.src}
                    alt={card.label}
                    className="w-full h-full object-cover"
                    style={{ filter: 'contrast(1.2) saturate(1.3) hue-rotate(-10deg)' }}
                    draggable={false}
                  />

                  {/* Specular highlight */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 55%, rgba(0,0,0,0.1) 100%)',
                      opacity:    isHovered ? 1 : 0,
                      transition: 'opacity 0.35s ease',
                    }}
                  />

                  {/* Label */}
                  <div
                    className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-12 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.72), transparent)',
                      opacity:    isHovered ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    <p className="text-white text-[9px] tracking-[0.3em] uppercase font-bold">
                      {card.label}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA — editorial hairline links: serif label, mono index, extending
          arrow, and a lime bar that sweeps the hairline on hover. */}
      <div className="mt-32 md:mt-44 px-8">
        <div className="mx-auto w-full max-w-xl border-t border-[#f0f0f0]/12">
          {[
            { href: '#rides',   label: 'View Rides',   index: '01', sub: 'Selected machines' },
            { href: '#gallery', label: 'Full Gallery', index: '02', sub: 'Every frame' },
          ].map(({ href, label, index, sub }) => (
            <a
              key={href}
              href={href}
              data-magnetic="cta"
              className="group relative block py-7 select-none"
            >
              {/* Hairline divider + lime sweep (sits on the row's bottom edge) */}
              <span className="absolute bottom-0 left-0 h-px w-full bg-[#f0f0f0]/12" />
              <span className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-[#D2FF00] transition-transform duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />

              <span className="flex items-end justify-between gap-6">
                {/* Left — index + serif label */}
                <span className="flex items-baseline gap-4 md:gap-6">
                  <span className="font-mono text-[10px] tracking-[0.25em] text-[#f0f0f0]/35 transition-colors duration-300 group-hover:text-[#f0f0f0]">
                    {index}
                  </span>
                  <span className="flex flex-col">
                    <span
                      className="font-serif font-black uppercase leading-none text-[#f0f0f0] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5"
                      style={{ fontSize: 'clamp(1.6rem, 3.4vw, 2.5rem)', letterSpacing: '-0.02em' }}
                    >
                      {label}
                    </span>
                    <span className="mt-2 font-mono text-[9px] tracking-[0.3em] uppercase text-[#f0f0f0]/30">
                      {sub}
                    </span>
                  </span>
                </span>

                {/* Right — extending arrow */}
                <span className="flex items-center pb-1.5 text-[#f0f0f0]" aria-hidden="true">
                  <span className="block h-px w-7 bg-[#f0f0f0] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-20 group-hover:bg-[#f0f0f0]" />
                  <span className="-ml-px text-xl leading-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                    →
                  </span>
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
