import React from 'react';

export default function Footer() {
  const year = new Date().getFullYear();

  const handleScrollContact = (e) => {
    e.preventDefault();
    const el = document.querySelector('#contact');
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <footer className="w-full bg-black border-t border-white/10 px-[var(--container-padding)] py-16">
      <div className="max-w-screen-xl mx-auto relative">

        {/* Centered, bold CTA */}
        <div className="flex justify-center">
          <a
            href="#contact"
            onClick={handleScrollContact}
            className="group inline-flex items-end gap-4 font-serif font-black uppercase leading-none text-white transition-colors duration-200 hover:text-[#D2FF00]"
            style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', letterSpacing: '-0.02em' }}
            aria-label="Drop a pin — contact"
          >
            DROP A PIN <span className="text-[#D2FF00]">//</span> CONTACT
            <span className="mb-2 text-2xl md:text-4xl transition-transform duration-300 group-hover:translate-x-2">→</span>
          </a>
        </div>

        {/* Minimal divider */}
        <div className="mt-10 h-px w-full bg-white/6" />

        {/* Bottom corner sign-off */}
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40 absolute right-4 bottom-3">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D2FF00] mr-2" style={{ animation: 'vfPulse 2.4s ease-in-out infinite' }} />
          Crafted for the streets. Engine running.
        </p>

      </div>
    </footer>
  );
}
