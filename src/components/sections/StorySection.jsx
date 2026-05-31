import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DUR, ST, STAGGER } from '@/motion/system';
import { MEDIA } from '@/data/media';

const EVOLUTION_DATA = [
  {
    year: '2022',
    title: 'First Line',
    machine: 'HTML / CSS / JS',
    detail: 'Late nights. Stack Overflow. The first working page. Signal received.',
  },
  {
    year: '2023',
    title: 'React Era',
    machine: 'React · Node.js · Git',
    detail: 'First full-stack project. First deployment. First time a stranger used something I built.',
  },
  {
    year: '2024',
    title: 'Motion Obsessed',
    machine: 'GSAP · Three.js · WebGL',
    detail: 'Discovered GSAP. Then Three.js. Then shaders. The screen became a racetrack.',
  },
  {
    year: '2026',
    title: 'RT•MOTO',
    machine: 'React · Vite · GSAP · R3F',
    detail: 'The platform. Every technique mastered to date. Every ride that shaped the discipline.',
  },
];

export default function StorySection() {
  const sectionRef = useRef(null);
  const headerRef  = useRef(null);
  const cardRefs   = useRef([]);
  const videoRef   = useRef(null);
  const [active, setActive] = useState(false); // cursor hovering → bring footage forward

  // Only play the background loop while the section is in view — saves CPU/battery
  // and avoids decoding video the visitor never reaches.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {}); // autoplay can reject if not yet allowed
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );

    io.observe(video);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: DUR.standard, ease: EASE.precision,
          scrollTrigger: { trigger: headerRef.current, start: ST.start.section, once: true },
        }
      );

      cardRefs.current.forEach((el, i) => {
        gsap.fromTo(el,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: DUR.standard, ease: EASE.precision, delay: i * STAGGER.elements,
            scrollTrigger: { trigger: el, start: ST.start.section, once: true },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="story"
      ref={sectionRef}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className="relative w-full bg-darker py-32 md:py-40 px-6 md:px-16 overflow-hidden border-t border-white/5"
    >

      {/* ── Background field footage — muted GoPro loop. Dim by default; the cursor
             brings it forward (bright) while the text retreats left to reveal it. ── */}
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity:    active ? 0.92 : 0.2,
            transform:  active ? 'scale(1.04)' : 'scale(1)',
            transition: 'opacity 700ms ease, transform 1200ms cubic-bezier(0.16,1,0.3,1)',
          }}
          poster={MEDIA.showcase.poster}
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={MEDIA.showcase.webm} type="video/webm" />
          <source src={MEDIA.showcase.mp4} type="video/mp4" />
        </video>
        {/* Dark wash — lifts on hover so the footage reads bright */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(8,8,8,1)',
            opacity:    active ? 0.28 : 0.62,
            transition: 'opacity 700ms ease',
          }}
        />
        {/* Edge vignette — keeps the slid-aside text crisp */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(8,8,8,0.85) 100%)' }}
        />
        {/* Footage label — quiet field-recording marker, bottom-right */}
        <span className="absolute bottom-6 right-6 font-mono text-[8px] tracking-[0.3em] uppercase text-accent/30">
          {MEDIA.showcase.label}
        </span>
      </div>

      {/* Hover affordance — fades out once the footage is playing forward */}
      <span
        className="absolute top-8 right-8 z-20 font-mono text-[8px] tracking-[0.35em] uppercase text-accent/50 pointer-events-none flex items-center gap-2"
        style={{ opacity: active ? 0 : 1, transition: 'opacity 400ms ease' }}
      >
        <span className="inline-block w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-accent/60" />
        HOVER TO PLAY
      </span>

      <div
        className="relative z-10 max-w-screen-xl mx-auto"
        style={{
          transform:       active ? 'translateX(-6%) scale(0.82)' : 'translateX(0) scale(1)',
          transformOrigin: 'left center',
          transition:      'transform 800ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >

        <div ref={headerRef} className="mb-16 opacity-0 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-accent text-[9px] font-black label-spaced">[ + ]</span>
              <p className="text-[9px] label-spaced uppercase font-black text-accent">
                R A J &nbsp;//&nbsp; 2 0 2 2 — 2 0 2 6
              </p>
            </div>
            <h2 className="font-serif font-black uppercase leading-none" style={{ fontSize: 'clamp(2.5rem, 6vw, 6rem)', letterSpacing: '-0.03em', lineHeight: '0.9' }}>
              <span className="block" style={{ color: '#D2FF00' }}>THE</span>
              <span className="block text-white">PATH.</span>
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-light/70 text-sm leading-relaxed">
              <span className="text-light font-bold">Raj Tiwari</span> — full-stack developer, RT•MOTO. From first line of HTML to production-grade motion systems. The KTM Duke is the therapy. The code is the output.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {EVOLUTION_DATA.map((item, i) => (
            <div
              key={item.year}
              ref={(el) => (cardRefs.current[i] = el)}
              className="group opacity-0 relative p-6 border border-white/5 bg-black/20 hover:bg-black/40 transition-colors duration-300 flex flex-col"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5 group-hover:bg-accent/50 transition-colors duration-300" />

              <p className="text-[9px] tracking-[0.35em] uppercase font-black text-accent mb-6">
                // {item.year}
              </p>

              <div className="flex-1 mb-6">
                <h3 className="text-xl font-black tracking-tight text-light uppercase mb-2">
                  {item.title}
                </h3>
                <p className="text-[10px] label-spaced text-white/50 mb-4">
                  {item.machine}
                </p>
                <p className="text-sm text-light/40 leading-relaxed">
                  {item.detail}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between">
                <div className="w-1.5 h-1.5 rounded-full bg-accent/20 group-hover:bg-accent transition-colors duration-300" />
                <span className="text-[8px] font-black text-white/10 group-hover:text-accent/40 transition-colors duration-300">[ + ]</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
