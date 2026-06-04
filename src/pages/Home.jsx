import { lazy, Suspense } from 'react';
import CompactNav from '@/components/layout/CompactNav';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import { useUIStore } from '@/store/useUIStore';

// Lazy load sections below the fold
const TheMachine = lazy(() => import('@/components/sections/TheMachine'));
const ManifestoSection = lazy(() => import('@/components/sections/ManifestoSection'));
const MarqueeTicker = lazy(() => import('@/components/ui/MarqueeTicker'));
const HelmetSection = lazy(() => import('@/components/sections/HelmetSection'));
const DoctrineSection = lazy(() => import('@/components/sections/DoctrineSection'));
const TheGrid = lazy(() => import('@/components/sections/TheGrid'));
const RidesSection = lazy(() => import('@/components/sections/RidesSection'));
const IABridgeSection = lazy(() => import('@/components/sections/IABridgeSection'));
const StatRevealSection = lazy(() => import('@/components/sections/StatRevealSection'));
const ActionGallery = lazy(() => import('@/components/sections/ActionGallery'));
const StorySection = lazy(() => import('@/components/sections/StorySection'));
const GallerySection = lazy(() => import('@/components/sections/Gallery'));
const ContactSection = lazy(() => import('@/components/sections/ContactSection'));
const Footer = lazy(() => import('@/components/layout/Footer'));
const ScanReveal = lazy(() => import('@/components/ui/ScanReveal'));

export function Home() {
  const isLoaded = useUIStore((state) => state.isLoaded);

  return (
    <>
      <main className={`relative z-10 w-full min-h-screen ${!isLoaded ? 'h-screen overflow-hidden' : ''}`}>

        {/* ── IGNITION ── Hero (Critical) */}
        <CompactNav />
        <Hero isLoaded={isLoaded} />
        {/* Full navigation lives in normal flow after the hero */}
        <Navbar />

        {/* ── Below the fold (Lazy) ── */}
        <Suspense fallback={<div className="h-screen bg-black" />}>
          <ScanReveal><TheMachine /></ScanReveal>
          <ScanReveal><ManifestoSection /></ScanReveal>
          <MarqueeTicker dark={true} />
          <HelmetSection />
          <ScanReveal><DoctrineSection /></ScanReveal>
          <ScanReveal><TheGrid /></ScanReveal>
          <RidesSection />
          <IABridgeSection />
          <StatRevealSection />
          <MarqueeTicker dark={false} />
          <ScanReveal><ActionGallery /></ScanReveal>
          <ScanReveal><StorySection /></ScanReveal>
          <MarqueeTicker dark={true} />
          <GallerySection />
          <ContactSection />
          <Footer />
        </Suspense>

      </main>
    </>
  );
}
