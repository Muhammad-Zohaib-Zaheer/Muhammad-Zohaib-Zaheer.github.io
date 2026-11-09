import { Directive, ElementRef, inject, input, numberAttribute } from '@angular/core';
import { UI_CONFIG } from '../../config/ui.config';
import { prefersReducedMotion } from '../utils/motion';

/**
 * Tilts a card in 3D towards the mouse and moves a soft glare with it.
 * Only reacts to a real mouse, touch screens keep the card flat.
 * Usage: <div appTilt> or <div [appTilt]="12"> for a custom angle.
 */
@Directive({
  selector: '[appTilt]',
  host: {
    class: 'tilt',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerleave)': 'reset()',
  },
})
export class TiltDirective {
  readonly maxDeg = input(UI_CONFIG.tilt.maxDeg, {
    alias: 'appTilt',
    transform: (value: unknown) => numberAttribute(value, UI_CONFIG.tilt.maxDeg),
  });

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected onPointerMove(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' || prefersReducedMotion()) return;

    const rect = this.element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const max = this.maxDeg();

    const style = this.element.style;
    style.setProperty('--tilt-x', `${(0.5 - y) * 2 * max}deg`);
    style.setProperty('--tilt-y', `${(x - 0.5) * 2 * max}deg`);
    style.setProperty('--glare-x', `${x * 100}%`);
    style.setProperty('--glare-y', `${y * 100}%`);
    this.element.classList.add('is-tilting');
  }

  protected reset(): void {
    const style = this.element.style;
    ['--tilt-x', '--tilt-y', '--glare-x', '--glare-y'].forEach((name) =>
      style.removeProperty(name),
    );
    this.element.classList.remove('is-tilting');
  }
}
