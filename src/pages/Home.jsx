import { useState } from 'react';
import { InertialLag } from '@/motion/InertialLag';
import { LetterboxReveal } from '@/components/ui/LetterboxReveal';
import { RevealText } from '@/components/ui/RevealText';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import Loader from '@/components/layout/Loader';
import TheMachine from '@/components/sections/TheMachine';
import TheGrid from '@/components/sections/TheGrid';
import ManifestoSection from '@/components/sections/ManifestoSection';
import MarqueeTicker from '@/components/ui/MarqueeTicker';
import RidesSection from '@/components/sections/RidesSection';
import IABridgeSection from '@/components/sections/IABridgeSection';
import ProjectDetail from '@/components/sections/ProjectDetail';
import StatRevealSection from '@/components/sections/StatRevealSection';
import StorySection from '@/components/sections/StorySection';
import ActionGallery from '@/components/sections/ActionGallery';
import GallerySection from '@/components/sections/Gallery';
import ContactSection from '@/components/sections/ContactSection';
import Footer from '@/components/layout/Footer';
import HelmetSection from '@/components/sections/HelmetSection';
import ScanReveal from '@/components/ui/ScanReveal';
import { useUIStore } from '@/store/useUIStore';

export function Home() {
  const [loading, setLoading] = useState(true);
  const setIsLoaded = useUIStore((state) => state.setIsLoaded);

  return (
    <>
      {loading && <Loader onComplete={() => { setLoading(false); setIsLoaded(true); }} />}

      <main className={`relative z-10 w-full min-h-screen ${loading ? 'h-screen overflow-hidden' : ''}`}>

        {/* ── IGNITION ── Hero */}
        <Navbar />
        <Hero isLoaded={!loading} />

        {/* ── THE MACHINE ── Specs & telemetry */}
        <ScanReveal><TheMachine /></ScanReveal>

        {/* ── IDENTITY ── Philosophy */}
        <ScanReveal><ManifestoSection /></ScanReveal>

        {/* ── PULSE ── Speed burst */}
        <MarqueeTicker dark={true} />

        {/* ── GEAR ── 3D helmet scroll-driven reveal */}
        <HelmetSection />

        {/* ── DOCTRINE ── Single statement */}
        <ScanReveal>
          <section className="min-h-screen w-full bg-darker px-10 py-52 md:py-64 border-t border-white/5 relative z-20 flex flex-col justify-center items-center text-center">
            <InertialLag strength={4}>
              <RevealText
                text="Built To Move."
                className="text-[9vw] md:text-[7vw] font-black max-w-5xl leading-[0.88] tracking-tighter"
              />
            </InertialLag>
            <InertialLag strength={2}>
              <p className="text-white/25 text-sm mt-16 max-w-md leading-relaxed tracking-wide">
                The discipline never changes.
                Find the apex. Ship the work.
              </p>
            </InertialLag>
          </section>
        </ScanReveal>

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

        {/* ── THE GRID ── Routes & turf */}
        <ScanReveal><TheGrid /></ScanReveal>

        {/* ── VISUAL ARCHIVE ── Full gallery */}
        <LetterboxReveal>
          <GallerySection />
        </LetterboxReveal>

        {/* ── CONNECT ── Contact */}
        <ContactSection />

        {/* ── FOOTER ── */}
        <Footer />

      </main>

      {/* ── PROJECT DETAIL OVERLAY ── */}
      <ProjectDetail />
    </>
  );
}
