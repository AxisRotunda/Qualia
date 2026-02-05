
import { Entity, KinematicController } from '../schema';

export class KinematicStore {
    private capacity: number;
    private count = 0;
    private sparse: Int32Array;
    private dense: Int32Array;

    // SoA Buffers for Target Transform
    private tx: Float32Array;
    private ty: Float32Array;
    private tz: Float32Array;
    private rx: Float32Array;
    private ry: Float32Array;
    private rz: Float32Array;
    private rw: Float32Array;

    constructor(initialCapacity = 4096) {
        this.capacity = initialCapacity;
        this.sparse = new Int32Array(initialCapacity).fill(-1);
        this.dense = new Int32Array(initialCapacity);
        this.tx = new Float32Array(initialCapacity);
        this.ty = new Float32Array(initialCapacity);
        this.tz = new Float32Array(initialCapacity);
        this.rx = new Float32Array(initialCapacity);
        this.ry = new Float32Array(initialCapacity);
        this.rz = new Float32Array(initialCapacity);
        this.rw = new Float32Array(initialCapacity);
    }

    add(e: Entity, c: KinematicController) {
        this.ensureCapacity(e);
        let idx = this.sparse[e];
        if (idx === -1) {
            idx = this.count;
            this.sparse[e] = idx;
            this.dense[idx] = e;
            this.count++;
        }
        this.setTarget(e, c.targetPosition, c.targetRotation);
    }

    setTarget(e: Entity, pos: {x:number, y:number, z:number}, rot: {x:number, y:number, z:number, w:number}) {
        const idx = this.sparse[e];
        if (idx !== -1) {
            this.tx[idx] = pos.x; this.ty[idx] = pos.y; this.tz[idx] = pos.z;
            this.rx[idx] = rot.x; this.ry[idx] = rot.y; this.rz[idx] = rot.z; this.rw[idx] = rot.w;
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
            this.tx[idx] = this.tx[lastIdx]; this.ty[idx] = this.ty[lastIdx]; this.tz[idx] = this.tz[lastIdx];
            this.rx[idx] = this.rx[lastIdx]; this.ry[idx] = this.ry[lastIdx]; this.rz[idx] = this.rz[lastIdx]; this.rw[idx] = this.rw[lastIdx];
        }
        this.sparse[e] = -1;
        this.count--;
    }

    has(e: Entity): boolean {
        return e < this.sparse.length && this.sparse[e] !== -1;
    }

    get(e: Entity): KinematicController | undefined {
        const idx = this.sparse[e];
        if (idx === -1 || e >= this.sparse.length) return undefined;
        return {
            targetPosition: { x: this.tx[idx], y: this.ty[idx], z: this.tz[idx] },
            targetRotation: { x: this.rx[idx], y: this.ry[idx], z: this.rz[idx], w: this.rw[idx] }
        };
    }

    forEach(callback: (tx: number, ty: number, tz: number, rx: number, ry: number, rz: number, rw: number, e: Entity) => void) {
        const len = this.count;
        for (let i = 0; i < len; i++) {
            callback(this.tx[i], this.ty[i], this.tz[i], this.rx[i], this.ry[i], this.rz[i], this.rw[i], this.dense[i]);
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
            this.tx = resize(this.tx); this.ty = resize(this.ty); this.tz = resize(this.tz);
            this.rx = resize(this.rx); this.ry = resize(this.ry); this.rz = resize(this.rz); this.rw = resize(this.rw);
            const den = new Int32Array(newCapacity); den.set(this.dense); this.dense = den;
            this.capacity = newCapacity;
        }
    }
}
