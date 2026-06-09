import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useUIStore } from '@/store/useUIStore';

// Authentic partner data with original brand color schemas and SVG logos.
const PARTNERS = [
  { 
    name: 'KTM', color: '#FF6600',
    svg: <svg viewBox="0 0 80 25" className="h-5 md:h-7 w-auto fill-current tracking-tighter" xmlns="http://www.w3.org/2000/svg"><text x="0" y="21" fontSize="22" className="font-sans font-black" letterSpacing="-1">KTM</text></svg>
  },
  { 
    name: 'WP SUSPENSION', color: '#FFFFFF',
    svg: <svg viewBox="0 0 260 30" className="h-[2.5vh] min-h-[22px] md:min-h-[28px] w-auto fill-current" xmlns="http://www.w3.org/2000/svg"><text x="0" y="24" fontSize="28" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">WP SUSPENSION</text></svg>
  },
  { 
    name: 'BREMBO', color: '#ED1C24',
    svg: <svg viewBox="0 0 160 30" className="h-[2.5vh] min-h-[22px] md:min-h-[28px] w-auto fill-current" xmlns="http://www.w3.org/2000/svg"><text x="0" y="24" fontSize="28" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">BREMBO</text></svg>
  },
  { 
    name: 'BOSCH', color: '#E20015',
    svg: <svg viewBox="0 0 130 30" className="h-[2.5vh] min-h-[22px] md:min-h-[28px] w-auto fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M5 2h12c3.5 0 6 2 6 5.5 0 2.5-1.5 4.5-4 5 3 .5 5 2.5 5 5.5 0 4-3.5 6-7 6H5V2zm4 4v5h8c1.5 0 2.5-1 2.5-2.5S18.5 6 17 6H9zm0 9v6h9c1.5 0 2.5-1 2.5-2.5S19.5 15 18 15H9z" /><text x="35" y="24" fontSize="26" fontWeight="900" fontFamily="sans-serif">OSCH</text></svg>
  },
  { 
    name: 'METZELER', color: '#0054A6',
    svg: <svg viewBox="0 0 180 30" className="h-[2.5vh] min-h-[20px] md:min-h-[24px] w-auto fill-current" xmlns="http://www.w3.org/2000/svg"><text x="0" y="24" fontSize="28" fontWeight="900" fontFamily="sans-serif" letterSpacing="4">METZELER</text></svg>
  },
  { 
    name: 'AKRAPOVIČ', color: '#E3000F',
    svg: <svg viewBox="0 0 220 30" className="h-[2.5vh] min-h-[22px] md:min-h-[28px] w-auto fill-current" xmlns="http://www.w3.org/2000/svg"><text x="0" y="24" fontSize="28" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">AKRAPOVIČ</text></svg>
  },
  { 
    name: 'MICHELIN', color: '#27509B',
    svg: <svg viewBox="0 0 180 30" className="h-[2.5vh] min-h-[22px] md:min-h-[28px] w-auto fill-current" xmlns="http://www.w3.org/2000/svg"><text x="0" y="24" fontSize="28" fontWeight="900" fontFamily="sans-serif" fontStyle="italic" letterSpacing="2">MICHELIN</text></svg>
  },
  { 
    name: 'MOTOREX', color: '#00994A',
    svg: <svg viewBox="0 0 180 30" className="h-[2.5vh] min-h-[22px] md:min-h-[28px] w-auto fill-current" xmlns="http://www.w3.org/2000/svg"><text x="0" y="24" fontSize="28" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">MOTOREX</text></svg>
  },
  { 
    name: 'PIRELLI', color: '#D31245',
    svg: <svg viewBox="0 0 160 30" className="h-[2.5vh] min-h-[22px] md:min-h-[28px] w-auto fill-current" xmlns="http://www.w3.org/2000/svg"><text x="0" y="24" fontSize="28" fontWeight="900" fontFamily="sans-serif" letterSpacing="3">PIRELLI</text></svg>
  },
  { 
    name: 'ÖHLINS', color: '#FFD700',
    svg: <svg viewBox="0 0 160 30" className="h-[2.5vh] min-h-[22px] md:min-h-[28px] w-auto fill-current" xmlns="http://www.w3.org/2000/svg"><text x="0" y="24" fontSize="28" fontWeight="900" fontFamily="sans-serif" letterSpacing="2">ÖHLINS</text></svg>
  },
  { 
    name: 'ALPINESTARS', color: '#FFFFFF',
    svg: <svg viewBox="0 0 240 30" className="h-[2.5vh] min-h-[22px] md:min-h-[28px] w-auto fill-current" xmlns="http://www.w3.org/2000/svg"><text x="0" y="24" fontSize="28" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">ALPINESTARS</text></svg>
  },
  { 
    name: 'RED BULL', color: '#DB0A40',
    svg: <svg viewBox="0 0 180 30" className="h-[2.5vh] min-h-[22px] md:min-h-[28px] w-auto fill-current" xmlns="http://www.w3.org/2000/svg"><text x="0" y="24" fontSize="28" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">RED BULL</text></svg>
  },
];

