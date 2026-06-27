import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MEDIA } from '@/data/media';

// Utility: Fisher-Yates shuffle
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function ActionGallery() {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  // Randomize cards once per component mount
  const randomizedCards = useMemo(() => shuffleArray(MEDIA.actionCards), []);

  // Touch devices keep the SAME fan — just tighter (cards overlap more) with
  // smaller cards so the spread fits a phone. No carousel/grid; the fan is the
  // section's signature.
  const isCoarse = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
    [],
  );
  const STEP = isCoarse ? 19 : 35;   // xPercent offset per card (more overlap on touch)
  const YK   = isCoarse ? 9 : 14.4;  // parabolic downward arc
  const ROT  = isCoarse ? 6 : 8;     // progressive Z-rotation

  // Calculate the base structural transforms for the fan-out layout
  const baseTransforms = randomizedCards.map((_, i) => {
    // Dynamic normalized index mapping (e.g. for 6 cards: -2.5, -1.5, -0.5, 0.5, 1.5, 2.5)
    const normalizedIndex = i - (randomizedCards.length - 1) / 2;

    return {
      xPercent: -50 + normalizedIndex * STEP,
      y: Math.abs(normalizedIndex) * YK,
      rotate: normalizedIndex * ROT,
      zIndex: Math.floor(50 - Math.abs(normalizedIndex) * 10), // Center highest, falling off to flanks
    };
  });

  useEffect(() => {
    // The fan-out reveal runs on every device — mobile fans in too.
    const ctx = gsap.context(() => {
      // Initial entry fan-out animation
      randomizedCards.forEach((_, i) => {
        const t = baseTransforms[i];
        gsap.fromTo(
          cardRefs.current[i],
          { xPercent: -50, y: 200, rotate: 0, opacity: 0, scale: 0.8 },
          {
            xPercent: t.xPercent,
            y: t.y,
            rotate: t.rotate,
            opacity: 1,
            scale: 1,
            zIndex: t.zIndex,
            duration: 1.2,
            ease: 'power3.out',
            delay: i * 0.1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              once: true,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [randomizedCards, baseTransforms]);

  const activeCard = useRef(null); // touch: index of the currently tapped card

  // Lift card `i` to the front and dim the rest (shared by hover + tap).
  const liftCard = (i) => {
    const t = baseTransforms[i];
    gsap.to(cardRefs.current[i], {
      scale: 1.06,
      rotate: t.rotate * 0.2, // ease the tilt for readability
      y: t.y - 36,            // lift relative to its fan position
      zIndex: 50,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    });
    randomizedCards.forEach((_, j) => {
      if (i !== j) {
        gsap.to(cardRefs.current[j], {
          filter: 'brightness(0.5) grayscale(0.5)',
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    });
  };

  // Return every card to its calculated fan position.
  const resetCards = () => {
    randomizedCards.forEach((_, j) => {
      const t = baseTransforms[j];
      gsap.to(cardRefs.current[j], {
        scale: 1,
        rotate: t.rotate,
        y: t.y,
        zIndex: t.zIndex,
        filter: 'brightness(1) grayscale(0)',
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  };

  const handleMouseEnter = (i) => { if (!isCoarse) liftCard(i); };
  const handleMouseLeave = () => { if (!isCoarse) resetCards(); };

  // Touch parity for hover: tap a card to bring it forward; tap again (or
  // another card) to swap. Tapping the active card resets the fan.
  const handleTap = (i) => {
    if (!isCoarse) return;
    if (activeCard.current === i) { activeCard.current = null; resetCards(); }
    else { activeCard.current = i; liftCard(i); }
  };

  return (
    <section
      ref={sectionRef}
      id="gallery"
      className="relative w-full overflow-hidden py-36 md:py-44"
      style={{ backgroundColor: '#0d0d0d' }}
    >
      {/* Header */}
      <div className="relative text-center z-0 mb-4 px-8">
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase mb-5">
          <span className="text-[#D2FF00] tabular-nums">08</span>
          <span className="text-white/25"> / 10</span>
          <span className="text-white/40">&nbsp;&nbsp;OFF TRACK // MOMENTS</span>
        </p>
        <h2
          className="font-serif font-black uppercase leading-none"
          style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', letterSpacing: '-0.03em', lineHeight: '0.9', color: '#f0f0f0' }}
        >
          Moments
        </h2>
      </div>

      {/* Fan container — same fan on every device (tighter + smaller on touch) */}
      <div className={`relative w-full max-w-6xl mx-auto -mt-6 md:-mt-12 px-4 z-10 ${
        isCoarse ? 'h-[260px]' : 'h-[420px] sm:h-[495px] md:h-[405px]'
      }`}>
        {randomizedCards.map((card, i) => (
          <div
            key={card.id}
            ref={(el) => (cardRefs.current[i] = el)}
            className={`absolute left-1/2 bottom-0 rounded-2xl overflow-hidden cursor-pointer shadow-2xl group border border-white/[0.05] transition-transform duration-300 will-change-transform ${
              isCoarse ? 'w-[150px] h-[214px]' : 'w-[234px] sm:w-[288px] h-[342px] sm:h-[405px]'
            }`}
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={() => handleMouseLeave(i)}
            onClick={() => handleTap(i)}
          >
            <img
              src={card.src}
              alt={card.label}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              style={{ filter: 'contrast(1.1) saturate(1.2)' }}
              draggable={false}
            />

            {/* Specular highlight overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-white/10 via-transparent to-black/20" />

            {/* Label Gradient & Text */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400">
              <p className="text-white text-[10px] tracking-[0.3em] uppercase font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-400 ease-out">
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA — editorial hairline links */}
      <div className="mt-32 md:mt-44 px-8">
        <div className="mx-auto w-full max-w-xl border-t border-[#f0f0f0]/12">
          {[
            { href: '#rides',   label: 'View Rides',   index: '01', sub: 'Selected machines' },
            { href: '/archive', label: 'Full Archive', index: '02', sub: 'Every frame' },
          ].map(({ href, label, index, sub }) => (
            <a
              key={href}
              href={href}
              data-magnetic="cta"
              className="group relative block py-7 select-none"
            >
              {/* Hairline divider + lime sweep */}
              <span className="absolute bottom-0 left-0 h-px w-full bg-[#f0f0f0]/12" />
              <span className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-[#D2FF00] transition-transform duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />

              <span className="flex items-end justify-between gap-6">
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
