import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DodecahedronGeometry,
  FogExp2,
  IcosahedronGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TorusGeometry,
  TorusKnotGeometry,
  Vector2,
  WebGLRenderer,
} from 'three';
import { SCENE_CONFIG, ShapeKind, ThemeColorKey } from '../../config/scene.config';
import { FrameLoop, isLowPowerDevice, prefersReducedMotion } from '../../shared/utils/motion';
import { createGlowTexture } from '../core/canvas-textures';
import {
  createRenderer,
  disposeTree,
  readTheme,
  resizeToElement,
  ThemeTokens,
} from '../core/three-utils';

const config = SCENE_CONFIG.background;

const GEOMETRY: Record<ShapeKind, (size: number) => BufferGeometry> = {
  icosahedron: (size) => new IcosahedronGeometry(size, 0),
  octahedron: (size) => new OctahedronGeometry(size, 0),
  dodecahedron: (size) => new DodecahedronGeometry(size, 0),
  torus: (size) => new TorusGeometry(size, size * 0.32, 12, 40),
  torusKnot: (size) => new TorusKnotGeometry(size, size * 0.28, 90, 12),
};

/**
 * Full-page background: a field of glowing particles and wireframe shapes.
 * The camera travels down through it as the page scrolls and drifts with the mouse.
 */
export class BackgroundWorld {
  private readonly theme: ThemeTokens = readTheme();
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(config.cameraFov, 1, 0.1, 200);
  private readonly particles: Points;
  private readonly shapes: { mesh: Mesh; x: number; y: number }[] = [];
  private readonly pointer = new Vector2();
  private readonly loop: FrameLoop;
  private readonly motion = prefersReducedMotion() ? 0 : 1;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = createRenderer(canvas, false);
    this.scene.fog = new FogExp2(this.theme.bg, config.fogDensity);
    this.camera.position.z = config.cameraZ;

    this.particles = this.createParticles();
    this.scene.add(this.particles);
    this.createShapes();

    this.resize();
    window.addEventListener('resize', this.resize);
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    this.loop = new FrameLoop(canvas, (delta, elapsed) => this.render(delta, elapsed));
  }

  dispose(): void {
    this.loop.dispose();
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('pointermove', this.onPointerMove);
    disposeTree(this.scene);
    this.renderer.dispose();
  }

  // #region Scene setup

  private createParticles(): Points {
    const count = isLowPowerDevice() ? config.lowPowerParticleCount : config.particleCount;
    const { spread, scrollTravel } = config;
    const palette = [
      this.theme.accent,
      this.theme.accent2,
      this.theme.accent3,
      this.theme.text,
    ].map((c) => new Color(c));

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Spread over the whole scroll path, plus a margin above and below.
      positions.set(
        [
          MathUtils.randFloatSpread(spread.x * 2),
          MathUtils.randFloat(-scrollTravel - spread.y, spread.y),
          MathUtils.randFloat(-spread.z, spread.z / 3),
        ],
        i * 3,
      );
      const color = palette[i % palette.length];
      colors.set([color.r, color.g, color.b], i * 3);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    const material = new PointsMaterial({
      size: config.particleSize,
      map: createGlowTexture(this.theme.text),
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    return new Points(geometry, material);
  }

  private createShapes(): void {
    const colors: Record<ThemeColorKey, string> = {
      accent: this.theme.accent,
      accent2: this.theme.accent2,
      accent3: this.theme.accent3,
    };

    for (const shape of config.shapes) {
      const mesh = new Mesh(
        GEOMETRY[shape.kind](shape.size),
        new MeshBasicMaterial({
          color: colors[shape.color],
          wireframe: true,
          transparent: true,
          opacity: config.shapeOpacity,
        }),
      );
      const y = -shape.depth * config.scrollTravel;
      mesh.position.set(shape.x, y, shape.z);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      this.shapes.push({ mesh, x: shape.x, y });
      this.scene.add(mesh);
    }
  }

  // #endregion

  // #region Frame

  private readonly resize = (): void => {
    resizeToElement(this.renderer, this.camera, this.canvas);

    // Keep the shapes near the screen edges, away from the text, and shrink them on narrow screens.
    const tanHalfFov = Math.tan(MathUtils.degToRad(config.cameraFov / 2));
    const scale = Math.min(1, this.camera.aspect);
    for (const shape of this.shapes) {
      const halfWidth = tanHalfFov * (config.cameraZ - shape.mesh.position.z) * this.camera.aspect;
      shape.mesh.position.x = shape.x * halfWidth;
      shape.mesh.scale.setScalar(scale);
    }
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    this.pointer.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
    );
  };

  private render(delta: number, elapsed: number): void {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    const camera = this.camera.position;
    const follow = config.followSpeed;

    camera.y = MathUtils.damp(
      camera.y,
      -progress * config.scrollTravel + this.pointer.y * config.parallax,
      follow,
      delta,
    );
    camera.x = MathUtils.damp(camera.x, this.pointer.x * config.parallax, follow, delta);

    this.particles.rotation.y = elapsed * 0.01 * this.motion;
    for (const [i, { mesh, y }] of this.shapes.entries()) {
      mesh.rotation.x += delta * config.shapeSpin * this.motion;
      mesh.rotation.y += delta * config.shapeSpin * 0.7 * this.motion;
      mesh.position.y = y + Math.sin(elapsed * 0.6 + i) * 0.4 * this.motion;
    }

    this.renderer.render(this.scene, this.camera);
  }

  // #endregion
}
