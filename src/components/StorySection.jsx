import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DUR, ST, STAGGER } from '../motion/system';

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
    <section id="story" ref={sectionRef} className="relative w-full bg-darker py-24 px-6 md:px-16 overflow-hidden border-t border-white/5">
      <div className="max-w-screen-xl mx-auto">

        <div ref={headerRef} className="mb-16 opacity-0 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-accent text-[9px] font-black label-spaced">[ + ]</span>
              <p className="text-[9px] label-spaced uppercase font-black text-accent">
                R A J &nbsp;// &nbsp; T H E &nbsp; P A T H
              </p>
            </div>
            <h2 className="text-[10vw] md:text-[5vw] font-black uppercase tracking-tighter leading-none text-light">
              The Path
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
