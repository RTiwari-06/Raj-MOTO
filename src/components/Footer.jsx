export default function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { label: 'GitHub',    href: '#' },
    { label: 'LinkedIn',  href: '#' },
    { label: 'Instagram', href: '#' },
  ];

  return (
    <footer className="relative w-full bg-black border-t border-[rgba(210,255,0,0.08)] px-6 md:px-16 py-6">

      {/* Top hairline accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D2FF00]/20 to-transparent" />

      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

        {/* Left — system identifier */}
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/30">
          <span className="text-[#D2FF00]/50">[SYS]</span>
          &nbsp;RT•MOTO // RAJ TIWARI // {year}
        </p>

        {/* Center — system status */}
        <div className="flex items-center gap-2.5 order-3 md:order-2">
          <span
            className="w-[6px] h-[6px] rounded-full bg-[#D2FF00]/60"
            style={{ animation: 'vfPulse 2.4s ease-in-out infinite' }}
          />
          <p className="font-mono text-[9px] font-black uppercase tracking-[0.45em] text-white/20">
            SYSTEM&nbsp;:&nbsp;NOMINAL
          </p>
        </div>

        {/* Right — channels + coords */}
        <div className="flex items-center gap-6 order-2 md:order-3">
          {links.map((s) => (
            <a
              key={s.label}
              href={s.href}
              data-magnetic
              target={s.href.startsWith('http') ? '_blank' : undefined}
              rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 hover:text-[#D2FF00] transition-colors"
              style={{ transitionDuration: '80ms' }}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

    </footer>
  );
}
