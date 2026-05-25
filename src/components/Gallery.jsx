import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MEDIA } from '../data/media';
import { EASE, DUR, STAGGER, ST } from '../motion/system';

const PHOTOS = MEDIA.gallery;

export default function GallerySection() {
  const sectionRef    = useRef(null);
  const headerRef     = useRef(null);
  const gridRef       = useRef(null);
  const lightboxRef   = useRef(null);
  const cursorRef     = useRef(null);

  const [hovered,    setHovered]    = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lightbox,   setLightbox]   = useState(null);
  const lightboxIndex = lightbox ? PHOTOS.findIndex((p) => p.id === lightbox.id) : -1;

  // Scroll entry
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
        { y: 50, opacity: 0, scale: 0.97 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: DUR.standard, ease: EASE.momentum, stagger: STAGGER.cards,
          scrollTrigger: { trigger: gridRef.current, start: ST.start.late, once: true },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Lightbox entrance
  useEffect(() => {
    if (lightbox && lightboxRef.current) {
      gsap.fromTo(lightboxRef.current,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: DUR.fast, ease: EASE.precision },
      );
    }
  }, [lightbox]);

  const navigate = useCallback((dir) => {
    setLightbox((prev) => {
      if (!prev) return null;
      const idx  = PHOTOS.findIndex((p) => p.id === prev.id);
      const next = (idx + dir + PHOTOS.length) % PHOTOS.length;
      return PHOTOS[next];
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

  // Floating VIEW/DRAG cursor
  const xTo = useRef(null);
  const yTo = useRef(null);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;
    xTo.current = gsap.quickTo(el, 'x', { duration: 0.3, ease: 'power3.out' });
    yTo.current = gsap.quickTo(el, 'y', { duration: 0.3, ease: 'power3.out' });

    const onMove = (e) => { xTo.current(e.clientX); yTo.current(e.clientY); };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section id="gallery" ref={sectionRef} className="relative w-full bg-black py-32 px-6 md:px-16 border-t border-white/5">

      {/* Floating cursor label */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 z-[9997] pointer-events-none transition-opacity duration-200"
        style={{ opacity: hovered ? 1 : 0, transform: 'translate(-50%, -50%)' }}
      >
        <div
          className="px-3 py-1.5 text-[9px] font-black label-spaced uppercase"
          style={{
            border:         '1px solid rgba(210,255,0,0.8)',
            color:          '#D2FF00',
            background:     'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            transform:      isDragging ? 'scale(0.88)' : 'scale(1)',
            transition:     'transform 0.15s ease',
          }}
        >
          {isDragging ? '[ DRAG ]' : '[ VIEW ]'}
        </div>
      </div>

      {/* Header */}
      <div ref={headerRef} className="mb-16 opacity-0">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-accent text-[9px] font-black label-spaced">[ + ]</span>
          <p className="text-[9px] label-spaced uppercase font-black text-accent">
            R T • M O T O &nbsp;// &nbsp; V I S U A L &nbsp; A R C H I V E
          </p>
        </div>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <h2 className="text-[12vw] md:text-[7vw] font-black uppercase tracking-tighter leading-none text-light">Gallery</h2>
          <p className="text-muted text-sm max-w-xs text-right leading-relaxed">
            Click any image to expand. Use ← → keys to navigate.
          </p>
        </div>
      </div>

      {/* Masonry grid */}
      <div
        ref={gridRef}
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '280px' }}
      >
        {PHOTOS.map((photo) => {
          const isHov = hovered === photo.id;
          return (
            <div
              key={photo.id}
              data-magnetic="image"
              className={`grid-cell relative overflow-hidden opacity-0 ${photo.span}`}
              style={{ borderRadius: '2px' }}
              onMouseEnter={() => setHovered(photo.id)}
              onMouseLeave={() => { setHovered(null); setIsDragging(false); }}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onClick={() => setLightbox(photo)}
            >
              <img
                src={photo.src}
                alt={photo.label}
                className="w-full h-full object-cover transition-transform duration-700 ease-out"
                style={{ transform: isHov ? 'scale(1.07)' : 'scale(1)' }}
                loading="lazy"
              />

              <div
                className="absolute inset-0 transition-opacity duration-400"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
                  opacity:    isHov ? 1 : 0.4,
                }}
              />

              {isHov && ['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos) => (
                <span key={pos} className={`absolute ${pos} text-[8px] font-black text-accent/60 pointer-events-none select-none`}>
                  [ + ]
                </span>
              ))}

              <span
                className="absolute top-4 left-4 text-[8px] font-black label-spaced uppercase px-2.5 py-1 transition-opacity duration-300"
                style={{
                  background: 'rgba(210,255,0,0.15)',
                  border:     '1px solid rgba(210,255,0,0.3)',
                  color:      '#D2FF00',
                  opacity:    isHov ? 1 : 0,
                }}
              >
                {photo.category}
              </span>

              <div
                className="absolute bottom-0 left-0 right-0 p-5 transition-transform duration-400"
                style={{ transform: isHov ? 'translateY(0)' : 'translateY(8px)' }}
              >
                <p className="text-white text-xs font-black label-spaced uppercase">{photo.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <div
            ref={lightboxRef}
            className="relative max-w-5xl max-h-[90vh] w-full mx-6"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.src}
              alt={lightbox.label}
              className="w-full max-h-[85vh] object-contain"
              style={{ borderRadius: '2px' }}
            />
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-[9px] label-spaced uppercase font-bold text-accent">{lightbox.category}</p>
                <p className="text-light font-black text-lg tracking-tight">{lightbox.label}</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  data-magnetic
                  className="w-9 h-9 border border-white/20 hover:border-accent hover:text-accent flex items-center justify-center text-white/60 transition-all duration-200 text-sm font-bold"
                  onClick={() => navigate(-1)}
                >←</button>
                <span className="text-[9px] label-spaced uppercase font-bold text-muted">
                  {lightboxIndex + 1} / {PHOTOS.length}
                </span>
                <button
                  data-magnetic
                  className="w-9 h-9 border border-white/20 hover:border-accent hover:text-accent flex items-center justify-center text-white/60 transition-all duration-200 text-sm font-bold"
                  onClick={() => navigate(1)}
                >→</button>
                <button
                  data-magnetic
                  className="text-[10px] label-spaced uppercase font-bold text-muted hover:text-light transition-colors ml-4"
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
