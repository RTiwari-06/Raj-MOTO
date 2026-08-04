import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from '@/store/useStore';
import { useUIStore } from '@/store/useUIStore';
import { EASE, DUR, STAGGER } from '@/motion/system';

import { Link, useNavigate, useLocation } from 'react-router-dom';

// ── Nav model ─────────────────────────────────────────────────────────────────
// Renumbered after TARMAC (#rides) was removed with RidesSection — the indices
// are a contiguous running order, so leaving a 02 gap would have read as a
// missing section rather than a design.
const LINKS = [
  { idx: '00', label: 'IGNITION',    href: '/',        id: null,      type: 'route' },
  { idx: '01', label: 'MACHINE',     href: '#machine', id: 'machine', type: 'anchor' },
  { idx: '02', label: 'PIT LANE',    href: '#story',   id: 'story',   type: 'anchor' },
  // Clicks through to the full /archive route, but scroll-spy tracks the on-page
  // VISUAL ARCHIVE section (#gallery) so the active highlight advances there.
  { idx: '03', label: 'ARCHIVE',     href: '/archive', id: 'gallery', type: 'route' },
  { idx: '04', label: 'COORDINATES', href: '#connect', id: 'connect', type: 'anchor' },
];

// Offset (px) the fixed nav steals from the top when smooth-scrolling to anchors.
const NAV_OFFSET = -88;

