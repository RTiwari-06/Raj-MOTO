import { useLayoutEffect, useRef, useState } from 'react';
import { useMarquee } from '@/components/ui/useMarquee';

// Band colour — a true neutral charcoal (no colour cast) so every brand logo
// reads accurately as it loops.
const BAND_BG = 'var(--color-canvas-raised)';
const EDGE_FADE =
  'linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)';

/**
 * Full-colour logo loop.
 *
 * A dense, gapless track of brand marks in their native colours (see
 * `.logo-mark`) streaming forever across a quiet neutral band. Feed
 * `logos: { name, src }[]`.
 *
 * The engine renders the set TWICE and slides the track -50% for a seamless
 * loop — which only stays gapless while ONE copy is at least as wide as the
 * viewport. Short sets (e.g. 7 logos) fall short on wide screens and leave a
 * blank after the last mark, so each copy repeats the set `reps` times until it
 * spans the container. Measured at runtime (and on resize / SVG load).
 *
 * Logos carry varying internal whitespace, so a uniform height renders padded
 * marks visually smaller. An optional per-logo `scale` optically balances them
 * (e.g. `{ name, src, scale: 1.25 }`).
 */
export default function LogoMarquee({
  logos,
  speed = 42,
  ariaLabel = 'Logos',
  className = '',
}) {
  const { wrapRef, trackRef } = useMarquee({ speed });
  const groupRef = useRef(null);
  const [reps, setReps] = useState(1);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const group = groupRef.current;
    if (!wrap || !group) return;

    const measure = () => {
      const wrapW = wrap.offsetWidth;
      const setW = group.offsetWidth / reps; // width of a single logo set
      if (!wrapW || !setW) return;
      // One extra set past "just covers" so the seam is always off-screen.
      const needed = Math.ceil(wrapW / setW) + 1;
      if (needed !== reps) setReps(needed);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    ro.observe(group); // refires once the SVGs load and the set's width settles
    return () => ro.disconnect();
  }, [reps, logos, wrapRef]);

  const sequence = Array.from({ length: reps }, (_, r) =>
    logos.map((logo, i) => (
      <div
        key={`${r}-${i}`}
        className="group flex flex-shrink-0 items-center justify-center px-5 md:px-10"
      >
        <img
          src={logo.src}
          alt={logo.name}
          loading="lazy"
          draggable={false}
          style={logo.scale ? { transform: `scale(${logo.scale})` } : undefined}
          className="logo-mark h-[26px] w-auto max-w-[94px] object-contain md:h-[31px] md:max-w-[146px]"
        />
      </div>
    ))
  );

  return (
    <section
      aria-label={ariaLabel}
      className={`relative z-30 w-full select-none overflow-hidden py-2.5 md:py-3.5 ${className}`}
      style={{ backgroundColor: BAND_BG }}
    >
      <div
        ref={wrapRef}
        className="relative overflow-hidden"
        style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
      >
        <div ref={trackRef} className="flex w-max flex-nowrap items-center will-change-transform">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              ref={copy === 0 ? groupRef : null}
              aria-hidden={copy === 1}
              className="flex flex-shrink-0 flex-nowrap items-center"
            >
              {sequence}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