export default function PartnersSection({ dark = true }) {
  const trackRef = useRef(null);
  const tweenRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const totalWidth = track.scrollWidth / 2;

    // Core Linear Engine
    tweenRef.current = gsap.to(track, {
      x: -totalWidth,
      duration: 45, 
      ease: 'none',
      repeat: -1,
      force3D: true,
    });

    // Kinetic Inertia Physics Engine
    let velocityProxy = { scale: 1 };
    
    const velocityTrigger = ScrollTrigger.create({
      onUpdate: (self) => {
        const scrollVelocity = self.getVelocity();
        const targetScale = 1 + Math.min(Math.abs(scrollVelocity) * 0.0008, 3.0);

        gsap.to(velocityProxy, {
          scale: targetScale,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto',
          onUpdate: () => {
            if (tweenRef.current) {
              tweenRef.current.timeScale(velocityProxy.scale);
            }
          }
        });
      },
    });

    const motionEnabled = useUIStore.getState().motionEnabled;
    if (!motionEnabled && tweenRef.current) tweenRef.current.timeScale(0);

    return () => {
      if (tweenRef.current) tweenRef.current.kill();
      if (velocityTrigger) velocityTrigger.kill();
    };
  }, []);

  useEffect(() => {
    const unsub = useUIStore.subscribe((state) => {
      if (!tweenRef.current) return;
      gsap.to(tweenRef.current, {
        timeScale: state.motionEnabled ? 1 : 0,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
    return () => unsub();
  }, []);

  const textColor = dark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(20, 25, 19, 0.3)';

  return (
    <section
      className="w-full overflow-hidden py-6 select-none relative z-30 mix-blend-screen bg-transparent border-t border-b"
      style={{
        borderColor: dark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.06)',
      }}
    >
      <div 
        ref={trackRef} 
        className="flex flex-row flex-nowrap items-center whitespace-nowrap will-change-transform"
      >
        {/* Render sequence twice for seamless loop */}
        {[1, 2].map((group) => (
          <div key={group} className="flex flex-row items-center flex-nowrap flex-shrink-0">
            {PARTNERS.map((p, i) => (
              <div 
                key={`${group}-${i}`} 
                className="group flex-shrink-0 flex flex-row items-center justify-start flex-nowrap px-8 md:px-12 cursor-crosshair"
              >
                <span 
                  className="opacity-[0.25] transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-[1.05]"
                  style={{ color: p.color, filter: `drop-shadow(0 0 24px ${p.color}66)` }}
                >
                  {p.svg}
                </span>
                <span 
                  className="text-[10px] md:text-xs font-mono font-medium tracking-normal opacity-40 px-8 md:px-12" 
                  style={{ color: textColor }}
                >
                  //
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
