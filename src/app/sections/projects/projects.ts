import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { TiltDirective } from '../../shared/directives/tilt.directive';
import { Icon } from '../../shared/icon/icon';
import { SectionHeading } from '../../shared/section-heading/section-heading';

@Component({
  selector: 'app-projects',
  imports: [Icon, RevealDirective, SectionHeading, TiltDirective],
  template: `
    <section id="projects" class="section">
      <div class="container">
        <app-section-heading
          sectionId="projects"
          [title]="projects.title"
          [intro]="projects.intro"
        />

        <ul class="projects">
          @for (project of projects.items; track project.name; let i = $index) {
            <li
              class="project card"
              [class.project--featured]="project.featured"
              [appTilt]="project.featured ? 3 : 7"
              [appReveal]="i % 2"
            >
              <div class="project__top">
                <span class="project__number">{{ (i + 1).toString().padStart(2, '0') }}</span>
                <span class="project__context">{{ project.context }}</span>
              </div>

              <h3 class="project__name">{{ project.name }}</h3>
              <p class="project__summary">{{ project.summary }}</p>

              <ul class="project__points">
                @for (point of project.points; track $index) {
                  <li>{{ point }}</li>
                }
              </ul>

              <div class="project__footer">
                <p class="project__label">{{ ui.builtWith }}</p>
                <ul class="chip-list">
                  @for (tech of project.stack; track tech) {
                    <li class="chip">{{ tech }}</li>
                  }
                </ul>

                @if (project.links.length) {
                  <div class="project__links">
                    @for (link of project.links; track link.href) {
                      <a
                        class="btn btn--ghost btn--sm"
                        [href]="link.href"
                        target="_blank"
                        rel="noopener"
                      >
                        {{ link.label }} <app-icon name="arrow-up-right" />
                      </a>
                    }
                  </div>
                }
              </div>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styleUrl: './projects.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Projects {
  protected readonly projects = PORTFOLIO.projects;
  protected readonly ui = PORTFOLIO.ui;
}
