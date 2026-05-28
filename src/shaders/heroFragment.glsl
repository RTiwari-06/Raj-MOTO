precision highp float;

varying vec2 vUv;

// ─── Uniforms ────────────────────────────────────────────────────────────────
uniform sampler2D uTexture;      // Base image
uniform sampler2D uTexture2;     // Reveal image (shown under cursor)
uniform vec2      uMouse;        // Cursor in local UV space [0,1] — pre-smoothed by JS
uniform float     uHover;        // 0.0 = idle, 1.0 = hovering. Animated by JS.
uniform float     uRevealRadius; // Outer edge of reveal. Default: 0.35
uniform vec2      uResolution;   // Container width/height
uniform vec2      uImageRes;     // Image natural width/height
uniform float     uTime;         // Seconds — drives the fluid motion

// ─── Simplex noise (Ashima) — same generator as the fluid background ──────────
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;

  // ─── OBJECT-FIT: COVER MATH ────────────────────────────────────────────────
  vec2 s = uResolution;
  vec2 imgRes = uImageRes;
  float rs = s.x / s.y;
  float ri = imgRes.x / imgRes.y;

  vec2 newRes = rs < ri ? vec2(imgRes.x * s.y / imgRes.y, s.y) : vec2(s.x, imgRes.y * s.x / imgRes.x);
  vec2 offset = (rs < ri ? vec2((newRes.x - s.x) / 2.0, 0.0) : vec2(0.0, (newRes.y - s.y) / 2.0)) / newRes;

  vec2 coverUv = vUv * s / newRes + offset;

  // ─── MICRO PARALLAX & SCALE ────────────────────────────────────────────────
  float scale = mix(1.0, 1.05, uHover);
  vec2 scaledUv = (coverUv - 0.5) / scale + 0.5;

  vec2 mouseOffset = (uMouse - 0.5);
  vec2 baseUv   = scaledUv + mouseOffset * 0.02 * uHover;
  vec2 revealUv = scaledUv + mouseOffset * 0.04 * uHover;

  // ─── FLUID / WAVE REVEAL ───────────────────────────────────────────────────
  // Distance from the cursor, gently ovalised.
  vec2 delta = uv - uMouse;
  delta.x *= 0.9;
  delta.y *= 1.1;
  float d = length(delta);

  // Layered flowing noise + concentric wavefronts radiating from the cursor.
  float flow1  = snoise(uv * 3.0 + uTime * 0.25);
  float flow2  = snoise(uv * 6.5 - uTime * 0.20 + flow1);
  float ripple = sin(d * 34.0 - uTime * 2.2) * 0.5 + 0.5;
  float edge   = flow1 * 0.5 + flow2 * 0.3 + (ripple - 0.5) * 0.4;

  // Perturb the distance so the boundary undulates like a liquid.
  // The core stays crisp; only the rim ripples → precise yet fluid.
  float dWave = d + edge * 0.05 * uHover;

  // Tighter feather than the old soft blob = a more defined reveal.
  float mask = smoothstep(uRevealRadius, uRevealRadius * 0.55, dWave) * uHover;

  // ─── LIQUID REFRACTION ─────────────────────────────────────────────────────
  // Displace the reveal sampling along a flowing noise field — watery distortion.
  vec2 flowVec = vec2(
    snoise(uv * 5.0 + uTime * 0.35),
    snoise(uv * 5.0 - uTime * 0.30 + 17.0)
  );
  revealUv += flowVec * 0.016 * mask;

  // ─── COMPOSITE ─────────────────────────────────────────────────────────────
  vec4 base   = texture2D(uTexture, baseUv);
  vec4 reveal = texture2D(uTexture2, revealUv);

  vec4 color = mix(base, reveal, mask);

  // Lime accent riding the rippling edge — a premium fluid highlight.
  float rim = smoothstep(0.0, 0.30, mask) * (1.0 - smoothstep(0.30, 0.65, mask));
  color.rgb += vec3(0.823, 1.0, 0.0) * rim * 0.12 * uHover;

  gl_FragColor = color;
}
