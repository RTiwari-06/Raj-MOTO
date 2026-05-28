import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useStore } from '../store/useStore';
import { useUIStore } from '../store/useUIStore';
import { EASE, DUR } from '../motion/system';

const LINKS = [
  { label: 'IGNITION',         href: '#'        },
  { label: 'MACHINE',          href: '#rides'   },
  { label: 'PIT LANE',         href: '#story'   },
  { label: 'TARMAC',           href: '#rides'   },
  { label: 'DROP COORDINATES', href: '#connect' },
];

const Navbar = () => {
  const navRef        = useRef(null);
  const setHovering   = useStore((state) => state.setHovering);
  // Boolean selector — Zustand only re-renders when the threshold is crossed,
  // not on every scroll frame.
  const scrolled      = useStore((state) => state.scroll > 24);
  const motionEnabled = useUIStore((state) => state.motionEnabled);
  const toggleMotion  = useUIStore((state) => state.toggleMotion);

  // GSAP entrance — unchanged
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
      className={`fixed top-0 left-0 w-full z-50 border-b border-white/5 transition-[background-color] duration-500 ${
        scrolled ? 'bg-black/40 backdrop-blur-md' : 'bg-transparent'
      }`}
      style={{ opacity: 0 }}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-10 md:px-20 py-5">

        {/* LEFT — identity */}
        <a
          href="#"
          data-magnetic
          className="justify-self-start font-serif leading-none text-[#D2FF00]"
          style={{ fontSize: '18px', letterSpacing: '-0.01em' }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          RT•MOTO
        </a>

        {/* CENTER — navigation (always in flow, never absolute) */}
        <ul className="hidden md:flex items-center gap-8 justify-self-center">
          {LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                data-magnetic
                className="text-[11px] tracking-[0.2em] uppercase text-white/50 hover:text-[#D2FF00] transition-colors duration-200 whitespace-nowrap"
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* RIGHT — system status (also the motion toggle — a11y preserved) */}
        <div className="justify-self-end">
          <button
            onClick={toggleMotion}
            data-magnetic
            aria-pressed={motionEnabled}
            aria-label={motionEnabled ? 'Motion on — click to reduce motion' : 'Motion paused — click to enable'}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/20 hover:text-[#D2FF00] transition-colors duration-200"
          >
            <span
              className="w-[5px] h-[5px] rounded-full transition-colors duration-200"
              style={{ backgroundColor: motionEnabled ? '#D2FF00' : 'rgba(255,255,255,0.2)' }}
            />
            {motionEnabled ? '[SYS.ONLINE]' : '[SYS.PAUSED]'}
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
