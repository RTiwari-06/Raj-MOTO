import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MEDIA } from '@/data/media';
import { ArrowLeft, X, Cpu } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Written as literal class strings so Tailwind's scanner emits them.
const COLS_RIDE_LEFT = 'grid-cols-[844fr_480fr]';
const COLS_RIDE_RIGHT = 'grid-cols-[480fr_844fr]';

const LOGGED = MEDIA.rides.map((r) => ({ ...r, kind: 'ride' }));

const RAW = MEDIA.rawArchive.map((r) => ({
  ...r,
  kind: 'raw',
  // 'RAW FEED // 2023' — the year is the only thing these frames actually carry.
  year: (r.category.match(/\d{4}/) || [])[0] || '',
}));

const ROWS = LOGGED.map((ride, i) => ({
  ride,
  raw: RAW[i],
  rideFirst: i % 2 === 0,
}));

const TAIL = RAW.slice(LOGGED.length);

// Flat visual order, so the lightbox arrows track what the eye just did.
const ENTRIES = [
  ...ROWS.flatMap(({ ride, raw, rideFirst }) => (rideFirst ? [ride, raw] : [raw, ride])),
  ...TAIL,
];

const YEARS = ENTRIES.map((e) => Number(e.year)).filter(Boolean);
const SPAN = `${Math.min(...YEARS)}—${Math.max(...YEARS)}`;

// The one measurement that defines each machine or run, taken from its own spec
// sheet rather than invented. Displacement for the bike that is defined by its
// engine, distance for the runs that are defined by how far they went.
const splitStat = (spec) => {
  if (!spec) return null;
  const [, figure, unit] = spec.value.match(/^([\d.,]+)\s*(.*)$/) || [];
  return figure ? { label: spec.label, figure, unit } : null;
};

const keyOf = (e) => e.id || e.src;

