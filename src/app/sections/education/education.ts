import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { TiltDirective } from '../../shared/directives/tilt.directive';
import { Icon } from '../../shared/icon/icon';
import { SectionHeading } from '../../shared/section-heading/section-heading';

@Component({
  selector: 'app-education',
  imports: [Icon, RevealDirective, SectionHeading, TiltDirective],
  template: `
    <section id="education" class="section">
      <div class="container">
        <app-section-heading
          sectionId="education"
          [title]="education.title"
          [intro]="education.intro"
        />

        <ul class="degrees">
          @for (degree of education.items; track degree.degree; let i = $index) {
            <li class="degree card" appTilt [appReveal]="i % 2">
              <span class="icon-badge"><app-icon name="book" /></span>
              <p class="degree__period">{{ degree.period }}</p>
              <h3 class="degree__title">{{ degree.degree }}</h3>
              <p class="degree__school">
                @if (degree.schoolUrl) {
                  <a [href]="degree.schoolUrl" target="_blank" rel="noopener"
                    >{{ degree.school }} <app-icon name="arrow-up-right"
                  /></a>
                } @else {
                  {{ degree.school }}
                }
              </p>
              <p class="degree__location"><app-icon name="map-pin" /> {{ degree.location }}</p>
              @if (degree.detail) {
                <p class="degree__detail">{{ degree.detail }}</p>
              }
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    @use 'mixins' as *;

    .degrees {
      display: grid;
      gap: 1.125rem;

      // As many columns as fit, so two or three degrees share a row on wide screens
      @include up(md) {
        grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
        gap: 1.375rem;
      }
    }

    .degree {
      padding: clamp(1.375rem, 3vw, 2rem);
    }

    .degree__period {
      margin-top: 1.25rem;
      color: var(--c-accent-2);
      font-family: var(--font-mono);
      font-size: var(--fs-small);
    }

    .degree__title {
      margin-top: 0.5rem;
      font-size: var(--fs-h3);
    }

    .degree__school a,
    .degree__school {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      margin-top: 0.5rem;
      font-weight: 600;
    }

    .degree__school a:hover {
      color: var(--c-accent-2);
    }

    .degree__location {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin-top: 0.25rem;
      color: var(--c-text-muted);
      font-size: var(--fs-small);
    }

    .degree__detail {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--c-border);
      color: var(--c-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Education {
  protected readonly education = PORTFOLIO.education;
}
