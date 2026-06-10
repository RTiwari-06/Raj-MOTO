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

  // Calculate the base structural transforms for the fan-out layout
  const baseTransforms = randomizedCards.map((_, i) => {
    // Dynamic normalized index mapping (e.g. for 6 cards: -2.5, -1.5, -0.5, 0.5, 1.5, 2.5)
    const normalizedIndex = i - (randomizedCards.length - 1) / 2;
    
    return {
      xPercent: -50 + (normalizedIndex * 35), // Slightly tighter offset to fit 6 cards comfortably
      y: Math.abs(normalizedIndex) * 14.4,    // Parabolic downward arc (scaled down 10% from 16)
      rotate: normalizedIndex * 8,            // Progressive Z-rotation
      zIndex: Math.floor(50 - Math.abs(normalizedIndex) * 10) // Center is highest, falling off to flanks
    };
  });

  useEffect(() => {
    // Desktop only — mobile uses native CSS scroll snap
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    if (isMobile) {
      gsap.set(cardRefs.current, { clearProps: 'all' });
      return;
    }

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

  const handleMouseEnter = (i) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const t = baseTransforms[i];
    
    // Animate the hovered card upward and scale it
    gsap.to(cardRefs.current[i], {
      scale: 1.06,
      rotate: t.rotate * 0.2, // Slightly reduce rotation for readability
      y: t.y - 36,            // Lift upward relative to its fan position (scaled down 10% from 40)
      zIndex: 50,             // Temporarily maximize z-index
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    });

    // Dim the surrounding cards
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

  const handleMouseLeave = (i) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const t = baseTransforms[i];
    
    // Revert the hovered card to its exact calculated base transform
    gsap.to(cardRefs.current[i], {
      scale: 1,
      rotate: t.rotate,
      y: t.y,
      zIndex: t.zIndex,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    });

    // Restore surrounding cards
    randomizedCards.forEach((_, j) => {
      gsap.to(cardRefs.current[j], {
        filter: 'brightness(1) grayscale(0)',
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden py-36 md:py-44"
      style={{ backgroundColor: '#0d0d0d' }}
    >
      {/* Header */}
      <div className="relative text-center z-0 mb-4 px-8">
        <div className="w-[60px] h-[2px] bg-[#D2FF00] mx-auto mb-6" />
        <p className="text-[9px] tracking-[0.45em] uppercase font-bold mb-4" style={{ color: '#9a9a9a' }}>
          OFF TRACK
        </p>
        <h2
          className="font-serif font-black uppercase leading-none"
          style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', letterSpacing: '-0.03em', lineHeight: '0.9', color: '#f0f0f0' }}
        >
          Moments
        </h2>
      </div>

      {/* Mathematical Fan / Mobile Slider Container */}
      <div className="relative w-full max-w-6xl mx-auto md:h-[405px] sm:h-[495px] -mt-6 md:-mt-12 px-4 z-10 
                      flex md:block overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar pb-12 md:pb-0">
        {randomizedCards.map((card, i) => (
          <div
            key={card.id}
            ref={(el) => (cardRefs.current[i] = el)}
            className="flex-shrink-0 md:absolute left-1/2 bottom-0 w-[234px] sm:w-[288px] h-[342px] sm:h-[405px] 
                       rounded-2xl overflow-hidden cursor-pointer shadow-2xl group border border-white/[0.05]
                       snap-center mx-3 md:mx-0 first:ml-8 last:mr-8 md:first:ml-0 md:last:mr-0
                       transition-transform duration-300 will-change-transform"
            style={{ 
              transform: window.matchMedia('(pointer: coarse)').matches ? (i % 2 === 0 ? 'rotate(1deg)' : 'rotate(-1deg)') : undefined 
            }}
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={() => handleMouseLeave(i)}
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
            { href: '#gallery', label: 'Full Gallery', index: '02', sub: 'Every frame' },
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
