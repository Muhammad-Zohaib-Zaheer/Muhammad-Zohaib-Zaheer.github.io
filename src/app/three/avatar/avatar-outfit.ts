import { CanvasTexture, LatheGeometry, RepeatWrapping, SRGBColorSpace, Vector2 } from 'three';
import { AvatarLook } from '../../models/portfolio.model';

// The avatar's clothes: a torso shape plus canvas-painted textures for the checked blazer,
// its lapels and the black shirt showing through the open front.

// #region Torso shape

/** Torso as a lathe profile, in world units. depth flattens it front to back. */
export const TORSO = {
  bottom: 0.55,
  /** Height of the rounded bottom edge. */
  hem: 0.18,
  /** The bust is lowered by this much so it sits over the platform. */
  drop: 0.38,
  top: 1.76,
  shoulder: 1.3,
  radius: 0.5,
  depth: 0.62,
  rows: 40,
  segments: 64,
} as const;

/** Torso radius at a height: rounded bottom edge, slightly narrower waist, squarish shoulders. */
function torsoRadius(y: number): number {
  const { bottom, top, shoulder, radius, hem } = TORSO;
  if (y > shoulder) {
    // Squarish shoulders that round off into the neck
    const t = (y - shoulder) / (top - shoulder);
    return radius * Math.cbrt(Math.max(1 - t ** 3, 0));
  }
  const waist =
    radius * (0.9 + 0.1 * Math.sin(((y - bottom) / (shoulder - bottom)) * (Math.PI / 2)));
  const h = Math.max(bottom + hem - y, 0) / hem;
  return waist * Math.sqrt(Math.max(1 - h * h, 0));
}

/** Lathe starts at phi = PI, which puts the front of the torso at u = 0.5 of the texture. */
export function createTorsoGeometry(): LatheGeometry {
  const { bottom, top, rows, segments } = TORSO;
  const points = Array.from({ length: rows + 1 }, (_, i) => {
    const y = bottom + ((top - bottom) * i) / rows;
    return new Vector2(Math.max(torsoRadius(y), 0.001), y);
  });
  return new LatheGeometry(points, segments, Math.PI, Math.PI * 2);
}

// #endregion

// #region Textures

/** Size of one check in pixels; the textures below are sized so a check is about 7 cm. */
const CHECK = 22;
const CHECKS_PER_TILE = 12;

/** Open front of the blazer: where the V starts and ends, and how wide it and the lapels are. */
const OPENING = { top: 1.74, point: 0.95, halfWidth: 0.2, lapel: 0.075 };

function createCanvas(
  width: number,
  height: number,
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return [canvas, canvas.getContext('2d')!];
}

function toTexture(canvas: HTMLCanvasElement, repeat: boolean): CanvasTexture {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  if (repeat) texture.wrapS = texture.wrapT = RepeatWrapping;
  return texture;
}

/** Base cloth, thick dark checks and thin light lines in between, like the blazer in my photo. */
function paintChecks(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  look: AvatarLook,
): void {
  ctx.fillStyle = look.blazer;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = 0.85;
  ctx.fillStyle = look.blazerCheck;
  for (let x = 0; x < width; x += CHECK) ctx.fillRect(x, 0, CHECK * 0.22, height);
  for (let y = 0; y < height; y += CHECK) ctx.fillRect(0, y, width, CHECK * 0.22);

  ctx.globalAlpha = 0.65;
  ctx.fillStyle = look.blazerLine;
  for (let x = CHECK / 2; x < width; x += CHECK) ctx.fillRect(x, 0, 2, height);
  for (let y = CHECK / 2; y < height; y += CHECK) ctx.fillRect(0, y, width, 2);
  ctx.globalAlpha = 1;
}

/** Tileable checks for the sleeves and shoulders. */
export function createCheckTexture(look: AvatarLook): CanvasTexture {
  const size = CHECK * CHECKS_PER_TILE;
  const [canvas, ctx] = createCanvas(size, size);
  paintChecks(ctx, size, size, look);
  return toTexture(canvas, true);
}

/** The torso: checks all round, with the lapels and the shirt painted on the front. */
export function createBlazerTexture(look: AvatarLook): CanvasTexture {
  const width = 1024;
  const height = 512;
  const [canvas, ctx] = createCanvas(width, height);
  paintChecks(ctx, width, height, look);

  const { bottom, top } = TORSO;
  // World position (height, sideways offset from the centre front) to canvas pixels.
  const toPixel = (y: number, offset: number): [number, number] => {
    const circumference = 2 * Math.PI * Math.max(torsoRadius(y), 0.05);
    const u = Math.min(Math.max(0.5 + offset / circumference, 0.02), 0.98);
    return [u * width, (1 - (y - bottom) / (top - bottom)) * height];
  };
  const halfWidth = (y: number) =>
    (OPENING.halfWidth * (y - OPENING.point)) / (OPENING.top - OPENING.point);
  const heights = Array.from(
    { length: 25 },
    (_, i) => OPENING.point + ((OPENING.top - OPENING.point) * i) / 24,
  );

  const fillBand = (
    from: (y: number) => number,
    to: (y: number) => number,
    color: string,
    alpha: number,
  ) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    heights.forEach((y, i) => ctx[i ? 'lineTo' : 'moveTo'](...toPixel(y, from(y))));
    [...heights].reverse().forEach((y) => ctx.lineTo(...toPixel(y, to(y))));
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  // Lapels: a darker band on both sides of the opening, then the shirt inside it.
  const lapel = (y: number) =>
    halfWidth(y) + OPENING.lapel * Math.min(1, (y - OPENING.point) / 0.25);
  fillBand(
    (y) => -lapel(y),
    (y) => -halfWidth(y),
    look.blazerCheck,
    0.45,
  );
  fillBand(halfWidth, lapel, look.blazerCheck, 0.45);
  fillBand((y) => -halfWidth(y), halfWidth, look.shirt, 1);

  // Light edge along the lapels
  ctx.strokeStyle = look.blazerLine;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 3;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    heights.forEach((y, i) => ctx[i ? 'lineTo' : 'moveTo'](...toPixel(y, side * halfWidth(y))));
    ctx.stroke();
  }

  // Shirt buttons
  ctx.fillStyle = look.blazerLine;
  ctx.globalAlpha = 0.35;
  for (const y of [1.52, 1.34, 1.16]) {
    const [x, py] = toPixel(y, 0);
    ctx.beginPath();
    ctx.arc(x, py, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Breast pocket with a folded square, on the left side of my chest (right side for the viewer)
  ctx.globalAlpha = 0.9;
  const [px, py] = toPixel(1.42, 0.27);
  ctx.fillStyle = look.blazerCheck;
  ctx.fillRect(px - 34, py, 68, 6);
  ctx.fillStyle = look.blazerLine;
  ctx.beginPath();
  ctx.moveTo(px - 26, py);
  ctx.lineTo(px - 8, py - 16);
  ctx.lineTo(px + 6, py - 6);
  ctx.lineTo(px + 22, py - 14);
  ctx.lineTo(px + 28, py);
  ctx.fill();
  ctx.globalAlpha = 1;

  return toTexture(canvas, false);
}

// #endregion
