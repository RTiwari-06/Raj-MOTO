import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MEDIA } from '../data/media';
import { EASE, DUR, STAGGER, ST } from '../motion/system';

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
      className="relative w-full overflow-hidden py-28 md:py-36"
      style={{ backgroundColor: '#f2f0e8' }}
    >
      {/* Header */}
      <div className="text-center mb-16 px-8">
        <p className="text-[10px] tracking-[0.45em] uppercase font-bold mb-5" style={{ color: '#999' }}>
          RT•MOTO // Visual Archive
        </p>
        <h2
          className="text-[10vw] md:text-[6.5vw] font-black uppercase tracking-tighter leading-none"
          style={{ color: '#111' }}
        >
          Action Gallery
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
                    boxShadow:  isHovered ? '0 28px 64px rgba(0,0,0,0.32)' : '0 6px 28px rgba(0,0,0,0.16)',
                    willChange: 'transform',
                  }}
                  onMouseEnter={() => setHovered(card.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <img
                    src={card.src}
                    alt={card.label}
                    className="w-full h-full object-cover"
                    loading="lazy"
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

      {/* CTA */}
      <div className="flex justify-center gap-6 mt-36 px-8">
        <a
          href="#rides"
          data-magnetic
          className="px-8 py-3.5 border border-black text-black text-[10px] tracking-[0.35em] uppercase font-bold transition-all duration-300 hover:bg-black hover:text-[#f2f0e8]"
        >
          View Rides
        </a>
        <a
          href="#gallery"
          data-magnetic="cta"
          className="px-8 py-3.5 bg-black text-[#f2f0e8] text-[10px] tracking-[0.35em] uppercase font-bold transition-colors duration-300 hover:bg-[#D2FF00] hover:text-black"
        >
          Full Gallery
        </a>
      </div>
    </section>
  );
}
