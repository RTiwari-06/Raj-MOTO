import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useStore } from '@/store/useStore';
import { MEDIA } from '@/data/media';
import vertexShader   from '@/shaders/heroVertex.glsl';
import fragmentShader from '@/shaders/heroFragment.glsl';

export function HeroShaderMesh() {
  const meshRef       = useRef();

  const imageMouse    = useStore((s) => s.imageMouse);
  const imageHovering = useStore((s) => s.imageHovering);

  // GSAP quickTo handles the inertial lag — the scan line drags behind the cursor
  const mouseUniform = useRef(new THREE.Vector2(0.5, 0.5));
  const xTo = useRef(null);
  const yTo = useRef(null);

  const velocityRef = useRef(0);
  const prevMouse = useRef({ x: 0.5, y: 0.5 });
  const hoverVal = useRef(0);

  const [baseTexture, revealTexture] = useTexture([MEDIA.hero.primary, MEDIA.hero.reveal]);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        u_texBase:      { value: baseTexture },
        u_texReveal:    { value: revealTexture },
        u_mouse:        { value: mouseUniform.current },
        u_revealRadius: { value: 0.35 },
        u_time:         { value: 0 },
        u_velocity:     { value: 0 },
        u_resolution:   { value: new THREE.Vector2(1, 1) },
        u_imageRes:     { value: new THREE.Vector2(baseTexture.image.width, baseTexture.image.height) },
        u_hover:        { value: 0 },
      },
    });
  }, [baseTexture, revealTexture]);

  useEffect(() => {
    // Phase 1: Refined inertia for a premium, weighty, and delayed cursor follow.
    xTo.current = gsap.quickTo(mouseUniform.current, 'x', { duration: 1.6, ease: 'power3.out' });
    yTo.current = gsap.quickTo(mouseUniform.current, 'y', { duration: 1.6, ease: 'power3.out' });
  }, []);

  useEffect(() => {
    if (xTo.current && yTo.current) {
      xTo.current(imageMouse.x);
      yTo.current(imageMouse.y);
    }
  }, [imageMouse]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const u = meshRef.current.material.uniforms;

    meshRef.current.scale.set(state.viewport.width, state.viewport.height, 1);
    u.u_resolution.value.set(state.viewport.width, state.viewport.height);
    u.u_time.value = state.clock.elapsedTime;

    // Phase 1: Premium, gradual hover transition for an atmospheric fade-in/out.
    const targetHover = imageHovering ? 1.0 : 0.0;
    hoverVal.current += (targetHover - hoverVal.current) * 0.04; // Slower, more cinematic interpolation
    u.u_hover.value = hoverVal.current;

    // Velocity tracking for parallax (influence reduced for a more subtle effect).
    const dx = u.u_mouse.value.x - prevMouse.current.x;
    const dy = u.u_mouse.value.y - prevMouse.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const targetVelocity = Math.min(dist * 20.0, 1.0);
    velocityRef.current += (targetVelocity - velocityRef.current) * 0.05;
    u.u_velocity.value = velocityRef.current;

    prevMouse.current.x = u.u_mouse.value.x;
    prevMouse.current.y = u.u_mouse.value.y;
  });

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}
