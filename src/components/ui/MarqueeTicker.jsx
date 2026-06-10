import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useUIStore } from '@/store/useUIStore';

// Premium high-end minimalist brand vector paths matching the RT-MOTO aesthetic
const LOGOS = [
  {
    name: 'KTM',
    svg: (
      <svg className="h-4 w-auto fill-current tracking-tighter" viewBox="0 0 80 25" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="21" fontSize="22" fontWeight="900" letterSpacing="-1">KTM</text>
      </svg>
    )
  },
  {
    name: 'WP SUSPENSION',
    svg: (
      <svg className="h-3.5 w-auto fill-current tracking-widest" viewBox="0 0 120 20" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="15" fontSize="14" fontWeight="900" letterSpacing="4">WP // SUSP</text>
      </svg>
    )
  },
  {
    name: 'BYBRE',
    svg: (
      <svg className="h-4 w-auto fill-current" viewBox="0 0 110 25" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 2h12c4 0 6 2 6 5s-2 4-4 5c3 1 5 3 5 6 0 4-3 7-8 7H10V2zm4 4v5h7c1.5 0 2.5-.5 2.5-2.5S22.5 6 21 6h-7zm0 9v6h8c1.5 0 2.5-.5 2.5-2.5s-1-3.5-2.5-3.5h-8zM45 2l5 9 5-9h5L52 14v11h-4V14L40 2h5z" />
      </svg>
    )
  },
  {
    name: 'BOSCH',
    svg: (
      <svg className="h-3.5 w-auto fill-current" viewBox="0 0 100 25" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 2h12c3.5 0 6 2 6 5.5 0 2.5-1.5 4.5-4 5 3 .5 5 2.5 5 5.5 0 4-3.5 6-7 6H5V2zm4 4v5h8c1.5 0 2.5-1 2.5-2.5S18.5 6 17 6H9zm0 9v6h9c1.5 0 2.5-1 2.5-2.5S19.5 15 18 15H9z" />
      </svg>
    )
  },
  {
    name: 'METZELER',
    svg: (
      <svg className="h-3 w-auto fill-current" viewBox="0 0 140 20" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="15" fontSize="13" fontWeight="900" letterSpacing="5">METZELER</text>
      </svg>
    )
  }
];

export default function MarqueeTicker({ dark = true }) {
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
      duration: 35,
      ease: 'none',
      repeat: -1,
      paused: true,
      force3D: true,
    });

    // The tween only runs while the ticker is on screen AND motion is enabled —
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
      // Only fires while the ticker is between start/end — no global handler.
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
      className="w-full overflow-hidden py-3.5 border-t border-b select-none relative z-30"
      style={{
        backgroundColor: 'transparent',
        borderColor: dark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.06)',
      }}
    >
      <div
        ref={trackRef}
        className="flex flex-row flex-nowrap items-center whitespace-nowrap will-change-transform"
      >
        {/* Render sequence twice for seamless loop */}
        {[...LOGOS, ...LOGOS].map((brand, i) => (
          <div
            key={i}
            className="flex-shrink-0 flex flex-row items-center justify-start flex-nowrap"
            style={{ color: textColor }}
          >
            <div className="px-8 transition-colors duration-300 hover:text-[#D7F700]">
              {brand.svg}
            </div>
            <span className="text-[10px] font-mono font-medium tracking-normal opacity-40 px-4">
              //
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
