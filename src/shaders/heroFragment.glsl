precision highp float;

varying vec2 vUv;

// ─── Uniforms ────────────────────────────────────────────────────────────────
uniform sampler2D u_texBase;      // rider WITHOUT helmet (bare head)
uniform sampler2D u_texReveal;    // rider WITH helmet + armored gear
uniform vec2      u_mouse;        // cursor in UV [0,1] — GSAP quickTo (inertial)
uniform float     u_revealRadius; // legacy (unused — kept to match JS uniforms)
uniform vec2      u_resolution;   // container width/height
uniform vec2      u_imageRes;     // image natural width/height
uniform float     u_time;         // system time
uniform float     u_velocity;     // rate of cursor movement (0 → 1)
uniform float     u_hover;        // 0 idle, 1 hovering (unused by the wipe)

// ── Leading-edge color. Swap to vec3(1.0, 0.4, 0.0) for KTM Orange #FF6600. ──
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

  // ─── Z-AXIS PARALLAX (depth illusion) ───────────────────────────────────────
  // The helmet/gear plate sits "closer to the glass": scaled up 1.05x and panned
  // further than the body, so the two layers slide at different speeds.
  vec2 mouseOffset = u_mouse - 0.5;
  vec2 par = mouseOffset * u_velocity * 0.02;
  vec2 uvBase   = coverUv + par * 0.35;                        // body — further back
  vec2 uvReveal = (coverUv - 0.5) / 1.05 + 0.5 - par * 1.0;    // gear — +5%, pans more

  vec4 colorBase   = texture2D(u_texBase, uvBase);
  vec4 colorReveal = texture2D(u_texReveal, uvReveal);

  // ─── THE RIGID CLIPPING PLANE (shallow ~15° visor sweep) ────────────────────
  // Aspect-correct projection onto a FIXED plane normal. Flattened from 45° to a
  // shallow diagonal (~15° off vertical) so the cut reads as a visor snapping
  // down / a wide-angle radar sweep rather than a generic geometric corner.
  // dir is the plane normal: vec2(sin(0.26), cos(0.26)) ≈ 15°.
  vec2  A    = vec2(s.x / s.y, 1.0);
  vec2  dir  = normalize(vec2(sin(0.26), cos(0.26)));
  float norm = dot(vec2(1.0, 1.0) * A, dir);
  float pUv    = dot(uv      * A, dir) / norm;
  float pMouse = dot(u_mouse * A, dir) / norm;

  // Razor-sharp edge: the boundary tracks the cursor's diagonal position.
  // mask = 1 on the reveal (gear) side — everything below-left of the cut.
  float signedDist = pUv - pMouse;
  const float EDGE = 0.006;                                   // ~razor half-width
  float mask = 1.0 - smoothstep(-EDGE, EDGE, signedDist);

  // ─── CINEMATIC GRADE (gentle, kept consistent across both plates) ───────────
  vec3 lumaW = vec3(0.299, 0.587, 0.114);
  vec3 gradedBase   = smoothstep(vec3(0.02), vec3(0.97), colorBase.rgb);
  vec3 gradedReveal = smoothstep(vec3(0.0), vec3(0.98), pow(colorReveal.rgb, vec3(0.94)));

  vec3 finalColor = mix(gradedBase, gradedReveal, mask);

  // ─── THE GLOWING LEADING EDGE (laser scan line) ─────────────────────────────
  // High-intensity emission injected at the cut; tight 2px core + soft halo.
  float core      = smoothstep(0.012, 0.0, abs(signedDist));  // sharp line
  float bloom     = smoothstep(0.06,  0.0, abs(signedDist)) * 0.5;
  float intensity = 0.9 + u_velocity * 1.6;                   // brighter while scanning
  finalColor += EDGE_COLOR * (core + bloom) * intensity;

  // ─── ALPHA BLEED — dark regions melt into the black page ────────────────────
  float lumaFinal = dot(finalColor, lumaW);
  float alpha = mix(0.55, 1.0, smoothstep(0.04, 0.5, lumaFinal));

  gl_FragColor = vec4(finalColor, alpha);
}
