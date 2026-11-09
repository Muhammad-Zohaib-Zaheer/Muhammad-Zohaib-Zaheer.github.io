import { CanvasTexture, SRGBColorSpace } from 'three';
import { ThemeTokens } from './three-utils';

// Textures drawn on a 2D canvas: the code editor, orbit labels and soft glows.

function createCanvas(
  width: number,
  height: number,
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return [canvas, canvas.getContext('2d')!];
}

function toTexture(canvas: HTMLCanvasElement): CanvasTexture {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

// #region Code editor

const CODE_TOKEN =
  /(\/\/.*$|'[^']*'|\b\w+(?=\s*:)|\b(?:const|let|return|new|export|import|from|class|true|false)\b|\b\d+(?:\.\d+)?\b|[{}[\](),:;.=])/;

function tokenColor(token: string, theme: ThemeTokens): string {
  if (token.startsWith('//')) return theme.muted;
  if (token.startsWith("'")) return theme.codeString;
  if (/^(const|let|return|new|export|import|from|class)$/.test(token)) return theme.accent;
  if (/^(true|false|\d)/.test(token)) return theme.codeNumber;
  if (/^[{}[\](),:;.=]$/.test(token)) return theme.muted;
  if (/^\w+$/.test(token)) return theme.accent2;
  return theme.text;
}

/** A small editor window with syntax-colored code. */
export function createCodeTexture(
  fileName: string,
  lines: string[],
  theme: ThemeTokens,
): CanvasTexture {
  const width = 1024;
  const lineHeight = 52;
  const header = 84;
  const height = header + lines.length * lineHeight + 48;
  const [canvas, ctx] = createCanvas(width, height);

  // Window body
  ctx.fillStyle = theme.codeBg;
  ctx.globalAlpha = 0.94;
  ctx.beginPath();
  ctx.roundRect(4, 4, width - 8, height - 8, 32);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Title bar: three dots and the file name
  [theme.accent3, theme.codeNumber, theme.codeString].forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(48 + i * 34, header / 2, 10, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = theme.muted;
  ctx.font = `500 26px ${theme.fontMono}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(fileName, 170, header / 2);

  // Code lines
  ctx.font = `500 30px ${theme.fontMono}`;
  lines.forEach((line, row) => {
    const y = header + 24 + row * lineHeight + lineHeight / 2;
    ctx.fillStyle = theme.muted;
    ctx.globalAlpha = 0.45;
    ctx.fillText(String(row + 1).padStart(2, ' '), 36, y);
    ctx.globalAlpha = 1;

    let x = 104;
    for (const part of line.split(CODE_TOKEN)) {
      if (!part) continue;
      ctx.fillStyle = tokenColor(part, theme);
      ctx.fillText(part, x, y);
      x += ctx.measureText(part).width;
    }
  });

  return toTexture(canvas);
}

// #endregion

// #region Labels

/** Pill-shaped label. Returns the texture and its width/height ratio. */
export function createLabelTexture(
  text: string,
  theme: ThemeTokens,
): { texture: CanvasTexture; aspect: number } {
  const height = 96;
  const font = `600 44px ${theme.fontMono}`;
  const [, measure] = createCanvas(1, 1);
  measure.font = font;
  const width = Math.ceil(measure.measureText(text).width + 88);

  const [canvas, ctx] = createCanvas(width, height);
  ctx.fillStyle = theme.codeBg;
  ctx.globalAlpha = 0.88;
  ctx.beginPath();
  ctx.roundRect(3, 3, width - 6, height - 6, height / 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = theme.accent2;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = theme.text;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2 + 2);

  return { texture: toTexture(canvas), aspect: width / height };
}

// #endregion

// #region Glow

/** Soft round dot, used for particles and the light pool under the avatar. */
export function createGlowTexture(color: string): CanvasTexture {
  const size = 128;
  const [canvas, ctx] = createCanvas(size, size);
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.35, color);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return toTexture(canvas);
}

// #endregion
