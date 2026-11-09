import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { isWebGLAvailable } from '../core/three-utils';
import { BackgroundWorld } from './background-world';

/** Fixed full-screen canvas behind the page. Loaded lazily from the app shell with @defer. */
@Component({
  selector: 'app-background-canvas',
  template: `<canvas #canvas aria-hidden="true"></canvas>`,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      animation: fade-in 1.6s var(--ease-out) both;
    }
    canvas {
      width: 100%;
      height: 100%;
    }
    @keyframes fade-in {
      from {
        opacity: 0;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackgroundCanvas {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (!isWebGLAvailable()) return;
      const world = new BackgroundWorld(this.canvas().nativeElement);
      destroyRef.onDestroy(() => world.dispose());
    });
  }
}
