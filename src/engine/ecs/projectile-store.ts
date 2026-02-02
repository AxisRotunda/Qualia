
import { Entity, Projectile } from '../schema';

export class ProjectileStore {
  private capacity: number;
  private count = 0;
  private sparse: Int32Array;
  private dense: Int32Array;

  // SoA Buffers
  private damage: Float32Array;
  private impulse: Float32Array;
  private life: Float32Array; // Remaining life in seconds
  private ownerId: Int32Array;

  constructor(initialCapacity = 1024) {
    this.capacity = initialCapacity;
    this.sparse = new Int32Array(initialCapacity).fill(-1);
    this.dense = new Int32Array(initialCapacity);
    
    this.damage = new Float32Array(initialCapacity);
    this.impulse = new Float32Array(initialCapacity);
    this.life = new Float32Array(initialCapacity);
    this.ownerId = new Int32Array(initialCapacity);
  }

  add(e: Entity, p: Projectile) {
    if (e < 0) return;
    this.ensureCapacity(e);
    
    let idx = this.sparse[e];
    if (idx === -1) {
      idx = this.count;
      this.sparse[e] = idx;
      this.dense[idx] = e;
      this.count++;
    }

    this.damage[idx] = p.damage;
    this.impulse[idx] = p.impulse;
    this.life[idx] = p.life;
    this.ownerId[idx] = p.ownerId;
  }

  remove(e: Entity) {
    if (e < 0 || e >= this.sparse.length) return;
    const idx = this.sparse[e];
    if (idx === -1) return;

    const lastIdx = this.count - 1;
    const lastEntity = this.dense[lastIdx];

    // Swap & Pop
    if (idx !== lastIdx) {
      this.dense[idx] = lastEntity;
      this.sparse[lastEntity] = idx;
      
      this.damage[idx] = this.damage[lastIdx];
      this.impulse[idx] = this.impulse[lastIdx];
      this.life[idx] = this.life[lastIdx];
      this.ownerId[idx] = this.ownerId[lastIdx];
    }

    this.sparse[e] = -1;
    this.count--;
  }

  has(e: Entity): boolean {
    return e < this.sparse.length && this.sparse[e] !== -1;
  }

  get(e: Entity): Projectile | undefined {
    const idx = this.sparse[e];
    if (idx === -1 || e >= this.sparse.length) return undefined;
    return {
      damage: this.damage[idx],
      impulse: this.impulse[idx],
      life: this.life[idx],
      ownerId: this.ownerId[idx]
    };
  }

  getDamage(e: Entity): number {
      const idx = this.sparse[e];
      return idx !== -1 ? this.damage[idx] : 0;
  }

  getImpulse(e: Entity): number {
      const idx = this.sparse[e];
      return idx !== -1 ? this.impulse[idx] : 0;
  }

  /**
   * Updates life for a specific entity.
   */
  updateLife(e: Entity, delta: number) {
      const idx = this.sparse[e];
      if (idx !== -1) {
          this.life[idx] -= delta;
      }
  }

  // Optimized iterator for CombatSystem lifecycle check
  forEach(callback: (damage: number, life: number, owner: Entity, e: Entity) => void) {
    const len = this.count;
    for (let i = 0; i < len; i++) {
      callback(this.damage[i], this.life[i], this.ownerId[i], this.dense[i]);
    }
  }

  clear() {
    this.count = 0;
    this.sparse.fill(-1);
  }

  private ensureCapacity(id: number) {
    if (id >= this.capacity || this.count >= this.capacity) {
      const newCapacity = Math.max(this.capacity * 2, id + 1);
      const oldSparse = this.sparse;
      this.sparse = new Int32Array(newCapacity).fill(-1);
      this.sparse.set(oldSparse);
      
      const resizeInt = (old: Int32Array) => { const n = new Int32Array(newCapacity); n.set(old); return n; };
      const resizeF32 = (old: Float32Array) => { const n = new Float32Array(newCapacity); n.set(old); return n; };

      this.dense = resizeInt(this.dense);
      this.damage = resizeF32(this.damage);
      this.impulse = resizeF32(this.impulse);
      this.life = resizeF32(this.life);
      this.ownerId = resizeInt(this.ownerId);
      
      this.capacity = newCapacity;
    }
  }
}
