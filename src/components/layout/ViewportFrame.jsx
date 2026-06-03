// Fixed viewport chrome — hairline perimeter border + corner crosshairs.
// (The top/bottom telemetry status strips were removed: the top strip's
// "RT•MOTO" doubled the real navbar logo and read as a glitch on every page.)
export default function ViewportFrame() {
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
    </div>
  );
}
