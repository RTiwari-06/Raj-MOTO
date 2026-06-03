// THE GEAR CHECK — cinematic boot/scan sequence.
// Pinned, scroll-scrubbed instrument startup: camera choreographs around the
// DamagedHelmet GLB while a telemetry HUD boots → scans → calibrates → ignites
// → locks in. GSAP writes a plain `scrollState`; R3F (camera, model, lights)
// and the GSAP timeline (HUD + DOM post-FX) read it — zero React re-renders.
import { useEffect, useRef, useMemo, Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { EASE, ST } from '@/motion/system';
import { MEDIA } from '@/data/media';

gsap.registerPlugin(ScrollTrigger);

// GSAP writes, R3F reads — zero React re-renders
const scrollState = { progress: 0, scanMix: 0, accentMix: 0, igniteMix: 0 };

// ── Camera choreography ─────────────────────────────────────────────────────
// Orbit keyframes: r = radius, t = Y-orbit angle (rad), h = camera height,
// ty = look-at height. Far dolly-in → orbit scan → push to visor → pull-back
// ignition → settle to a hero 3/4 view.
const CAM_STOPS = [
  { p: 0.00, r: 8.4, t: -0.55, h: 0.55, ty: 0.04 }, // POWER ON (far, dark)
  { p: 0.12, r: 5.7, t: -0.42, h: 0.46, ty: 0.05 }, // dolly settled
  { p: 0.40, r: 4.6, t:  0.58, h: 0.30, ty: 0.08 }, // SCAN orbit L→R
  { p: 0.66, r: 3.15, t: 0.12, h: 0.56, ty: 0.40 }, // CALIBRATION push to visor
  { p: 0.85, r: 5.15, t: -0.14, h: 0.36, ty: 0.10 }, // IGNITION pull back
  { p: 1.00, r: 4.35, t:  0.34, h: 0.32, ty: 0.07 }, // READY settle
];

const smoothstep = (t) => {
  t = Math.min(1, Math.max(0, t));
  return t * t * (3 - 2 * t);
};

function cameraAt(p) {
  let a = CAM_STOPS[0];
  let b = CAM_STOPS[CAM_STOPS.length - 1];
  for (let i = 0; i < CAM_STOPS.length - 1; i++) {
    if (p >= CAM_STOPS[i].p && p <= CAM_STOPS[i + 1].p) {
      a = CAM_STOPS[i];
      b = CAM_STOPS[i + 1];
      break;
    }
  }
  const span = b.p - a.p || 1;
  const t = smoothstep((p - a.p) / span);
  const r = a.r + (b.r - a.r) * t;
  const th = a.t + (b.t - a.t) * t;
  const h = a.h + (b.h - a.h) * t;
  const ty = a.ty + (b.ty - a.ty) * t;
  return { x: Math.sin(th) * r, y: h, z: Math.cos(th) * r, ty };
}

function CameraRig() {
  const { camera } = useThree();
  const desired = useRef(new THREE.Vector3(0, 0.5, 8.4));
  const lookTarget = useRef(new THREE.Vector3(0, 0.04, 0));
  const tmpLook = useRef(new THREE.Vector3());

  useFrame(() => {
    const c = cameraAt(scrollState.progress);
    desired.current.set(c.x, c.y, c.z);
    camera.position.lerp(desired.current, 0.1);
    tmpLook.current.set(0, c.ty, 0);
    lookTarget.current.lerp(tmpLook.current, 0.1);
    camera.lookAt(lookTarget.current);
  });
  return null;
}

function HelmetModel() {
  const groupRef = useRef();
  const accentLightRef = useRef();
  const { scene } = useGLTF('/helmet.glb');

  // Return both the prepared scene and its (cloned) materials from the memo —
  // never write a ref during render. useFrame closes over `materials` directly.
  const { object: cloned, materials } = useMemo(() => {
    const s = scene.clone(true);
    const box = new THREE.Box3().setFromObject(s);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    s.position.sub(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.4 / maxDim;
    s.scale.setScalar(scale);
    s.position.multiplyScalar(scale);

    // Clone materials so emissive "power-on" doesn't mutate the cached GLTF.
    const mats = [];
    s.traverse((o) => {
      if (o.isMesh && o.material) {
        o.material = o.material.clone();
        o.material.emissiveIntensity = 0.05;
        mats.push(o.material);
      }
    });
    return { object: s, materials: mats };
  }, [scene]);

  const accentColor = useMemo(() => new THREE.Color('#D2FF00'), []);
  const neutralColor = useMemo(() => new THREE.Color('#555555'), []);
  const lerpColor = useMemo(() => new THREE.Color(), []);
  const reduced = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        0.4 + scrollState.progress * 0.7 + Math.sin(state.clock.elapsedTime * 0.3) * 0.04;
      groupRef.current.position.y = reduced.current
        ? 0
        : Math.sin(state.clock.elapsedTime * 0.6) * 0.03;
    }

    // Emissive power-on — the helmet's own lights glow as it ignites.
    const e = scrollState.igniteMix;
    for (const m of materials) m.emissiveIntensity = 0.05 + e * 2.2;

    if (accentLightRef.current) {
      lerpColor.lerpColors(neutralColor, accentColor, scrollState.accentMix);
      accentLightRef.current.color.copy(lerpColor);
      accentLightRef.current.intensity =
        0.6 + scrollState.accentMix * 3 + scrollState.igniteMix * 2.4;
    }
  });

  return (
    <>
      <group ref={groupRef}>
        <primitive object={cloned} />
      </group>
      <ambientLight intensity={0.12} />
      <directionalLight position={[5, 5, 5]} intensity={1.1} />
      <directionalLight position={[-4, 3, -3]} intensity={0.35} color="#334488" />
      <directionalLight position={[0, 2, -6]} intensity={0.85} color="#ffffff" />
      <pointLight ref={accentLightRef} position={[0, 3, 3]} intensity={0.6} distance={14} />
      <spotLight position={[-2, -2, 4]} intensity={0.22} angle={0.5} penumbra={1} />
    </>
  );
}

