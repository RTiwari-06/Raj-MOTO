import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useStore } from '../store/useStore';
import { useUIStore } from '../store/useUIStore';
import { EASE, DUR } from '../motion/system';

const LINKS = [
  { label: 'IGNITION',         subLabel: '[ ABOUT ]',      href: '#',        gear: '1ST' },
  { label: 'MACHINE',          subLabel: '[ RIDES ]',      href: '#rides',   gear: '2ND' },
  { label: 'PIT LANE',         subLabel: '[ EXPERIENCE ]', href: '#story',   gear: '3RD' },
  { label: 'TARMAC',           subLabel: '[ WORK ]',       href: '#rides',   gear: '4TH' },
  { label: 'DROP COORDINATES', subLabel: '[ CONTACT ]',    href: '#connect', gear: '5TH' },
];

const Navbar = () => {
  const navRef        = useRef(null);
  const setHovering   = useStore((state) => state.setHovering);
  const motionEnabled = useUIStore((state) => state.motionEnabled);
  const toggleMotion  = useUIStore((state) => state.toggleMotion);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(navRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: DUR.considered, ease: EASE.precision, delay: 0.4 },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 w-full z-50 mix-blend-difference"
      style={{ opacity: 0 }}
    >
      <div className="max-w-screen-2xl mx-auto px-10 md:px-20 py-6 flex items-center justify-between">

        {/* Logo — single clean identity, no clutter */}
        <a
          href="#"
          data-magnetic
          className="flex items-end gap-[2px] leading-none"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <span className="text-light text-xl font-black tracking-tight uppercase">RT</span>
          <span className="text-lg font-black leading-none mb-[1px]" style={{ color: '#D2FF00' }}>•</span>
          <span className="text-light text-xl font-black tracking-tight uppercase">MOTO</span>
        </a>

        {/* Nav links — CSS-only hover states, no event listener leaks */}
        <ul className="hidden md:flex items-center gap-10">
          {LINKS.map(({ label, subLabel, href, gear }) => (
            <li key={label}>
              <a
                href={href}
                data-magnetic
                className="group relative flex flex-col items-start text-[10px] font-semibold uppercase tracking-[0.2em] text-light/60 hover:text-light transition-colors duration-[120ms]"
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
              >
                {/* Gear indicator — appears above on hover */}
                <span className="block text-[7px] font-black tracking-[0.4em] uppercase mb-[3px] text-[#D2FF00] opacity-0 translate-y-1.5 group-hover:opacity-70 group-hover:translate-y-0 transition-all duration-[80ms] ease-out">
                  {gear}
                </span>

                <span>{label}</span>

                {/* Sub-label — visible on hover */}
                <span className="block text-[7px] font-mono font-normal tracking-[0.3em] mt-[3px] text-[#D2FF00]/45 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-[80ms] ease-out">
                  {subLabel}
                </span>

                {/* Gear-shift underline */}
                <span className="block h-[1px] mt-[3px] w-full bg-[#D2FF00] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-[80ms] ease-out" />
              </a>
            </li>
          ))}
        </ul>

        {/* Right — motion toggle only, no redundant labels */}
        <div className="hidden lg:flex items-center">
          <button
            onClick={toggleMotion}
            data-magnetic
            className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.35em] transition-colors duration-[80ms]"
            style={{ color: motionEnabled ? '#D2FF00' : 'rgba(255,255,255,0.25)' }}
          >
            <span
              className="w-[5px] h-[5px] rounded-full transition-colors duration-[80ms]"
              style={{ backgroundColor: motionEnabled ? '#D2FF00' : 'rgba(255,255,255,0.2)' }}
            />
            {motionEnabled ? '[MOTION: ON]' : '[MOTION: OFF]'}
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
