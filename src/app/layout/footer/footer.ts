import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-footer',
  imports: [Icon],
  template: `
    <footer class="footer">
      <div class="footer__inner container">
        <p>© {{ year }} {{ profile.name }}. {{ footer.text }}</p>
        <a class="footer__top" href="#home" [attr.aria-label]="ui.backToTop">
          {{ ui.backToTop }} <app-icon name="arrow-up" />
        </a>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      padding-block: 1.75rem;
      border-top: 1px solid var(--c-border);
      color: var(--c-text-muted);
      font-size: var(--fs-small);
    }
    .footer__inner {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem 1.5rem;
    }
    .footer__top {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: color var(--duration);
    }
    .footer__top:hover {
      color: var(--c-text);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  protected readonly profile = PORTFOLIO.profile;
  protected readonly footer = PORTFOLIO.footer;
  protected readonly ui = PORTFOLIO.ui;
  protected readonly year = new Date().getFullYear();
}
