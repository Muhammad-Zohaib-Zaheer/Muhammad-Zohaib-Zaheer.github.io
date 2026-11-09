import {
  AdditiveBlending,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  Texture,
  TextureLoader,
  TorusGeometry,
  Vector2,
  WebGLRenderer,
} from 'three';
import { SCENE_CONFIG } from '../../config/scene.config';
import { AvatarLook } from '../../models/portfolio.model';
import { FrameLoop, prefersReducedMotion } from '../../shared/utils/motion';
import { createCodeTexture, createGlowTexture, createLabelTexture } from '../core/canvas-textures';
import {
  createRenderer,
  disposeTree,
  readTheme,
  resizeToElement,
  ThemeTokens,
} from '../core/three-utils';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CharacterFigure, Figure, ModelFigure, PhotoFigure } from './avatar-figure';

const config = SCENE_CONFIG.avatar;

/**
 * The hero scene: my avatar on a glowing platform, skill labels orbiting around it
 * and a floating editor panel. Owns its renderer, loop and listeners; call dispose() to tear down.
 */
export class AvatarWorld {
  private readonly theme: ThemeTokens = readTheme();
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(config.cameraFov, 1, 0.1, 100);
  private readonly orbit = new Group();
  private readonly loop: FrameLoop;
  private readonly resizeObserver: ResizeObserver;
  private readonly motion = prefersReducedMotion() ? 0 : 1;

  private readonly environment: Texture;
  private figure?: Figure;
  private codePanel?: Mesh;
  private platformArc?: Mesh;
  private elapsed = 0;
  private introWaveAt = Infinity;
  private disposed = false;

