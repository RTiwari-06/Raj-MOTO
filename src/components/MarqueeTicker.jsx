import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useUIStore } from '../store/useUIStore';

const ITEMS = [
  'RT•MOTO', '·', 'DUKE 250', '·',
  'BENGALURU', '·', 'MOTION', '·',
  'RT•MOTO', '·', 'DUKE 250', '·',
  'BENGALURU', '·', 'MOTION', '·',
];

export default function MarqueeTicker({ dark = true }) {
  const trackRef  = useRef(null);
  const tweenRef  = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const totalWidth = track.scrollWidth / 2;

    tweenRef.current = gsap.to(track, {
      x: -totalWidth,
      duration: 55,
      ease: 'none',
      repeat: -1,
    });

    let prevVelocity = 0;
    const velocityTrigger = ScrollTrigger.create({
      onUpdate: (self) => {
        const v = self.getVelocity();
        const targetScale = 1 + Math.min(Math.abs(v) * 0.0012, 2.5);
        prevVelocity = gsap.utils.interpolate(prevVelocity, targetScale, 0.1);
        if (tweenRef.current) tweenRef.current.timeScale(prevVelocity);
      },
    });

    // Sync initial motion state
    const motionEnabled = useUIStore.getState().motionEnabled;
    if (!motionEnabled && tweenRef.current) tweenRef.current.timeScale(0);

    return () => {
      if (tweenRef.current) tweenRef.current.kill();
      velocityTrigger.kill();
    };
  }, []);

  // Subscribe to motionEnabled changes
  useEffect(() => {
    const unsub = useUIStore.subscribe((state) => {
      if (!tweenRef.current) return;
      if (!state.motionEnabled) {
        tweenRef.current.timeScale(0);
      } else {
        tweenRef.current.timeScale(1);
      }
    });
    return () => unsub();
  }, []);

  const bg   = dark ? '#111112' : '#f2f0e8';
  const text = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)';

  return (
    <div
      className="w-full overflow-hidden py-4 border-t border-b"
      style={{
        backgroundColor: bg,
        borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)',
      }}
    >
      <div ref={trackRef} className="flex items-center whitespace-nowrap will-change-transform">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span
            key={i}
            className="text-[10px] font-black uppercase px-8 label-spaced"
            style={{ color: item === '·' ? '#D2FF00' : text }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
