import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { RevealDirective } from '../directives/reveal.directive';

/**
 * "01 / About" style heading. The number and label come from the nav list,
 * so reordering the nav renumbers every section.
 */
@Component({
  selector: 'app-section-heading',
  imports: [RevealDirective],
  template: `
    <header class="heading" appReveal>
      <p class="heading__kicker">
        <span class="heading__index">{{ index() }}</span>
        <span class="heading__slash">/</span>
        {{ label() }}
      </p>
      <h2 class="heading__title">{{ title() }}</h2>
      @if (intro()) {
        <p class="heading__intro">{{ intro() }}</p>
      }
    </header>
  `,
  styleUrl: './section-heading.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeading {
  readonly sectionId = input.required<string>();
  readonly title = input.required<string>();
  readonly intro = input('');

  private readonly position = computed(() =>
    PORTFOLIO.nav.findIndex((item) => item.id === this.sectionId()),
  );

  protected readonly index = computed(() => String(this.position() + 1).padStart(2, '0'));
  protected readonly label = computed(() => PORTFOLIO.nav[this.position()]?.label ?? '');
}
