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
  const wrapRef  = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const wrap  = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    // Core Linear Engine — xPercent loop is immune to font-load / resize width
    // changes (content is rendered twice, so -50% is exactly one sequence).
    const tween = gsap.to(track, {
      xPercent: -50,
      duration: 40,
      ease: 'none',
      repeat: -1,
      paused: true,
      force3D: true,
    });

    // The tween only runs while the marquee is on screen AND motion is enabled —
    // an always-on infinite tween keeps the GSAP ticker (and the compositor)
    // busy for the whole session, which drains mobile devices.
    let inView = false;
    const sync = () => {
      if (inView && useUIStore.getState().motionEnabled) tween.play();
      else tween.pause();
    };

    // Kinetic Inertia Physics Engine — quickTo reuses a single damping tween
    // instead of allocating a new one on every scroll event.
    const velocityProxy = { scale: 1 };
    const setScale = gsap.quickTo(velocityProxy, 'scale', {
      duration: 0.5,
      ease: 'power2.out',
      onUpdate: () => tween.timeScale(velocityProxy.scale),
    });

    const st = ScrollTrigger.create({
      trigger: wrap,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        inView = self.isActive;
        sync();
      },
      // Only fires while the marquee is between start/end — no global handler.
      onUpdate: (self) => {
        const scrollVelocity = self.getVelocity();
        setScale(1 + Math.min(Math.abs(scrollVelocity) * 0.0008, 3.0));
      },
    });

    inView = st.isActive;
    sync();

    const unsub = useUIStore.subscribe(sync);

    return () => {
      unsub();
      st.kill();
      tween.kill();
      gsap.set(track, { clearProps: 'transform' });
    };
  }, []);

  const textColor = dark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(20, 25, 19, 0.3)';

  return (
    <div
      ref={wrapRef}
      className="w-full overflow-hidden py-4 select-none relative z-30 bg-transparent border-t border-b"
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