  // Pointer state
  private readonly pointer = new Vector2();
  private spin = 0;
  private dragging = false;
  private dragStartX = 0;
  private lastX = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly host: HTMLElement,
    private readonly look: AvatarLook,
    private readonly onWave: () => void,
  ) {
    this.renderer = createRenderer(canvas, true);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
    this.environment = this.createEnvironment();
    this.addLights();
    this.addPlatform();
    this.scene.add(this.orbit);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.loop = new FrameLoop(host, (delta, elapsed) => this.render(delta, elapsed));

    window.addEventListener('pointermove', this.onWindowPointerMove, { passive: true });
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointercancel', this.onPointerCancel);
  }

  /** Builds the parts that need web fonts or a model download. */
  async init(): Promise<void> {
    await this.loadFonts();
    if (this.disposed) return;

    const screen = createCodeTexture(this.look.codeFileName, this.look.codeLines, this.theme);
    this.addOrbitLabels();
    this.addCodePanel(screen);

    const figure = await this.createFigure();
    if (this.disposed) return disposeTree(figure.root);

    this.figure = figure;
    figure.root.traverse((node) => {
      if (node instanceof Mesh && !(node.material as MeshStandardMaterial).transparent)
        node.castShadow = true;
    });
    this.scene.add(figure.root);
    this.resize();
    if (this.motion) this.introWaveAt = this.elapsed + config.introWaveDelay;
  }

  wave(): void {
    this.figure?.wave();
    this.onWave();
  }

  dispose(): void {
    this.disposed = true;
    this.loop.dispose();
    this.resizeObserver.disconnect();
    window.removeEventListener('pointermove', this.onWindowPointerMove);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerCancel);
    disposeTree(this.scene);
    this.environment.dispose();
    this.renderer.dispose();
  }

  // #region Scene setup

  private async loadFonts(): Promise<void> {
    try {
      await Promise.all([
        document.fonts.load(`500 30px ${this.theme.fontMono}`),
        document.fonts.load(`700 120px ${this.theme.fontDisplay}`),
      ]);
    } catch {
      // Canvas text falls back to the next font in the stack.
    }
  }

  private async createFigure(): Promise<Figure> {
    if (this.look.modelUrl) {
      try {
        const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
        return new ModelFigure(await new GLTFLoader().loadAsync(this.look.modelUrl));
      } catch (error) {
        console.warn(`Could not load ${this.look.modelUrl}, trying the next avatar option.`, error);
      }
    }
    if (this.look.photoUrl) {
      try {
        const texture = await new TextureLoader().loadAsync(this.look.photoUrl);
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        return new PhotoFigure(texture);
      } catch (error) {
        console.warn(
          `Could not load ${this.look.photoUrl}, using the built-in avatar instead.`,
          error,
        );
      }
    }
    return new CharacterFigure(this.look, this.theme);
  }

  /** Soft studio reflections, so skin, hair and the watch look rendered rather than flat. */
  private createEnvironment(): Texture {
    const generator = new PMREMGenerator(this.renderer);
    const environment = generator.fromScene(new RoomEnvironment(), 0.04).texture;
    generator.dispose();
    this.scene.environment = environment;
    this.scene.environmentIntensity = config.light.environment;
    return environment;
  }

  private addLights(): void {
    const { light } = config;
    const key = new DirectionalLight(this.theme.text, light.key);
    key.position.set(2.5, 4, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(light.shadowMapSize, light.shadowMapSize);
    key.shadow.camera.left = key.shadow.camera.bottom = -2.5;
    key.shadow.camera.right = key.shadow.camera.top = 2.5;
    key.shadow.radius = 4;
    key.shadow.bias = -0.0005;
    // Soft light from the front left fills the face
    const fill = new DirectionalLight(this.theme.text, light.fill);
    fill.position.set(-3, 2, 4);
    const rimLeft = new DirectionalLight(this.theme.accent, light.rim);
    rimLeft.position.set(-4, 3, -4);
    const rimRight = new DirectionalLight(this.theme.accent2, light.rim * 0.8);
    rimRight.position.set(4, 2.5, -3);

    this.scene.add(
      new HemisphereLight(this.theme.text, this.theme.bg, light.hemi),
      key,
      fill,
      rimLeft,
      rimRight,
    );
  }

  private addPlatform(): void {
    const disc = new Mesh(
      new CylinderGeometry(1.2, 1.32, 0.1, 64),
      new MeshStandardMaterial({ color: this.theme.bgSoft, roughness: 0.35, metalness: 0.5 }),
    );
    disc.position.y = -0.08;
    disc.receiveShadow = true;

    const ring = new Mesh(
      new TorusGeometry(1.27, 0.014, 12, 128),
      new MeshBasicMaterial({ color: this.theme.accent, toneMapped: false }),
    );
    ring.position.y = -0.025;
    ring.rotation.x = Math.PI / 2;

    // An open arc spins slowly so the platform feels alive.
    this.platformArc = new Mesh(
      new TorusGeometry(1.55, 0.008, 8, 128, Math.PI * 1.4),
      new MeshBasicMaterial({
        color: this.theme.accent2,
        transparent: true,
        opacity: 0.6,
        toneMapped: false,
      }),
    );
    this.platformArc.position.y = -0.05;
    this.platformArc.rotation.x = Math.PI / 2;

    const pool = new Mesh(
      new PlaneGeometry(4.4, 4.4),
      new MeshBasicMaterial({
        map: createGlowTexture(this.theme.accent),
        transparent: true,
        opacity: 0.55,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    pool.position.y = -0.02;
    pool.rotation.x = -Math.PI / 2;

    this.scene.add(disc, ring, this.platformArc, pool);
  }

  private addOrbitLabels(): void {
    const { orbit } = config;
    const labels = this.look.orbitLabels;
    this.orbit.position.y = orbit.y;
    this.orbit.rotation.x = orbit.tilt;

    labels.forEach((text, i) => {
      const { texture, aspect } = createLabelTexture(text, this.theme);
      const sprite = new Sprite(
        new SpriteMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
          toneMapped: false,
        }),
      );
      const angle = (i / labels.length) * Math.PI * 2;
      sprite.position.set(Math.cos(angle) * orbit.radius, 0, Math.sin(angle) * orbit.radius);
      sprite.scale.set(orbit.labelHeight * aspect, orbit.labelHeight, 1);
      this.orbit.add(sprite);
    });
  }

  private addCodePanel(screen: ReturnType<typeof createCodeTexture>): void {
    const { width, x, y, z, turn } = config.codePanel;
    const image = screen.image as HTMLCanvasElement;
    this.codePanel = new Mesh(
      new PlaneGeometry(width, (width * image.height) / image.width),
      new MeshBasicMaterial({
        map: screen,
        transparent: true,
        side: DoubleSide,
        toneMapped: false,
      }),
    );
    this.codePanel.position.set(x, y, z);
    this.codePanel.rotation.y = turn;
    this.scene.add(this.codePanel);
  }

  // #endregion

  // #region Frame

  private resize(): void {
    resizeToElement(this.renderer, this.camera, this.host);

    // Narrow screens hide the side panel and pull the orbit in a little.
    const compact = this.host.clientWidth < config.compactWidth;
    if (this.codePanel) this.codePanel.visible = !compact;
    this.orbit.scale.setScalar(compact ? config.orbit.compactScale : 1);

    // Move the camera back far enough to fit the framed area on both axes.
    const tanHalfFov = Math.tan(MathUtils.degToRad(config.cameraFov / 2));
    const halfWidth = compact ? config.frame.halfWidthCompact : config.frame.halfWidth;
    const distance = Math.max(
      config.frame.halfHeight / tanHalfFov,
      halfWidth / (tanHalfFov * this.camera.aspect),
    );
    this.camera.position.set(0, config.lookAtY + config.cameraLift, distance);
    this.camera.lookAt(0, config.lookAtY, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private render(delta: number, elapsed: number): void {
    this.elapsed = elapsed;

    if (elapsed >= this.introWaveAt) {
      this.introWaveAt = Infinity;
      this.wave();
    }

    if (!this.dragging) this.spin = MathUtils.damp(this.spin, 0, config.spinReturn, delta);

    if (this.figure) {
      this.figure.root.rotation.y = this.spin;
      this.figure.update(delta, elapsed, this.pointer);
    }

    this.orbit.rotation.y += config.orbit.speed * delta * this.motion;
    if (this.platformArc) this.platformArc.rotation.z += 0.4 * delta * this.motion;
    if (this.codePanel) {
      this.codePanel.position.y =
        config.codePanel.y + Math.sin(elapsed * 1.3) * config.codePanel.bob * this.motion;
    }

    this.renderer.render(this.scene, this.camera);
  }

  // #endregion

  // #region Pointer

  /** Tracks the cursor anywhere on the page so the head can follow it. */
  private readonly onWindowPointerMove = (event: PointerEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const headX = rect.left + rect.width / 2;
    const headY = rect.top + rect.height * 0.3;
    this.pointer.set(
      MathUtils.clamp((event.clientX - headX) / (window.innerWidth / 2), -1, 1),
      MathUtils.clamp(-(event.clientY - headY) / (window.innerHeight / 2), -1, 1),
    );
  };

  private readonly onPointerDown = (event: PointerEvent): void => {
    this.dragging = true;
    this.dragStartX = this.lastX = event.clientX;
    this.canvas.setPointerCapture(event.pointerId);
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (!this.dragging) return;
    this.spin += (event.clientX - this.lastX) * config.dragSpeed;
    const limit = this.figure?.maxTurn;
    if (limit) this.spin = MathUtils.clamp(this.spin, -limit, limit);
    this.lastX = event.clientX;
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (!this.dragging) return;
    this.dragging = false;
    if (Math.abs(event.clientX - this.dragStartX) < config.tapTolerance) this.wave();
  };

  private readonly onPointerCancel = (): void => {
    this.dragging = false;
  };

  // #endregion
}
