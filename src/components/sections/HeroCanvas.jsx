import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { HeroShaderMesh } from '@/components/webgl/HeroShaderMesh';
import { attachContextRecovery } from '@/components/webgl/contextRecovery';

// Desktop-only liquid reveal. Loaded via lazy() from Hero so three.js never
// enters the eager bundle — phones get the static photograph instead.
export default function HeroCanvas({ inView }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 45, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      frameloop={inView ? 'always' : 'demand'}
      onCreated={attachContextRecovery}
    >
      <Suspense fallback={null}>
        <HeroShaderMesh />
      </Suspense>
    </Canvas>
  );
}
