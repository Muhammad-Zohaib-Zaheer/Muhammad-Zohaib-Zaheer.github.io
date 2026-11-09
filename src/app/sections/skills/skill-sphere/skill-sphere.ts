import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  viewChild,
  viewChildren,
} from '@angular/core';
import { UI_CONFIG } from '../../../config/ui.config';
import { FrameLoop, prefersReducedMotion } from '../../../shared/utils/motion';

interface Point {
  x: number;
  y: number;
  z: number;
}

/** Spreads n points evenly over a unit sphere (Fibonacci lattice). */
function spherePoints(count: number): Point[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const angle = golden * i;
    return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius };
  });
}

/**
 * A rotating 3D cloud of skill tags, done with plain DOM and CSS transforms.
 * It spins slowly on its own and turns towards the mouse while hovered.
 */
@Component({
  selector: 'app-skill-sphere',
  template: `
    <div
      class="sphere"
      #sphere
      (pointermove)="onPointerMove($event)"
      (pointerleave)="onPointerLeave()"
    >
      @for (tag of tags(); track tag) {
        <span class="sphere__tag" #tag>{{ tag }}</span>
      }
    </div>
  `,
  styleUrl: './skill-sphere.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillSphere {
  readonly tags = input.required<string[]>();

  private readonly sphere = viewChild.required<ElementRef<HTMLElement>>('sphere');
  private readonly tagElements = viewChildren<ElementRef<HTMLElement>>('tag');

  private readonly speed: { x: number; y: number } = {
    x: UI_CONFIG.sphere.idleSpeed,
    y: UI_CONFIG.sphere.idleSpeed,
  };
  private readonly angle = { x: 0, y: 0 };
  private radius = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const element = this.sphere().nativeElement;
      const points = spherePoints(this.tagElements().length);

      const resizeObserver = new ResizeObserver(() => {
        this.radius = element.clientWidth * UI_CONFIG.sphere.radiusRatio;
        this.draw(points);
      });
      resizeObserver.observe(element);

      const loop = prefersReducedMotion() ? null : new FrameLoop(element, () => this.step(points));
      destroyRef.onDestroy(() => {
        resizeObserver.disconnect();
        loop?.dispose();
      });
    });
  }

  protected onPointerMove(event: PointerEvent): void {
    const rect = this.sphere().nativeElement.getBoundingClientRect();
    const { hoverSpeed } = UI_CONFIG.sphere;
    this.speed.y = ((event.clientX - rect.left) / rect.width - 0.5) * hoverSpeed;
    this.speed.x = -((event.clientY - rect.top) / rect.height - 0.5) * hoverSpeed;
  }

  protected onPointerLeave(): void {
    this.speed.x = this.speed.y = UI_CONFIG.sphere.idleSpeed;
  }

  private step(points: Point[]): void {
    this.angle.x += this.speed.x;
    this.angle.y += this.speed.y;
    this.draw(points);
  }

  /** Rotates every point and writes the result straight to the DOM (no change detection). */
  private draw(points: Point[]): void {
    const { minScale, minOpacity } = UI_CONFIG.sphere;
    const [sinX, cosX] = [Math.sin(this.angle.x), Math.cos(this.angle.x)];
    const [sinY, cosY] = [Math.sin(this.angle.y), Math.cos(this.angle.y)];

    this.tagElements().forEach(({ nativeElement: tag }, i) => {
      const p = points[i];
      // Rotate around Y, then X.
      const x1 = p.x * cosY + p.z * sinY;
      const z1 = -p.x * sinY + p.z * cosY;
      const y2 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;

      const depth = (z2 + 1) / 2; // 0 = back, 1 = front
      const scale = minScale + (1 - minScale) * depth;
      tag.style.transform = `translate(-50%, -50%) translate3d(${x1 * this.radius}px, ${y2 * this.radius}px, 0) scale(${scale})`;
      tag.style.opacity = String(minOpacity + (1 - minOpacity) * depth);
      tag.style.zIndex = String(Math.round(depth * 100));
    });
  }
}
