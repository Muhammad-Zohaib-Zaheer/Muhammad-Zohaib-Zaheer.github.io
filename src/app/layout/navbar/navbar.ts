import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { UI_CONFIG } from '../../config/ui.config';
import { PORTFOLIO } from '../../data/portfolio.data';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-navbar',
  imports: [Icon],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:scroll)': 'onScroll()',
    '(document:keydown.escape)': 'close()',
  },
})
export class Navbar {
  protected readonly profile = PORTFOLIO.profile;
  protected readonly nav = PORTFOLIO.nav;
  protected readonly ui = PORTFOLIO.ui;

  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly active = signal('');

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Lock page scroll while the mobile menu covers the screen.
    effect(() => document.body.classList.toggle('no-scroll', this.menuOpen()));

    afterNextRender(() => {
      this.onScroll();
      destroyRef.onDestroy(this.watchSections());
    });
  }

  protected onScroll(): void {
    this.scrolled.set(window.scrollY > UI_CONFIG.nav.scrolledOffset);
  }

  protected toggle(): void {
    this.menuOpen.update((open) => !open);
  }

  protected close(): void {
    this.menuOpen.set(false);
  }

  /** Highlights the nav link of the section in the middle of the screen. Returns a cleanup function. */
  private watchSections(): () => void {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) this.active.set(entry.target.id);
        }
      },
      { rootMargin: UI_CONFIG.nav.spyRootMargin },
    );

    // The hero is watched too, so no link stays highlighted after scrolling back to the top.
    document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }
}
