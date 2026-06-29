import { lazy, Suspense, useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import { useUIStore } from '@/store/useUIStore';

// Lazy load sections below the fold
const IABridgeSection = lazy(() => import('@/components/sections/IABridgeSection'));
const TheMachine = lazy(() => import('@/components/sections/TheMachine'));
const TextMarquee = lazy(() => import('@/components/ui/TextMarquee'));
const HelmetSection = lazy(() => import('@/components/sections/HelmetSection'));
const DoctrineSection = lazy(() => import('@/components/sections/DoctrineSection'));
const RidesSection = lazy(() => import('@/components/sections/RidesSection'));
const StatRevealSection = lazy(() => import('@/components/sections/StatRevealSection'));
const VisorUpHinge = lazy(() => import('@/components/sections/VisorUpHinge'));
const StorySection = lazy(() => import('@/components/sections/StorySection'));
const GallerySection = lazy(() => import('@/components/sections/Gallery'));
const PartnersSection = lazy(() => import('@/components/sections/PartnersSection'));
const ContactSection = lazy(() => import('@/components/sections/ContactSection'));
const Footer = lazy(() => import('@/components/layout/Footer'));
const ScanReveal = lazy(() => import('@/components/ui/ScanReveal'));

export function Home() {
  const isLoaded = useUIStore((state) => state.isLoaded);

  // Below-fold sections mount at the first idle slot AFTER the hero has painted
  // (i.e. once the loader hands over `isLoaded`) — deliberately BEFORE the user
  // scrolls into them. Mounting them while the user still dwells on the hero
  // means the full document height + every ScrollTrigger (incl. the two pinned
  // sections) is established against a stable layout; the old "mount on first
  // scroll" path inserted ~18 screens of DOM mid-scroll, which lurched the page
  // under the fixed navbar and fired not-yet-positioned pins/reveals.
  const [restReady, setRestReady] = useState(false);
  useEffect(() => {
    if (restReady || !isLoaded) return;
    const arm = () => setRestReady(true);
    let idleId, timerId;
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(arm, { timeout: 800 });
    } else {
      timerId = window.setTimeout(arm, 400);
    }
    return () => {
      if (idleId) window.cancelIdleCallback(idleId);
      if (timerId) window.clearTimeout(timerId);
    };
  }, [restReady, isLoaded]);

  // Once the below-fold sections are in the DOM, let layout settle for two
  // frames, then recompute every pin/trigger against the final positions.
  // Without this the pinned Rides section keeps the start/end distances
  // it measured before its siblings' images decoded.
  useEffect(() => {
    if (!restReady) return;
    let raf1 = 0, raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [restReady]);

  return (
    <>
      <main className={`relative z-10 w-full min-h-screen ${!isLoaded ? 'h-screen overflow-hidden' : ''}`}>

        {/* ── IGNITION ── Hero (Critical) */}
        <Navbar />
        <Hero isLoaded={isLoaded} />

        {/* ── Below the fold (Lazy, idle-mounted) ── */}
        {!restReady ? (
          <div className="h-screen bg-black" />
        ) : (
        <Suspense fallback={<div className="h-screen bg-black" />}>
          {/* ── ON TRACK ── the performance self ── */}
          <IABridgeSection />
          <ScanReveal><TheMachine /></ScanReveal>
          <TextMarquee />
          <HelmetSection />
          <ScanReveal><DoctrineSection /></ScanReveal>
          <RidesSection />
          <StatRevealSection />

          {/* ── VISOR UP ── act break ── */}
          <VisorUpHinge />

          {/* ── OFF TRACK ── the person ── */}
          <ScanReveal><StorySection /></ScanReveal>
          <GallerySection />
          <PartnersSection />
          <ContactSection />
          <Footer />
        </Suspense>
        )}

      </main>
    </>
  );
}
