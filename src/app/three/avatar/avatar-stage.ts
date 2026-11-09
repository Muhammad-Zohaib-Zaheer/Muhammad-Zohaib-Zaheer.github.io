import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { SCENE_CONFIG } from '../../config/scene.config';
import { PORTFOLIO } from '../../data/portfolio.data';
import { Icon } from '../../shared/icon/icon';
import { isWebGLAvailable } from '../core/three-utils';
import { AvatarWorld } from './avatar-world';

/** Hero canvas with the 3D avatar. Loaded lazily from the hero with @defer. */
@Component({
  selector: 'app-avatar-stage',
  imports: [Icon],
  templateUrl: './avatar-stage.html',
  styleUrl: './avatar-stage.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarStage {
  protected readonly look = PORTFOLIO.avatar;
  protected readonly initials = PORTFOLIO.profile.initials;
  protected readonly supported = signal(isWebGLAvailable());
  protected readonly ready = signal(false);
  protected readonly greeting = signal(false);

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private greetingTimer = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const canvas = this.canvas()?.nativeElement;
      if (!canvas) return;

      const world = new AvatarWorld(canvas, this.host().nativeElement, this.look, () =>
        this.showGreeting(),
      );
      world.init().then(() => this.ready.set(true));

      destroyRef.onDestroy(() => {
        world.dispose();
        clearTimeout(this.greetingTimer);
      });
    });
  }

  private showGreeting(): void {
    this.greeting.set(true);
    clearTimeout(this.greetingTimer);
    this.greetingTimer = window.setTimeout(
      () => this.greeting.set(false),
      SCENE_CONFIG.avatar.waveDuration * 1000,
    );
  }
}