const Navbar = () => {
  const navigate     = useNavigate();
  const location     = useLocation();
  const navRef       = useRef(null);
  const indicatorRef = useRef(null);   // sliding lime bar under the active link
  const progressRef  = useRef(null);   // hairline scroll-progress fill
  const readoutRef   = useRef(null);   // mono "SCROLL nnn%" telemetry value
  const linkRefs     = useRef([]);     // per-link <li> for measuring the indicator
  const pendingScroll = useRef(null);  // anchor to scroll to once /home has mounted

  const [active,   setActive]   = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const setHovering   = useStore((state) => state.setHovering);
  // Boolean selector — Zustand only re-renders on threshold crossings, not per frame.
  const scrolled      = useStore((state) => state.scroll > 24);
  const motionEnabled = useUIStore((state) => state.motionEnabled);
  const toggleMotion  = useUIStore((state) => state.toggleMotion);

  // Smooth-scroll to an on-page anchor. Crucially calls lenis.start() first: the
  // mobile menu stops Lenis while open, and goTo fires synchronously on tap —
  // without restarting, scrollTo would be a silent no-op (the "links don't
  // scroll on mobile" bug). Retries while the target is still lazy-mounting.
  const scrollToAnchor = useCallback((hash, tries = 0) => {
    const el = document.querySelector(hash);
    if (!el) {
      if (tries < 60) requestAnimationFrame(() => scrollToAnchor(hash, tries + 1));
      return;
    }
    const lenis = window.__lenis;
    if (lenis) {
      lenis.start();
      lenis.scrollTo(el, { offset: NAV_OFFSET });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // ── Smooth anchor navigation (drives Lenis when present) ────────────────────
  const goTo = useCallback((e, item) => {
    e.preventDefault();
    setMenuOpen(false);

    if (item.type === 'route') {
      navigate(item.href);
      return;
    }

    // From a nested route (e.g. /archive): go home first, then scroll once the
    // homepage has mounted — avoids the navigate('/'+'#id') reload-to-hash flash.
    if (location.pathname !== '/') {
      pendingScroll.current = item.href;
      navigate('/');
      return;
    }

    scrollToAnchor(item.href);
  }, [navigate, location.pathname, scrollToAnchor]);

  // Flush a queued cross-route scroll once we're back on the homepage.
  useEffect(() => {
    if (location.pathname === '/' && pendingScroll.current) {
      const hash = pendingScroll.current;
      pendingScroll.current = null;
      scrollToAnchor(hash);
    }
  }, [location.pathname, scrollToAnchor]);

  // ── Logo / IGNITION — home, scrolling to top when already on the homepage ────
  const goHome = useCallback((e) => {
    e.preventDefault();
    setMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      return;
    }
    const lenis = window.__lenis;
    lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate, location.pathname]);

  // ── Entrance — nav drops in, then the rail items stagger ────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.4 });
      tl.fromTo(navRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: DUR.considered, ease: EASE.precision },
      );
      tl.fromTo('[data-nav-item]',
        { y: -14, opacity: 0 },
        { y: 0, opacity: 1, duration: DUR.fast, ease: EASE.precision, stagger: STAGGER.elements },
        '-=0.7',
      );
    }, navRef);
    return () => ctx.revert();
  }, []);

  // ── Scroll-spy + progress + readout (all imperative — zero re-renders) ──────
  useEffect(() => {
    const targets = LINKS
      .map((l, i) => ({ i, id: l.id }))
      .filter((t) => t.id);

    let offsets = [];
    let max = 1;
    const measure = () => {
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      // Use document-relative position. offsetTop is relative to the nearest
      // positioned ancestor — and several sections sit inside <ScanReveal>
      // (position:relative) wrappers, so offsetTop would read ≈0 for them and
      // pin the active link. getBoundingClientRect + scrollY is wrapper-proof.
      const scrollY = window.scrollY || window.pageYOffset || 0;
      offsets = targets.map((t) => {
        const el = document.getElementById(t.id);
        return { i: t.i, top: el ? el.getBoundingClientRect().top + scrollY : Infinity };
      });
    };
    // Measure once layout/images have settled, and again on resize/load.
    const raf = requestAnimationFrame(() => requestAnimationFrame(measure));
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    // Pinned sections (Helmet/Rides) change section offsets when ScrollTrigger
    // recalculates — re-measure so the spy never works off stale positions.
    ScrollTrigger.addEventListener('refresh', measure);
    // Below-the-fold sections are lazy-loaded (Suspense), so the page height keeps
    // growing AFTER first paint — and image decode shifts offsets again. Re-measure
    // on any document-height change so `offsets`/`max` never go stale (otherwise the
    // active highlight, % readout, and progress bar all freeze at their initial values).
    let roRaf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(roRaf);
      roRaf = requestAnimationFrame(measure);
    });
    ro.observe(document.documentElement);

    let lastScroll = -1;
    let lastPct    = -1;
    let lastActive = 0;
    const render = (scroll) => {
      if (scroll === lastScroll) return;   // ignore non-scroll store updates (mouse, etc.)
      lastScroll = scroll;

      const pct = scroll / max;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${Math.min(1, pct)})`;

      const pctInt = Math.min(100, Math.round(pct * 100));
      if (readoutRef.current && pctInt !== lastPct) {
        readoutRef.current.textContent = String(pctInt).padStart(3, '0');
        lastPct = pctInt;
      }

      // The "reading line" sits 32% down the viewport; the deepest section past it wins.
      const line = scroll + window.innerHeight * 0.32;
      let next = 0;
      for (const o of offsets) if (o.top <= line) next = o.i;
      if (next !== lastActive) { lastActive = next; setActive(next); }
    };

    render(useStore.getState().scroll);
    const unsub = useStore.subscribe((s) => render(s.scroll));

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(roRaf);
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('load', measure);
      ScrollTrigger.removeEventListener('refresh', measure);
      unsub();
    };
  }, []);

  // ── Slide the indicator to the active link (and keep it pinned on resize) ────
  useEffect(() => {
    let raf;
    const move = () => {
      const el  = linkRefs.current[active];
      const ind = indicatorRef.current;
      if (!el || !ind) return;
      // Rail is hidden (mobile / < md breakpoint) — don't busy-loop rAF.
      if (el.offsetParent === null) return;
      // Not laid out yet (e.g. web fonts still loading) — retry next frame so the
      // bar never gets stuck at a stale, fallback-font width.
      if (el.offsetWidth === 0) {
        raf = requestAnimationFrame(move);
        return;
      }
      gsap.to(ind, {
        x: el.offsetLeft,
        width: el.offsetWidth,
        duration: DUR.fast,
        ease: EASE.precision,
      });
    };
    move();
    window.addEventListener('resize', move);
    window.addEventListener('load', move);
    // Re-measure once the custom display/mono fonts swap in.
    if (document.fonts?.ready) document.fonts.ready.then(move).catch(() => {});
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', move);
      window.removeEventListener('load', move);
    };
  }, [active]);

  // ── Mobile menu — lock page scroll + stagger the overlay in ─────────────────
  useEffect(() => {
    const lenis = window.__lenis;
    if (menuOpen) {
      lenis?.stop();
      const ctx = gsap.context(() => {
        gsap.fromTo('[data-menu-item]',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: DUR.standard, ease: EASE.precision, stagger: STAGGER.tight, delay: 0.08 },
        );
      });
      return () => ctx.revert();
    }
    lenis?.start();
  }, [menuOpen]);

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 w-full z-50 border-b transition-[background-color,border-color] duration-500 nav-solid-mobile ${
          scrolled
            ? 'bg-black/90 md:bg-black/80 md:backdrop-blur-md border-line'
            : 'bg-transparent border-transparent'
        }`}
        style={{ opacity: 0 }}
      >
        {/* Top scrim — over the hero (transparent nav) it darkens whatever sits/scrolls
            beneath the bar so the figure recedes into shadow; fades once the solid
            bg-black/80 takes over on scroll. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-24 transition-opacity duration-500"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.72), transparent)', opacity: scrolled ? 0 : 1 }}
        />

        {/* gap-x is load-bearing, not cosmetic: the centre track is `auto`, so at
            widths where it grows the 1fr side tracks collapse and the last nav
            link (COORDINATES) butts straight against the scroll readout with no
            separation. The readout only fades in past 24px of scroll, which is
            why the collision looks like a scroll bug rather than a layout one. */}
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-x-6 md:gap-x-10 px-6 md:px-12 lg:px-20 py-4 md:py-5">

          {/* ── LEFT · race-plate identity ─────────────────────────────────── */}
          <a
            href="/"
            onClick={goHome}
            data-magnetic
            data-nav-item
            className="group flex items-center gap-3 justify-self-start"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            {/* Ignition tick — grows on hover */}
            <span className="block w-[3px] h-7 bg-accent origin-center transition-transform duration-300 group-hover:scale-y-125" />
            <img
              src="/media/svgs/brand_logo.webp"
              alt="RT•MOTO"
              draggable={false}
              className="h-8 md:h-9 w-auto object-contain"
            />
          </a>

          {/* ── CENTER · indexed telemetry rail ────────────────────────────── */}
          <ul className="relative hidden md:flex items-stretch gap-7 lg:gap-9 justify-self-center">
            {LINKS.map((item, i) => {
              const { idx, label, href } = item;
              const isActive = i === active;
              return (
                <li
                  key={label}
                  ref={(el) => (linkRefs.current[i] = el)}
                  data-nav-item
                  className="py-1"
                >
                  <a
                    href={href}
                    onClick={(e) => goTo(e, item)}
                    data-magnetic
                    aria-current={isActive ? 'true' : undefined}
                    className="group flex items-baseline gap-1.5"
                    onMouseEnter={() => setHovering(true)}
                    onMouseLeave={() => setHovering(false)}
                  >
                    <span className={`font-mono text-[8px] tracking-[0.15em] transition-colors duration-200 ${
                      isActive ? 'text-accent' : 'text-fg-muted group-hover:text-accent-mid'
                    }`}>
                      {idx}
                    </span>
                    <span className={`font-serif text-[11px] tracking-[0.16em] uppercase whitespace-nowrap transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-fg-2 group-hover:text-white'
                    }`}>
                      {label}
                    </span>
                  </a>
                </li>
              );
            })}

            {/* Scroll-spy indicator — slides between links */}
            <span
              ref={indicatorRef}
              aria-hidden="true"
              className="absolute -bottom-1 left-0 h-[2px] bg-accent pointer-events-none"
              style={{ width: 0, boxShadow: '0 0 12px var(--color-accent), 0 0 4px var(--color-accent)' }}
            />
          </ul>

          {/* ── RIGHT · telemetry cluster + system toggle ──────────────────── */}
          <div className="justify-self-end flex items-center gap-4 md:gap-5">

            {/* Live scroll readout — value updated imperatively; quiet over the hero */}
            <div
              data-nav-item
              className="hidden lg:flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] tabular-nums"
            >
              <span
                className="flex items-center gap-1.5 transition-opacity duration-500"
                style={{ opacity: scrolled ? 1 : 0 }}
              >
                <span className="text-fg-muted">Scroll</span>
                <span ref={readoutRef} className="text-accent">000</span>
                <span className="text-fg-muted">%</span>
              </span>
            </div>

            <span
              data-nav-item
              className="hidden lg:block w-px h-4 bg-surface-raised transition-opacity duration-500"
              style={{ opacity: scrolled ? 1 : 0 }}
            />

            {/* System status / motion toggle — a11y preserved */}
            <button
              onClick={toggleMotion}
              data-magnetic
              data-nav-item
              aria-pressed={motionEnabled}
              aria-label={motionEnabled ? 'Motion on — click to reduce motion' : 'Motion paused — click to enable'}
              className="hidden md:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-muted hover:text-accent transition-colors duration-200 touch-buffer"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              <span
                className="w-[5px] h-[5px] rounded-full transition-colors duration-200"
                style={{ backgroundColor: motionEnabled ? 'var(--color-accent)' : 'var(--color-line-strong)', boxShadow: motionEnabled ? '0 0 8px var(--color-accent), 0 0 2px var(--color-accent)' : 'none' }}
              />
              {motionEnabled ? '[SYS.ONLINE]' : '[SYS.PAUSED]'}
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              data-magnetic
              data-nav-item
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-[5px] touch-buffer"
            >
              <span
                className="block w-5 h-[1.5px] bg-accent transition-transform duration-300"
                style={{ transform: menuOpen ? 'translateY(3.25px) rotate(45deg)' : 'none' }}
              />
              <span
                className="block w-5 h-[1.5px] bg-accent transition-transform duration-300"
                style={{ transform: menuOpen ? 'translateY(-3.25px) rotate(-45deg)' : 'none' }}
              />
            </button>
          </div>
        </div>

        {/* ── Hairline scroll-progress fill ────────────────────────────────── */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-white/[0.06] overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-accent origin-left"
            style={{ transform: 'scaleX(0)', boxShadow: '0 0 8px var(--color-accent-mid)' }}
          />
        </div>
      </nav>

      {/* ── MOBILE OVERLAY MENU ────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 md:hidden bg-black/95 transition-opacity duration-500 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Faint technical grid for depth */}
        <div className="absolute inset-0 hairline-grid opacity-60" />

        <div className="relative h-full flex flex-col justify-center px-8 pt-24 pb-12">
          <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-accent-soft mb-8">
            // Navigation
          </span>

          <ul className="flex flex-col gap-1">
            {LINKS.map((item, i) => {
              const { idx, label, href } = item;
              return (
                <li key={label} data-menu-item={menuOpen ? '' : undefined}>
                  <a
                    href={href}
                    onClick={(e) => goTo(e, item)}
                    className="group flex items-baseline gap-4 py-2"
                  >
                  <span className={`font-mono text-[11px] tracking-[0.1em] ${
                    i === active ? 'text-accent' : 'text-fg-muted'
                  }`}>
                    {idx}
                  </span>
                  <span className={`font-serif text-[12vw] leading-[0.95] uppercase transition-colors duration-200 ${
                    i === active ? 'text-accent' : 'text-white group-active:text-accent'
                  }`}>
                    {label}
                  </span>
                </a>
              </li>
              );
            })}
          </ul>

          {/* Telemetry footer */}
          <div className="mt-auto pt-10 flex items-center justify-between border-t border-line">
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-fg-muted">
              Bengaluru · IND
            </span>
            <button
              onClick={toggleMotion}
              aria-pressed={motionEnabled}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-muted"
            >
              <span
                className="w-[5px] h-[5px] rounded-full"
                style={{ backgroundColor: motionEnabled ? 'var(--color-accent)' : 'var(--color-line-strong)', boxShadow: motionEnabled ? '0 0 8px var(--color-accent), 0 0 2px var(--color-accent)' : 'none' }}
              />
              {motionEnabled ? '[SYS.ONLINE]' : '[SYS.PAUSED]'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
