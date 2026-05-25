import { useEffect, useRef, useMemo, Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { EASE, ST } from '../motion/system';
import { MEDIA } from '../data/media';

gsap.registerPlugin(ScrollTrigger);

// GSAP writes, R3F reads — zero React re-renders
const scrollState = { progress: 0, accentMix: 0 };

function HelmetModel() {
  const groupRef = useRef();
  const accentLightRef = useRef();
  const { scene } = useGLTF('/helmet.glb');

  const cloned = useMemo(() => {
    const s = scene.clone(true);
    const box = new THREE.Box3().setFromObject(s);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    s.position.sub(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.4 / maxDim;
    s.scale.setScalar(scale);
    s.position.multiplyScalar(scale);
    return s;
  }, [scene]);

  const accentColor = useMemo(() => new THREE.Color('#D2FF00'), []);
  const neutralColor = useMemo(() => new THREE.Color('#555555'), []);
  const lerpColor = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.y = scrollState.progress * Math.PI * 2 + 0.4;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.03;

    if (accentLightRef.current) {
      lerpColor.lerpColors(neutralColor, accentColor, scrollState.accentMix);
      accentLightRef.current.color.copy(lerpColor);
      accentLightRef.current.intensity = 0.8 + scrollState.accentMix * 3;
    }
  });

  return (
    <>
      <group ref={groupRef}>
        <primitive object={cloned} />
      </group>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={1.0} />
      <directionalLight position={[-4, 3, -3]} intensity={0.3} color="#334488" />
      <pointLight ref={accentLightRef} position={[0, 3, 3]} intensity={0.8} distance={12} />
      <spotLight position={[-2, -2, 4]} intensity={0.2} angle={0.5} penumbra={1} />
    </>
  );
}

useGLTF.preload('/helmet.glb');

