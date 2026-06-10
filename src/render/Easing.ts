export type EasingFunction = (t: number) => number;

function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

export function easeOutQuad(t: number): number {
  const x = clamp01(t);
  return 1 - (1 - x) * (1 - x);
}

export function easeInBack(t: number, s = 1.70158): number {
  const x = clamp01(t);
  return x * x * ((s + 1) * x - s);
}

export function easeOutBack(t: number, s = 1.70158): number {
  const x = clamp01(t) - 1;
  return 1 + (s + 1) * x * x * x + s * x * x;
}

export function easeOutElastic(t: number): number {
  const x = clamp01(t);
  if (x === 0 || x === 1) {
    return x;
  }
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

export function easeInOutSine(t: number): number {
  const x = clamp01(t);
  return -(Math.cos(Math.PI * x) - 1) / 2;
}
