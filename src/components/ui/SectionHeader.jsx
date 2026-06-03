// TELEMETRY DECK — shared instrument header.
// Replaces the legacy `w-[60px] h-[2px]` eyebrow across sections. Renders a
// numbered section index, a kicker label, an optional right-side telemetry
// readout, and a lime tick-ruler. Purely presentational — no motion, no refs
// required — so it drops into any section (including GSAP-wired ones) safely.
export function SectionHeader({
  index,
  total = '14',
  kicker,
  readout,
  className = '',
  panning = false,   // opt-in: tick ruler pans continuously (telemetry feed)
}) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-end justify-between gap-6">
        <div className="flex items-baseline gap-3 md:gap-4">
          <span className="font-mono text-[10px] md:text-[11px] tracking-[0.25em] text-[#D2FF00] tabular-nums">
            {index}
            <span className="text-white/25"> / {total}</span>
          </span>
          <span className="font-mono text-[9px] md:text-[10px] tracking-[0.35em] uppercase text-white/45">
            {kicker}
          </span>
        </div>

        {readout && (
          <span className="hidden sm:block font-mono text-[9px] tracking-[0.3em] uppercase text-white/30 text-right leading-relaxed">
            {readout}
          </span>
        )}
      </div>

      <div className={`tick-rule tick-rule--accent ${panning ? 'tick-rule--scroll' : ''} mt-3`} aria-hidden="true" />
    </div>
  );
}

export default SectionHeader;
