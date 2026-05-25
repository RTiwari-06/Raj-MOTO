import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import vertexShader from '../shaders/fluidVertex.glsl?raw';
import fragmentShader from '../shaders/fluidFragment.glsl?raw';

export function FluidBackground() {
  const meshRef = useRef();
  const imageMouse = useStore((s) => s.imageMouse);
  const fluidIntensity = useStore((s) => s.fluidIntensity);

  // Smooth mouse for the fluid
  const smoothMouse = useRef({ x: 0.5, y: 0.5 });

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uIntensity: { value: 0 },
      },
      depthWrite: false, // Ensure it sits behind the main mesh without depth issues
    });
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const u = meshRef.current.material.uniforms;

    // Smooth the mouse movement
    smoothMouse.current.x += (imageMouse.x - smoothMouse.current.x) * 0.05;
    smoothMouse.current.y += (imageMouse.y - smoothMouse.current.y) * 0.05;

    u.uTime.value = state.clock.elapsedTime;
    u.uMouse.value.set(smoothMouse.current.x, smoothMouse.current.y);
    u.uIntensity.value = fluidIntensity;

    // Scale dynamically to always cover the viewport (x1.5 for margin)
    meshRef.current.scale.set(state.viewport.width * 1.5, state.viewport.height * 1.5, 1);
  });

  return (
    <mesh ref={meshRef} material={shaderMaterial} position={[0, 0, -1]}>
      {/* 1x1 geometry so scale drives the size perfectly without rebuilding */}
      <planeGeometry args={[1, 1, 1, 1]} />
    </mesh>
  );
}
