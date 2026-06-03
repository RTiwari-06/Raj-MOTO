import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MEDIA } from '@/data/media';
import { EASE, DUR, STAGGER, ST } from '@/motion/system';
import { SectionHeader } from '@/components/ui/SectionHeader';

const PHOTOS = MEDIA.gallery;

export default function GallerySection() {
  const sectionRef = useRef(null);
  const headerRef  = useRef(null);
  const gridRef    = useRef(null);
  const cursorRef  = useRef(null);

  const [hovered,  setHovered]  = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const hoveredPhoto = PHOTOS.find((p) => p.id === hovered);
  const lightboxIndex = lightbox ? PHOTOS.findIndex((p) => p.id === lightbox.id) : -1;

  // Entrance + scroll parallax
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: DUR.considered, ease: EASE.momentum,
          scrollTrigger: { trigger: headerRef.current, start: ST.start.early, once: true },
        },
      );

      const cells = gridRef.current.querySelectorAll('.grid-cell');
      gsap.fromTo(cells,
        { y: 60, opacity: 0, scale: 0.97 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: DUR.standard, ease: EASE.precision, stagger: STAGGER.cards,
          scrollTrigger: { trigger: gridRef.current, start: ST.start.late, once: true },
        },
      );

      // Parallax momentum — over-scaled image wrapper drifts on scroll.
      gsap.utils.toArray(cells).forEach((cell, i) => {
        const wrap = cell.querySelector('.gallery-parallax');
        if (!wrap) return;
        gsap.fromTo(wrap,
          { yPercent: i % 2 === 0 ? -8 : 8 },
          {
            yPercent: i % 2 === 0 ? 8 : -8,
            ease: EASE.scrub,
            scrollTrigger: { trigger: cell, start: 'top bottom', end: 'bottom top', scrub: ST.scrub.standard },
          },
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Lightbox entrance
  useEffect(() => {
    if (lightbox && document.querySelector('.gallery-lightbox-inner')) {
      gsap.fromTo('.gallery-lightbox-inner',
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: DUR.fast, ease: EASE.precision },
      );
    }
  }, [lightbox]);

  const navigate = useCallback((dir) => {
    setLightbox((prev) => {
      if (!prev) return null;
      const idx = PHOTOS.findIndex((p) => p.id === prev.id);
      return PHOTOS[(idx + dir + PHOTOS.length) % PHOTOS.length];
    });
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')     setLightbox(null);
      if (e.key === 'ArrowRight') navigate(1);
      if (e.key === 'ArrowLeft')  navigate(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  // Floating VIEW // location cursor
  const xTo = useRef(null);
  const yTo = useRef(null);
  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;
    xTo.current = gsap.quickTo(el, 'x', { duration: DUR.fast, ease: EASE.momentum });
    yTo.current = gsap.quickTo(el, 'y', { duration: DUR.fast, ease: EASE.momentum });
    const onMove = (e) => { xTo.current(e.clientX); yTo.current(e.clientY); };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="relative w-full bg-[#0a0a0a] py-28 md:py-36 px-6 md:px-16 border-t border-white/5 overflow-hidden"
    >
      <div className="grain-layer" />

      {/* Floating VIEW cursor */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 z-[9997] pointer-events-none transition-opacity duration-200"
        style={{ opacity: hovered ? 1 : 0, transform: 'translate(-50%, -50%)' }}
      >
        <div
          className="px-3.5 py-2 text-[9px] font-black tracking-[0.3em] uppercase whitespace-nowrap"
          style={{ background: '#D2FF00', color: '#0a0a0a' }}
        >
          VIEW {hoveredPhoto ? `// ${hoveredPhoto.location}` : ''}
        </div>
      </div>

      <div className="relative max-w-screen-2xl mx-auto">

        {/* Header */}
        <div ref={headerRef} className="mb-12 md:mb-16 opacity-0">
          <SectionHeader index="12" kicker="VISUAL ARCHIVE" readout="THE FULL LIFESTYLE" className="mb-8 max-w-3xl" />
          <h2
            className="font-serif font-black uppercase leading-none"
            style={{ fontSize: 'clamp(2.6rem, 8vw, 8rem)', letterSpacing: '-0.04em', lineHeight: '0.86' }}
          >
            <span className="block" style={{ color: '#D2FF00' }}>VISUAL</span>
            <span className="block text-white">ARCHIVE</span>
          </h2>
        </div>

        {/* Editorial masonry */}
        <div
          ref={gridRef}
          className="grid gap-3 md:gap-4"
          style={{
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridAutoRows: 'clamp(160px, 21vw, 300px)',
            gridAutoFlow: 'dense',
          }}
        >
          {PHOTOS.map((photo) => (
            <div
              key={photo.id}
              data-magnetic="image"
              className={`grid-cell group relative overflow-hidden cursor-none opacity-0 bg-[#0d0d0d] ${photo.span}`}
              onMouseEnter={() => setHovered(photo.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setLightbox(photo)}
            >
              {/* Placeholder behind (shows for unshot tiles) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                <span className="font-mono text-[8px] tracking-[0.35em] text-white/20">NO FEED</span>
                <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#D2FF00]/50">{photo.label}</span>
              </div>

              {/* Parallax wrapper + image (hover scale 1.05 over 0.6s) */}
              <div className="gallery-parallax absolute inset-[-10%] will-change-transform">
                <img
                  src={photo.src}
                  alt={photo.label}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className="w-full h-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  loading="lazy"
                  draggable={false}
                />
              </div>

              {/* Editorial gradient + label — clean by default, richer on hover */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.05) 55%, transparent 100%)',
                  opacity: hovered === photo.id ? 1 : 0.55,
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 pointer-events-none">
                <span
                  className="font-mono text-[8px] tracking-[0.35em] uppercase text-[#D2FF00]/80 block mb-1.5 transition-opacity duration-300"
                  style={{ opacity: hovered === photo.id ? 1 : 0.6 }}
                >
                  {photo.category}
                </span>
                <p
                  className="font-serif font-black uppercase text-white leading-none transition-transform duration-400"
                  style={{
                    fontSize: 'clamp(1rem, 1.8vw, 1.7rem)',
                    letterSpacing: '-0.02em',
                    transform: hovered === photo.id ? 'translateY(0)' : 'translateY(6px)',
                  }}
                >
                  {photo.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <div
            className="gallery-lightbox-inner relative max-w-5xl max-h-[90vh] w-full mx-6"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.src}
              alt={lightbox.label}
              className="w-full max-h-[82vh] object-contain"
              style={{ borderRadius: '2px' }}
            />
            <div className="flex items-center justify-between mt-5 border-t border-white/10 pt-4">
              <div>
                <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#D2FF00] mb-1">
                  {lightbox.category} · {lightbox.location}
                </p>
                <p className="font-serif font-black uppercase text-white text-2xl leading-none tracking-tight">
                  {lightbox.label}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  data-magnetic
                  className="w-9 h-9 border border-white/20 hover:border-[#D2FF00] hover:text-[#D2FF00] flex items-center justify-center text-white/60 transition-all duration-200 text-sm font-bold"
                  onClick={() => navigate(-1)}
                  aria-label="Previous"
                >←</button>
                <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-white/40 tabular-nums">
                  {String(lightboxIndex + 1).padStart(2, '0')} / {String(PHOTOS.length).padStart(2, '0')}
                </span>
                <button
                  data-magnetic
                  className="w-9 h-9 border border-white/20 hover:border-[#D2FF00] hover:text-[#D2FF00] flex items-center justify-center text-white/60 transition-all duration-200 text-sm font-bold"
                  onClick={() => navigate(1)}
                  aria-label="Next"
                >→</button>
                <button
                  data-magnetic
                  className="font-mono text-[10px] tracking-[0.2em] uppercase font-bold text-white/40 hover:text-white transition-colors ml-3"
                  onClick={() => setLightbox(null)}
                >Close ✕</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
