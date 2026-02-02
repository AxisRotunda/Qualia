
import { Entity } from '../schema';

/**
 * AgentStore: SoA storage for autonomous behavior data.
 * Supports Wander/Avoid steering logic.
 */
export class AgentStore {
  private capacity: number;
  private count = 0;
  private sparse: Int32Array;
  private dense: Int32Array;

  // SoA Buffers
  private tx: Float32Array; // Target X
  private tz: Float32Array; // Target Z
  private speed: Float32Array;
  private state: Int8Array; // 0: Idle, 1: Wander, 2: Flee
  
  // Natural Movement State
  private wanderAngle: Float32Array; // Current wander heading relative to forward
  private timer: Float32Array; // Decision timer

  constructor(initialCapacity = 512) {
    this.capacity = initialCapacity;
    this.sparse = new Int32Array(initialCapacity).fill(-1);
    this.dense = new Int32Array(initialCapacity);
    
    this.tx = new Float32Array(initialCapacity);
    this.tz = new Float32Array(initialCapacity);
    this.speed = new Float32Array(initialCapacity);
    this.state = new Int8Array(initialCapacity);
    this.wanderAngle = new Float32Array(initialCapacity);
    this.timer = new Float32Array(initialCapacity);
  }

  add(e: Entity, speed: number = 2.0) {
    if (e < 0) return;
    this.ensureCapacity(e);
    let idx = this.sparse[e];
    if (idx === -1) {
      idx = this.count;
      this.sparse[e] = idx;
      this.dense[idx] = e;
      this.count++;
    }
    this.tx[idx] = 0;
    this.tz[idx] = 0;
    this.speed[idx] = speed;
    this.state[idx] = 1; // Default to Wander
    this.wanderAngle[idx] = Math.random() * Math.PI * 2;
    this.timer[idx] = Math.random() * 5.0;
  }

  setTarget(e: Entity, x: number, z: number) {
    const idx = this.sparse[e];
    if (idx !== -1) {
      this.tx[idx] = x;
      this.tz[idx] = z;
    }
  }
  
  updateWanderState(e: Entity, dAngle: number, dt: number) {
      const idx = this.sparse[e];
      if (idx !== -1) {
          this.wanderAngle[idx] += dAngle;
          this.timer[idx] -= dt;
      }
  }
  
  resetTimer(e: Entity, value: number) {
      const idx = this.sparse[e];
      if (idx !== -1) this.timer[idx] = value;
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
      this.tx[idx] = this.tx[lastIdx];
      this.tz[idx] = this.tz[lastIdx];
      this.speed[idx] = this.speed[lastIdx];
      this.state[idx] = this.state[lastIdx];
      this.wanderAngle[idx] = this.wanderAngle[lastIdx];
      this.timer[idx] = this.timer[lastIdx];
    }
    this.sparse[e] = -1;
    this.count--;
  }

  forEach(callback: (tx: number, tz: number, speed: number, state: number, angle: number, timer: number, e: Entity) => void) {
    const len = this.count;
    for (let i = 0; i < len; i++) {
      callback(
          this.tx[i], 
          this.tz[i], 
          this.speed[i], 
          this.state[i], 
          this.wanderAngle[i], 
          this.timer[i], 
          this.dense[i]
      );
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
      
      const resizeF = (old: Float32Array) => { const n = new Float32Array(newCapacity); n.set(old); return n; };
      this.tx = resizeF(this.tx); this.tz = resizeF(this.tz); this.speed = resizeF(this.speed);
      this.wanderAngle = resizeF(this.wanderAngle); this.timer = resizeF(this.timer);
      
      const s = new Int8Array(newCapacity); s.set(this.state); this.state = s;
      const d = new Int32Array(newCapacity); d.set(this.dense); this.dense = d;
      this.capacity = newCapacity;
    }
  }
}
