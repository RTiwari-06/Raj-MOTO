precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform vec2 uMouse;
uniform float uIntensity;

// Classic Perlin 2D Noise
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
  vec2 p = vUv;
  
  // Calculate distance to mouse
  float dist = distance(p, uMouse);
  float mouseEffect = smoothstep(0.6, 0.0, dist);
  
  // Create flowing noise
  float n1 = snoise(p * 2.0 + uTime * 0.15);
  float n2 = snoise(p * 4.0 - uTime * 0.2 + mouseEffect * 1.5);
  float n3 = snoise(p * 1.5 + uTime * 0.1 + vec2(n1, n2) * 1.0);
  
  // Mix colors
  vec3 bgColor = vec3(0.02, 0.02, 0.02); // Dark grey/black
  vec3 accentColor = vec3(1.0, 0.353, 0.0); // #FF5A00
  
  // Combine noise
  float finalNoise = smoothstep(0.0, 0.8, n3 + mouseEffect * 0.4);
  
  // The fluid color mix — scaled by uIntensity
  vec3 color = mix(bgColor, accentColor, finalNoise * 0.12 * uIntensity);

  // Mouse glow — scaled by uIntensity
  color += accentColor * mouseEffect * 0.1 * uIntensity;

  gl_FragColor = vec4(color, 1.0);
}
