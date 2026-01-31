
import { Entity, Transform } from '../schema';

export class TransformStore {
  private capacity: number;
  private count = 0;

  // Sparse Set Logic
  private sparse: Int32Array;
  private dense: Int32Array;

  // SoA Data Buffers
  private px: Float32Array;
  private py: Float32Array;
  private pz: Float32Array;

  private rx: Float32Array;
  private ry: Float32Array;
  private rz: Float32Array;
  private rw: Float32Array;

  private sx: Float32Array;
  private sy: Float32Array;
  private sz: Float32Array;

  constructor(initialCapacity = 4096) {
    this.capacity = initialCapacity;
    this.sparse = new Int32Array(initialCapacity).fill(-1);
    this.dense = new Int32Array(initialCapacity);

    this.px = new Float32Array(initialCapacity);
    this.py = new Float32Array(initialCapacity);
    this.pz = new Float32Array(initialCapacity);

    this.rx = new Float32Array(initialCapacity);
    this.ry = new Float32Array(initialCapacity);
    this.rz = new Float32Array(initialCapacity);
    this.rw = new Float32Array(initialCapacity);

    this.sx = new Float32Array(initialCapacity);
    this.sy = new Float32Array(initialCapacity);
    this.sz = new Float32Array(initialCapacity);
  }

  add(e: Entity, t: Transform) {
    this.ensureCapacity(e);
    
    let idx = this.sparse[e];
    if (idx === -1) {
      idx = this.count;
      this.sparse[e] = idx;
      this.dense[idx] = e;
      this.count++;
    }

    this.px[idx] = t.position.x;
    this.py[idx] = t.position.y;
    this.pz[idx] = t.position.z;

    this.rx[idx] = t.rotation.x;
    this.ry[idx] = t.rotation.y;
    this.rz[idx] = t.rotation.z;
    this.rw[idx] = t.rotation.w;

    this.sx[idx] = t.scale.x;
    this.sy[idx] = t.scale.y;
    this.sz[idx] = t.scale.z;
  }

  remove(e: Entity) {
    if (e >= this.sparse.length) return;
    const idx = this.sparse[e];
    if (idx === -1) return;

    const lastIdx = this.count - 1;
    const lastEntity = this.dense[lastIdx];

    if (idx !== lastIdx) {
      // Swap
      this.dense[idx] = lastEntity;
      this.sparse[lastEntity] = idx;

      // Copy Data from Last to Current
      this.px[idx] = this.px[lastIdx];
      this.py[idx] = this.py[lastIdx];
      this.pz[idx] = this.pz[lastIdx];

      this.rx[idx] = this.rx[lastIdx];
      this.ry[idx] = this.ry[lastIdx];
      this.rz[idx] = this.rz[lastIdx];
      this.rw[idx] = this.rw[lastIdx];

      this.sx[idx] = this.sx[lastIdx];
      this.sy[idx] = this.sy[lastIdx];
      this.sz[idx] = this.sz[lastIdx];
    }

    this.sparse[e] = -1;
    this.count--;
  }

  has(e: Entity): boolean {
    return e < this.sparse.length && this.sparse[e] !== -1;
  }

  get(e: Entity): Transform | undefined {
    if (e >= this.sparse.length) return undefined;
    const idx = this.sparse[e];
    if (idx === -1) return undefined;

    // Return a copy (Snapshot)
    return {
      position: { x: this.px[idx], y: this.py[idx], z: this.pz[idx] },
      rotation: { x: this.rx[idx], y: this.ry[idx], z: this.rz[idx], w: this.rw[idx] },
      scale: { x: this.sx[idx], y: this.sy[idx], z: this.sz[idx] }
    };
  }

  // --- Optimized Setters ---

  setPosition(e: Entity, x: number, y: number, z: number) {
    const idx = this.sparse[e];
    if (idx !== -1) {
      this.px[idx] = x;
      this.py[idx] = y;
      this.pz[idx] = z;
    }
  }

  setRotation(e: Entity, x: number, y: number, z: number, w: number) {
    const idx = this.sparse[e];
    if (idx !== -1) {
      this.rx[idx] = x;
      this.ry[idx] = y;
      this.rz[idx] = z;
      this.rw[idx] = w;
    }
  }

  setScale(e: Entity, x: number, y: number, z: number) {
    const idx = this.sparse[e];
    if (idx !== -1) {
      this.sx[idx] = x;
      this.sy[idx] = y;
      this.sz[idx] = z;
    }
  }

  // --- Optimized Getters ---

  copyPosition(e: Entity, target: { x: number, y: number, z: number }) {
    const idx = this.sparse[e];
    if (idx !== -1) {
      target.x = this.px[idx];
      target.y = this.py[idx];
      target.z = this.pz[idx];
    }
  }

  get size() {
    return this.count;
  }

  clear() {
    this.count = 0;
    this.sparse.fill(-1);
  }

  private ensureCapacity(id: number) {
    if (id >= this.capacity) {
      const newCapacity = Math.max(this.capacity * 2, id + 1);
      this.resize(newCapacity);
    }
    if (this.count >= this.capacity) {
      this.resize(this.capacity * 2);
    }
  }

  private resize(newCapacity: number) {
    const oldSparse = this.sparse;
    this.sparse = new Int32Array(newCapacity).fill(-1);
    this.sparse.set(oldSparse);

    const resizeBuffer = (old: Float32Array) => {
      const n = new Float32Array(newCapacity);
      n.set(old);
      return n;
    };

    const resizeInt = (old: Int32Array) => {
      const n = new Int32Array(newCapacity);
      n.set(old);
      return n;
    };

    this.dense = resizeInt(this.dense);
    this.px = resizeBuffer(this.px);
    this.py = resizeBuffer(this.py);
    this.pz = resizeBuffer(this.pz);
    this.rx = resizeBuffer(this.rx);
    this.ry = resizeBuffer(this.ry);
    this.rz = resizeBuffer(this.rz);
    this.rw = resizeBuffer(this.rw);
    this.sx = resizeBuffer(this.sx);
    this.sy = resizeBuffer(this.sy);
    this.sz = resizeBuffer(this.sz);

    this.capacity = newCapacity;
  }
}
