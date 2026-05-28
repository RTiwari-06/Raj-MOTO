import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DUR, ST } from '../motion/system';

const SOCIALS = [
  { label: 'GitHub',    href: '#' },
  { label: 'LinkedIn',  href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'Twitter',   href: '#' },
];

const CONTACT_EMAIL = 'raj@rtmoto.dev';

export default function ContactSection() {
  const sectionRef  = useRef(null);
  const headerRef   = useRef(null);
  const formRef     = useRef(null);
  const socialsRef  = useRef(null);
  const inputRef    = useRef(null);

  const [inputValue, setInputValue]   = useState('');
  const [submitted,  setSubmitted]    = useState(false);
  const [blink,      setBlink]        = useState(true);
  const [focused,    setFocused]      = useState(false);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: DUR.standard, ease: EASE.precision,
          scrollTrigger: { trigger: headerRef.current, start: ST.start.section, once: true },
        }
      );
      gsap.fromTo(formRef.current,
        { y: 45, opacity: 0 },
        {
          y: 0, opacity: 1, duration: DUR.standard, ease: EASE.precision, delay: 0.15,
          scrollTrigger: { trigger: formRef.current, start: ST.start.section, once: true },
        }
      );
      gsap.fromTo(socialsRef.current,
        { y: 35, opacity: 0 },
        {
          y: 0, opacity: 1, duration: DUR.standard, ease: EASE.precision, delay: 0.25,
          scrollTrigger: { trigger: socialsRef.current, start: ST.start.section, once: true },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setSubmitted(true);
    // Route through mailto with the message content
    const mailto = `mailto:${CONTACT_EMAIL}?subject=TRANSMISSION&body=${encodeURIComponent(inputValue)}`;
    window.location.href = mailto;
    setTimeout(() => {
      setSubmitted(false);
      setInputValue('');
    }, 3000);
  };

  return (
    <section
      id="connect"
      ref={sectionRef}
      className="relative w-full bg-black min-h-screen flex items-center px-6 md:px-16 py-32 border-t border-white/5 overflow-hidden"
    >
      {/* Hairline grid background */}
      <div className="absolute inset-0 pointer-events-none hairline-grid opacity-70" />

      <div className="max-w-screen-xl mx-auto relative z-10 w-full">

        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <div ref={headerRef} className="opacity-0 mb-16 md:mb-20">

          <div className="w-[60px] h-[2px] bg-[#D2FF00] mb-8" />

          <p className="font-mono text-[10px] font-black uppercase tracking-[0.45em] text-white/30 mb-10">
            DROP COORDINATES &nbsp;//&nbsp; 2026
          </p>

          <h2
            className="font-serif font-black uppercase leading-none"
            style={{ fontSize: 'clamp(3rem, 10vw, 8.5rem)', letterSpacing: '-0.03em', lineHeight: '0.9', color: '#D2FF00' }}
          >
            LET'S
          </h2>
          <h2
            className="font-serif font-black uppercase text-white leading-none"
            style={{ fontSize: 'clamp(3rem, 10vw, 8.5rem)', letterSpacing: '-0.03em', lineHeight: '0.9' }}
          >
            BUILD.
          </h2>

          <p className="font-sans font-light text-white/40 max-w-lg mt-10" style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.05rem)', lineHeight: '1.7' }}>
            For collaborations, opportunities, or conversations worth having.
          </p>
        </div>

        {/* ── TERMINAL INPUT ──────────────────────────────────────────────────── */}
        <div ref={formRef} className="opacity-0 mb-20 md:mb-28">

          <p className="font-mono text-[9px] font-black uppercase tracking-[0.45em] text-white/30 mb-4">
            ESTABLISH LINK &nbsp;//&nbsp; ENTER TRANSMISSION
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-2xl">

            {/* Terminal prompt row */}
            <div
              className="flex items-center w-full border-b"
              style={{
                borderColor: focused ? '#D2FF00' : 'rgba(255,255,255,0.12)',
                transition: 'border-color 120ms ease',
              }}
            >
              <span className="font-mono text-[#D2FF00]/70 text-sm mr-3 shrink-0">&gt;_</span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Drop the coordinates for the next mission..."
                className="flex-1 bg-transparent font-mono text-white text-sm py-4 outline-none placeholder:text-white/20"
                style={{ letterSpacing: '0.02em', caretColor: '#D2FF00' }}
                disabled={submitted}
              />
              {/* Blink cursor when focused + empty */}
              {focused && !inputValue && (
                <span
                  className="inline-block w-[2px] h-[1em] bg-[#D2FF00] shrink-0"
                  style={{ opacity: blink ? 1 : 0, transition: 'opacity 60ms' }}
                />
              )}
            </div>

            {/* Transmission status */}
            {submitted && (
              <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#D2FF00] mt-3">
                &gt; SIGNAL TRANSMITTED. STANDING BY...
              </p>
            )}

            {/* CTA row */}
            <div className="flex items-center gap-6 mt-8">
              <button
                type="submit"
                data-magnetic="cta"
                className="group inline-flex items-center gap-4 px-9 py-5 text-[11px] font-black uppercase tracking-[0.4em] bg-[#D2FF00] text-black hover:bg-white transition-colors duration-[80ms]"
                style={{ borderRadius: '0px' }}
              >
                <span>TRANSMIT</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/30 hover:text-[#D2FF00] transition-colors"
                style={{ transitionDuration: '80ms' }}
              >
                or direct: {CONTACT_EMAIL}
              </a>
            </div>
          </form>
        </div>

        {/* ── SIGNAL CHANNELS ─────────────────────────────────────────────────── */}
        <div ref={socialsRef} className="opacity-0">

          <div className="flex items-center gap-5 mb-8">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.45em] text-white/25">
              SIGNAL CHANNELS //
            </p>
            <div className="h-px flex-1 bg-white/5 max-w-[180px]" />
          </div>

          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                data-magnetic
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group relative font-serif font-black uppercase text-white transition-colors hover:text-[#D2FF00]"
                style={{
                  fontSize: 'clamp(1.1rem, 1.8vw, 1.5rem)',
                  letterSpacing: '-0.01em',
                  transitionDuration: '80ms',
                }}
              >
                {s.label}
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#D2FF00] group-hover:w-full"
                  style={{ transition: 'width 80ms cubic-bezier(0.16,1,0.3,1)' }} />
              </a>
            ))}
          </div>

          {/* Signal status footer */}
          <div className="flex items-center gap-6 mt-16 pt-10 border-t border-white/5">
            <div className="flex items-center gap-3">
              <span
                className="w-2 h-2 rounded-full bg-[#D2FF00]"
                style={{ animation: 'vfPulse 2.4s ease-in-out infinite' }}
              />
              <p className="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-white/40">
                SIGNAL&nbsp;:&nbsp;OPEN
              </p>
            </div>
            <div className="h-px flex-1 bg-white/5 max-w-[200px]" />
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-white/25">
              LATENCY&nbsp;:&nbsp;&lt;48H
            </p>
          </div>
        </div>
      </div>

    </section>
  );
}
