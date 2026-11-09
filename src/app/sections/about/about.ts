import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { TiltDirective } from '../../shared/directives/tilt.directive';
import { Icon } from '../../shared/icon/icon';
import { SectionHeading } from '../../shared/section-heading/section-heading';

@Component({
  selector: 'app-about',
  imports: [Icon, RevealDirective, SectionHeading, TiltDirective],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  protected readonly about = PORTFOLIO.about;
  protected readonly profile = PORTFOLIO.profile;

  /** Falls back to the initials when the photo is missing or fails to load. */
  protected readonly showPhoto = signal(!!this.profile.photo);
}
