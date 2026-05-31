import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import vertexShader from '@/shaders/fluidVertex.glsl';
import fragmentShader from '@/shaders/fluidFragment.glsl';

export function FluidBackground() {
  const meshRef = useRef();

  const smoothMouse = useRef({ x: 0.5, y: 0.5 });
  const smoothFall  = useRef(0);   // 0 = still, 1 = falling (ramps with hover)
  const fallOffset  = useRef(0);   // continuous downward accumulator (never jumps)

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime:       { value: 0 },
        uMouse:      { value: new THREE.Vector2(0.5, 0.5) },
        uIntensity:  { value: 0 },
        uFall:       { value: 0 },
        uFallOffset: { value: 0 },
      },
      depthWrite: false, // Ensure it sits behind the main mesh without depth issues
    });
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const u = meshRef.current.material.uniforms;
    const st = useStore.getState();

    // ── Mouse → fluid (slow, invisible follow) ───────────────────────────────
    const tx = (st.mouse.x + 1.0) * 0.5;
    const ty = (st.mouse.y + 1.0) * 0.5;
    smoothMouse.current.x += (tx - smoothMouse.current.x) * 0.04;
    smoothMouse.current.y += (ty - smoothMouse.current.y) * 0.04;

    // ── Falling stars: ramp up while the cursor is over the hero, freeze on exit
    // fallOffset accumulates (delta × ramp) so it never jumps when motion stops.
    const active = st.imageHovering ? 1 : 0;
    smoothFall.current += (active - smoothFall.current) * 0.05;
    fallOffset.current += delta * 0.12 * smoothFall.current;

    u.uTime.value       = state.clock.elapsedTime;
    u.uMouse.value.set(smoothMouse.current.x, smoothMouse.current.y);
    u.uIntensity.value  = st.fluidIntensity;
    u.uFall.value       = smoothFall.current;
    u.uFallOffset.value = fallOffset.current;

    meshRef.current.scale.set(state.viewport.width * 1.5, state.viewport.height * 1.5, 1);
  });

  return (
    <mesh ref={meshRef} material={shaderMaterial} position={[0, 0, -1]}>
      {/* 1x1 geometry so scale drives the size perfectly without rebuilding */}
      <planeGeometry args={[1, 1, 1, 1]} />
    </mesh>
  );
}
