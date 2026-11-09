import {
  AnimationAction,
  AnimationMixer,
  Box3,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CapsuleGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  LoopOnce,
  MathUtils,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  SphereGeometry,
  Texture,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { SCENE_CONFIG } from '../../config/scene.config';
import { AvatarLook } from '../../models/portfolio.model';
import { ThemeTokens } from '../core/three-utils';
import {
  createBlazerTexture,
  createCheckTexture,
  createTorsoGeometry,
  TORSO,
} from './avatar-outfit';

const config = SCENE_CONFIG.avatar;

/** What the avatar scene needs from a character, built-in or loaded. */
export interface Figure {
  readonly root: Object3D;
  /** pointer is -1..1 on both axes, relative to the character's head. */
  update(delta: number, elapsed: number, pointer: Vector2): void;
  wave(): void;
  /** Largest drag rotation in radians; unlimited when not set. */
  readonly maxTurn?: number;
}

// #region Helpers

type Vec3 = [number, number, number];

function mesh(
  geometry: BufferGeometry,
  material: Material,
  position: Vec3 = [0, 0, 0],
  scale: Vec3 = [1, 1, 1],
): Mesh {
  const result = new Mesh(geometry, material);
  result.position.set(...position);
  result.scale.set(...scale);
  return result;
}

function standard(color: string | Color, roughness = 0.6, metalness = 0): MeshStandardMaterial {
  return new MeshStandardMaterial({ color, roughness, metalness });
}

/** Hair: fairly rough with a soft grey sheen; vertex colours carry the groove shading. */
function hairMaterial(look: AvatarLook): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    color: look.hair,
    vertexColors: true,
    roughness: 0.55,
    sheen: 0.45,
    sheenColor: new Color(look.hair).lerp(new Color(0xffffff), 0.25),
    sheenRoughness: 0.45,
    envMapIntensity: 0.45,
    side: DoubleSide,
  });
}

/** 0 → 1 → 0 shaped curve over a time window, eased at both ends. */
function pulse(now: number, start: number, duration: number): number {
  const t = (now - start) / duration;
  if (t <= 0 || t >= 1) return 0;
  return Math.sin(t * Math.PI) ** 0.5;
}

/** Narrows the lower half of a sphere so the head gets a slimmer jaw and chin. */
function taperChin(geometry: SphereGeometry, amount: number): SphereGeometry {
  const position = geometry.attributes['position'];
  const radius = geometry.parameters.radius;
  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i);
    if (y >= 0) continue;
    const squeeze = (-y / radius) ** 2;
    position.setX(i, position.getX(i) * (1 - amount * squeeze));
    position.setZ(i, position.getZ(i) * (1 - amount * 0.4 * squeeze));
  }
  geometry.computeVertexNormals();
  return geometry;
}

// #endregion

// #region Built-in character

const DOWN = new Vector3(0, -1, 0);

/**
 * A normal, tidy short haircut in unit-sphere coordinates around the head: where the hairline sits,
 * how thick the hair lies, a little volume on top, a side part and a fringe swept to one side.
 */
const HAIRSTYLE = {
  /**
   * The hairline is high on the forehead, just above the ears at the sides, drops behind the ears
   * and runs low across the nape. temples: how much higher it sits at the corners of the forehead.
   * fringe/fringeTips: how far the soft tips of the fringe dip and how many there are.
   * sideburn: how far the hair comes down in front of the ears; ears: how far it arcs up over them.
   */
  hairline: {
    front: 0.62,
    side: 0.15,
    nape: -0.85,
    temples: 0.08,
    fringe: 0.05,
    fringeTips: 9,
    sideburn: 0.15,
    ears: 0.34,
  },
  thickness: { side: 0.045, top: 0.12 },
  /** Volume on top: height, front-to-back fade (z), width, upward push and lean to my right (-x). */
  volume: { height: 0.1, from: -0.4, to: 0.8, width: 0.9, lift: 0.2, lean: -0.08 },
  /** Fringe swept to my right (-x): how far it comes down the forehead and how thick it is. */
  swoop: { depth: 0.16, thickness: 0.05 },
  /** A few wide, soft grooves combed back, and how much they shade the hair. */
  grooves: { count: 7, depth: 0.018, shade: 0.25 },
  /** Side part on my left (+x): where it runs, how wide and how deep it is. */
  part: { x: 0.36, width: 0.05, depth: 0.035 },
};

