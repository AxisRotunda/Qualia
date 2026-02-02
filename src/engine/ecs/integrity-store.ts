
import { Entity } from '../schema';

export interface Integrity {
    health: number;
    maxHealth: number;
    threshold: number; // Minimum impulse to cause damage
    lastImpactPoint?: { x: number, y: number, z: number };
    lastImpactVel?: { x: number, y: number, z: number };
}

export class IntegrityStore {
  private capacity: number;
  private count = 0;
  private sparse: Int32Array;
  private dense: Int32Array;

  // SoA Buffers
  private health: Float32Array;
  private maxHealth: Float32Array;
  private threshold: Float32Array;
  
  // RUN_REF: Impact Metadata Buffers (Zero-Alloc spatial memory)
  private ix: Float32Array; // Impact Point X
  private iy: Float32Array; // Impact Point Y
  private iz: Float32Array; // Impact Point Z
  
  private ivx: Float32Array; // Impact Velocity X
  private ivy: Float32Array; // Impact Velocity Y
  private ivz: Float32Array; // Impact Velocity Z

  constructor(initialCapacity = 1024) {
    this.capacity = initialCapacity;
    this.sparse = new Int32Array(initialCapacity).fill(-1);
    this.dense = new Int32Array(initialCapacity);
    
    this.health = new Float32Array(initialCapacity);
    this.maxHealth = new Float32Array(initialCapacity);
    this.threshold = new Float32Array(initialCapacity);
    
    this.ix = new Float32Array(initialCapacity);
    this.iy = new Float32Array(initialCapacity);
    this.iz = new Float32Array(initialCapacity);
    
    this.ivx = new Float32Array(initialCapacity);
    this.ivy = new Float32Array(initialCapacity);
    this.ivz = new Float32Array(initialCapacity);
  }

  add(e: Entity, health: number, threshold: number) {
    if (e < 0) return;
    this.ensureCapacity(e);
    
    let idx = this.sparse[e];
    if (idx === -1) {
      idx = this.count;
      this.sparse[e] = idx;
      this.dense[idx] = e;
      this.count++;
    }

    this.health[idx] = health;
    this.maxHealth[idx] = health;
    this.threshold[idx] = threshold;
    
    // Initialize vectors to zero
    this.ix[idx] = 0; this.iy[idx] = 0; this.iz[idx] = 0;
    this.ivx[idx] = 0; this.ivy[idx] = 0; this.ivz[idx] = 0;
  }

  applyDamage(e: Entity, amount: number, point?: {x:number, y:number, z:number}, vel?: {x:number, y:number, z:number}) {
      const idx = this.sparse[e];
      if (idx !== -1) {
          this.health[idx] -= amount;
          if (point) {
              this.ix[idx] = point.x; this.iy[idx] = point.y; this.iz[idx] = point.z;
          }
          if (vel) {
              this.ivx[idx] = vel.x; this.ivy[idx] = vel.y; this.ivz[idx] = vel.z;
          }
      }
  }

  get(e: Entity): Integrity | undefined {
      const idx = this.sparse[e];
      if (idx === -1) return undefined;
      return {
          health: this.health[idx],
          maxHealth: this.maxHealth[idx],
          threshold: this.threshold[idx],
          lastImpactPoint: { x: this.ix[idx], y: this.iy[idx], z: this.iz[idx] },
          lastImpactVel: { x: this.ivx[idx], y: this.ivy[idx], z: this.ivz[idx] }
      };
  }

  getHealth(e: Entity): number {
      const idx = this.sparse[e];
      return idx !== -1 ? this.health[idx] : 0;
  }

  remove(e: Entity) {
    if (e < 0 || e >= this.sparse.length) return;
    const idx = this.sparse[e];
    if (idx === -1) return;

    const lastIdx = this.count - 1;
    const lastEntity = this.dense[lastIdx];

    if (idx !== lastIdx) {
      this.dense[idx] = lastEntity;
      this.sparse[lastEntity] = idx;
      this.health[idx] = this.health[lastIdx];
      this.maxHealth[idx] = this.maxHealth[lastIdx];
      this.threshold[idx] = this.threshold[lastIdx];
      this.ix[idx] = this.ix[lastIdx]; this.iy[idx] = this.iy[lastIdx]; this.iz[idx] = this.iz[lastIdx];
      this.ivx[idx] = this.ivx[lastIdx]; this.ivy[idx] = this.ivy[lastIdx]; this.ivz[idx] = this.ivz[lastIdx];
    }

    this.sparse[e] = -1;
    this.count--;
  }

  forEach(callback: (h: number, max: number, thresh: number, e: Entity) => void) {
      const len = this.count;
      for(let i=0; i<len; i++) {
          callback(this.health[i], this.maxHealth[i], this.threshold[i], this.dense[i]);
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
      
      const resize = (old: Float32Array) => { const n = new Float32Array(newCapacity); n.set(old); return n; };
      const resizeInt = (old: Int32Array) => { const n = new Int32Array(newCapacity); n.set(old); return n; };

      this.dense = resizeInt(this.dense);
      this.health = resize(this.health);
      this.maxHealth = resize(this.maxHealth);
      this.threshold = resize(this.threshold);
      
      this.ix = resize(this.ix); this.iy = resize(this.iy); this.iz = resize(this.iz);
      this.ivx = resize(this.ivx); this.ivy = resize(this.ivy); this.ivz = resize(this.ivz);
      
      this.capacity = newCapacity;
    }
  }
}
