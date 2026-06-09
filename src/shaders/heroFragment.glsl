precision highp float;

varying vec2 vUv;

// ─── Uniforms ────────────────────────────────────────────────────────────────
uniform sampler2D u_texBase;    // human — helmet off (the resting surface)
uniform sampler2D u_texReveal;  // rider — helmet on (revealed through the liquid)
uniform vec2      u_resolution; // container px (only the ratio is used → aspect)
uniform vec2      u_imageRes;   // image natural px
uniform vec2      u_focal;      // cover focal point (figure framing)
uniform float     u_time;       // system time (drives the organic edge warp)
uniform float     u_radius;     // metaball radius (liquid thickness, field units)
uniform vec3      u_points[28]; // cursor liquid: xy = pos (screen-UV y-up), z = strength

// ─── Cheap value noise for the organic, liquid edges ─────────────────────────
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i),               b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0,1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main() {
  // ─── OBJECT-FIT: COVER, focal-biased (figure stays framed on portrait) ───────
  vec2 s = u_resolution;
  vec2 imgRes = u_imageRes;
  float rs = s.x / s.y;
  float ri = imgRes.x / imgRes.y;
  vec2 newRes = rs < ri
    ? vec2(imgRes.x * s.y / imgRes.y, s.y)
    : vec2(s.x, imgRes.y * s.x / imgRes.x);
  vec2 offsetPx = rs < ri
    ? vec2((newRes.x - s.x) * u_focal.x, 0.0)
    : vec2(0.0, (newRes.y - s.y) * u_focal.y);
  vec2 coverUv = vUv * s / newRes + offsetPx / newRes;

  // Same scene in both photos → same UV → perfect registration (helmet on head).
  vec4 colorBase   = texture2D(u_texBase,   coverUv);
  vec4 colorReveal = texture2D(u_texReveal, coverUv);

  // ─── CURSOR LIQUID — one cohesive gooey mass with a soft trailing wake ────────
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);

  // Two-octave domain warp → organic liquid edges. Boundary-only (NOT a grain /
  // aberration / glitch overlay; the photo itself is never distorted).
  vec2 wp1  = vUv * 2.4 + u_time * 0.10;
  vec2 wp2  = vUv * 4.8 - u_time * 0.14;
  vec2 warp = (vec2(vnoise(wp1), vnoise(wp1 + 37.2)) - 0.5)
            + (vec2(vnoise(wp2), vnoise(wp2 + 19.7)) - 0.5) * 0.5;
  vec2 sp   = vUv * aspect + warp * 0.05;

  // Inverse-square metaball field over the dense cursor trail → it fuses into one
  // smooth gooey liquid that follows the pointer (the Lando reveal).
  float field = 0.0;
  for (int i = 0; i < 28; i++) {
    vec3  pt = u_points[i];
    vec2  p  = pt.xy * aspect;
    float d2 = dot(sp - p, sp - p);
    field += pt.z * (u_radius * u_radius) / (d2 + 0.0008);
  }

  // Soft, premium feathered liquid edge.
  float mask = clamp(smoothstep(0.34, 0.82, field), 0.0, 1.0);

  // ─── GRADE — clean reveal (Lando-like), the photo speaks ─────────────────────
  vec3 reveal = (colorReveal.rgb - 0.5) * 1.04 + 0.5;
  vec3 color  = mix(colorBase.rgb, reveal, mask);

  gl_FragColor = vec4(color, 1.0);   // opaque — a living photograph
}