useGLTF.preload('/helmet.glb');

export default function HelmetSection() {
  const sectionRef = useRef(null);
  const degreeRef = useRef(null);
  const scanPctRef = useRef(null);
  const progressRef = useRef(null);
  const hudTopRef = useRef(null);

  const bootRef = useRef(null);
  const identityRef = useRef(null);
  const calibRef = useRef(null);
  const philoRef = useRef(null);
  const finaleRef = useRef(null);
  const reticleRef = useRef(null);
  const scanlineRef = useRef(null);
  const bloomRef = useRef(null);

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
            const p = self.progress;
            if (degreeRef.current) {
              degreeRef.current.textContent = `${String(Math.round(p * 360)).padStart(3, '0')}°`;
            }
            if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
            if (scanPctRef.current) {
              // Scan completion across the SCAN beat (0.12 → 0.40).
              const s = Math.min(1, Math.max(0, (p - 0.12) / 0.28));
              scanPctRef.current.textContent = String(Math.round(s * 100)).padStart(3, '0');
            }
          },
        },
      });

      // R3F drivers
      tl.to(scrollState, { progress: 1, duration: 1, ease: EASE.scrub }, 0);
      tl.to(scrollState, { scanMix: 1, duration: 0.05, ease: EASE.momentum }, 0.12);
      tl.to(scrollState, { accentMix: 1, duration: 0.14, ease: EASE.momentum }, 0.66);
      tl.to(scrollState, { igniteMix: 1, duration: 0.16, ease: EASE.momentum }, 0.66);

      // HUD chrome
      tl.fromTo(hudTopRef.current, { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0);

      // ── POWER ON (0 – 0.12) ──
      tl.fromTo(bootRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.035, ease: EASE.precision }, 0);
      tl.to(bootRef.current, { opacity: 0, y: -14, duration: 0.03, ease: EASE.exit }, 0.11);

      // ── SYSTEMS SCAN (0.12 – 0.40) ── reticle + travelling scanline + identity
      tl.fromTo(reticleRef.current, { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.04, ease: EASE.precision }, 0.13);
      tl.set(scanlineRef.current, { top: '16%' }, 0.12);
      tl.fromTo(scanlineRef.current, { opacity: 0 }, { opacity: 0.85, duration: 0.02 }, 0.12);
      tl.to(scanlineRef.current, { top: '84%', duration: 0.26, ease: 'none' }, 0.12);
      tl.to(scanlineRef.current, { opacity: 0, duration: 0.03 }, 0.38);
      tl.fromTo(identityRef.current, { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.06, ease: EASE.precision }, 0.16);
      tl.to(identityRef.current, { opacity: 0, x: 60, duration: 0.05, ease: EASE.exit }, 0.37);

      // ── CALIBRATION (0.40 – 0.66) ── spec telemetry table
      tl.fromTo(calibRef.current, { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.06, ease: EASE.precision }, 0.42);
      tl.to(calibRef.current, { opacity: 0, x: -60, duration: 0.05, ease: EASE.exit }, 0.63);
      tl.to(reticleRef.current, { opacity: 0, scale: 0.7, duration: 0.05, ease: EASE.exit }, 0.63);

      // ── IGNITION (0.66 – 0.85) ── lime bloom wash + philosophy
      tl.fromTo(bloomRef.current, { opacity: 0 }, { opacity: 1, duration: 0.16, ease: EASE.momentum }, 0.66);
      tl.fromTo(philoRef.current, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.07, ease: EASE.precision }, 0.69);
      tl.to(philoRef.current, { opacity: 0, y: -26, duration: 0.05, ease: EASE.exit }, 0.83);

      // ── READY TO RACE (0.85 – 1.0) ── finale seal
      tl.fromTo(finaleRef.current, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.1, ease: EASE.precision }, 0.87);
    }, sectionRef);

    return () => {
      ctx.revert();
      scrollState.progress = 0;
      scrollState.scanMix = 0;
      scrollState.accentMix = 0;
      scrollState.igniteMix = 0;
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
          camera={{ position: [0, 0.5, 8.4], fov: 42, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <CameraRig />
            <HelmetModel />
            <Environment preset="studio" environmentIntensity={0.25} />
          </Suspense>
        </Canvas>
      </div>

      {/* ── DOM post-FX ── */}
      {/* Cinematic vignette (always on, subtle) */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.55) 100%)' }}
      />
      {/* Film grain */}
      <div className="grain-layer z-20" />
      {/* Travelling scan line */}
      <div
        ref={scanlineRef}
        className="hfx absolute left-0 right-0 z-30 pointer-events-none"
        style={{
          top: '16%',
          height: '2px',
          opacity: 0,
          background: 'linear-gradient(90deg, transparent, rgba(210,255,0,0.9) 50%, transparent)',
          boxShadow: '0 0 16px rgba(210,255,0,0.6)',
        }}
      />
      {/* Ignition bloom wash */}
      <div
        ref={bloomRef}
        className="hfx absolute inset-0 z-20 pointer-events-none"
        style={{
          opacity: 0,
          background:
            'radial-gradient(ellipse at center, rgba(210,255,0,0.16) 0%, rgba(210,255,0,0.04) 40%, transparent 72%)',
        }}
      />

      {/* Center scan reticle */}
      <div
        ref={reticleRef}
        className="hfx absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
        style={{ opacity: 0, width: 'min(60vh, 60vw)', height: 'min(60vh, 60vw)' }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 border border-[#D2FF00]/15 rounded-full" />
        <div className="absolute inset-[18%] border border-[#D2FF00]/10 rounded-full" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-[#D2FF00]/15" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#D2FF00]/15" />
        <span className="brk tl" style={{ top: '12%', left: '12%' }} />
        <span className="brk tr" style={{ top: '12%', right: '12%' }} />
        <span className="brk bl" style={{ bottom: '12%', left: '12%' }} />
        <span className="brk br" style={{ bottom: '12%', right: '12%' }} />
      </div>

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
        className="absolute top-0 left-0 right-0 z-40 pointer-events-none px-8 md:px-16 py-6 flex items-start justify-between"
        style={{ opacity: 0 }}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-[#D2FF00] animate-pulse" />
            <span className="text-[9px] font-black tracking-[0.35em] uppercase text-[#D2FF00]/60">
              {d.sectionLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.25em] uppercase text-white/30">
            <span>SCAN</span>
            <span ref={scanPctRef} className="text-[#D2FF00]/70 tabular-nums">000</span>
            <span>%</span>
          </div>
        </div>
        <span
          ref={degreeRef}
          className="font-mono text-[28px] md:text-[40px] font-black text-white/10 tracking-tight select-none tabular-nums"
        >
          000&deg;
        </span>
      </div>

      {/* ── POWER ON ── */}
      <div
        ref={bootRef}
        className="absolute z-30 pointer-events-none left-8 md:left-16 top-1/2 -translate-y-1/2"
        style={{ opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-2 bg-[#D2FF00] animate-pulse" />
          <span className="text-[9px] font-black tracking-[0.4em] uppercase text-[#D2FF00]/70">
            SYS // POWER ON
          </span>
        </div>
        <h3
          className="font-serif font-black uppercase text-white leading-none"
          style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)', letterSpacing: '-0.04em' }}
        >
          GEAR CHECK
        </h3>
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/35 mt-3">
          Initialising inspection sequence…
        </p>
      </div>

      {/* ── SYSTEMS SCAN · Rider Identity ── */}
      <div
        ref={identityRef}
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

      {/* ── CALIBRATION · Machine Spec ── */}
      <div
        ref={calibRef}
        className="absolute z-30 pointer-events-none right-8 md:right-16 bottom-28 md:bottom-auto md:top-1/2 md:-translate-y-1/2 text-right"
        style={{ opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-3 justify-end">
          <span className="text-[9px] font-black tracking-[0.35em] uppercase text-[#D2FF00]/70">
            CALIBRATION // SPEC
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
              <span className="text-[11px] font-black text-white/60 font-mono tabular-nums">
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── IGNITION · Philosophy ── */}
      <div
        ref={philoRef}
        className="absolute z-30 pointer-events-none bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 text-center max-w-lg px-6"
        style={{ opacity: 0 }}
      >
        <div className="flex items-center gap-3 justify-center mb-4">
          <div className="h-px w-8 bg-[#D2FF00]/30" />
          <span className="text-[9px] font-black tracking-[0.35em] uppercase text-[#D2FF00]/70">
            IGNITION
          </span>
          <div className="h-px w-8 bg-[#D2FF00]/30" />
        </div>
        <p
          className="font-serif italic text-white/85 leading-relaxed"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
        >
          &ldquo;{d.philosophy.quote}&rdquo;
        </p>
        <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#D2FF00]/50 mt-3">
          &mdash; {d.philosophy.author}
        </p>
      </div>

      {/* ── READY TO RACE · Finale ── */}
      <div
        ref={finaleRef}
        className="absolute z-30 pointer-events-none inset-0 flex items-end justify-center pb-16 md:pb-20"
        style={{ opacity: 0 }}
      >
        <div className="text-center">
          <div className="flex items-center gap-4 justify-center mb-2">
            <div className="h-px w-12 bg-[#D2FF00]/40" />
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#D2FF00]">
              READY TO RACE
            </span>
            <div className="h-px w-12 bg-[#D2FF00]/40" />
          </div>
          <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-white/25 mt-1">
            360&deg; INSPECTION VERIFIED // GEAR CHECK COMPLETE
          </p>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 z-40 h-[2px] bg-white/5">
        <div
          ref={progressRef}
          className="h-full bg-[#D2FF00]/70 origin-left"
          style={{ transform: 'scaleX(0)', boxShadow: '0 0 10px rgba(210,255,0,0.5)' }}
        />
      </div>
    </section>
  );
}
