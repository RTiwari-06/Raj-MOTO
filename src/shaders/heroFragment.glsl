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
uniform float     uTime;         // Seconds — drives the gentle fluid motion

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

  // ─── MINIMAL FLUID REVEAL ──────────────────────────────────────────────────
  // Distance from the cursor, gently ovalised.
  vec2 delta = uv - uMouse;
  delta.x *= 0.9;
  delta.y *= 1.1;
  float d = length(delta);

  // Two slow octaves of noise softly warp the boundary → a calm liquid edge.
  float n1   = snoise(uv * 3.0 + uTime * 0.18);
  float n2   = snoise(uv * 6.0 - uTime * 0.14 + n1);
  float warp = n1 * 0.5 + n2 * 0.25;

  float dWave = d + warp * 0.045 * uHover;

  // Soft, clean feathered edge — minimal, no rings, no rim.
  float mask = smoothstep(uRevealRadius, uRevealRadius * 0.5, dWave) * uHover;

  // Gentle liquid refraction on the revealed image only.
  vec2 flowVec = vec2(
    snoise(uv * 4.0 + uTime * 0.25),
    snoise(uv * 4.0 - uTime * 0.22 + 11.0)
  );
  revealUv += flowVec * 0.012 * mask;

  // ─── COMPOSITE ─────────────────────────────────────────────────────────────
  vec4 base   = texture2D(uTexture, baseUv);
  vec4 reveal = texture2D(uTexture2, revealUv);

  vec3 rgb = mix(base.rgb, reveal.rgb, mask);

  // "Downed" over the starfield — dark regions of the photo turn translucent so
  // the cosmos bleeds through, while the lit subject stays solid.
  float lum   = dot(rgb, vec3(0.299, 0.587, 0.114));
  float alpha = mix(0.55, 1.0, smoothstep(0.04, 0.5, lum));

  gl_FragColor = vec4(rgb, alpha);
}
