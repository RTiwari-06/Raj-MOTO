// Character scramble utility — resolves text left-to-right like a launch display board.
// No dependencies. Returns a cancel function for cleanup.

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ·/|\\0123456789';

export function runScramble(element, finalText, duration = 0.75) {
  const total = finalText.length;
  const totalFrames = Math.round(duration * 60);
  let frame = 0;
  let raf;

  const tick = () => {
    element.textContent = Array.from(finalText)
      .map((char, i) => {
        if (char === ' ') return ' ';
        // Each character resolves left-to-right sequentially
        const resolveAt = Math.floor((i / total) * totalFrames * 0.8);
        if (frame >= resolveAt) return char;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      })
      .join('');

    frame++;
    if (frame <= totalFrames) {
      raf = requestAnimationFrame(tick);
    }
  };

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
