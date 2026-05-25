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
  const navRef         = useRef(null);
  const setHovering    = useStore((state) => state.setHovering);
  const motionEnabled  = useUIStore((state) => state.motionEnabled);
  const toggleMotion   = useUIStore((state) => state.toggleMotion);

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
      <div className="max-w-screen-2xl mx-auto px-8 md:px-16 py-6 flex items-center justify-between">

        {/* Logo */}
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
          <span className="hidden md:block text-[8px] font-bold tracking-[0.25em] uppercase text-white/25 leading-none mb-[3px] ml-2">
            // 2026
          </span>
        </a>

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-10">
          {LINKS.map(({ label, subLabel, href, gear }) => (
            <li key={label} className="relative">
              <a
                href={href}
                data-magnetic
                className="group relative flex flex-col items-start text-[10px] font-semibold uppercase tracking-[0.2em] text-light/60 hover:text-light transition-colors"
                style={{ transitionDuration: '120ms' }}
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
              >
                {/* Gear indicator — appears above on hover */}
                <span
                  className="block text-[7px] font-black tracking-[0.4em] uppercase mb-[3px]"
                  style={{
                    color: '#D2FF00',
                    opacity: 0,
                    transform: 'translateY(6px)',
                    transition: 'opacity 80ms ease, transform 80ms ease',
                  }}
                  ref={(el) => {
                    if (!el) return;
                    const parent = el.parentElement;
                    const onEnter = () => {
                      el.style.opacity = '0.7';
                      el.style.transform = 'translateY(0)';
                    };
                    const onLeave = () => {
                      el.style.opacity = '0';
                      el.style.transform = 'translateY(6px)';
                    };
                    parent.addEventListener('mouseenter', onEnter);
                    parent.addEventListener('mouseleave', onLeave);
                  }}
                >
                  {gear}
                </span>

                {/* Label */}
                <span>{label}</span>

                {/* Sub-label — visible on hover */}
                <span
                  className="block text-[7px] font-mono font-normal tracking-[0.3em] mt-[3px]"
                  style={{
                    color: 'rgba(210,255,0,0.45)',
                    opacity: 0,
                    transform: 'translateY(-4px)',
                    transition: 'opacity 80ms ease, transform 80ms ease',
                  }}
                  ref={(el) => {
                    if (!el) return;
                    const parent = el.parentElement;
                    const onEnter = () => {
                      el.style.opacity = '1';
                      el.style.transform = 'translateY(0)';
                    };
                    const onLeave = () => {
                      el.style.opacity = '0';
                      el.style.transform = 'translateY(-4px)';
                    };
                    parent.addEventListener('mouseenter', onEnter);
                    parent.addEventListener('mouseleave', onLeave);
                  }}
                >
                  {subLabel}
                </span>

                {/* Gear-shift underline */}
                <span
                  className="block h-[1px] mt-[3px] w-full"
                  style={{
                    backgroundColor: '#D2FF00',
                    clipPath: 'inset(0 100% 0 0)',
                    transition: 'clip-path 80ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  ref={(el) => {
                    if (!el) return;
                    const parent = el.closest('a');
                    if (!parent) return;
                    const show = () => (el.style.clipPath = 'inset(0 0% 0 0)');
                    const hide = () => (el.style.clipPath = 'inset(0 100% 0 0)');
                    parent.addEventListener('mouseenter', show);
                    parent.addEventListener('mouseleave', hide);
                  }}
                />
              </a>
            </li>
          ))}
        </ul>

        {/* Right — MOTION toggle + SYSTEM CONTROL */}
        <div className="hidden lg:flex items-center gap-5">

          {/* MOTION toggle */}
          <button
            onClick={toggleMotion}
            data-magnetic
            className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.35em] transition-colors"
            style={{
              color: motionEnabled ? '#D2FF00' : 'rgba(255,255,255,0.25)',
              transitionDuration: '80ms',
            }}
          >
            <span
              className="w-[5px] h-[5px] rounded-full"
              style={{
                backgroundColor: motionEnabled ? '#D2FF00' : 'rgba(255,255,255,0.2)',
                transition: 'background-color 80ms',
              }}
            />
            {motionEnabled ? '[MOTION: ON]' : '[MOTION: OFF]'}
          </button>

          <div className="w-px h-4 bg-white/10" />

          <div className="flex items-center gap-3">
            <div
              className="w-[5px] h-[5px] rounded-full bg-[#D2FF00]/60"
              style={{ animation: 'vfPulse 2.4s ease-in-out infinite' }}
            />
            <span className="font-mono text-[8px] uppercase tracking-[0.38em] text-white/25">
              SYSTEM CONTROL
            </span>
          </div>

        </div>

      </div>
    </nav>
  );
};

export default Navbar;
