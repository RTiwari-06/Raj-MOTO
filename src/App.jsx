import { useState } from 'react';
import { SmoothScroll } from './utils/Lenis';
import { InertialLag } from './motion/InertialLag';
import { Cursor } from './components/Cursor';
import ViewportFrame from './components/ViewportFrame';
import { LetterboxReveal } from './components/LetterboxReveal';
import { RevealText } from './components/RevealText';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Loader from './components/Loader';
import ManifestoSection from './components/ManifestoSection';
import MarqueeTicker from './components/MarqueeTicker';
import RidesSection from './components/RidesSection';
import IABridgeSection from './components/IABridgeSection';
import ProjectDetail from './components/ProjectDetail';
import StatRevealSection from './components/StatRevealSection';
import StorySection from './components/StorySection';
import ActionGallery from './components/ActionGallery';
import GallerySection from './components/Gallery';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import HelmetSection from './components/HelmetSection';
import ScanReveal from './components/ScanReveal';
import { MEDIA } from './data/media';
import { useUIStore } from './store/useUIStore';

function App() {
  const [loading,    setLoading]    = useState(true);
  const [detailRide, setDetailRide] = useState(null);
  const setIsLoaded = useUIStore((state) => state.setIsLoaded);

  return (
    <SmoothScroll>
      <Cursor />
      <ViewportFrame />

      {loading && <Loader onComplete={() => { setLoading(false); setIsLoaded(true); }} />}

      <main className={`relative z-10 w-full min-h-screen ${loading ? 'h-screen overflow-hidden' : ''}`}>

        {/* ── IGNITION ── Hero */}
        <Navbar />
        <Hero isLoaded={!loading} />

        {/* ── IDENTITY ── Philosophy */}
        <ScanReveal><ManifestoSection /></ScanReveal>

        {/* ── PULSE ── Speed burst */}
        <MarqueeTicker dark={true} />

        {/* ── GEAR ── 3D helmet scroll-driven reveal */}
        <HelmetSection />

        {/* ── DOCTRINE ── Single statement */}
        <ScanReveal>
          <section className="min-h-screen w-full bg-darker px-10 py-40 border-t border-white/5 relative z-20 flex flex-col justify-center items-center text-center">
            <InertialLag strength={6}>
              <RevealText
                text="Built To Fight. Wired To Win."
                className="text-[8vw] font-black max-w-6xl leading-[0.9] tracking-tighter"
              />
            </InertialLag>
            <InertialLag strength={3}>
              <p className="text-muted text-sm mt-10 max-w-sm leading-relaxed tracking-wide">
                Code Is The Blueprint. Motion Is The Soul.
                Whether It's A GSAP Timeline Or A Mountain Pass,
                The Discipline Never Changes — Find The Apex. Ship The Work.
              </p>
            </InertialLag>
          </section>
        </ScanReveal>

        {/* ── RIDES ── Archive horizontal showcase (pinned — no ScanReveal wrapper) */}
        <RidesSection onViewDetail={setDetailRide} />

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

        {/* ── VISUAL ARCHIVE ── Full gallery (anamorphic frame) */}
        <LetterboxReveal>
          <GallerySection />
        </LetterboxReveal>

        {/* ── CONNECT ── Contact */}
        <ContactSection />

        {/* ── FOOTER ── */}
        <Footer />

      </main>

      {/* ── PROJECT DETAIL OVERLAY ── slides up over the page ───────────── */}
      {detailRide && (
        <ProjectDetail
          ride={detailRide}
          rides={MEDIA.rides}
          rideIndex={MEDIA.rides.findIndex((r) => r.id === detailRide.id)}
          onClose={() => setDetailRide(null)}
          onNavigate={(idx) => setDetailRide(MEDIA.rides[idx])}
        />
      )}

    </SmoothScroll>
  );
}

export default App;