/**
 * Arms as two bones solved towards a hand target, with a hint for where the elbow points.
 * Body-space positions for the arm on the viewer's right; the other side is mirrored.
 * The resting pose is the one from my photo: both hands on the blazer button.
 */
const ARM = {
  shoulder: [0.5, 1.5, 0] as Vec3,
  upper: 0.42,
  lower: 0.54,
  rest: { hand: [0.12, 1.02, 0.4] as Vec3, elbow: [1, -0.2, -0.5] as Vec3 },
  wave: { hand: [0.95, 2.02, 0.3] as Vec3, elbow: [1, -0.7, 0.1] as Vec3 },
};

/** Brow height inside the head group (head centre plus the brow offset). */
const BROW_HEIGHT = 0.525;

interface Arm {
  side: number;
  shoulder: Group;
  elbow: Group;
}

// Scratch objects for the per-frame arm solve, so animating creates no garbage.
const scratch = {
  shoulder: new Vector3(),
  hand: new Vector3(),
  pole: new Vector3(),
  elbow: new Vector3(),
  direction: new Vector3(),
  bend: new Vector3(),
  inverse: new Quaternion(),
};

/** Smooth 0..1 step, like GLSL smoothstep. */
function smoothstep(from: number, to: number, value: number): number {
  const t = MathUtils.clamp((value - from) / (to - from), 0, 1);
  return t * t * (3 - 2 * t);
}

/** What the haircut looks like in one direction from the head centre. */
interface HairSample {
  /** Hair surface, in unit-sphere coordinates. */
  point: Vector3;
  /** 0 at the hairline, 1 on top of the head. */
  top: number;
  height: number;
  groove: number;
  part: number;
}

/** The haircut in one direction d (unit vector from the head centre). */
function sampleHair(d: Vector3, point = new Vector3()): HairSample {
  const { hairline, thickness, volume, swoop, grooves } = HAIRSTYLE;
  const front = Math.max(d.z, 0) ** 1.3;

  // Hairline: high at the forehead and temples, soft fringe tips, sideburns, and an arc over each ear
  const temples = hairline.temples * smoothstep(0.2, 0.5, Math.abs(d.x)) * front;
  const tips =
    hairline.fringe *
    Math.abs(Math.sin((Math.atan2(d.x, d.z) * hairline.fringeTips) / 2)) ** 3 *
    front;
  const sideburn =
    hairline.sideburn *
    smoothstep(0.75, 0.92, Math.abs(d.x)) *
    smoothstep(0.02, 0.12, d.z) *
    (1 - smoothstep(0.25, 0.45, d.z));
  const ear = Math.exp(
    -((Math.abs(d.x) - 0.97) ** 2 + (d.y - 0.05) ** 2 + (d.z + 0.05) ** 2) / 0.035,
  );
  // The fringe falls a little lower on my right side, swept across from the part
  const swept = smoothstep(0.25, -0.45, d.x) * front;
  // Above the ears at the sides, falling away behind them down to the nape
  const base = MathUtils.lerp(hairline.side, hairline.nape, smoothstep(0.1, -0.5, d.z));
  const line =
    base +
    (hairline.front - base) * front +
    temples +
    hairline.ears * ear -
    tips -
    sideburn -
    swoop.depth * swept;
  const grow = smoothstep(line - 0.03, line + 0.1, d.y);
  const top = smoothstep(line, line + 0.5, d.y);

  // Volume: highest at the front of the top, fading towards the crown and the sides
  const narrow = 1 - smoothstep(volume.width * 0.55, volume.width, Math.abs(d.x - volume.lean));
  const height =
    volume.height * smoothstep(volume.from, volume.to, d.z) * smoothstep(0.3, 0.85, d.y) * narrow;

  const groove = Math.sin(grooves.count * (d.x + 0.6 * d.z + 0.4 * d.y));
  const part = Math.exp(-(((d.x - HAIRSTYLE.part.x) / HAIRSTYLE.part.width) ** 2)) * top * front;
  const shell =
    1 +
    MathUtils.lerp(thickness.side, thickness.top, top) +
    height +
    swoop.thickness * swept * grow +
    grooves.depth * groove * top -
    HAIRSTYLE.part.depth * part;

  const r = MathUtils.lerp(0.93, shell, grow);
  point.set(d.x * r, d.y * r + volume.lift * height, d.z * r);
  return { point, top, height, groove, part };
}

