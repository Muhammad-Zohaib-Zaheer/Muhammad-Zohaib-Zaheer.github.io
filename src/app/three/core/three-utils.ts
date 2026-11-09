import {
  ACESFilmicToneMapping,
  Material,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Texture,
  WebGLRenderer,
} from 'three';
import { SCENE_CONFIG } from '../../config/scene.config';

// #region Theme

/** Colors and fonts from src/styles/_theme.scss, so the 3D scenes match the page. */
export interface ThemeTokens {
  bg: string;
  bgSoft: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  accent3: string;
  codeBg: string;
  codeString: string;
  codeNumber: string;
  fontMono: string;
  fontDisplay: string;
}

const THEME_VARIABLES: Record<keyof ThemeTokens, string> = {
  bg: '--c-bg',
  bgSoft: '--c-bg-soft',
  text: '--c-text',
  muted: '--c-text-muted',
  accent: '--c-accent',
  accent2: '--c-accent-2',
  accent3: '--c-accent-3',
  codeBg: '--c-code-bg',
  codeString: '--c-code-string',
  codeNumber: '--c-code-number',
  fontMono: '--font-mono',
  fontDisplay: '--font-display',
};

export function readTheme(): ThemeTokens {
  const styles = getComputedStyle(document.documentElement);
  const entries = Object.entries(THEME_VARIABLES).map(([key, variable]) => [
    key,
    styles.getPropertyValue(variable).trim(),
  ]);
  return Object.fromEntries(entries) as ThemeTokens;
}

// #endregion

// #region Renderer

export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function createRenderer(canvas: HTMLCanvasElement, antialias: boolean): WebGLRenderer {
  const renderer = new WebGLRenderer({
    canvas,
    antialias,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, SCENE_CONFIG.maxPixelRatio));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  return renderer;
}

/** Matches the drawing buffer and camera to the canvas' CSS size. */
export function resizeToElement(
  renderer: WebGLRenderer,
  camera: PerspectiveCamera,
  element: HTMLElement,
): void {
  const width = element.clientWidth;
  const height = element.clientHeight;
  if (!width || !height) return;

  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

// #endregion

// #region Cleanup

/** Frees GPU memory held by every mesh, material and texture under the given object. */
export function disposeTree(root: Object3D): void {
  root.traverse((node) => {
    const mesh = node as Mesh;
    mesh.geometry?.dispose();

    const materials: Material[] = Array.isArray(mesh.material)
      ? mesh.material
      : mesh.material
        ? [mesh.material]
        : [];
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value instanceof Texture) value.dispose();
      }
      material.dispose();
    }
  });
}

// #endregion
