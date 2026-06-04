precision highp float;

varying vec2 vUv;

// ─── Uniforms ────────────────────────────────────────────────────────────────
uniform sampler2D u_texBase;    // human — helmet off, identity (the resting surface)
uniform sampler2D u_texReveal;  // rider — helmet on, machine (revealed through the blobs)
uniform vec2      u_resolution; // container px
uniform vec2      u_imageRes;   // image natural px
uniform vec2      u_focal;      // cover focal point (keeps the figure on portrait)
uniform float     u_time;       // system time (drives the liquid edge warp)
uniform vec3      u_points[16]; // trail: xy = UV position (y-up), z = strength 0..1

// ─── Cheap value noise for the organic, liquid blob edges ────────────────────
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

  // Same scene in both photos → sample at the same UV → perfect registration, so
  // the helmet lands on the head and the armour on the torso, in place.
  vec4 colorBase   = texture2D(u_texBase,   coverUv);
  vec4 colorReveal = texture2D(u_texReveal, coverUv);

  // ─── LIQUID-BLOB TRAIL MASK (the Lando reveal) ───────────────────────────────
  // Aspect-correct so blobs read round on screen.
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);

  // Low-frequency domain warp → organic, fluid edges (NOT a grain/glitch overlay;
  // it only shapes the mask boundary, the photo is never distorted).
  vec2 wp   = vUv * 3.0 + u_time * 0.15;
  vec2 warp = vec2(vnoise(wp), vnoise(wp + 37.2)) - 0.5;
  vec2 sp   = vUv * aspect + warp * 0.045;

  // Metaball field: inverse-square falloff summed over the trail → blobs merge.
  const float R = 0.13;        // blob radius
  float field = 0.0;
  for (int i = 0; i < 16; i++) {
    vec3  pt = u_points[i];
    vec2  p  = pt.xy * aspect;
    float d2 = dot(sp - p, sp - p);
    field += pt.z * (R * R) / (d2 + 0.0008);
  }

  float mask = clamp(smoothstep(0.6, 1.1, field), 0.0, 1.0);

  // ─── RESTRAINED FILMIC GRADE — no aberration, no glitch ──────────────────────
  vec3 gradedBase = colorBase.rgb;
  gradedBase = mix(gradedBase, vec3(dot(gradedBase, vec3(0.299, 0.587, 0.114))), 0.12);

  vec3 gradedReveal = colorReveal.rgb;
  gradedReveal.r *= 1.04;       // a hair warmer — the machine state

  vec3 finalColor = mix(gradedBase, gradedReveal, mask);
  gl_FragColor = vec4(finalColor, 1.0);   // opaque — a living photograph
}
