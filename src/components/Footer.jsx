export default function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { label: 'LinkedIn', href: '#' },
    { label: 'GitHub',   href: '#' },
    { label: 'Twitter',  href: '#' },
  ];

  return (
    <footer className="w-full bg-black border-t border-white/10 px-[var(--container-padding)] py-6">
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Left — copyright */}
        <p className="text-[12px] text-white/30">
          © {year} Raj Tiwari
        </p>

        {/* Right — channels */}
        <div className="flex items-center gap-6">
          {links.map((s) => (
            <a
              key={s.label}
              href={s.href}
              data-magnetic
              className="text-[12px] text-white/30 hover:text-[#D2FF00] transition-colors duration-200"
            >
              {s.label}
            </a>
          ))}
        </div>

      </div>
    </footer>
  );
}
