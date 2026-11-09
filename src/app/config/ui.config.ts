// Tunable numbers for the 2D interface: timings, thresholds and effect strengths.
// Colors, fonts and spacing live in src/styles/_theme.scss.

export const UI_CONFIG = {
  /** Path to the SVG sprite inside public/. */
  iconSprite: 'icons.svg',

  nav: {
    /** Pixels scrolled before the navbar gets its solid background. */
    scrolledOffset: 24,
    /** Band of the viewport that decides which section is "active". */
    spyRootMargin: '-45% 0px -50% 0px',
  },

  /** Scroll reveal, all values are shares of the viewport height. */
  reveal: {
    /** Where an element starts appearing (1 = bottom edge of the screen). */
    enterStart: 1,
    /** How much scrolling it takes to be fully visible. */
    enterLength: 0.35,
    /** How close to the top it starts fading out again. */
    exitLength: 0.2,
    /** Extra delay per stagger step. */
    stagger: 0.04,
  },

  tilt: {
    /** Maximum card rotation in degrees. */
    maxDeg: 8,
  },

  typewriter: {
    typeMs: 70,
    deleteMs: 35,
    holdMs: 1800,
  },

  sphere: {
    /** How many skills from each group go on the sphere. */
    tagsPerGroup: 5,
    /** Sphere radius as a share of the container width. */
    radiusRatio: 0.38,
    /** Rotation speed (radians per frame) when the pointer is away. */
    idleSpeed: 0.003,
    /** Extra speed added at the edge of the sphere when hovering. */
    hoverSpeed: 0.02,
    /** Smallest scale and opacity for tags at the back. */
    minScale: 0.55,
    minOpacity: 0.25,
  },

  /** How long the "Copied" state stays on the email button. */
  copyResetMs: 2000,
} as const;
