// RT•MOTO — Motion Language System
// Single source of truth for all animation constants.
// No component should hard-code a duration, ease, or timing value.

// ── Easing Library ─────────────────────────────────────────────────────────────
export const EASE = {
  // Primary arrivals — sharp deceleration, like a car braking into a corner
  precision:  'power4.out',

  // Cinematic weight — slow build, sudden authoritative stop
  authority:  'expo.out',

  // Default motion — smooth, weighted, never weak
  momentum:   'power3.out',

  // Hover response — tactile, immediate
  hover:      'power2.out',

  // Elastic micro-interactions — spring feel without being playful
  spring:     'back.out(1.4)',

  // Fast decisive exits
  exit:       'power4.in',

  // Soft background element departures
  drift:      'power2.in',

  // Scroll-scrubbed animations — no ease, pure position mapping
  scrub:      'none',
};

// ── Duration Tokens ────────────────────────────────────────────────────────────
export const DUR = {
  instant:    0.12,   // state indicators, dot activations
  feedback:   0.25,   // hover swaps, micro-state changes
  fast:       0.40,   // quick UI transitions
  standard:   0.70,   // default motion duration
  considered: 1.00,   // weighted entry animations
  cinematic:  1.20,   // section reveals, major transitions
  epic:       1.80,   // hero sequences, landmark moments
  breath:     2.40,   // extreme slow reveals, ambient motion
};

// ── Stagger Tokens ─────────────────────────────────────────────────────────────
export const STAGGER = {
  chars:    0.025,   // character-level scramble / reveal
  tight:    0.045,   // dense word reveals
  words:    0.07,    // standard word stagger
  elements: 0.10,   // UI element lists
  cards:    0.12,   // grid cards
  sections: 0.20,   // major block stagger
};

// ── ScrollTrigger Defaults ─────────────────────────────────────────────────────
export const ST = {
  start: {
    hero:    'top top',
    section: 'top 78%',
    late:    'top 65%',
    early:   'top 90%',
  },
  scrub: {
    tight:    0.8,
    standard: 1.5,
    loose:    2.5,
  },
};

// ── Velocity-Reactive Constants ────────────────────────────────────────────────
// Scroll velocity (from Lenis) feeds GSAP quickTo for G-force effects
export const VELOCITY = {
  maxSkew:        4,    // deg — maximum canvas skewX at peak scroll speed
  maxLag:         8,    // px  — maximum inertial Y-translate for lagged elements
  maxAberration:  4.0,  // unitless — peak RGB-split magnitude fed to shader uAberration
  velocityScale:  1.5,  // multiplier applied to Lenis velocity value
};

// ── Hover Physics ──────────────────────────────────────────────────────────────
export const HOVER = {
  lift:     -5,     // px — element lift on hover
  scale:    1.03,   // scale pulse
  magnetic: 0.28,   // magnetic pull factor (0 = none, 1 = full follow)
};