export default function HelmetSection() {
  const sectionRef = useRef(null);
  const degreeRef = useRef(null);
  const progressRef = useRef(null);
  const block1Ref = useRef(null);
  const block2Ref = useRef(null);
  const block3Ref = useRef(null);
  const finaleRef = useRef(null);
  const accentOverlayRef = useRef(null);
  const hudTopRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=300%',
          scrub: ST.scrub.standard,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (degreeRef.current) {
              degreeRef.current.textContent =
                `${String(Math.round(self.progress * 360)).padStart(3, '0')}°`;
            }
            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${self.progress})`;
            }
          },
        },
      });

      // R3F rotation driver
      tl.to(scrollState, { progress: 1, duration: 1, ease: EASE.scrub }, 0);

      // HUD entrance
      tl.fromTo(hudTopRef.current, { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0);

      // Phase 1: Identity (4% – 26%)
      tl.fromTo(
        block1Ref.current,
        { opacity: 0, x: -60 },
        { opacity: 1, x: 0, duration: 0.07, ease: EASE.precision },
        0.04,
      );
      tl.to(
        block1Ref.current,
        { opacity: 0, x: 60, duration: 0.05, ease: EASE.exit },
        0.21,
      );

      // Phase 2: Machine (32% – 54%)
      tl.fromTo(
        block2Ref.current,
        { opacity: 0, x: 60 },
        { opacity: 1, x: 0, duration: 0.07, ease: EASE.precision },
        0.32,
      );
      tl.to(
        block2Ref.current,
        { opacity: 0, x: -60, duration: 0.05, ease: EASE.exit },
        0.49,
      );

      // Phase 3: Philosophy (60% – 80%)
      tl.fromTo(
        block3Ref.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.07, ease: EASE.precision },
        0.60,
      );
      tl.to(
        block3Ref.current,
        { opacity: 0, y: -30, duration: 0.05, ease: EASE.exit },
        0.76,
      );

      // Phase 4: Accent wash (85% – 100%)
      tl.to(scrollState, { accentMix: 1, duration: 0.15, ease: EASE.momentum }, 0.85);
      tl.fromTo(
        accentOverlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.15, ease: EASE.momentum },
        0.85,
      );
      tl.fromTo(
        finaleRef.current,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.10, ease: EASE.precision },
        0.88,
      );
    }, sectionRef);

    return () => {
      ctx.revert();
      scrollState.progress = 0;
      scrollState.accentMix = 0;
    };
  }, []);

  const d = MEDIA.helmet;

  return (
    <section
      ref={sectionRef}
      id="gear"
      className="relative w-full h-screen bg-black overflow-hidden"
    >
      {/* Background textures */}
      <div className="absolute inset-0 scan-lines pointer-events-none z-0" />
      <div className="absolute inset-0 hairline-grid pointer-events-none z-0 opacity-30" />

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-10">
        <Canvas
          camera={{ position: [0, 0.3, 4.5], fov: 40, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <HelmetModel />
            <Environment preset="studio" environmentIntensity={0.25} />
          </Suspense>
        </Canvas>
      </div>

      {/* Accent wash radial overlay */}
      <div
        ref={accentOverlayRef}
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          opacity: 0,
          background:
            'radial-gradient(ellipse at center, rgba(210,255,0,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Corner registration marks */}
      <div className="absolute top-4 left-4 w-6 h-[1px] bg-white/15 pointer-events-none z-40" />
      <div className="absolute top-4 left-4 w-[1px] h-6 bg-white/15 pointer-events-none z-40" />
      <div className="absolute top-4 right-4 w-6 h-[1px] bg-white/15 pointer-events-none z-40" />
      <div className="absolute top-4 right-4 w-[1px] h-6 bg-white/15 pointer-events-none z-40" />
      <div className="absolute bottom-4 left-4 w-6 h-[1px] bg-white/15 pointer-events-none z-40" />
      <div className="absolute bottom-4 left-4 w-[1px] h-6 bg-white/15 pointer-events-none z-40" />
      <div className="absolute bottom-4 right-4 w-6 h-[1px] bg-white/15 pointer-events-none z-40" />
      <div className="absolute bottom-4 right-4 w-[1px] h-6 bg-white/15 pointer-events-none z-40" />

      {/* HUD top bar */}
      <div
        ref={hudTopRef}
        className="absolute top-0 left-0 right-0 z-40 pointer-events-none px-8 md:px-16 py-6 flex items-center justify-between"
        style={{ opacity: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-[#D2FF00] animate-pulse" />
          <span className="text-[9px] font-black tracking-[0.35em] uppercase text-[#D2FF00]/60">
            {d.sectionLabel}
          </span>
        </div>
        <span
          ref={degreeRef}
          className="font-mono text-[28px] md:text-[36px] font-black text-white/8 tracking-tight select-none"
        >
          000&deg;
        </span>
      </div>

      {/* ── Phase 1: Rider Identity ── */}
      <div
        ref={block1Ref}
        className="absolute z-30 pointer-events-none left-8 md:left-16 bottom-28 md:bottom-auto md:top-1/2 md:-translate-y-1/2"
        style={{ opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-2 bg-[#D2FF00]" />
          <span className="text-[9px] font-black tracking-[0.35em] uppercase text-[#D2FF00]/70">
            RIDER // IDENTITY
          </span>
        </div>
        <h3
          className="font-serif font-black uppercase text-white leading-none"
          style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '-0.03em' }}
        >
          {d.rider.name}
        </h3>
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 mt-3">
          {d.rider.role}
        </p>
        <p className="font-mono text-[9px] tracking-[0.25em] uppercase text-white/20 mt-1.5">
          {d.rider.tag}
        </p>
      </div>

      {/* ── Phase 2: Machine Specs ── */}
      <div
        ref={block2Ref}
        className="absolute z-30 pointer-events-none right-8 md:right-16 bottom-28 md:bottom-auto md:top-1/2 md:-translate-y-1/2 text-right"
        style={{ opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-3 justify-end">
          <span className="text-[9px] font-black tracking-[0.35em] uppercase text-[#D2FF00]/70">
            MACHINE // SPEC
          </span>
          <div className="w-2 h-2 bg-[#D2FF00]" />
        </div>
        <h3
          className="font-serif font-black uppercase text-white leading-none"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', letterSpacing: '-0.03em' }}
        >
          {d.machine.model}
        </h3>
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 mt-3">
          {d.machine.variant}
        </p>
        <div className="mt-5 space-y-2">
          {d.machine.specs.map((s) => (
            <div key={s.label} className="flex items-center justify-end gap-4">
              <span className="text-[9px] tracking-[0.3em] uppercase text-white/25 font-mono">
                {s.label}
              </span>
              <span className="text-[11px] font-black text-white/60 font-mono">
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Phase 3: Philosophy ── */}
      <div
        ref={block3Ref}
        className="absolute z-30 pointer-events-none bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 text-center max-w-lg px-6"
        style={{ opacity: 0 }}
      >
        <div className="flex items-center gap-3 justify-center mb-4">
          <div className="h-px w-8 bg-[#D2FF00]/30" />
          <span className="text-[9px] font-black tracking-[0.35em] uppercase text-[#D2FF00]/70">
            PHILOSOPHY
          </span>
          <div className="h-px w-8 bg-[#D2FF00]/30" />
        </div>
        <p
          className="font-serif italic text-white/80 leading-relaxed"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
        >
          &ldquo;{d.philosophy.quote}&rdquo;
        </p>
        <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#D2FF00]/50 mt-3">
          &mdash; {d.philosophy.author}
        </p>
      </div>

      {/* ── Phase 4: Finale ── */}
      <div
        ref={finaleRef}
        className="absolute z-30 pointer-events-none inset-0 flex items-end justify-center pb-16 md:pb-20"
        style={{ opacity: 0 }}
      >
        <div className="text-center">
          <div className="flex items-center gap-4 justify-center mb-2">
            <div className="h-px w-12 bg-[#D2FF00]/40" />
            <span className="text-[9px] font-black tracking-[0.4em] uppercase text-[#D2FF00]">
              GEAR CHECK // COMPLETE
            </span>
            <div className="h-px w-12 bg-[#D2FF00]/40" />
          </div>
          <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-white/20 mt-1">
            360&deg; INSPECTION VERIFIED
          </p>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 z-40 h-[2px] bg-white/5">
        <div
          ref={progressRef}
          className="h-full bg-[#D2FF00]/60 origin-left"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>
    </section>
  );
}
