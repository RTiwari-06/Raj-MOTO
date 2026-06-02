import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { MEDIA } from '@/data/media';
import vertexShader   from '@/shaders/heroVertex.glsl';
import fragmentShader from '@/shaders/heroFragment.glsl';

// ─── RETIRED MECHANIC (2026-06-02) ────────────────────────────────────────────
// The cursor-driven base→reveal diagonal wipe has been REPLACED by a DOM
// clip-path scroll reveal in Hero.jsx (Approach B / B1). This mesh is no longer
// mounted by Hero.jsx — the file is kept for reference / potential reuse.
// The mouse-reveal wiring is DISABLED: u_mouse / u_velocity / u_hover are frozen
// and the cursor inertia (gsap.quickTo) + velocity + hover lerp were removed.
// Only u_time and u_resolution remain live so the shader still grades correctly
// if ever re-mounted. WebGL in the hero is now atmosphere-only (FluidBackground).
export function HeroShaderMesh() {
  const meshRef = useRef();

  const [baseTexture, revealTexture] = useTexture([MEDIA.hero.primary, MEDIA.hero.reveal]);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        u_texBase:      { value: baseTexture },
        u_texReveal:    { value: revealTexture },
        u_mouse:        { value: new THREE.Vector2(0.5, 0.5) }, // frozen — reveal retired
        u_revealRadius: { value: 0.35 },
        u_time:         { value: 0 },
        u_velocity:     { value: 0 },                            // frozen — reveal retired
        u_resolution:   { value: new THREE.Vector2(1, 1) },
        u_imageRes:     { value: new THREE.Vector2(baseTexture.image.width, baseTexture.image.height) },
        u_hover:        { value: 0 },                            // frozen — reveal retired
      },
    });
  }, [baseTexture, revealTexture]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const u = meshRef.current.material.uniforms;

    meshRef.current.scale.set(state.viewport.width, state.viewport.height, 1);
    u.u_resolution.value.set(state.viewport.width, state.viewport.height);
    u.u_time.value = state.clock.elapsedTime;

    // DISABLED: cursor inertia (gsap.quickTo on u_mouse), per-frame velocity
    // calculation (u_velocity) and the hover lerp (u_hover) that previously drove
    // the diagonal base→reveal wipe. The reveal is now DOM clip-path (Hero.jsx).
  });

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}
