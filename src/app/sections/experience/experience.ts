import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { TiltDirective } from '../../shared/directives/tilt.directive';
import { Icon } from '../../shared/icon/icon';
import { SectionHeading } from '../../shared/section-heading/section-heading';

@Component({
  selector: 'app-experience',
  imports: [Icon, RevealDirective, SectionHeading, TiltDirective],
  template: `
    <section id="experience" class="section">
      <div class="container">
        <app-section-heading
          sectionId="experience"
          [title]="experience.title"
          [intro]="experience.intro"
        />

        <ol class="timeline">
          @for (job of experience.items; track job.company + job.period) {
            <li class="timeline__item" appReveal>
              <span class="timeline__dot" aria-hidden="true"><app-icon name="briefcase" /></span>

              <article class="job card" [appTilt]="3">
                <header class="job__header">
                  <div>
                    <h3 class="job__role">{{ job.role }}</h3>
                    <p class="job__company">
                      @if (job.companyUrl) {
                        <a [href]="job.companyUrl" target="_blank" rel="noopener">{{
                          job.company
                        }}</a>
                      } @else {
                        {{ job.company }}
                      }
                    </p>
                  </div>
                  <div class="job__meta">
                    <span class="chip">{{ job.period }}</span>
                    <span class="job__location"
                      ><app-icon name="map-pin" /> {{ job.location }}</span
                    >
                  </div>
                </header>

                <p class="job__summary">{{ job.summary }}</p>
                <ul class="job__points">
                  @for (point of job.points; track $index) {
                    <li>{{ point }}</li>
                  }
                </ul>
                <ul class="chip-list">
                  @for (tech of job.stack; track tech) {
                    <li class="chip">{{ tech }}</li>
                  }
                </ul>
              </article>
            </li>
          }
        </ol>
      </div>
    </section>
  `,
  styleUrl: './experience.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Experience {
  protected readonly experience = PORTFOLIO.experience;
}
