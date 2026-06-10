// Pointer state shared between Hero's native listeners and the WebGL shader.
// Lives in its own module (no three.js imports) so Hero can write to it without
// pulling the WebGL chunk into the eager bundle — written by Hero, read in
// HeroShaderMesh's useFrame. No React state / no Zustand writes per move.
export const heroPointer = { x: 0.5, y: 0.5, active: false };