/** The hair: tucked inside the skull below the hairline, with soft shading painted in vertex colours. */
function createHairShell(radius: number): SphereGeometry {
  const geometry = new SphereGeometry(radius, 144, 96);
  const position = geometry.attributes['position'];
  const colors = new Float32Array(position.count * 3);
  const { grooves, volume } = HAIRSTYLE;
  const d = new Vector3();

  for (let i = 0; i < position.count; i++) {
    d.fromBufferAttribute(position, i).divideScalar(radius);
    const { point, top, height, groove, part } = sampleHair(d);
    position.setXYZ(i, point.x * radius, point.y * radius, point.z * radius);

    // Lighter on the ridges and where the hair is fullest, darker in the grooves and the part
    const shade =
      (1 + grooves.shade * groove * top + (height / volume.height) * 0.15) * (1 - 0.5 * part);
    colors.set([shade, shade, shade], i * 3);
  }
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * A stylised half-body version of me, modelled on my photo: slim face, big smile, short neat hair,
 * light stubble, black shirt under a checked blazer, and a watch on the left wrist.
 * It breathes, blinks, follows the cursor (or looks around when the cursor is still) and waves.
 * Built from simple shapes so it needs no model file; colours come from portfolio.data.ts.
 * Measurements are in world units; the character is about 3 units tall.
 */
export class CharacterFigure implements Figure {
  readonly root = new Group();

  private readonly body = new Group();
  private readonly chest = new Group();
  private readonly head = new Group();
  private readonly brows: Object3D[] = [];
  private readonly eyes: Object3D[] = [];
  private readonly gazes: Object3D[] = [];
  private readonly arms: Arm[] = [];
  private mouth!: Group;

  private elapsed = 0;
  private nextBlink: number = config.blinkEvery.min;
  private blinkStart = -1;
  private waveStart = -Infinity;
  private readonly lastPointer = new Vector2(Infinity, Infinity);
  private pointerMovedAt = 0;

  constructor(
    private readonly look: AvatarLook,
    theme: ThemeTokens,
  ) {
    const skin = new Color(look.skin);
    const materials = {
      // A little emissive warmth keeps the skin from turning grey in the shadows.
      skin: new MeshStandardMaterial({
        color: skin,
        roughness: 0.5,
        emissive: skin.clone().multiplyScalar(0.05),
        envMapIntensity: 0.6,
      }),
      skinShade: standard(skin.clone().multiplyScalar(0.95), 0.55),
      // Black hair with a soft grey sheen, the way it catches the light in my photo
      hair: hairMaterial(look),
      stubble: new MeshStandardMaterial({
        color: look.hair,
        roughness: 1,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      }),
      // A touch of skin tone in the beard reads as short facial hair instead of a solid mask.
      beard: new MeshStandardMaterial({
        color: new Color(look.hair).lerp(skin, 0.18),
        roughness: 0.95,
        side: DoubleSide,
      }),
      eyeWhite: standard(theme.text, 0.25),
      iris: standard(look.eyes, 0.15),
      pupil: standard(theme.bg, 0.1),
      shine: new MeshBasicMaterial({ color: theme.text }),
      teeth: new MeshStandardMaterial({ color: theme.text, roughness: 0.25, side: DoubleSide }),
      mouth: new MeshStandardMaterial({
        color: new Color(look.lips).multiplyScalar(0.35),
        side: DoubleSide,
      }),
      lips: standard(look.lips, 0.45),
      shirt: standard(look.shirt, 0.65),
      blazer: new MeshStandardMaterial({ map: createBlazerTexture(look), roughness: 0.85 }),
      sleeve: new MeshStandardMaterial({ map: createCheckTexture(look), roughness: 0.85 }),
      watch: standard(theme.muted, 0.2, 1),
      dial: standard(theme.bg, 0.25, 0.4),
      watchHands: new MeshBasicMaterial({ color: theme.text }),
    };

    this.buildTorso(materials);
    this.buildHead(materials);
    this.buildArms(materials);
    this.body.position.y = -TORSO.drop;
    this.root.add(this.body);
  }

  // #region Building

  private buildTorso(m: Record<'blazer' | 'shirt' | 'skin', Material>): void {
    this.chest.add(
      mesh(createTorsoGeometry(), m.blazer, [0, 0, 0], [1, 1, TORSO.depth]),
      mesh(new CylinderGeometry(0.13, 0.15, 0.26, 24), m.skin, [0, 1.77, 0]),
    );

    // Shirt collar around the neck, with its two points at the front
    const collar = mesh(
      new TorusGeometry(0.15, 0.035, 10, 28),
      m.shirt,
      [0, 1.73, 0],
      [1.1, 0.85, 1],
    );
    collar.rotation.x = Math.PI / 2;
    this.chest.add(collar);
    for (const side of [-1, 1]) {
      const point = mesh(new BoxGeometry(0.11, 0.08, 0.02), m.shirt, [side * 0.065, 1.69, 0.125]);
      point.rotation.set(-0.35, 0, side * 0.75);
      this.chest.add(point);
    }
    this.body.add(this.chest);
  }

  private buildHead(
    m: Record<
      | 'skin'
      | 'skinShade'
      | 'hair'
      | 'stubble'
      | 'beard'
      | 'eyeWhite'
      | 'iris'
      | 'pupil'
      | 'shine'
      | 'teeth'
      | 'mouth'
      | 'lips',
      Material
    >,
  ): void {
    const center = 0.4;
    const headScale: Vec3 = [0.83, 1.1, 0.92];
    this.head.position.y = 1.84;

    // Slim oval face with a narrower chin, ears and a small nose
    this.head.add(
      mesh(taperChin(new SphereGeometry(0.42, 64, 48), 0.22), m.skin, [0, center, 0], headScale),
      mesh(
        new SphereGeometry(0.042, 16, 12),
        m.skinShade,
        [0, center - 0.06, 0.392],
        [0.8, 1.1, 1.05],
      ),
      mesh(new CapsuleGeometry(0.024, 0.09, 4, 8), m.skin, [0, center - 0.005, 0.372]),
    );
    for (const side of [-1, 1]) {
      this.head.add(
        mesh(
          new SphereGeometry(0.085, 16, 12),
          m.skin,
          [side * 0.338, center + 0.02, -0.02],
          [0.42, 1, 0.7],
        ),
      );
    }

    // Big eyes with a dark lash line on top and a highlight, so they read from far away
    for (const side of [-1, 1]) {
      const eye = new Group();
      eye.position.set(side * 0.135, center + 0.035, 0.316);

      const gaze = new Group();
      gaze.add(
        mesh(new SphereGeometry(0.047, 20, 14), m.iris, [0, 0, 0.03], [1, 1, 0.45]),
        mesh(new SphereGeometry(0.024, 14, 10), m.pupil, [0, 0, 0.046], [1, 1, 0.45]),
        mesh(new SphereGeometry(0.011, 8, 6), m.shine, [0.016, 0.018, 0.053]),
      );
      const lid = mesh(
        new SphereGeometry(0.074, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.26),
        m.skin,
        [0, 0.002, 0],
        [1.04, 0.95, 0.76],
      );
      lid.rotation.x = 0.12;
      const lash = mesh(
        new TorusGeometry(0.069, 0.011, 6, 24, Math.PI * 0.85),
        m.hair,
        [0, 0, 0.024],
      );
      lash.rotation.set(-0.25, 0, Math.PI / 2 - Math.PI * 0.425);

      eye.add(
        mesh(new SphereGeometry(0.07, 24, 16), m.eyeWhite, [0, 0, 0], [1, 0.88, 0.62]),
        gaze,
        lid,
        lash,
      );
      this.eyes.push(eye);
      this.gazes.push(gaze);

      // Thick brows with a slight arch, the outer end a little lower
      const brow = new Group();
      brow.position.set(side * 0.145, BROW_HEIGHT, 0.342);
      brow.rotation.z = -side * 0.06;
      const arc = mesh(
        new TorusGeometry(0.2, 0.021, 8, 20, 0.68),
        m.hair,
        [0, -0.2, 0],
        [1, 1, 0.75],
      );
      arc.rotation.z = Math.PI / 2 - 0.34;
      brow.add(arc);
      this.brows.push(brow);
      this.head.add(eye, brow);
    }

    this.mouth = this.buildSmile(m, center);
    this.head.add(this.mouth);
    this.head.add(mesh(createHairShell(0.42), m.hair, [0, center, 0], headScale));
    if (this.look.beard) this.buildBeard(m.beard, center);
    if (this.look.glasses) this.head.add(this.buildGlasses(m.hair, center + 0.035));

    this.body.add(this.head);
  }

  /** Open smile showing the upper teeth, with a dark mouth below them and the lips around it. */
  private buildSmile(
    m: Record<'teeth' | 'mouth' | 'lips' | 'stubble', Material>,
    center: number,
  ): Group {
    const smile = new Group();
    smile.position.set(0, center - 0.165, 0.335);

    const lowerHalf = (radius: number, length: number) =>
      new SphereGeometry(radius, 28, 10, 0, Math.PI * 2, Math.PI / 2, length);
    const upperLip = mesh(new CapsuleGeometry(0.011, 0.18, 4, 8), m.lips, [0, 0.004, 0.04]);
    upperLip.rotation.z = Math.PI / 2;
    const lowerLip = mesh(
      new TorusGeometry(0.1, 0.011, 8, 28, Math.PI),
      m.lips,
      [0, 0, 0.012],
      [1, 0.62, 1],
    );
    lowerLip.rotation.z = Math.PI;

    smile.add(
      mesh(lowerHalf(0.1, Math.PI / 2), m.mouth, [0, 0, -0.003], [1, 0.62, 0.4]),
      mesh(lowerHalf(0.095, Math.PI * 0.22), m.teeth, [0, 0, 0], [1, 0.62, 0.42]),
      upperLip,
      lowerLip,
    );

    // Light moustache, like in my photo
    if (this.look.stubble) {
      const moustache = mesh(
        new TorusGeometry(0.085, 0.013, 6, 18, Math.PI * 0.75),
        m.stubble,
        [0, -0.03, 0.045],
        [1, 0.5, 1],
      );
      moustache.rotation.z = Math.PI / 2 - Math.PI * 0.375;
      smile.add(moustache);
    }
    return smile;
  }

  private buildBeard(beard: Material, center: number): void {
    // Short beard along the jaw: the front 220° of the lower head only
    const span = Math.PI * 1.22;
    const shell = new SphereGeometry(
      0.42,
      36,
      18,
      Math.PI / 2 - span / 2,
      span,
      Math.PI * 0.62,
      Math.PI * 0.3,
    );
    this.head.add(mesh(taperChin(shell, 0.3), beard, [0, center, 0.004], [0.885, 1.1, 0.95]));
  }

  private buildGlasses(frame: Material, y: number): Group {
    const glasses = new Group();
    for (const side of [-1, 1]) {
      glasses.add(mesh(new TorusGeometry(0.085, 0.012, 10, 28), frame, [side * 0.135, y, 0.38]));
      const arm = mesh(new BoxGeometry(0.014, 0.014, 0.4), frame, [side * 0.29, y + 0.01, 0.19]);
      arm.rotation.y = side * -0.35;
      glasses.add(arm);
    }
    glasses.add(mesh(new BoxGeometry(0.07, 0.014, 0.014), frame, [0, y + 0.01, 0.39]));
    return glasses;
  }

  private buildArms(
    m: Record<'sleeve' | 'shirt' | 'skin' | 'watch' | 'dial' | 'watchHands', Material>,
  ): void {
    const { upper, lower } = ARM;
    for (const side of [-1, 1]) {
      const shoulder = new Group();
      shoulder.add(
        mesh(new SphereGeometry(0.13, 24, 16), m.sleeve),
        mesh(new CapsuleGeometry(0.125, upper - 0.1, 6, 16), m.sleeve, [0, -upper / 2, 0]),
      );

      const elbow = new Group();
      elbow.position.y = -upper;
      const cuff = mesh(new TorusGeometry(0.1, 0.014, 8, 20), m.shirt, [0, -(lower - 0.11), 0]);
      cuff.rotation.x = Math.PI / 2;
      elbow.add(
        mesh(new SphereGeometry(0.118, 20, 14), m.sleeve),
        mesh(new CapsuleGeometry(0.108, lower - 0.25, 6, 16), m.sleeve, [
          0,
          -(lower - 0.14) / 2,
          0,
        ]),
        cuff,
        this.buildHand(m.skin, side, lower),
      );

      // Watch on my left wrist, which is the arm on the viewer's right
      if (side > 0 && this.look.watch) {
        elbow.add(this.buildWatch(m.watch, m.dial, m.watchHands, lower));
      }

      shoulder.add(elbow);
      this.body.add(shoulder);
      this.arms.push({ side, shoulder, elbow });
    }
  }

  private buildHand(skin: Material, side: number, lower: number): Group {
    const hand = new Group();
    hand.position.y = -lower;
    const thumb = mesh(new CapsuleGeometry(0.03, 0.07, 4, 8), skin, [-side * 0.06, 0.02, 0.04]);
    thumb.rotation.z = side * 0.7;
    hand.add(mesh(new SphereGeometry(0.1, 20, 14), skin, [0, 0, 0], [0.82, 1.1, 0.62]), thumb);
    return hand;
  }

  private buildWatch(metal: Material, face: Material, hands: Material, lower: number): Group {
    const watch = new Group();
    watch.position.y = -(lower - 0.085);
    const band = mesh(new TorusGeometry(0.094, 0.018, 8, 28), metal);
    band.rotation.x = Math.PI / 2;
    const dial = mesh(new CylinderGeometry(0.066, 0.066, 0.026, 28), face, [0, 0, 0.102]);
    dial.rotation.x = Math.PI / 2;
    const bezel = mesh(new TorusGeometry(0.066, 0.01, 8, 28), metal, [0, 0, 0.116]);
    // Two small clock hands on the face
    const hour = mesh(new BoxGeometry(0.006, 0.03, 0.002), hands, [0.006, 0.012, 0.115]);
    hour.rotation.z = -0.5;
    const minute = mesh(new BoxGeometry(0.005, 0.042, 0.002), hands, [-0.01, 0.016, 0.115]);
    minute.rotation.z = 0.6;
    watch.add(band, dial, bezel, hour, minute);
    return watch;
  }

  // #endregion

  // #region Animation

  wave(): void {
    this.waveStart = this.elapsed;
  }

  update(delta: number, elapsed: number, pointer: Vector2): void {
    this.elapsed = elapsed;
    const speed = config.followSpeed;
    const wave = pulse(elapsed, this.waveStart, config.waveDuration);
    const breath = Math.sin(elapsed * config.breathSpeed);

    // Breathing: the chest swells, shoulders and head rise a little. The whole figure floats and sways.
    this.chest.scale.set(1 + breath * 0.008, 1 + breath * 0.012, 1 + breath * 0.025);
    this.head.position.y = 1.84 + breath * 0.01;
    this.root.position.y = Math.sin(elapsed * 1.1) * 0.03;
    this.root.rotation.z = Math.sin(elapsed * 0.7) * 0.012;

    // Follow the cursor; when it has been still for a while, look around on my own.
    if (!pointer.equals(this.lastPointer)) {
      this.lastPointer.copy(pointer);
      this.pointerMovedAt = elapsed;
    }
    const still = elapsed - this.pointerMovedAt;
    const idle = smoothstep(config.idleLookAfter, config.idleLookAfter + 1.5, still);
    const yaw =
      MathUtils.lerp(pointer.x * config.headYaw, Math.sin(elapsed * 0.35) * 0.35, idle) +
      Math.sin(elapsed * 0.45) * 0.05;
    const pitch =
      MathUtils.lerp(-pointer.y * config.headPitch, Math.sin(elapsed * 0.27) * 0.08, idle) +
      Math.sin(elapsed * 0.6 + 1) * 0.03;
    this.head.rotation.y = MathUtils.damp(this.head.rotation.y, yaw, speed, delta);
    this.head.rotation.x = MathUtils.damp(this.head.rotation.x, pitch, speed, delta);
    this.head.rotation.z = Math.sin(elapsed * 0.5) * 0.03 + wave * 0.12;
    this.body.rotation.y = MathUtils.damp(this.body.rotation.y, yaw * 0.25, speed, delta);

    // The eyes lead the head a little
    const eyeX = MathUtils.clamp(yaw * 0.03, -0.014, 0.014);
    const eyeY = MathUtils.clamp(-pitch * 0.03, -0.01, 0.01);
    for (const gaze of this.gazes) gaze.position.set(eyeX, eyeY, 0);

    this.blink(elapsed);
    for (const brow of this.brows) brow.position.y = BROW_HEIGHT + wave * 0.015;
    this.mouth.scale.set(1 + wave * 0.1, 1 + wave * 0.15, 1);
    this.poseArms(wave, elapsed, breath);
  }

  /** Quick, eased blinks at random intervals, sometimes twice in a row. */
  private blink(elapsed: number): void {
    if (elapsed > this.nextBlink) {
      this.blinkStart = elapsed;
      const double = Math.random() < config.doubleBlinkChance;
      this.nextBlink =
        elapsed +
        (double
          ? config.blinkDuration * 2
          : MathUtils.randFloat(config.blinkEvery.min, config.blinkEvery.max));
    }
    const t = (elapsed - this.blinkStart) / config.blinkDuration;
    const closed = t > 0 && t < 1 ? Math.sin(t * Math.PI) : 0;
    for (const eye of this.eyes) eye.scale.y = 1 - 0.9 * closed;
  }

  /** Solves both arms towards their hand targets: resting on the blazer button, or waving. */
  private poseArms(wave: number, elapsed: number, breath: number): void {
    const { shoulder: shoulderAt, upper, lower, rest } = ARM;
    const s = scratch;
    for (const arm of this.arms) {
      const w = arm.side > 0 ? wave : 0;
      const mirror = (v: Vec3, out: Vector3) => out.set(v[0] * arm.side, v[1], v[2]);

      s.shoulder.set(shoulderAt[0] * arm.side, shoulderAt[1] + breath * 0.012, shoulderAt[2]);
      mirror(rest.hand, s.hand).lerp(mirror(ARM.wave.hand, s.direction), w);
      s.hand.x += Math.sin(elapsed * 10) * 0.13 * w * arm.side;
      s.hand.y += Math.sin(elapsed * 1.3 + arm.side) * 0.008 * (1 - w);
      mirror(rest.elbow, s.pole).lerp(mirror(ARM.wave.elbow, s.direction), w).normalize();

      // Two-bone solve: where the elbow sits so both bones keep their length
      s.direction.copy(s.hand).sub(s.shoulder);
      const reach = Math.min(s.direction.length(), upper + lower - 0.001);
      s.direction.normalize();
      const along = (upper * upper - lower * lower + reach * reach) / (2 * reach);
      const out = Math.sqrt(Math.max(upper * upper - along * along, 0));
      s.bend.copy(s.pole).addScaledVector(s.direction, -s.pole.dot(s.direction)).normalize();
      s.elbow.copy(s.shoulder).addScaledVector(s.direction, along).addScaledVector(s.bend, out);

      arm.shoulder.position.copy(s.shoulder);
      s.direction.copy(s.elbow).sub(s.shoulder).normalize();
      arm.shoulder.quaternion.setFromUnitVectors(DOWN, s.direction);
      s.inverse.copy(arm.shoulder.quaternion).invert();
      s.direction.copy(s.hand).sub(s.elbow).normalize().applyQuaternion(s.inverse);
      arm.elbow.quaternion.setFromUnitVectors(DOWN, s.direction);
    }
  }

  // #endregion
}

// #endregion

// #region Photo relief

/**
 * Distance of every grid point to the outside of the photo's silhouette, in grid cells.
 * Two-pass chamfer distance on the alpha channel; points outside the cut-out are 0.
 */
function distanceInside(image: HTMLImageElement, columns: number, rows: number): Float32Array {
  const canvas = document.createElement('canvas');
  canvas.width = columns;
  canvas.height = rows;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(image, 0, 0, columns, rows);
  const alpha = ctx.getImageData(0, 0, columns, rows).data;

  const distance = new Float32Array(columns * rows);
  for (let i = 0; i < distance.length; i++)
    distance[i] = alpha[i * 4 + 3] > 127 ? columns + rows : 0;
  const at = (x: number, y: number) =>
    x < 0 || y < 0 || x >= columns || y >= rows ? 0 : distance[y * columns + x];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const i = y * columns + x;
      if (distance[i]) {
        distance[i] = Math.min(
          distance[i],
          at(x - 1, y) + 1,
          at(x, y - 1) + 1,
          at(x - 1, y - 1) + 1.4,
          at(x + 1, y - 1) + 1.4,
        );
      }
    }
  }
  for (let y = rows - 1; y >= 0; y--) {
    for (let x = columns - 1; x >= 0; x--) {
      const i = y * columns + x;
      if (distance[i]) {
        distance[i] = Math.min(
          distance[i],
          at(x + 1, y) + 1,
          at(x, y + 1) + 1,
          at(x + 1, y + 1) + 1.4,
          at(x - 1, y + 1) + 1.4,
        );
      }
    }
  }
  return distance;
}

