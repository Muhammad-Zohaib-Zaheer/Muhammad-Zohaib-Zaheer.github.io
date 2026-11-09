// Tunable numbers for the two WebGL scenes. Colors are read from the CSS theme at runtime.

export type ShapeKind = 'icosahedron' | 'octahedron' | 'dodecahedron' | 'torus' | 'torusKnot';
export type ThemeColorKey = 'accent' | 'accent2' | 'accent3';

export interface FloatingShape {
  kind: ShapeKind;
  /** 0 = top of the page, 1 = bottom. */
  depth: number;
  /** Horizontal position as a share of the visible half-width, -1 = left edge, 1 = right edge. */
  x: number;
  z: number;
  size: number;
  color: ThemeColorKey;
}

export const SCENE_CONFIG = {
  /** Upper limit for devicePixelRatio, keeps phones with 3x screens fast. */
  maxPixelRatio: 2,

  background: {
    particleCount: 1600,
    /** Used on touch devices. */
    lowPowerParticleCount: 650,
    particleSize: 0.14,
    /** Half-size of the box the particles are spread in. */
    spread: { x: 32, y: 26, z: 18 },
    /** World units the camera travels from page top to bottom. */
    scrollTravel: 70,
    /** How far the camera drifts with the pointer. */
    parallax: 1.4,
    /** How quickly the camera catches up with scroll and pointer, per second. */
    followSpeed: 3.5,
    fogDensity: 0.03,
    cameraFov: 60,
    cameraZ: 14,
    shapeOpacity: 0.22,
    shapeSpin: 0.12,
    shapes: [
      { kind: 'icosahedron', depth: 0.02, x: -0.86, z: -6, size: 2.2, color: 'accent' },
      { kind: 'torusKnot', depth: 0.16, x: 0.88, z: -8, size: 1.6, color: 'accent2' },
      { kind: 'octahedron', depth: 0.3, x: -0.9, z: -5, size: 1.8, color: 'accent3' },
      { kind: 'torus', depth: 0.46, x: 0.86, z: -7, size: 2, color: 'accent' },
      { kind: 'dodecahedron', depth: 0.62, x: -0.88, z: -6, size: 1.9, color: 'accent2' },
      { kind: 'icosahedron', depth: 0.78, x: 0.9, z: -9, size: 2.4, color: 'accent3' },
      { kind: 'torusKnot', depth: 0.94, x: -0.86, z: -7, size: 1.5, color: 'accent' },
    ] satisfies readonly FloatingShape[],
  },

  avatar: {
    cameraFov: 30,
    /** Point the camera looks at (middle of the character). */
    lookAtY: 1.12,
    /** Camera sits this much above the look-at point. */
    cameraLift: 0.45,
    /** Half of the world area that must stay in frame; camera distance is fitted to it. */
    frame: { halfHeight: 1.65, halfWidth: 2.3, halfWidthCompact: 1.7 },
    /** Stages narrower than this (px) hide the editor panel and pull the orbit in. */
    compactWidth: 480,
    /** How far the head turns towards the pointer (radians). */
    headYaw: 0.55,
    headPitch: 0.3,
    /** Smoothing for head and body movement, per second. */
    followSpeed: 6,
    blinkEvery: { min: 2.4, max: 5.5 },
    blinkDuration: 0.18,
    /** Chance that a blink is followed straight away by a second one. */
    doubleBlinkChance: 0.2,
    /** Breathing speed in radians per second (about one breath every four seconds). */
    breathSpeed: 1.6,
    /** Seconds without cursor movement before the avatar starts looking around on its own. */
    idleLookAfter: 3,
    waveDuration: 2.6,
    /** Wave once shortly after the scene appears. */
    introWaveDelay: 0.8,
    dragSpeed: 0.009,
    /** Pixels the pointer may move and still count as a tap. */
    tapTolerance: 6,
    /** Speed the character turns back to the front after a drag, per second. */
    spinReturn: 2.2,
    orbit: {
      radius: 1.85,
      y: 1.15,
      tilt: 0.28,
      speed: 0.32,
      labelHeight: 0.22,
      compactScale: 0.72,
    },
    /** Floating editor panel to the side of the avatar. */
    codePanel: { width: 1.3, x: -1.4, y: 2, z: -1.1, turn: 0.35, bob: 0.06 },
    /** Height a loaded .glb model is scaled to. */
    modelHeight: 2.8,
    /**
     * Cut-out photo turned into a relief. depth is how far the body comes forward, edge how wide the
     * rounded rim is (share of the width), bend the torso curve. Turns are in radians.
     */
    photo: {
      height: 3,
      segments: 120,
      depth: 0.32,
      edge: 0.14,
      bend: 0.12,
      emissive: 0.55,
      maxTurn: 0.6,
      lookTurn: 0.3,
    },
    /** Lights, intensities are in three.js physical units. */
    light: { hemi: 0.7, key: 2.2, fill: 0.55, rim: 2.6, environment: 0.35, shadowMapSize: 1024 },
  },
} as const;
