import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { UI_CONFIG } from '../../config/ui.config';
import { PORTFOLIO } from '../../data/portfolio.data';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { TiltDirective } from '../../shared/directives/tilt.directive';
import { Icon } from '../../shared/icon/icon';
import { SectionHeading } from '../../shared/section-heading/section-heading';

@Component({
  selector: 'app-contact',
  imports: [Icon, RevealDirective, SectionHeading, TiltDirective],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  protected readonly contact = PORTFOLIO.contact;
  protected readonly profile = PORTFOLIO.profile;
  protected readonly copied = signal(false);

  private timer = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.profile.email);
    } catch {
      // Clipboard can be blocked (http, old browsers); the mailto link still works.
      return;
    }
    this.copied.set(true);
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.copied.set(false), UI_CONFIG.copyResetMs);
  }
}
