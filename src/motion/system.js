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
  feedback:   0.28,   // hover swaps, micro-state changes
  fast:       0.45,   // quick UI transitions
  standard:   0.80,   // default motion duration
  considered: 1.10,   // weighted entry animations
  cinematic:  1.40,   // section reveals, major transitions
  epic:       2.20,   // hero sequences, landmark moments
  breath:     3.00,   // extreme slow reveals, ambient motion
};

// ── Stagger Tokens ─────────────────────────────────────────────────────────────
export const STAGGER = {
  chars:    0.028,   // character-level scramble / reveal
  tight:    0.05,    // dense word reveals
  words:    0.08,    // standard word stagger
  elements: 0.12,   // UI element lists
  cards:    0.14,   // grid cards
  sections: 0.24,   // major block stagger
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
  maxAberration:  4.0,  // reserved — peak RGB-split magnitude (currently unused)
  velocityScale:  1.5,  // multiplier applied to Lenis velocity value
};

// ── Hover Physics ──────────────────────────────────────────────────────────────
export const HOVER = {
  lift:     -5,     // px — element lift on hover
  scale:    1.03,   // scale pulse
  magnetic: 0.28,   // magnetic pull factor (0 = none, 1 = full follow)
};

// ── Cinematic Scroll (System 01) ─────────────────────────────────────────────
// Scrub weights — how heavily a scroll-linked animation lags the scrollbar.
export const SCROLL = {
  FILM:  2.5,   // slow, weighted, cinematic
  SCENE: 1.5,   // normal scene progression
  CUT:   0.3,   // fast cut between states
};
