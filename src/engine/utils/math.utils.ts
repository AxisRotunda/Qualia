
export class MathUtils {
  static readonly DEG2RAD = Math.PI / 180;
  static readonly RAD2DEG = 180 / Math.PI;

  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  static map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }

  static randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  static damp(current: number, target: number, lambda: number, dt: number): number {
    return MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
  }
}
