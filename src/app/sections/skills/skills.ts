import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UI_CONFIG } from '../../config/ui.config';
import { PORTFOLIO } from '../../data/portfolio.data';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { TiltDirective } from '../../shared/directives/tilt.directive';
import { Icon } from '../../shared/icon/icon';
import { SectionHeading } from '../../shared/section-heading/section-heading';
import { SkillSphere } from './skill-sphere/skill-sphere';

@Component({
  selector: 'app-skills',
  imports: [Icon, RevealDirective, SectionHeading, SkillSphere, TiltDirective],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skills {
  protected readonly skills = PORTFOLIO.skills;

  /** The first few skills of every group, without the notes in brackets. */
  protected readonly sphereTags = [
    ...new Set(
      this.skills.groups.flatMap((group) =>
        group.items
          .slice(0, UI_CONFIG.sphere.tagsPerGroup)
          .map((item) => item.replace(/\s*\(.*\)/, '')),
      ),
    ),
  ];
}
