import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { MEDIA } from '@/data/media';
import { heroPointer } from '@/components/webgl/heroPointer';
import vertexShader   from '@/shaders/heroVertex.glsl';
import fragmentShader from '@/shaders/heroFragment.glsl';

// Point budget — MUST match the `u_points[28]` loop bound in heroFragment.glsl.
// First AUTO_COUNT points are autonomous fluid cells; the rest are the cursor trail.
const N = 28;
const AUTO_COUNT  = 4;
const TRAIL_START = AUTO_COUNT;          // 4
const TRAIL_LEN   = N - AUTO_COUNT;      // 24

// Cover focal point for the shader's object-fit COVER math. Y is INVERTED vs CSS
// object-position (flipY): FOCAL.y = 1 − cssY. The <img> uses '43% 46%' → 0.54.
const FOCAL = new THREE.Vector2(0.43, 0.54);

const smoothing = (k, delta) => 1 - Math.exp(-k * delta);

// ── Cursor liquid (the Lando reveal) ─────────────────────────────────────────
const K_MOUSE = 7.0;   // follow lag — liquid trails just behind the real cursor
const DECAY   = 3.0;   // wake recede (~1s graceful tail)
const EMIT    = 0.014; // UV step between emitted points (dense → fully merged)
const RADIUS  = 0.050; // liquid thickness — reduced 50%

// ── Autonomous fluid waves (curl-noise advection, always flowing on their own) ─
const FLOW   = 0.050;  // curl flow speed
const SPRING = 0.55;   // gentle pull to home anchor (keeps the waves spread)
const VEL_K  = 3.2;    // velocity smoothing → graceful glide
const AUTO = [
  { ax: 0.22, ay: 0.66, str: 0.85 },
  { ax: 0.78, ay: 0.40, str: 0.85 },
  { ax: 0.60, ay: 0.74, str: 0.85 },
  { ax: 0.35, ay: 0.28, str: 0.85 },
];

// ── Cheap 2D value noise + curl → divergence-free (fluid-like) flow ───────────
function hash2(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi),     b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}
function psi(x, y, t) {
  return vnoise(x * 1.6 + t * 0.12, y * 1.6 - t * 0.05)
       + 0.5 * vnoise(x * 3.2 - t * 0.08, y * 3.2 + 11.0);
}
const E = 0.0015;
const curlX = (x, y, t) =>  (psi(x, y + E, t) - psi(x, y - E, t)) / (2 * E);
const curlY = (x, y, t) => -(psi(x + E, y, t) - psi(x - E, y, t)) / (2 * E);

export function HeroShaderMesh() {
  const meshRef = useRef();
  const mouse   = useRef(new THREE.Vector2(0.5, 0.5));
  const pointsArray = useMemo(() => new Float32Array(N * 3), []);
  const points = useRef(pointsArray);
  const trail = useRef({ head: TRAIL_START, lastX: 0.5, lastY: 0.5, seeded: false });
  const aPos = useRef(AUTO.map((a) => new THREE.Vector2(a.ax, a.ay)));
  const aVel = useRef(AUTO.map(() => new THREE.Vector2(0, 0)));

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
      u_radius:     { value: RADIUS },
      u_points:     { value: pointsArray },
    },
  }), [baseTexture, revealTexture, pointsArray]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const u  = meshRef.current.material.uniforms;
    const dt = Math.min(delta, 0.05);   // clamp big steps (tab refocus)
    const t  = state.clock.elapsedTime;

    meshRef.current.scale.set(state.viewport.width, state.viewport.height, 1);
    u.u_resolution.value.set(state.viewport.width, state.viewport.height);
    u.u_time.value = t % 1000.0;

    const d = points.current;

    // Decay every trail point — the cursor wake recedes (autonomous cells are
    // overwritten below each frame, so the decay doesn't touch them).
    const dk = Math.exp(-dt * DECAY);
    for (let i = TRAIL_START; i < N; i++) d[i * 3 + 2] *= dk;

    // ── Autonomous fluid waves — curl-noise flow + gentle spring to home ──────
    const vk = smoothing(VEL_K, dt);
    for (let i = 0; i < AUTO_COUNT; i++) {
      const a = AUTO[i], p = aPos.current[i], v = aVel.current[i];
      const tvx = curlX(p.x, p.y, t) * FLOW + (a.ax - p.x) * SPRING;
      const tvy = curlY(p.x, p.y, t) * FLOW + (a.ay - p.y) * SPRING;
      v.x += (tvx - v.x) * vk;
      v.y += (tvy - v.y) * vk;
      p.x = Math.max(-0.1, Math.min(1.1, p.x + v.x * dt));
      p.y = Math.max(-0.1, Math.min(1.1, p.y + v.y * dt));
      d[i * 3]     = p.x;
      d[i * 3 + 1] = p.y;
      d[i * 3 + 2] = a.str;
    }

    // ── Cursor liquid — dense trail in the [TRAIL_START, N) slots ─────────────
    const fm = smoothing(K_MOUSE, dt);
    mouse.current.x += (heroPointer.x - mouse.current.x) * fm;
    mouse.current.y += (heroPointer.y - mouse.current.y) * fm;

    const T = trail.current;
    if (heroPointer.active) {
      const px = mouse.current.x, py = mouse.current.y;
      if (!T.seeded) {
        for (let i = TRAIL_START; i < N; i++) d[i * 3 + 2] = 0;   // clean slate
        T.lastX = px; T.lastY = py; T.head = TRAIL_START; T.seeded = true;
      }
      const dx = px - T.lastX, dy = py - T.lastY;
      const dist = Math.hypot(dx, dy);
      if (dist >= EMIT) {
        const steps = Math.min(10, Math.ceil(dist / EMIT));
        for (let s = 1; s <= steps; s++) {
          const f = s / steps;
          T.head = TRAIL_START + ((T.head - TRAIL_START + 1) % TRAIL_LEN);
          d[T.head * 3]     = T.lastX + dx * f;
          d[T.head * 3 + 1] = T.lastY + dy * f;
          d[T.head * 3 + 2] = 1.0;
        }
        T.lastX = px; T.lastY = py;
      } else {
        d[T.head * 3]     = px;
        d[T.head * 3 + 1] = py;
        d[T.head * 3 + 2] = 1.0;
      }
    } else {
      T.seeded = false;   // cursor re-seeds (and clears) cleanly on re-entry
    }

    u.u_points.value = d;   // same reference; uploaded each frame via uniform3fv
  });

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}
