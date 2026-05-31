precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform vec2  uMouse;
uniform float uIntensity;
uniform float uFall;        // 0 = still, 1 = falling (cursor over the hero)
uniform float uFallOffset;  // continuous downward scroll — freezes, never jumps

// ─── Simplex noise (Ashima) — nebula clouds ───────────────────────────────────
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

float hash21(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// One twinkling star grid. Stars elongate into vertical streaks while uFall ramps.
float starLayer(vec2 uv, float scale, float density, float tw){
  vec2 gv = fract(uv * scale) - 0.5;
  vec2 id = floor(uv * scale);
  float h = hash21(id);
  if (h > 1.0 - density) {
    vec2 off = (vec2(hash21(id + 1.7), hash21(id + 4.1)) - 0.5) * 0.7;
    vec2 q   = gv - off;
    q.y /= (1.0 + uFall * 4.0);                      // streak vertically while falling
    float d  = length(q);
    float b  = smoothstep(0.09, 0.0, d);
    b *= 0.55 + 0.45 * sin(uTime * tw + h * 31.4);   // twinkle
    return b;
  }
  return 0.0;
}

void main() {
  vec2 uv = vUv;

  // Gentle parallax — the cosmos drifts with the cursor + a slow constant pan.
  vec2 p = uv + (uMouse - 0.5) * 0.05;
  p.y += uTime * 0.004;

  // Nebula — soft clouds from layered noise.
  float n = snoise(p * 2.5 + uTime * 0.03) * 0.5 + snoise(p * 5.0 - uTime * 0.02) * 0.25;
  n = smoothstep(0.05, 0.95, n * 0.5 + 0.5);
  vec3 nebula = mix(vec3(0.008, 0.010, 0.024), vec3(0.05, 0.07, 0.03), n);

  // Stars — three depths, each falling at its own rate (parallax) while active.
  float s = 0.0;
  s += starLayer(p + vec2(0.0, uFallOffset * 1.0),  90.0, 0.10, 2.1);
  s += starLayer(p + vec2(0.0, uFallOffset * 0.6),  55.0, 0.08, 1.3) * 0.85;
  s += starLayer(p + vec2(0.0, uFallOffset * 1.6), 150.0, 0.06, 3.4) * 0.70;

  vec3 starColor = mix(vec3(1.0), vec3(0.823, 1.0, 0.0), 0.18); // mostly white, hint of lime
  vec3 color = nebula + starColor * s;

  // Faint lime aura around the cursor.
  float dist = distance(uv, uMouse);
  color += vec3(0.823, 1.0, 0.0) * smoothstep(0.45, 0.0, dist) * 0.05;

  // Fade with entrance intensity (stars keep a low floor so they never fully vanish).
  color *= clamp(0.45 + uIntensity * 0.65, 0.0, 1.25);

  gl_FragColor = vec4(color, 1.0);
}
