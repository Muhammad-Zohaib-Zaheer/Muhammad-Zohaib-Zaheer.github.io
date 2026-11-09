import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { TiltDirective } from '../../shared/directives/tilt.directive';
import { Icon } from '../../shared/icon/icon';
import { SectionHeading } from '../../shared/section-heading/section-heading';

@Component({
  selector: 'app-highlights',
  imports: [Icon, RevealDirective, SectionHeading, TiltDirective],
  templateUrl: './highlights.html',
  styleUrl: './highlights.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Highlights {
  protected readonly highlights = PORTFOLIO.highlights;
}