/**
 * My cut-out photo as a shallow 3D relief: the silhouette is inflated so the body comes forward and
 * the edges stay thin, then bent a little like a torso. It leans towards the pointer and can be
 * dragged a little, but not far enough to give away that it is a relief.
 */
export class PhotoFigure implements Figure {
  readonly root = new Group();
  readonly maxTurn = config.photo.maxTurn;

  private readonly card = new Group();
  private elapsed = 0;
  private waveStart = -Infinity;

  constructor(texture: Texture) {
    const { height, segments, depth, edge, bend, emissive } = config.photo;
    const image = texture.image as HTMLImageElement;
    const width = (height * image.width) / image.height;
    const rows = Math.round((segments * image.height) / image.width);

    const geometry = new PlaneGeometry(width, height, segments, rows);
    const inside = distanceInside(image, segments + 1, rows + 1);
    const position = geometry.attributes['position'];
    const edgeCells = edge * segments;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i) / (width / 2);
      const relief = Math.sqrt(Math.min(inside[i] / edgeCells, 1));
      position.setZ(i, relief * depth + (1 - x * x) * bend);
    }
    geometry.computeVertexNormals();

    // The photo lights itself through the emissive map, so its colours stay true while the scene
    // lights still add shading and the coloured rim.
    const material = new MeshStandardMaterial({
      map: texture,
      emissive: 0xffffff,
      emissiveMap: texture,
      emissiveIntensity: emissive,
      roughness: 0.9,
      transparent: true,
      alphaTest: 0.04,
      side: DoubleSide,
    });
    const photo = new Mesh(geometry, material);
    photo.position.y = height / 2;
    this.card.add(photo);
    this.root.add(this.card);
  }

  wave(): void {
    this.waveStart = this.elapsed;
  }

  update(delta: number, elapsed: number, pointer: Vector2): void {
    this.elapsed = elapsed;
    const { lookTurn } = config.photo;
    const hop = pulse(elapsed, this.waveStart, config.waveDuration / 2);

    // Lean towards the pointer, breathe, and bounce with a little wiggle when saying hi.
    this.card.rotation.y = MathUtils.damp(
      this.card.rotation.y,
      pointer.x * lookTurn,
      config.followSpeed,
      delta,
    );
    this.card.rotation.x = MathUtils.damp(
      this.card.rotation.x,
      -pointer.y * lookTurn * 0.4,
      config.followSpeed,
      delta,
    );
    this.card.rotation.z = hop * Math.sin(elapsed * 14) * 0.04;
    this.card.scale.y = 1 + Math.sin(elapsed * 1.8) * 0.006;
    this.root.position.y = Math.sin(elapsed * 1.1) * 0.035 + hop * 0.18;
  }
}

