import { Canvas } from '@react-three/fiber';
import { BackgroundOrb } from '@/components/webgl/BackgroundOrb';
import { Suspense } from 'react';

export function WebGLCanvas() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 5, -5]} intensity={0.5} color="#ffffff" />
          <BackgroundOrb />
        </Suspense>
      </Canvas>
    </div>
  );
}
