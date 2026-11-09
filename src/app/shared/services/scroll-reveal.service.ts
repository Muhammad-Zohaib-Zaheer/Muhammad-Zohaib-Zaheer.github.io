import { Injectable } from '@angular/core';
import { UI_CONFIG } from '../../config/ui.config';
import { prefersReducedMotion } from '../utils/motion';

/**
 * Drives the scroll-linked reveal. For every registered element it writes two numbers on each scroll frame:
 *   --enter  0 → 1 while the element comes up from the bottom of the screen
 *   --exit   1 → 0 while it leaves through the top
 * CSS (styles.scss, .reveal) turns them into opacity, lift and tilt, so scrolling back reverses everything.
 */
@Injectable({ providedIn: 'root' })
export class ScrollRevealService {
  private readonly items = new Map<HTMLElement, { step: number; exitOnly: boolean }>();
  private readonly motion = !prefersReducedMotion();
  private frame = 0;
  private listening = false;

  /**
   * step shifts the element's start a little later, for a staggered cascade.
   * exitOnly skips the entrance, for content that is already on screen when the page opens.
   */
  register(element: HTMLElement, step: number, exitOnly: boolean): void {
    this.items.set(element, { step, exitOnly });
    if (!this.motion) {
      this.write(element, 1, 1);
      return;
    }
    this.listen();
    this.schedule();
  }

  unregister(element: HTMLElement): void {
    this.items.delete(element);
    if (!this.items.size && this.listening) {
      window.removeEventListener('scroll', this.schedule);
      window.removeEventListener('resize', this.schedule);
      cancelAnimationFrame(this.frame);
      this.frame = 0;
      this.listening = false;
    }
  }

  private listen(): void {
    if (this.listening) return;
    window.addEventListener('scroll', this.schedule, { passive: true });
    window.addEventListener('resize', this.schedule, { passive: true });
    this.listening = true;
  }

  private readonly schedule = (): void => {
    if (!this.frame) this.frame = requestAnimationFrame(() => this.update());
  };

  private update(): void {
    this.frame = 0;
    const { enterStart, enterLength, exitLength, stagger } = UI_CONFIG.reveal;
    const viewport = window.innerHeight;
    const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

    // Read every position first, then write, so the browser lays out only once.
    const measured = [...this.items].map(([element, { step, exitOnly }]) => {
      const rect = element.getBoundingClientRect();
      const start = viewport * (enterStart - step * stagger);
      return {
        element,
        enter: exitOnly ? 1 : clamp((start - rect.top) / (viewport * enterLength)),
        exit: clamp(rect.bottom / (viewport * exitLength)),
      };
    });

    let moving = false;
    for (const { element, enter, exit } of measured) {
      moving = this.write(element, enter, exit) || moving;
    }

    // The element's own transform shifts what we measure, so keep refining until it settles.
    if (moving) this.schedule();
  }

  /** Returns true when the values changed noticeably. */
  private write(element: HTMLElement, enter: number, exit: number): boolean {
    const style = element.style;
    const previous =
      Number(style.getPropertyValue('--enter') || -1) +
      Number(style.getPropertyValue('--exit') || -1);
    style.setProperty('--enter', enter.toFixed(3));
    style.setProperty('--exit', exit.toFixed(3));
    style.setProperty('--progress', Math.min(enter, exit).toFixed(3));
    return Math.abs(previous - (enter + exit)) > 0.004;
  }
}
