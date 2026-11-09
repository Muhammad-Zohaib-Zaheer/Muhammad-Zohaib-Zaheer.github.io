// Small browser helpers shared by the animated parts of the site.

export const prefersReducedMotion = (): boolean =>
  matchMedia('(prefers-reduced-motion: reduce)').matches;

/** True on phones and tablets, used to pick lighter effects. */
export const isLowPowerDevice = (): boolean => matchMedia('(pointer: coarse)').matches;

/**
 * requestAnimationFrame loop that only runs while its element is on screen.
 * The callback gets the frame delta and the total running time, both in seconds.
 */
export class FrameLoop {
  private frameId = 0;
  private running = false;
  private lastTime = 0;
  private elapsed = 0;
  private readonly observer: IntersectionObserver;

  constructor(
    target: Element,
    private readonly tick: (delta: number, elapsed: number) => void,
  ) {
    this.observer = new IntersectionObserver(([entry]) =>
      entry.isIntersecting ? this.start() : this.stop(),
    );
    this.observer.observe(target);
  }

  dispose(): void {
    this.stop();
    this.observer.disconnect();
  }

  private start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();

    const frame = (now: number) => {
      // Clamp the delta so a long pause (background tab) does not cause a jump.
      const delta = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;
      this.elapsed += delta;
      this.tick(delta, this.elapsed);
      this.frameId = requestAnimationFrame(frame);
    };
    this.frameId = requestAnimationFrame(frame);
  }

  private stop(): void {
    cancelAnimationFrame(this.frameId);
    this.running = false;
  }
}
