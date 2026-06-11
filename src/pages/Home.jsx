import { lazy, Suspense, useEffect, useRef, useState } from 'react';
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

// Mounts children only when the user is within ~2 viewports of the section.
// Used for the WebGL sections (Helmet, StatReveal) so three.js (~1MB) is
// fetched + parsed shortly before it's needed instead of during page load.
function NearViewport({ children, height = '100vh' }) {
  const ref = useRef(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (near) return;
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setNear(true); },
      { rootMargin: '150% 0px' }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [near]);
  return near ? children : <div ref={ref} style={{ height }} className="bg-black" />;
}

export function Home() {
  const isLoaded = useUIStore((state) => state.isLoaded);

  // Below-fold sections mount once the browser has an idle slot after the
  // hero paints — OR the instant the user shows scroll intent, whichever
  // comes first, so fast scrollers never meet a black gap. Mounting them with
  // the first render fetched + parsed every lazy chunk and ran each section's
  // GSAP setup inside the LCP window — the main cause of the first-load
  // freeze on phones.
  const [restReady, setRestReady] = useState(false);
  useEffect(() => {
    if (restReady) return;
    const arm = () => setRestReady(true);

    window.addEventListener('scroll', arm, { once: true, passive: true });
    window.addEventListener('touchstart', arm, { once: true, passive: true });
    window.addEventListener('wheel', arm, { once: true, passive: true });

    // Scroll intent mounts instantly (listeners above); the idle fallback can
    // therefore stay generous — it only fires for users who never scroll.
    let idleId, timerId;
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(arm, { timeout: 2500 });
    } else {
      timerId = window.setTimeout(arm, 1500);
    }
    return () => {
      window.removeEventListener('scroll', arm);
      window.removeEventListener('touchstart', arm);
      window.removeEventListener('wheel', arm);
      if (idleId) window.cancelIdleCallback(idleId);
      if (timerId) window.clearTimeout(timerId);
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
          <ScanReveal><TheMachine /></ScanReveal>
          <TextMarquee dark={true} />
          <ScanReveal><ManifestoSection /></ScanReveal>
          <NearViewport><HelmetSection /></NearViewport>
          <ScanReveal><DoctrineSection /></ScanReveal>
          <ScanReveal><TheGrid /></ScanReveal>
          <RidesSection />
          <IABridgeSection />
          <NearViewport><StatRevealSection /></NearViewport>
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
