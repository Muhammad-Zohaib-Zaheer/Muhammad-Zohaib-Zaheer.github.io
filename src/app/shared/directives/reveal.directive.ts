import {
  afterNextRender,
  booleanAttribute,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { ScrollRevealService } from '../services/scroll-reveal.service';

/**
 * Scroll-linked reveal: the element fades, lifts and tilts in as it scrolls into view and
 * reverses when scrolled back. Usage: <div appReveal> or <div [appReveal]="2"> to start two
 * steps later than its neighbours; add revealExitOnly for content already visible on load.
 * The look is defined in styles.scss (.reveal).
 */
@Directive({
  selector: '[appReveal]',
  host: {
    class: 'reveal',
    '[style.--reveal-step]': 'step()',
  },
})
export class RevealDirective {
  readonly step = input(0, {
    alias: 'appReveal',
    transform: (value: unknown) => numberAttribute(value, 0),
  });
  readonly exitOnly = input(false, { alias: 'revealExitOnly', transform: booleanAttribute });

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const reveal = inject(ScrollRevealService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      reveal.register(element, this.step(), this.exitOnly());
      destroyRef.onDestroy(() => reveal.unregister(element));
    });
  }
}
