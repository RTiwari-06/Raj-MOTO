import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MEDIA } from '@/data/media';
import { ArrowLeft } from 'lucide-react';
import { RevealText } from '@/components/ui/RevealText';
import { DUR, EASE, STAGGER, ST } from '@/motion/system';

gsap.registerPlugin(ScrollTrigger);

const Archive = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Cards pop in dynamically as they scroll into view (row-batched stagger).
      gsap.set('.archive-item', { opacity: 0, y: 48, scale: 0.92 });
      ScrollTrigger.batch('.archive-item', {
        start: ST.start.early,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: DUR.standard,
            stagger: STAGGER.cards,
            ease: EASE.precision,
            overwrite: true,
          }),
      });
      // Recalculate trigger positions after images reserve their space.
      ScrollTrigger.refresh();
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-20 md:px-12">
      <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <button 
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold tracking-widest uppercase">Back to Pit Lane</span>
          </button>
          
          <RevealText 
            text="Visual Archive" 
            className="text-[12vw] md:text-[8vw] font-black leading-none tracking-tighter"
          />
          <p className="text-white/40 max-w-md mt-6 text-sm leading-relaxed uppercase tracking-widest">
            A comprehensive log of motion, machines, and the culture that drives them.
            Telemetry data and visual proof.
          </p>
        </div>
        
        <div className="flex gap-12 text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 border-t border-white/10 pt-4">
          <div>
            <div className="text-white mb-1">Total Logs</div>
            <div>{MEDIA.rides.length + 9} Entries</div>
          </div>
          <div>
            <div className="text-white mb-1">Status</div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live Feed
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Render existing rides first */}
        {MEDIA.rides.map((ride, idx) => (
          <div 
            key={ride.id} 
            className="archive-item group relative aspect-[4/5] overflow-hidden bg-white/5 border border-white/10"
          >
            <img 
              src={ride.src} 
              alt={ride.model} 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-[transform,filter] duration-700 ease-out will-change-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <span className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">{ride.category}</span>
              <h3 className="text-2xl font-black mt-1 leading-none">{ride.model}</h3>
            </div>
            <div className="absolute top-6 right-6 text-[10px] font-mono text-white/30">
              [ LOG_{idx.toString().padStart(3, '0')} ]
            </div>
          </div>
        ))}

        {/* Add the "Raw" gallery images */}
        {MEDIA.rawArchive.map((item, idx) => (
          <div 
            key={item.id} 
            className="archive-item group relative aspect-[4/5] overflow-hidden bg-white/5 border border-white/10"
          >
            <img 
              src={item.src} 
              alt="Raw archive" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-[transform,filter] duration-700 ease-out will-change-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">{item.category}</span>
              <h3 className="text-2xl font-black mt-1 leading-none">SNAPSHOT_{idx}</h3>
            </div>
          </div>
        ))}
      </div>
      
      <footer className="mt-40 pt-20 border-t border-white/5 flex justify-between items-center text-[10px] font-bold tracking-[0.3em] uppercase text-white/20">
        <div>RT•MOTO // VISUAL INTELLIGENCE</div>
        <div>STAY IN MOTION</div>
      </footer>
    </div>
  );
};

export default Archive;
