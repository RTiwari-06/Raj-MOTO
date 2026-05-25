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

void main() {
  vec2 uv = vUv;

  // ─── OBJECT-FIT: COVER MATH ────────────────────────────────────────────────
  vec2 s = uResolution;
  vec2 i = uImageRes;
  float rs = s.x / s.y;
  float ri = i.x / i.y;
  
  vec2 newRes = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
  vec2 offset = (rs < ri ? vec2((newRes.x - s.x) / 2.0, 0.0) : vec2(0.0, (newRes.y - s.y) / 2.0)) / newRes;
  
  vec2 coverUv = vUv * s / newRes + offset;

  // ─── MICRO PARALLAX & SCALE ────────────────────────────────────────────────
  // 1. Subtle scale on hover (e.g., zooms in slightly to 1.05x)
  float scale = mix(1.0, 1.05, uHover);
  vec2 scaledUv = (coverUv - 0.5) / scale + 0.5;

  // 2. Parallax offset based on mouse distance from center
  vec2 mouseOffset = (uMouse - 0.5);
  // Base image moves slightly opposite to cursor
  vec2 baseUv = scaledUv + mouseOffset * 0.02 * uHover;
  // Reveal image moves slightly more to create a parallax depth separation
  vec2 revealUv = scaledUv + mouseOffset * 0.04 * uHover;

  // ─── HOVER REVEAL ──────────────────────────────────────────────────────────
  // Calculate distance from cursor, but stretch it slightly to make it an
  // organic oval rather than a perfect circle.
  vec2 delta = uv - uMouse;
  delta.x *= 0.85; // Stretch horizontally
  delta.y *= 1.15; // Compress vertically
  float d = length(delta);

  // Wide feathered mask for a premium soft gradient edge
  float mask = smoothstep(uRevealRadius, uRevealRadius * 0.1, d) * uHover;

  // ─── COMPOSITE ─────────────────────────────────────────────────────────────
  vec4 base   = texture2D(uTexture, baseUv);
  vec4 reveal = texture2D(uTexture2, revealUv);

  gl_FragColor = mix(base, reveal, mask);
}
