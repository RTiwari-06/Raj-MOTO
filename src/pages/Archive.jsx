import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MEDIA } from '@/data/media';
import { ArrowLeft, X, Cpu, Activity, Maximize2, Hash } from 'lucide-react';
import { scrambleText } from '@/utils/scramble';

gsap.registerPlugin(ScrollTrigger);

const ALL_ENTRIES = [...MEDIA.rides, ...MEDIA.rawArchive];

// Sequential strip spans — creating a rhythmic mechanical flow
const getGridSpan = (i) => {
  const spans = [
    'md:col-span-3', // Dominant Wide
    'md:col-span-1', // Technical Small
    'md:col-span-2', // Standard Wide
    'md:col-span-2', // Standard Wide
    'md:col-span-1', // Technical Small
    'md:col-span-3', // Dominant Wide
  ];
  return spans[i % spans.length];
};

const Archive = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [lightbox, setLightbox] = useState(null);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // ── LIVE CLOCK ──
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ── LIGHTBOX NAVIGATION ──
  const navigateLightbox = useCallback((dir) => {
    setLightbox((prev) => {
      if (!prev) return null;
      const idx = ALL_ENTRIES.findIndex((p) => (p.id || p.src) === (prev.id || prev.src));
      const nextIdx = (idx + dir + ALL_ENTRIES.length) % ALL_ENTRIES.length;
      return ALL_ENTRIES[nextIdx];
    });
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (!lightbox) return;
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') navigateLightbox(1);
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox, navigateLightbox]);

  // ── SCROLL ORCHESTRATION ──
  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray('.grid-item');
      
      // Title Entrance
      gsap.fromTo('.archive-hero-title', 
        { y: 100, opacity: 0, skewY: 5 },
        { y: 0, opacity: 1, skewY: 0, duration: 1.5, ease: 'expo.out', delay: 0.2 }
      );

      // Grid Entrance: Sequential Shutter
      gsap.fromTo(items, 
        { clipPath: 'inset(100% 0% 0% 0%)', y: 50 },
        { 
          clipPath: 'inset(0% 0% 0% 0%)', 
          y: 0, 
          duration: 1.2, 
          stagger: 0.1, 
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.grid-container',
            start: 'top 80%',
          }
        }
      );

      // Deep Parallax
      items.forEach(item => {
        const img = item.querySelector('img');
        gsap.to(img, {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-canvas-deep text-[#F5F5F5] selection:bg-accent selection:text-black pb-40 overflow-x-hidden">
      <div className="grain-layer opacity-[0.03] pointer-events-none" />

      {/* ── PERMANENT STATUS BAR (TOP) ── */}
      <div className="fixed top-0 left-0 w-full z-[100] px-6 md:px-12 py-8 flex items-center justify-between mix-blend-difference pointer-events-none font-mono">
        <div className="pointer-events-auto flex gap-6">
          <button onClick={() => navigate('/')} className="group flex items-center gap-3 text-fg-muted hover:text-white transition-colors">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[9px] uppercase tracking-[0.4em]">Main_Terminal</span>
          </button>
          <button onClick={() => navigate('/#machine')} className="group flex items-center gap-3 text-machine/60 hover:text-machine transition-colors">
            <Cpu size={14} />
            <span className="text-[9px] uppercase tracking-[0.4em]">Machine_Core</span>
          </button>
        </div>
        
        <div className="hidden md:flex items-center gap-12 text-[9px] tracking-[0.3em] uppercase opacity-20">
          <div className="flex items-center gap-3"><Hash size={10} /> <span>Node_082</span></div>
          <div className="flex items-center gap-3"><Activity size={10} /> <span>UTC_{time}</span></div>
        </div>
      </div>

      {/* ── SECTION 01: CINEMATIC COVER ── */}
      <header className="relative w-full flex flex-col items-center justify-center text-center px-6 pt-[20vh] mb-[15vh]">
        <div className="archive-hero-title">
          <div className="flex items-center justify-center gap-3 mb-6 font-mono text-[10px] tracking-[0.6em] uppercase text-accent-soft">
             <div className="w-1.5 h-1.5 bg-accent animate-pulse rounded-full" />
             <span>Accessing_Visual_Logs</span>
          </div>
          <div className="relative inline-block border-2 border-accent bg-canvas-deep px-10 py-8 md:px-16 md:py-12 mb-8 shadow-[0_0_40px_var(--color-accent-dim)]">
             <div className="absolute inset-0 opacity-20 bg-[linear-gradient(var(--color-accent-soft)_1px,transparent_1px),linear-gradient(90deg,var(--color-accent-soft)_1px,transparent_1px)] bg-[size:24px_24px]" />
             <h1 className="relative z-10 font-serif font-black italic text-7xl md:text-[14vw] leading-[0.75] tracking-tighter uppercase text-white drop-shadow-md">
               Grid_<br />Archive
             </h1>
          </div>
          <div className="flex flex-col items-center gap-4 opacity-20">
             <div className="w-px h-24 bg-white" />
             <span className="font-mono text-[8px] tracking-[0.5em] uppercase">Scroll_to_initiate</span>
          </div>
        </div>
      </header>

      {/* ── SECTION 02: LINEAR STRIP GRID ── */}
      <main className="grid-container relative px-6 md:px-12 max-w-[2200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {ALL_ENTRIES.map((entry, idx) => (
            <div 
              key={entry.id || idx}
              className={`grid-item group relative overflow-hidden bg-canvas border border-line-subtle cursor-pointer ${getGridSpan(idx)}`}
              onClick={() => setLightbox(entry)}
              onMouseEnter={(e) => {
                const text = e.currentTarget.querySelector('.scramble-target');
                if (text) scrambleText(text);
              }}
            >
              {/* IMAGE STRIP */}
              <div className="relative aspect-video overflow-hidden pointer-events-none">
                <img
                  src={entry.src}
                  alt={entry.model}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center filter grayscale brightness-50 contrast-125 transition-all duration-[1200ms] ease-out group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-[1.08]"
                />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute inset-0 bg-transparent group-hover:bg-accent-wash transition-colors duration-1000" />
                
                {/* Telemetry Index */}
                <div className="absolute top-6 left-8 font-mono text-[9px] tracking-[0.4em] uppercase text-fg-muted flex items-center gap-3">
                  <span className="text-accent-soft">//</span>
                  <span>SYS_{String(idx + 1).padStart(3, '0')}</span>
                </div>
              </div>

              {/* INFO BAR */}
              <div className="flex items-center justify-between p-6 bg-black/40 backdrop-blur-md border-t border-line-subtle transition-colors duration-500 group-hover:bg-accent-wash group-hover:border-accent-dim">
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[7px] tracking-[0.4em] uppercase text-accent-mid opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
                    Data_Verification_Success
                  </span>
                  <h3 className="scramble-target font-serif font-black italic uppercase text-xl md:text-3xl tracking-tighter leading-none text-fg group-hover:text-white">
                    {entry.model || `Sector_Log_${idx}`}
                  </h3>
                </div>
                
                <div className="flex items-center gap-8 opacity-20 group-hover:opacity-100 transition-opacity">
                   <div className="flex flex-col items-end font-mono text-[8px] tracking-[0.3em] uppercase">
                      <span className="text-fg-muted mb-1">Season</span>
                      <span className="text-white">{entry.year || '2026'}</span>
                   </div>
                   <div className="w-12 h-12 rounded-full border border-line flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-black transition-all">
                      <Maximize2 size={14} />
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div 
          className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-6 md:p-12 animate-in fade-in zoom-in-95 duration-700"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-12 right-12 text-fg-muted hover:text-accent transition-colors p-4" onClick={() => setLightbox(null)}>
            <X size={32} strokeWidth={1} />
          </button>

          <div className="relative w-full max-w-7xl h-full flex flex-col justify-between items-center p-8" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full flex-1 flex items-center justify-center min-h-0 mb-8">
              <div className="relative group overflow-hidden border border-line-subtle bg-black/50 w-full h-full flex items-center justify-center">
                <img src={lightbox.src} alt={lightbox.model} className="w-full max-h-[65vh] object-contain opacity-0 animate-in fade-in duration-1000 delay-200" onLoad={(e) => e.currentTarget.classList.remove('opacity-0')} />
                <div className="absolute inset-0 pointer-events-none border-[1px] border-line-subtle opacity-10" />
              </div>
            </div>

            <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-12 border-t border-line pt-8 shrink-0">
              <div className="max-w-3xl">
                <span className="font-mono text-[10px] tracking-[0.8em] uppercase text-accent mb-6 flex items-center gap-4">
                  <span className="w-2 h-2 bg-accent animate-pulse rounded-full" />
                  LOG_DATA_FEED // NODE_{ALL_ENTRIES.indexOf(lightbox).toString().padStart(3, '0')}
                </span>
                <h2 className="font-serif font-black italic uppercase text-6xl md:text-[8vw] text-white tracking-tighter leading-[0.7]">{lightbox.model}</h2>
              </div>
              
              <div className="flex gap-4">
                 <button onClick={() => navigateLightbox(-1)} className="w-16 h-16 border border-line flex items-center justify-center hover:bg-accent hover:text-black transition-all duration-700 text-xl group"><span className="group-hover:-translate-x-1 transition-transform">←</span></button>
                 <button onClick={() => navigateLightbox(1)} className="w-16 h-16 border border-line flex items-center justify-center hover:bg-accent hover:text-black transition-all duration-700 text-xl group"><span className="group-hover:translate-x-1 transition-transform">→</span></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="relative z-10 mt-40 px-6 md:px-12 py-10 flex justify-between items-center border-t border-line-subtle font-mono text-[8px] tracking-[0.5em] uppercase opacity-20 pointer-events-none">
        <span>RT•MOTO // CORE_ARCHIVE</span>
        <span className="hidden md:inline">Processing: 60FPS // No_Signal_Loss</span>
        <span>©2026_Terminal_Secure</span>
      </footer>
    </div>
  );
};

export default Archive;
