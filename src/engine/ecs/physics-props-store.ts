import { Entity, PhysicsProps } from '../schema';

export class PhysicsPropsStore {
  private capacity: number;
  private count = 0;
  private sparse: Int32Array;
  private dense: Int32Array;

  // SoA Buffers
  private friction: Float32Array;
  private restitution: Float32Array;
  private density: Float32Array;

  constructor(initialCapacity = 4096) {
    this.capacity = initialCapacity;
    this.sparse = new Int32Array(initialCapacity).fill(-1);
    this.dense = new Int32Array(initialCapacity);
    this.friction = new Float32Array(initialCapacity);
    this.restitution = new Float32Array(initialCapacity);
    this.density = new Float32Array(initialCapacity);
  }

  add(e: Entity, p: PhysicsProps) {
    this.ensureCapacity(e);
    let idx = this.sparse[e];
    if (idx === -1) {
      idx = this.count;
      this.sparse[e] = idx;
      this.dense[idx] = e;
      this.count++;
    }
    this.friction[idx] = p.friction;
    this.restitution[idx] = p.restitution;
    this.density[idx] = p.density || 1000;
  }

  setProps(e: Entity, friction: number, restitution: number, density: number) {
    const idx = this.sparse[e];
    if (idx !== -1) {
      this.friction[idx] = friction;
      this.restitution[idx] = restitution;
      this.density[idx] = density;
    }
  }

  remove(e: Entity) {
    if (e >= this.sparse.length) return;
    const idx = this.sparse[e];
    if (idx === -1) return;
    const lastIdx = this.count - 1;
    const lastEntity = this.dense[lastIdx];
    if (idx !== lastIdx) {
      this.dense[idx] = lastEntity;
      this.sparse[lastEntity] = idx;
      this.friction[idx] = this.friction[lastIdx];
      this.restitution[idx] = this.restitution[lastIdx];
      this.density[idx] = this.density[lastIdx];
    }
    this.sparse[e] = -1;
    this.count--;
  }

  has(e: Entity): boolean {
    return e < this.sparse.length && this.sparse[e] !== -1;
  }

  get(e: Entity): PhysicsProps | undefined {
    const idx = this.sparse[e];
    if (idx === -1 || e >= this.sparse.length) return undefined;
    return {
      friction: this.friction[idx],
      restitution: this.restitution[idx],
      density: this.density[idx]
    };
  }

  getDensity(e: Entity): number {
      const idx = this.sparse[e];
      return idx !== -1 ? this.density[idx] : 1000;
  }

  forEach(callback: (f: number, r: number, d: number, e: Entity) => void) {
    const len = this.count;
    for (let i = 0; i < len; i++) {
      callback(this.friction[i], this.restitution[i], this.density[i], this.dense[i]);
    }
  }

  clear() {
    this.count = 0;
    this.sparse.fill(-1);
  }

  get size() { return this.count; }

  private ensureCapacity(id: number) {
    if (id >= this.capacity || this.count >= this.capacity) {
      const newCapacity = Math.max(this.capacity * 2, id + 1);
      const oldSparse = this.sparse;
      this.sparse = new Int32Array(newCapacity).fill(-1);
      this.sparse.set(oldSparse);
      
      const f = new Float32Array(newCapacity); f.set(this.friction); this.friction = f;
      const r = new Float32Array(newCapacity); r.set(this.restitution); this.restitution = r;
      const d = new Float32Array(newCapacity); d.set(this.density); this.density = d;
      const den = new Int32Array(newCapacity); den.set(this.dense); this.dense = den;
      
      this.capacity = newCapacity;
    }
  }
}