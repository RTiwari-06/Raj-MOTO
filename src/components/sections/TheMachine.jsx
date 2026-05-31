// THE MACHINE — specs & telemetry. Two-column: stark machine portrait + data.
const SPECS = ['SINGLE-CYLINDER.', '30 HORSES.', 'AGGRESSIVE GEOMETRY.'];

const LOG = [
  { k: 'Bloodline',      v: 'Motul 7100' },
  { k: 'Stopping Power', v: 'ByBre Pads' },
  { k: 'Upgrades',       v: 'TFT Display Calibration' },
];

const CORNERS = ['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'];

export default function TheMachine() {
  return (
    <section
      id="machine"
      className="relative w-full bg-[#0a0a0a] border-t border-white/5 px-6 md:px-16 py-28 md:py-36"
    >
      <div className="max-w-screen-xl mx-auto">

        {/* Eyebrow / title */}
        <div className="mb-14 md:mb-20">
          <div className="w-[60px] h-[2px] bg-[#D2FF00] mb-6" />
          <h2
            className="font-serif font-black uppercase leading-none"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 5rem)', letterSpacing: '-0.03em', lineHeight: '0.9' }}
          >
            <span style={{ color: '#D2FF00' }}>THE</span> <span className="text-white">MACHINE</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

          {/* LEFT — stark, high-contrast machine portrait */}
          <div className="relative aspect-[4/5] overflow-hidden bg-black">
            <img
              src="/moto-night-helmet.webp"
              alt="KTM Duke 250 BS6"
              className="w-full h-full object-cover"
              style={{ filter: 'grayscale(1) contrast(1.35) brightness(0.9)' }}
              loading="lazy"
            />
            {/* Corner registration marks */}
            {CORNERS.map((pos) => {
              const isR = pos.includes('right');
              const isB = pos.includes('bottom');
              return (
                <div key={pos} className={`absolute ${pos} w-6 h-6 pointer-events-none`} aria-hidden="true">
                  <div className={`absolute ${isB ? 'bottom-0' : 'top-0'} ${isR ? 'right-0' : 'left-0'} w-full h-px bg-[#D2FF00]/40`} />
                  <div className={`absolute ${isB ? 'bottom-0' : 'top-0'} ${isR ? 'right-0' : 'left-0'} w-px h-full bg-[#D2FF00]/40`} />
                </div>
              );
            })}
            {/* Machine tag */}
            <div className="absolute bottom-5 left-5 font-mono text-[9px] tracking-[0.3em] uppercase text-[#D2FF00]">
              KTM DUKE 250 BS6
            </div>
          </div>

          {/* RIGHT — data-driven specs + maintenance log */}
          <div>
            <div className="space-y-1">
              {SPECS.map((s) => (
                <p
                  key={s}
                  className="font-serif font-black uppercase text-white"
                  style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3.5rem)', letterSpacing: '-0.02em', lineHeight: '0.98' }}
                >
                  {s}
                </p>
              ))}
            </div>

            {/* Maintenance log */}
            <div className="mt-12 pt-10 border-t border-white/10">
              <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-[#D2FF00] mb-6">
                // MAINTENANCE LOG
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/[0.08] border border-white/[0.08]">
                {LOG.map((item) => (
                  <div key={item.k} className="bg-[#0f0f0f] p-5">
                    <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/35 mb-2">
                      {item.k}
                    </p>
                    <p className="text-white text-sm font-semibold leading-snug">
                      {item.v}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
