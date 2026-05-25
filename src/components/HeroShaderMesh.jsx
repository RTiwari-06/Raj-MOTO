import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import vertexShader   from '../shaders/heroVertex.glsl?raw';
import fragmentShader from '../shaders/heroFragment.glsl?raw';

const CONFIG = {
  revealRadius:   0.35,
  mouseLerpSpeed: 0.1,
  hoverLerpSpeed: 0.06,
};

export function HeroShaderMesh() {
  const meshRef       = useRef();

  const imageMouse    = useStore((s) => s.imageMouse);
  const imageHovering = useStore((s) => s.imageHovering);

  const smoothMouse = useRef({ x: 0.5, y: 0.5 });
  const smoothHover = useRef(0);

  const [baseTexture, revealTexture] = useTexture(['/base.jpg', '/reveal.jpg']);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture:      { value: baseTexture },
        uTexture2:     { value: revealTexture },
        uMouse:        { value: new THREE.Vector2(0.5, 0.5) },
        uHover:        { value: 0 },
        uRevealRadius: { value: CONFIG.revealRadius },
        uResolution:   { value: new THREE.Vector2(1, 1) }, // Updated in frame
        uImageRes:     { value: new THREE.Vector2(baseTexture.image.width, baseTexture.image.height) },
      },
    });
  }, [baseTexture, revealTexture]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const u = meshRef.current.material.uniforms;

    // Dynamically scale the mesh to exactly fit the viewport
    // This fixes any letterboxing or squashing if the canvas resizes on scroll
    meshRef.current.scale.set(state.viewport.width, state.viewport.height, 1);
    u.uResolution.value.set(state.viewport.width, state.viewport.height);

    smoothMouse.current.x += (imageMouse.x - smoothMouse.current.x) * CONFIG.mouseLerpSpeed;
    smoothMouse.current.y += (imageMouse.y - smoothMouse.current.y) * CONFIG.mouseLerpSpeed;
    u.uMouse.value.set(smoothMouse.current.x, smoothMouse.current.y);

    const target = imageHovering ? 1.0 : 0.0;
    smoothHover.current += (target - smoothHover.current) * CONFIG.hoverLerpSpeed;
    u.uHover.value = smoothHover.current;
  });

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      {/* A 1x1 geometry scaled by useFrame matches viewport perfectly */}
      <planeGeometry args={[1, 1, 1, 1]} />
    </mesh>
  );
}
