import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import TheMachine from '@/components/sections/TheMachine';
import TheGrid from '@/components/sections/TheGrid';
import ManifestoSection from '@/components/sections/ManifestoSection';
import MarqueeTicker from '@/components/ui/MarqueeTicker';
import RidesSection from '@/components/sections/RidesSection';
import IABridgeSection from '@/components/sections/IABridgeSection';
import StatRevealSection from '@/components/sections/StatRevealSection';
import StorySection from '@/components/sections/StorySection';
import ActionGallery from '@/components/sections/ActionGallery';
import GallerySection from '@/components/sections/Gallery';
import ContactSection from '@/components/sections/ContactSection';
import Footer from '@/components/layout/Footer';
import HelmetSection from '@/components/sections/HelmetSection';
import DoctrineSection from '@/components/sections/DoctrineSection';
import ScanReveal from '@/components/ui/ScanReveal';
import { useUIStore } from '@/store/useUIStore';

export function Home() {
  const isLoaded = useUIStore((state) => state.isLoaded);

  return (
    <>
      <main className={`relative z-10 w-full min-h-screen ${!isLoaded ? 'h-screen overflow-hidden' : ''}`}>

        {/* ── IGNITION ── Hero */}
        <Navbar />
        <Hero isLoaded={isLoaded} />

        {/* ── THE MACHINE ── Specs & telemetry */}
        <ScanReveal><TheMachine /></ScanReveal>

        {/* ── IDENTITY ── Philosophy */}
        <ScanReveal><ManifestoSection /></ScanReveal>

        {/* ── PULSE ── Speed burst */}
        <MarqueeTicker dark={true} />

        {/* ── GEAR ── 3D helmet scroll-driven reveal */}
        <HelmetSection />

        {/* ── DOCTRINE ── Route-map dashboard */}
        <ScanReveal><DoctrineSection /></ScanReveal>

        {/* ── THE GRID ── Routes & turf (pairs with the route dashboard above) */}
        <ScanReveal><TheGrid /></ScanReveal>

        {/* ── RIDES ── Archive horizontal showcase */}
        <RidesSection />

        {/* ── IA BRIDGE ── Motorcycle-to-browser performance statement */}
        <IABridgeSection />

        {/* ── CAREER ── Race numbers */}
        <StatRevealSection />

        {/* ── PULSE ── Palette reset */}
        <MarqueeTicker dark={false} />

        {/* ── OFF TRACK ── Lifestyle / fan moments */}
        <ScanReveal><ActionGallery /></ScanReveal>

        {/* ── ON TRACK ── The Path: 2022 → RT•MOTO */}
        <ScanReveal><StorySection /></ScanReveal>

        {/* ── PULSE ── */}
        <MarqueeTicker dark={true} />

        {/* ── VISUAL ARCHIVE ── Full gallery */}
        <GallerySection />

        {/* ── CONNECT ── Contact */}
        <ContactSection />

        {/* ── FOOTER ── */}
        <Footer />

      </main>
    </>
  );
}
