precision highp float;

varying vec2 vUv;

// ─── Uniforms ────────────────────────────────────────────────────────────────
uniform sampler2D u_texBase;      // rider in standard gear
uniform sampler2D u_texReveal;    // rider in high-tech glowing gear
uniform vec2      u_mouse;        // cursor in UV [0,1] — GSAP quickTo (inertial)
uniform float     u_revealRadius; // circular lens radius (aspect-space, ~0.35)
uniform vec2      u_resolution;   // container width/height
uniform vec2      u_imageRes;     // image natural width/height
uniform float     u_time;         // system time
uniform float     u_velocity;     // rate of cursor movement (0 → 1)
uniform float     u_hover;        // 0 idle, 1 hovering — fades the lens in/out

// ── Lens-ring color. Swap to vec3(1.0, 0.4, 0.0) for KTM Orange #FF6600. ──
const vec3 EDGE_COLOR = vec3(0.8, 1.0, 0.0);   // Neon Lime #CCFF00

void main() {
  vec2 uv = vUv;

  // ─── OBJECT-FIT: COVER ──────────────────────────────────────────────────────
  vec2 s = u_resolution;
  vec2 imgRes = u_imageRes;
  float rs = s.x / s.y;
  float ri = imgRes.x / imgRes.y;
  vec2 newRes = rs < ri ? vec2(imgRes.x * s.y / imgRes.y, s.y) : vec2(s.x, imgRes.y * s.x / imgRes.x);
  vec2 offset = (rs < ri ? vec2((newRes.x - s.x) / 2.0, 0.0) : vec2(0.0, (newRes.y - s.y) / 2.0)) / newRes;
  vec2 coverUv = vUv * s / newRes + offset;

  // PHASE 2: Enhanced Z-AXIS PARALLAX for deeper illusion
  vec2 mouseOffset = u_mouse - 0.5;
  vec2 par = mouseOffset * 0.03; // Increased parallax influence

  vec2 uvBase   = coverUv + par * 0.4; // Base layer drifts a bit more
  vec2 uvReveal = (coverUv - 0.5) / 1.06 + 0.5 - par * 1.5; // Reveal layer moves significantly more

  vec4 colorBase   = texture2D(u_texBase, uvBase);
  vec4 colorReveal = texture2D(u_texReveal, uvReveal);

  // ─── ATMOSPHERIC REVEAL MASK (the feeling of discovery) ───────────────────
  vec2  aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  float dist   = distance(vUv * aspect, u_mouse * aspect);

  // PHASE 2: Organic Reveal Breathing
  float breathing = sin(u_time * 0.4) * 0.015;
  float softRadius = (0.22 + breathing) * u_hover;

  // Extremely wide feathering for a soft, atmospheric falloff with no visible boundary.
  float mask = smoothstep(softRadius + 0.3, softRadius, dist) * u_hover;
  mask = pow(mask, 1.5);

  // ─── CINEMATIC COLOR & LIGHTING SEPARATION ────────────────────────────────
  vec3 gradedBase   = smoothstep(vec3(0.0), vec3(1.0), colorBase.rgb * 0.95);
  gradedBase.g *= 0.9;
  gradedBase = mix(gradedBase, vec3(dot(gradedBase, vec3(0.299, 0.587, 0.114))), 0.2);

  vec3 gradedReveal = smoothstep(vec3(-0.05), vec3(1.05), colorReveal.rgb * 1.05);
  gradedReveal.r *= 1.1;

  vec3 finalColor = mix(gradedBase, gradedReveal, mask);

  // ─── ALPHA BLEED (melting into the background) ────────────────────────────
  vec3 lumaW = vec3(0.299, 0.587, 0.114);
  float lumaFinal = dot(finalColor, lumaW);
  float alpha = mix(0.7, 1.0, smoothstep(0.0, 0.6, lumaFinal));

  gl_FragColor = vec4(finalColor, alpha);
}
