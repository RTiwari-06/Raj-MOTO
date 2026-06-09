import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useUIStore } from '@/store/useUIStore';

const BRANDS = [
  'RALPH LAUREN',
  'MIND',
  'PLAYSTATION',
  'QUADRANT',
  'TUMI',
  'HILTON',
  'UBER',
  'LN KART',
  'BELL HELMETS',
  'PURE ELECTRIC',
  'GOOGLE'
];

export default function TextMarquee({ dark = true }) {
  const trackRef = useRef(null);
  const tweenRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const totalWidth = track.scrollWidth / 2;

    // Core Linear Engine
    tweenRef.current = gsap.to(track, {
      x: -totalWidth,
      duration: 40,
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
    <div
      className="w-full overflow-hidden py-4 select-none relative z-30 mix-blend-screen bg-transparent border-t border-b"
      style={{
        borderColor: dark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.06)',
      }}
    >
      <div 
        ref={trackRef} 
        className="flex flex-row flex-nowrap items-center whitespace-nowrap will-change-transform"
      >
        {/* Render sequence twice for seamless loop */}
        {[...BRANDS, ...BRANDS].map((brand, i) => (
          <div 
            key={i} 
            className="flex-shrink-0 flex flex-row items-center justify-start flex-nowrap"
            style={{ color: textColor }}
          >
            <span className="font-sans font-black text-xl md:text-3xl lg:text-[2vw] uppercase tracking-tighter px-8 md:px-12 transition-colors duration-300 hover:text-[#D7F700]">
              {brand}
            </span>
            <span className="text-[10px] md:text-xs font-mono font-medium tracking-normal opacity-40 px-4 md:px-6">
              //
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
