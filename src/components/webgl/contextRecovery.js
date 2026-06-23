// WebGL context-loss recovery for R3F canvases.
//
// When the GPU drops a context (memory pressure, driver reset, too many live
// contexts) the browser leaves the <canvas> permanently blank UNLESS the
// `webglcontextlost` default is prevented — only then does it re-issue a
// context and fire `webglcontextrestored`. On restore we kick a re-render so
// the scene repaints instead of staying black.
//
// Wire it straight into a Canvas:  <Canvas onCreated={attachContextRecovery} />
// R3F's onCreated state carries both `gl` (THREE.WebGLRenderer) and
// `invalidate` (request a frame, needed for `frameloop="demand"`).
export function attachContextRecovery({ gl, invalidate }) {
  const canvas = gl.domElement;

  const onLost = (e) => {
    e.preventDefault(); // required for the browser to attempt restoration
  };
  const onRestored = () => {
    invalidate?.();
  };

  canvas.addEventListener('webglcontextlost', onLost, false);
  canvas.addEventListener('webglcontextrestored', onRestored, false);
  // Listeners die with the canvas element when the Canvas unmounts.
}
