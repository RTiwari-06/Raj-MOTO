import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '@/store/useStore';
import * as THREE from 'three';

export function BackgroundOrb() {
  const groupRef = useRef();
  const orbRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const accentLight = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const { mouse } = useStore.getState();

    // Smooth container follow (parallax effect mapping to mouse)
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, mouse.x * 2.5, 0.05);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, mouse.y * 1.5, 0.05);
    }

    if (orbRef.current) {
      // Rotation based on time directly mapping vanilla WebGL exactly
      orbRef.current.rotation.x = mouse.y * 0.5 + t * 0.08;
      orbRef.current.rotation.y = mouse.x * 0.8 + t * 0.12;
      orbRef.current.position.y = Math.sin(t * 0.7) * 0.25;
    }

    if (ring1Ref.current) ring1Ref.current.rotation.z += 0.006;
    if (ring2Ref.current) ring2Ref.current.rotation.y += 0.004;

    if (accentLight.current) {
      accentLight.current.intensity = 3 + Math.sin(t * 1.5) * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[2.5, 0, -2]}>
      <pointLight ref={accentLight} color="#D2FF00" position={[2, 2, 4]} distance={20} />
      <pointLight color="#FF8700" position={[-3, -1, 1]} intensity={2} distance={15} />

      {/* Main Orb */}
      <mesh ref={orbRef}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial color="#282C20" metalness={0.9} roughness={0.15} />
        
        {/* Wireframe shell */}
        <mesh>
          <icosahedronGeometry args={[1.12, 2]} />
          <meshBasicMaterial color="#D2FF00" wireframe transparent opacity={0.12} />
        </mesh>

        {/* Orbiting rings */}
        <mesh ref={ring1Ref} rotation={[Math.PI / 2.5, 0, 0]}>
          <torusGeometry args={[1.6, 0.01, 8, 120]} />
          <meshBasicMaterial color="#D2FF00" transparent opacity={0.22} />
        </mesh>

        <mesh ref={ring2Ref} rotation={[-Math.PI / 4, 0, Math.PI / 6]}>
          <torusGeometry args={[1.9, 0.006, 8, 120]} />
          <meshBasicMaterial color="#FF8700" transparent opacity={0.12} />
        </mesh>
      </mesh>
    </group>
  );
}