const Archive = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [lightbox, setLightbox] = useState(null);

  // ── LIGHTBOX NAVIGATION ──
  const navigateLightbox = useCallback((dir) => {
    setLightbox((prev) => {
      if (!prev) return null;
      const idx = ENTRIES.findIndex((e) => keyOf(e) === keyOf(prev));
      return ENTRIES[(idx + dir + ENTRIES.length) % ENTRIES.length];
    });
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') navigateLightbox(1);
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox, navigateLightbox]);

  // ── SCROLL ORCHESTRATION ──
  useEffect(() => {
    const reduced =
      document.documentElement.classList.contains('motion-off') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const fine = window.matchMedia('(pointer: fine)').matches;

    const ctx = gsap.context(() => {
      // The children of .archive-lede are the overflow-hidden masks; it is their
      // contents that must travel, or the mask does nothing.
      gsap.from('.archive-lede > div > *', {
        yPercent: 110,
        duration: 1.4,
        stagger: 0.08,
        ease: 'expo.out',
        delay: 0.15,
      });

      // Tiles wipe along the axis of their own row, so the reveal reads as the
      // pinwheel drawing itself rather than as a generic stagger.
      gsap.utils.toArray('.tile-row').forEach((row) => {
        const fromLeft = row.dataset.wipe === 'left';
        gsap.from(row.querySelectorAll('.tile'), {
          clipPath: fromLeft ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)',
          duration: 1.1,
          stagger: 0.09,
          ease: 'power4.out',
          scrollTrigger: { trigger: row, start: 'top 88%' },
        });
        gsap.from(row.querySelectorAll('.tile-caption'), {
          opacity: 0,
          y: 14,
          duration: 0.9,
          stagger: 0.09,
          ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 88%' },
        });
      });

      // Parallax only on the dominant tiles — applying it uniformly would flatten
      // the hierarchy the grid just established. Fine pointers only.
      if (!fine) return;
      gsap.utils.toArray('.tile-dominant img').forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: img.closest('.tile'),
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const lightboxIndex = lightbox ? ENTRIES.findIndex((e) => keyOf(e) === keyOf(lightbox)) : -1;

  // ── TILE ──
  // The button is absolutely positioned so it fills whatever height the row
  // ends up at. Only the dominant tile carries an aspect ratio, which is what
  // makes it — and not the subordinate image's own proportions — set that
  // height, exactly as the Figma row does.
  const Tile = ({ entry, dominant, aspect }) => (
    <div className={`relative ${dominant ? 'tile-dominant ' : ''}${aspect || ''}`}>
      <button
        type="button"
        onClick={() => setLightbox(entry)}
        className="tile group absolute inset-0 overflow-hidden bg-canvas cursor-pointer
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <img
          src={entry.src}
          alt={entry.model || `Archive frame ${entry.year}`}
          loading="lazy"
          decoding="async"
          className="archive-img absolute left-0 w-full object-cover object-center
            grayscale brightness-[0.72] transition-[filter] duration-[900ms] ease-out
            group-hover:grayscale-0 group-hover:brightness-100"
          // Dominant tiles are overscanned so the parallax has somewhere to
          // travel without exposing the tile behind it. 16% of overscan covers
          // the ±6% yPercent travel (which is 6% of the image's own height, not
          // the container's) with ~1% to spare at both ends.
          style={dominant ? { top: '-8%', height: '116%' } : { top: 0, height: '100%' }}
        />
      </button>
    </div>
  );

  // ── CAPTIONS ──
  // Rides get a name and their defining measurement. Raw frames get a year,
  // because a year is all we know about them — the asymmetry is the point.
  const RideCaption = ({ ride }) => {
    const stat = splitStat(ride.specs?.[0]);
    return (
      <div className="tile-caption flex flex-col items-start gap-3 border-t border-line pt-3
        md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-x-6">
        <div className="min-w-0">
          <div className="font-mono text-[8px] md:text-[9px] tracking-[0.35em] uppercase text-fg-muted mb-1.5">
            {ride.category}
          </div>
          <h3
            className="font-serif font-black uppercase text-fg leading-[0.9] tracking-tight-cap"
            style={{ fontSize: 'clamp(14px, 3.2vw, 36px)' }}
          >
            {ride.model}
          </h3>
        </div>

        {stat && (
          <div className="text-left md:text-right shrink-0">
            <div className="font-mono text-accent leading-none tabular-nums" style={{ fontSize: 'clamp(20px, 4.2vw, 52px)' }}>
              {stat.figure}
              {stat.unit && (
                <span className="text-accent-mid ml-1" style={{ fontSize: '0.38em' }}>
                  {stat.unit}
                </span>
              )}
            </div>
            <div className="font-mono text-[8px] md:text-[9px] tracking-[0.35em] uppercase text-fg-muted mt-1.5">
              {stat.label}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Top-aligned so the year lands on the same line as the ride's eyebrow across
  // the gutter, rather than drifting to the bottom of a tall cell.
  const RawCaption = ({ frame }) => (
    <div className="tile-caption flex items-start justify-end border-t border-line-subtle pt-3">
      <span className="font-mono text-[8px] md:text-[9px] tracking-[0.35em] uppercase text-fg-muted tabular-nums">
        {frame.year}
      </span>
    </div>
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-canvas-deep text-fg selection:bg-accent selection:text-ink overflow-x-hidden">
      <div className="grain-layer opacity-[0.03] pointer-events-none" />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-5 md:px-12 py-6 flex items-center gap-6 mix-blend-difference font-mono">
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 text-fg-2 hover:text-fg transition-colors"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[9px] uppercase tracking-[0.35em]">Portfolio</span>
        </button>
        <button
          onClick={() => navigate('/#machine')}
          className="group flex items-center gap-3 text-fg-2 hover:text-fg transition-colors"
        >
          <Cpu size={13} />
          <span className="text-[9px] uppercase tracking-[0.35em]">The machine</span>
        </button>
      </nav>

      <div className="max-w-[1440px] mx-auto px-5 md:px-12">
        {/* ── HEADER ──
            Laid out on the same 844/480 split as the rows below, so the grid
            announces itself before a single image loads. */}
        {/* The images hold the pinwheel at every width, but the header cannot:
            at 390px the meta column squeezes to ~130px and the title to ~200px,
            so the header alone stacks. */}
        <header className="grid gap-x-5 gap-y-8 md:items-end pt-[24vh] md:pt-[30vh] pb-16 md:pb-24 grid-cols-1 md:grid-cols-[844fr_480fr]">
          <div className="archive-lede min-w-0">
            <div className="overflow-hidden">
              <div className="font-mono text-[9px] md:text-[10px] tracking-[0.45em] uppercase text-accent mb-4 md:mb-6">
                RT•MOTO — Visual log
              </div>
            </div>
            <div className="overflow-hidden">
              <h1
                className="font-serif font-black uppercase text-fg leading-[0.82] tracking-tight-cap"
                style={{ fontSize: 'clamp(40px, 11vw, 158px)' }}
              >
                Archive
              </h1>
            </div>
          </div>

          <dl className="min-w-0 font-mono text-[8px] md:text-[9px] tracking-[0.3em] uppercase border-t border-line pt-3 space-y-2">
            <div className="flex justify-between gap-3">
              <dt className="text-fg-muted">Frames</dt>
              <dd className="text-fg-2 tabular-nums">{ENTRIES.length}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-fg-muted">Logged rides</dt>
              <dd className="text-fg-2 tabular-nums">{LOGGED.length}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-fg-muted">Span</dt>
              <dd className="text-fg-2 tabular-nums">{SPAN}</dd>
            </div>
          </dl>
        </header>

        {/* ── THE PINWHEEL ── */}
        <main className="space-y-12 md:space-y-16">
          {ROWS.map(({ ride, raw, rideFirst }) => (
            <section
              key={ride.id}
              className={`tile-row grid gap-x-5 gap-y-3 md:gap-y-4 ${
                rideFirst ? COLS_RIDE_LEFT : COLS_RIDE_RIGHT
              }`}
              data-wipe={rideFirst ? 'left' : 'right'}
            >
              {rideFirst ? (
                <>
                  <Tile entry={ride} dominant aspect="aspect-[3/2]" />
                  <Tile entry={raw} />
                  <RideCaption ride={ride} />
                  <RawCaption frame={raw} />
                </>
              ) : (
                <>
                  <Tile entry={raw} />
                  <Tile entry={ride} dominant aspect="aspect-[3/2]" />
                  <RawCaption frame={raw} />
                  <RideCaption ride={ride} />
                </>
              )}
            </section>
          ))}

          {/* Coda — the frames with no ride logged against them. Equal width,
              no pairing, nothing to say beyond a year. */}
          <section className="tile-row grid grid-cols-3 gap-x-5 gap-y-3 md:gap-y-4 pt-3 md:pt-6" data-wipe="left">
            {TAIL.map((frame) => (
              <Tile key={frame.id} entry={frame} aspect="aspect-[4/5]" />
            ))}
            {TAIL.map((frame) => (
              <RawCaption key={`cap-${frame.id}`} frame={frame} />
            ))}
          </section>
        </main>

        {/* ── FOOTER ── */}
        <footer className="mt-32 md:mt-48 py-8 border-t border-line-subtle flex flex-wrap justify-between gap-4 font-mono text-[8px] md:text-[9px] tracking-[0.35em] uppercase text-fg-faint">
          <span>RT•MOTO — Archive</span>
          <span className="tabular-nums">{SPAN}</span>
        </footer>
      </div>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[1000] bg-canvas-deep/98 backdrop-blur-2xl flex flex-col p-5 md:p-10 animate-in fade-in duration-500"
          onClick={() => setLightbox(null)}
        >
          <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.35em] uppercase shrink-0">
            <span className="text-accent tabular-nums">
              {String(lightboxIndex + 1).padStart(2, '0')}
              <span className="text-fg-muted"> / {String(ENTRIES.length).padStart(2, '0')}</span>
            </span>
            <button
              className="text-fg-muted hover:text-fg transition-colors p-2 -m-2"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              <X size={22} strokeWidth={1.25} />
            </button>
          </div>

          <div
            className="flex-1 min-h-0 flex items-center justify-center py-6 md:py-10"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              key={lightbox.src}
              src={lightbox.src}
              alt={lightbox.model || `Archive frame ${lightbox.year}`}
              className="max-w-full max-h-full object-contain animate-in fade-in duration-700"
            />
          </div>

          <div
            className="shrink-0 flex flex-wrap items-end justify-between gap-x-8 gap-y-5 border-t border-line pt-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0">
              <div className="font-mono text-[9px] tracking-[0.35em] uppercase text-fg-muted mb-2">
                {lightbox.kind === 'raw' ? 'Raw feed' : lightbox.category}
              </div>
              {/* A raw frame has no name to give. Its year is the only fact on
                  record, so the year takes the heading rather than a placeholder
                  standing in at the same weight as a real ride. */}
              <h2
                className="font-serif font-black uppercase text-fg leading-[0.9] tracking-tight-cap"
                style={{ fontSize: 'clamp(20px, 4vw, 52px)' }}
              >
                {lightbox.model || lightbox.year}
              </h2>
              {lightbox.tagline && (
                <p className="text-fg-2 text-sm mt-3 max-w-xl">{lightbox.tagline}</p>
              )}
            </div>

            <div className="flex items-end gap-8">
              {lightbox.specs && (
                <dl className="hidden md:flex gap-8 font-mono text-[9px] tracking-[0.3em] uppercase">
                  {lightbox.specs.map((s) => (
                    <div key={s.label}>
                      <dt className="text-fg-muted mb-1.5">{s.label}</dt>
                      <dd className="text-fg-2 tabular-nums">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => navigateLightbox(-1)}
                  aria-label="Previous frame"
                  className="w-12 h-12 border border-line flex items-center justify-center text-fg-2
                    hover:bg-accent hover:border-accent hover:text-ink transition-colors duration-300"
                >
                  ←
                </button>
                <button
                  onClick={() => navigateLightbox(1)}
                  aria-label="Next frame"
                  className="w-12 h-12 border border-line flex items-center justify-center text-fg-2
                    hover:bg-accent hover:border-accent hover:text-ink transition-colors duration-300"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Archive;
