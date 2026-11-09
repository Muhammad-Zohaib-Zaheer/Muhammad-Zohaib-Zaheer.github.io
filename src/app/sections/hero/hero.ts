import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { UI_CONFIG } from '../../config/ui.config';
import { PORTFOLIO } from '../../data/portfolio.data';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { TiltDirective } from '../../shared/directives/tilt.directive';
import { Icon } from '../../shared/icon/icon';
import { prefersReducedMotion } from '../../shared/utils/motion';
import { AvatarStage } from '../../three/avatar/avatar-stage';

@Component({
  selector: 'app-hero',
  imports: [AvatarStage, Icon, RevealDirective, TiltDirective],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  protected readonly hero = PORTFOLIO.hero;
  protected readonly ui = PORTFOLIO.ui;
  protected readonly initials = PORTFOLIO.profile.initials;

  /** Text currently shown by the role typewriter. */
  protected readonly typedRole = signal(this.hero.roles[0]);

  private timer = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (prefersReducedMotion()) return;
      this.typeRoles();
      destroyRef.onDestroy(() => clearTimeout(this.timer));
    });
  }

  /** Types each role, holds it, deletes it, then moves to the next one. */
  private typeRoles(): void {
    const { typeMs, deleteMs, holdMs } = UI_CONFIG.typewriter;
    const roles = this.hero.roles;
    let index = 0;
    let length = roles[0].length;
    let deleting = true;

    const step = () => {
      const role = roles[index];
      length += deleting ? -1 : 1;
      this.typedRole.set(role.slice(0, length));

      let delay: number = deleting ? deleteMs : typeMs;
      if (!deleting && length === role.length) {
        deleting = true;
        delay = holdMs;
      } else if (deleting && length === 0) {
        deleting = false;
        index = (index + 1) % roles.length;
      }
      this.timer = window.setTimeout(step, delay);
    };

    // The first role is already on screen, so start by holding it.
    this.timer = window.setTimeout(step, holdMs);
  }
}
