import { lazy, Suspense, useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import { useUIStore } from '@/store/useUIStore';

// Lazy load sections below the fold
const TheMachine = lazy(() => import('@/components/sections/TheMachine'));
const TextMarquee = lazy(() => import('@/components/ui/TextMarquee'));
const ManifestoSection = lazy(() => import('@/components/sections/ManifestoSection'));
const HelmetSection = lazy(() => import('@/components/sections/HelmetSection'));
const DoctrineSection = lazy(() => import('@/components/sections/DoctrineSection'));
const TheGrid = lazy(() => import('@/components/sections/TheGrid'));
const RidesSection = lazy(() => import('@/components/sections/RidesSection'));
const IABridgeSection = lazy(() => import('@/components/sections/IABridgeSection'));
const StatRevealSection = lazy(() => import('@/components/sections/StatRevealSection'));
const ActionGallery = lazy(() => import('@/components/sections/ActionGallery'));
const StorySection = lazy(() => import('@/components/sections/StorySection'));
const GallerySection = lazy(() => import('@/components/sections/Gallery'));
const PartnersSection = lazy(() => import('@/components/sections/PartnersSection'));
const ContactSection = lazy(() => import('@/components/sections/ContactSection'));
const Footer = lazy(() => import('@/components/layout/Footer'));
const ScanReveal = lazy(() => import('@/components/ui/ScanReveal'));

export function Home() {
  const isLoaded = useUIStore((state) => state.isLoaded);

  // Below-fold sections mount only once the browser has an idle slot after
  // the hero paints. Mounting them with the first render fetched + parsed
  // every lazy chunk (including three.js via HelmetSection/StatReveal) and ran
  // each section's GSAP setup inside the LCP window — the main cause of the
  // multi-second first-load freeze on phones.
  const [restReady, setRestReady] = useState(false);
  useEffect(() => {
    const arm = () => setRestReady(true);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(arm, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(arm, 1200);
    return () => window.clearTimeout(id);
  }, []);

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
          <ScanReveal><TheMachine /></ScanReveal>
          <TextMarquee dark={true} />
          <ScanReveal><ManifestoSection /></ScanReveal>
          <HelmetSection />
          <ScanReveal><DoctrineSection /></ScanReveal>
          <ScanReveal><TheGrid /></ScanReveal>
          <RidesSection />
          <IABridgeSection />
          <StatRevealSection />
          <ScanReveal><ActionGallery /></ScanReveal>
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