// #endregion

// #region Loaded model

/** Animation names that are treated as a wave or greeting. */
const WAVE_CLIP = /wave|hello|greet/i;

/**
 * Wraps a .glb model (for example one generated from a photo) so it behaves like the built-in character:
 * scaled to fit, plays an idle animation, turns its head bone towards the pointer and waves (or hops) on tap.
 */
export class ModelFigure implements Figure {
  readonly root = new Group();

  private readonly head?: Object3D;
  private readonly mixer?: AnimationMixer;
  private readonly waveAction?: AnimationAction;
  private elapsed = 0;
  private waveStart = -Infinity;

  constructor(gltf: GLTF) {
    const model = gltf.scene;
    const box = new Box3().setFromObject(model);
    model.scale.setScalar(config.modelHeight / box.getSize(new Vector3()).y);

    box.setFromObject(model);
    const center = box.getCenter(new Vector3());
    model.position.set(-center.x, -box.min.y, -center.z);
    this.root.add(model);

    this.head = model.getObjectByName('Head') ?? findByName(model, /head/i);

    if (gltf.animations.length) {
      this.mixer = new AnimationMixer(model);
      const wave = gltf.animations.find((clip) => WAVE_CLIP.test(clip.name));
      const idle = gltf.animations.find((clip) => clip !== wave);
      if (idle) this.mixer.clipAction(idle).play();
      if (wave) {
        this.waveAction = this.mixer.clipAction(wave);
        this.waveAction.setLoop(LoopOnce, 1);
      }
    }
  }

  wave(): void {
    this.waveStart = this.elapsed;
    this.waveAction?.reset().play();
  }

  update(delta: number, elapsed: number, pointer: Vector2): void {
    this.elapsed = elapsed;
    this.mixer?.update(delta);

    // Without a wave animation the model does a small hop instead.
    const hop = this.waveAction
      ? 0
      : pulse(elapsed, this.waveStart, config.waveDuration / 2) * 0.25;
    this.root.position.y = Math.sin(elapsed * 1.1) * 0.035 + hop;

    if (this.head) {
      const { headYaw, headPitch, followSpeed } = config;
      this.head.rotation.y = MathUtils.damp(
        this.head.rotation.y,
        pointer.x * headYaw,
        followSpeed,
        delta,
      );
      this.head.rotation.x = MathUtils.damp(
        this.head.rotation.x,
        -pointer.y * headPitch,
        followSpeed,
        delta,
      );
    }
  }
}

function findByName(root: Object3D, pattern: RegExp): Object3D | undefined {
  let found: Object3D | undefined;
  root.traverse((node) => {
    if (!found && pattern.test(node.name)) found = node;
  });
  return found;
}

// #endregion
