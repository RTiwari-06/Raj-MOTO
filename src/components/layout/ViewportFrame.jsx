import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { useUIStore } from '@/store/useUIStore';

export default function ViewportFrame() {
  const depthRef = useRef(null);
  const setScrollDepth = useUIStore.getState().setScrollDepth;

  useEffect(() => {
    const unsub = useStore.subscribe((state) => {
      if (!depthRef.current) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.round((state.scroll / max) * 100) : 0;
      depthRef.current.textContent = `${String(pct).padStart(3, '0')}%`;
      setScrollDepth(pct);
    });
    return () => unsub();
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9900]"
      aria-hidden="true"
    >
      {/* Hairline perimeter border */}
      <div className="absolute inset-3 border border-[rgba(210,255,0,0.07)]" />

      {/* ── CORNER CROSSHAIRS ──────────────────────────────────────────────── */}
      {/* Top-left */}
      <div className="absolute top-3 left-3 w-5 h-5">
        <div className="absolute top-0 left-0 w-full h-px bg-[#D2FF00]/25" />
        <div className="absolute top-0 left-0 w-px h-full bg-[#D2FF00]/25" />
      </div>
      {/* Top-right */}
      <div className="absolute top-3 right-3 w-5 h-5">
        <div className="absolute top-0 right-0 w-full h-px bg-[#D2FF00]/25" />
        <div className="absolute top-0 right-0 w-px h-full bg-[#D2FF00]/25" />
      </div>
      {/* Bottom-left */}
      <div className="absolute bottom-3 left-3 w-5 h-5">
        <div className="absolute bottom-0 left-0 w-full h-px bg-[#D2FF00]/25" />
        <div className="absolute bottom-0 left-0 w-px h-full bg-[#D2FF00]/25" />
      </div>
      {/* Bottom-right */}
      <div className="absolute bottom-3 right-3 w-5 h-5">
        <div className="absolute bottom-0 right-0 w-full h-px bg-[#D2FF00]/25" />
        <div className="absolute bottom-0 right-0 w-px h-full bg-[#D2FF00]/25" />
      </div>

      {/* ── TOP STATUS STRIP ───────────────────────────────────────────────── */}
      <div className="absolute top-3 left-8 right-8 flex items-center justify-between">
        <span className="font-mono text-[8px] uppercase tracking-[0.38em] text-white/18">
          RT•MOTO
        </span>
        <div className="flex items-center gap-2">
          <span
            className="w-[5px] h-[5px] rounded-full bg-[#D2FF00]/55"
            style={{ animation: 'vfPulse 2.4s ease-in-out infinite' }}
          />
          <span className="font-mono text-[8px] uppercase tracking-[0.38em] text-white/18">
            SYSTEM&nbsp;:&nbsp;NOMINAL
          </span>
        </div>
      </div>

      {/* ── BOTTOM STATUS STRIP ────────────────────────────────────────────── */}
      <div className="absolute bottom-3 left-8 right-8 flex items-center justify-between">
        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/12">
          12.9716°N &nbsp;·&nbsp; 77.5946°E
        </span>
        <span
          ref={depthRef}
          className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/12"
        >
          000%
        </span>
      </div>

    </div>
  );
}
