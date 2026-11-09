import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { UI_CONFIG } from '../../config/ui.config';
import { IconName } from '../../models/portfolio.model';

/** Renders one symbol from public/icons.svg. Size follows font-size, color follows currentColor. */
@Component({
  selector: 'app-icon',
  template: `<svg aria-hidden="true" focusable="false"><use [attr.href]="href()" /></svg>`,
  styles: `
    :host {
      display: inline-flex;
      width: 1em;
      height: 1em;
      flex-shrink: 0;
    }
    svg {
      width: 100%;
      height: 100%;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input.required<IconName>();

  protected readonly href = computed(() => `${UI_CONFIG.iconSprite}#${this.name()}`);
}
