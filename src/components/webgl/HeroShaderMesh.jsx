import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { MEDIA } from '@/data/media';
import vertexShader   from '@/shaders/heroVertex.glsl';
import fragmentShader from '@/shaders/heroFragment.glsl';

// Pointer state lives in module scope — written by Hero's native listeners and the
// one-time auto-sweep / ambient emitter, read here in useFrame. No React state /
// no Zustand writes per move: zero render churn.
export const heroPointer = { x: 0.5, y: 0.5, active: false };

// Trail length — MUST match the `u_points[16]` loop bound in heroFragment.glsl.
const N = 16;

// Cover focal point — base.jpg places the rider centre, slightly left, mid-height.
const FOCAL = new THREE.Vector2(0.43, 0.46);

// Frame-rate-independent smoothing: f = 1 - e^(-k·dt). Identical feel at 60/120Hz.
const smoothing = (k, delta) => 1 - Math.exp(-k * delta);

const K_MOUSE = 12.0;   // pointer follow — responsive with a little mass
const DECAY   = 2.6;    // trail-strength decay (≈0.9s liquid tail)
const EMIT    = 0.025;  // UV distance between emitted trail points

// Ambient / idle emitter
const AMBIENT_INTERVAL = 0.85; // seconds between ambient emissions
const AMBIENT_STRENGTH = 0.42; // strength of ambient blobs
const AMBIENT_RADIUS   = 0.06; // how far from focal they appear

export function HeroShaderMesh() {
  const meshRef = useRef();
  const mouse   = useRef(new THREE.Vector2(0.5, 0.5));
  const pointsArray = useMemo(() => new Float32Array(N * 3), []);
  const points = useRef(pointsArray);
  const trail = useRef({ head: 0, lastX: 0.5, lastY: 0.5, seeded: false, ambientAcc: 0 });

  const [baseTexture, revealTexture] = useTexture([MEDIA.hero.primary, MEDIA.hero.reveal]);

  const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: false,
    uniforms: {
      u_texBase:    { value: baseTexture },
      u_texReveal:  { value: revealTexture },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_imageRes:   { value: new THREE.Vector2(baseTexture.image.width, baseTexture.image.height) },
      u_focal:      { value: FOCAL.clone() },
      u_time:       { value: 0 },
      u_points:     { value: pointsArray },   // Use the memoized array directly
    },
  }), [baseTexture, revealTexture, pointsArray]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const u  = meshRef.current.material.uniforms;
    const dt = Math.min(delta, 0.05);   // clamp big steps (tab refocus)
    const t  = state.clock.elapsedTime;

    meshRef.current.scale.set(state.viewport.width, state.viewport.height, 1);
    u.u_resolution.value.set(state.viewport.width, state.viewport.height);
    u.u_time.value = t;

    // Smooth the live pointer toward the module-scope target (a little mass).
    const fm = smoothing(K_MOUSE, dt);
    mouse.current.x += (heroPointer.x - mouse.current.x) * fm;
    mouse.current.y += (heroPointer.y - mouse.current.y) * fm;

    // Decay every trail point — the reveal melts away behind the cursor.
    const d  = points.current;
    const dk = Math.exp(-dt * DECAY);
    for (let i = 0; i < N; i++) d[i * 3 + 2] *= dk;

    const T = trail.current;

    if (heroPointer.active) {
      // Active pointer: emit along movement so trail follows finger/mouse.
      const px = mouse.current.x, py = mouse.current.y;
      if (!T.seeded) { T.lastX = px; T.lastY = py; T.seeded = true; }
      const dx = px - T.lastX, dy = py - T.lastY;
      const dist = Math.hypot(dx, dy);
      if (dist >= EMIT) {
        // Emit along the segment so fast moves stay continuous (no gaps).
        const steps = Math.min(6, Math.ceil(dist / EMIT));
        for (let sIdx = 1; sIdx <= steps; sIdx++) {
          const f = sIdx / steps;
          T.head = (T.head + 1) % N;
          d[T.head * 3]     = T.lastX + dx * f;
          d[T.head * 3 + 1] = T.lastY + dy * f;
          d[T.head * 3 + 2] = 1.0;
        }
        T.lastX = px; T.lastY = py;
      } else {
        // Paused cursor — keep one live blob under it.
        d[T.head * 3]     = px;
        d[T.head * 3 + 1] = py;
        d[T.head * 3 + 2] = 1.0;
      }
      // reset ambient accumulator so we don't double-emit
      T.ambientAcc = 0;
    } else {
      // Idle: emit gentle ambient blobs that sweep across the figure so the
      // effect is discoverable and feels alive (auto-play behavior).
      T.ambientAcc += dt;
      if (T.ambientAcc >= AMBIENT_INTERVAL) {
        T.ambientAcc = 0;
        // Emit one ambient point near the focal with a slight sinusoidal offset.
        const jitterX = (Math.sin(t * 0.6) * 0.5 + 0.5) * AMBIENT_RADIUS * 2 - AMBIENT_RADIUS;
        const jitterY = (Math.cos(t * 0.45) * 0.5 + 0.5) * AMBIENT_RADIUS * 2 - AMBIENT_RADIUS;
        T.head = (T.head + 1) % N;
        d[T.head * 3]     = FOCAL.x + jitterX;
        d[T.head * 3 + 1] = FOCAL.y + jitterY;
        d[T.head * 3 + 2] = AMBIENT_STRENGTH;
      }
      T.seeded = false;   // don't streak from a stale position on re-entry
    }

    u.u_points.value = d;   // same reference; uploaded each frame via uniform3fv
  });

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}
