import type { EasingFunction } from './Easing';
import { easeOutQuad } from './Easing';

export interface TweenConfig<T extends Record<string, number>> {
  target: T;
  prop: keyof T;
  from: number;
  to: number;
  ms: number;
  easing?: EasingFunction;
  onDone?: () => void;
}

export class Tween<T extends Record<string, number>> {
  private elapsed = 0;
  private done = false;
  private readonly easing: EasingFunction;

  constructor(private readonly config: TweenConfig<T>) {
    this.easing = config.easing ?? easeOutQuad;
    this.config.target[this.config.prop] = config.from as T[keyof T];
  }

  update(deltaMs: number): boolean {
    if (this.done) {
      return false;
    }

    this.elapsed = Math.min(this.config.ms, this.elapsed + deltaMs);
    const t = this.config.ms === 0 ? 1 : this.elapsed / this.config.ms;
    const eased = this.easing(t);
    const value = this.config.from + (this.config.to - this.config.from) * eased;
    this.config.target[this.config.prop] = value as T[keyof T];

    if (this.elapsed >= this.config.ms) {
      this.done = true;
      this.config.onDone?.();
      return false;
    }

    return true;
  }
}

export class TweenRunner {
  private readonly tweens: Array<Tween<Record<string, number>>> = [];

  add<T extends Record<string, number>>(config: TweenConfig<T>): Tween<T> {
    const tween = new Tween(config);
    this.tweens.push(tween as unknown as Tween<Record<string, number>>);
    return tween;
  }

  update(deltaMs: number): void {
    for (let i = this.tweens.length - 1; i >= 0; i -= 1) {
      if (!this.tweens[i].update(deltaMs)) {
        this.tweens.splice(i, 1);
      }
    }
  }

  clear(): void {
    this.tweens.length = 0;
  }
}
