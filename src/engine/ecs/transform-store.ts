import { Entity, Transform } from '../schema';

export class TransformStore {
    private capacity: number;
    private count = 0;

    // Sparse Set Logic
    private sparse: Int32Array;
    private dense: Int32Array;

    // SoA Data Buffers (Current State)
    private px: Float32Array;
    private py: Float32Array;
    private pz: Float32Array;
    private rx: Float32Array;
    private ry: Float32Array;
    private rz: Float32Array;
    private rw: Float32Array;

    // SoA Data Buffers (Previous State for Interpolation)
    private ppx: Float32Array;
    private ppy: Float32Array;
    private ppz: Float32Array;
    private prx: Float32Array;
    private pry: Float32Array;
    private prz: Float32Array;
    private prw: Float32Array;

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

        this.ppx = new Float32Array(initialCapacity);
        this.ppy = new Float32Array(initialCapacity);
        this.ppz = new Float32Array(initialCapacity);
        this.prx = new Float32Array(initialCapacity);
        this.pry = new Float32Array(initialCapacity);
        this.prz = new Float32Array(initialCapacity);
        this.prw = new Float32Array(initialCapacity);

        this.sx = new Float32Array(initialCapacity);
        this.sy = new Float32Array(initialCapacity);
        this.sz = new Float32Array(initialCapacity);
    }

    add(e: Entity, t: Transform) {
        if (e < 0) return;
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

        // Sync previous to prevent interpolation spikes on spawn
        this.snapshotPose(e);

        this.sx[idx] = t.scale.x;
        this.sy[idx] = t.scale.y;
        this.sz[idx] = t.scale.z;
    }

    /**
   * Industry standard: Copies current state into previous state buffers.
   * Called before a new physics step to allow Render interpolation.
   */
    snapshotAll() {
        this.ppx.set(this.px);
        this.ppy.set(this.py);
        this.ppz.set(this.pz);
        this.prx.set(this.rx);
        this.pry.set(this.ry);
        this.prz.set(this.rz);
        this.prw.set(this.rw);
    }

    snapshotPose(e: Entity) {
        const idx = this.sparse[e];
        if (idx !== -1) {
            this.ppx[idx] = this.px[idx];
            this.ppy[idx] = this.py[idx];
            this.ppz[idx] = this.pz[idx];
            this.prx[idx] = this.rx[idx];
            this.pry[idx] = this.ry[idx];
            this.prz[idx] = this.rz[idx];
            this.prw[idx] = this.rw[idx];
        }
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
            this.px[idx] = this.px[lastIdx];
            this.py[idx] = this.py[lastIdx];
            this.pz[idx] = this.pz[lastIdx];
            this.rx[idx] = this.rx[lastIdx];
            this.ry[idx] = this.ry[lastIdx];
            this.rz[idx] = this.rz[lastIdx];
            this.rw[idx] = this.rw[lastIdx];
            this.ppx[idx] = this.ppx[lastIdx];
            this.ppy[idx] = this.ppy[lastIdx];
            this.ppz[idx] = this.ppz[lastIdx];
            this.prx[idx] = this.prx[lastIdx];
            this.pry[idx] = this.pry[lastIdx];
            this.prz[idx] = this.prz[lastIdx];
            this.prw[idx] = this.prw[lastIdx];
            this.sx[idx] = this.sx[lastIdx];
            this.sy[idx] = this.sy[lastIdx];
            this.sz[idx] = this.sz[lastIdx];
        }

        this.sparse[e] = -1;
        this.count--;
    }

    has(e: Entity): boolean {
        return e >= 0 && e < this.sparse.length && this.sparse[e] !== -1;
    }

    get(e: Entity): Transform | undefined {
        if (e < 0 || e >= this.sparse.length) return undefined;
        const idx = this.sparse[e];
        if (idx === -1) return undefined;

        return {
            position: { x: this.px[idx], y: this.py[idx], z: this.pz[idx] },
            rotation: { x: this.rx[idx], y: this.ry[idx], z: this.rz[idx], w: this.rw[idx] },
            scale: { x: this.sx[idx], y: this.sy[idx], z: this.sz[idx] }
        };
    }

    /**
   * Standard SoA iterator for high-frequency systems (e.g. RepairSystem).
   * Passes raw scalars to callback to prevent GC pressure.
   */
    forEach(callback: (px: number, py: number, pz: number, rx: number, ry: number, rz: number, rw: number, sx: number, sy: number, sz: number, e: Entity) => void) {
        const len = this.count;
        for (let i = 0; i < len; i++) {
            callback(
                this.px[i], this.py[i], this.pz[i],
                this.rx[i], this.ry[i], this.rz[i], this.rw[i],
                this.sx[i], this.sy[i], this.sz[i],
                this.dense[i]
            );
        }
    }

    /**
   * Optimized Interpolator for Render Loop.
   * alpha: Physics remainder [0..1]
   */
    forEachInterpolated(alpha: number, callback: (x: number, y: number, z: number, qx: number, qy: number, qz: number, qw: number, e: Entity) => void) {
        const len = this.count;
        const invAlpha = 1.0 - alpha;

        for (let i = 0; i < len; i++) {
            // Linear Interpolation for position
            const x = this.ppx[i] * invAlpha + this.px[i] * alpha;
            const y = this.ppy[i] * invAlpha + this.py[i] * alpha;
            const z = this.ppz[i] * invAlpha + this.pz[i] * alpha;

            // Normalized Lerp (nlerp) for rotation is industry standard for background/props.
            let qx = this.prx[i] * invAlpha + this.rx[i] * alpha;
            let qy = this.pry[i] * invAlpha + this.ry[i] * alpha;
            let qz = this.prz[i] * invAlpha + this.rz[i] * alpha;
            let qw = this.prw[i] * invAlpha + this.rw[i] * alpha;

            const mag = Math.sqrt(qx * qx + qy * qy + qz * qz + qw * qw);
            qx /= mag; qy /= mag; qz /= mag; qw /= mag;

            callback(x, y, z, qx, qy, qz, qw, this.dense[i]);
        }
    }

    setPosition(e: Entity, x: number, y: number, z: number) {
        if (e < 0 || e >= this.sparse.length) return;
        const idx = this.sparse[e];
        if (idx !== -1) {
            this.px[idx] = x; this.py[idx] = y; this.pz[idx] = z;
        }
    }

    setRotation(e: Entity, x: number, y: number, z: number, w: number) {
        if (e < 0 || e >= this.sparse.length) return;
        const idx = this.sparse[e];
        if (idx !== -1) {
            this.rx[idx] = x; this.ry[idx] = y; this.rz[idx] = z; this.rw[idx] = w;
        }
    }

    setPose(e: Entity, px: number, py: number, pz: number, rx: number, ry: number, rz: number, rw: number) {
        if (e < 0 || e >= this.sparse.length) return;
        const idx = this.sparse[e];
        if (idx !== -1) {
            this.px[idx] = px; this.py[idx] = py; this.pz[idx] = pz;
            this.rx[idx] = rx; this.ry[idx] = ry; this.rz[idx] = rz; this.rw[idx] = rw;
        }
    }

    setScale(e: Entity, x: number, y: number, z: number) {
        if (e < 0 || e >= this.sparse.length) return;
        const idx = this.sparse[e];
        if (idx !== -1) {
            this.sx[idx] = x; this.sy[idx] = y; this.sz[idx] = z;
        }
    }

    copyPosition(e: Entity, target: { x: number, y: number, z: number }) {
        if (e < 0 || e >= this.sparse.length) return;
        const idx = this.sparse[e];
        if (idx !== -1) {
            target.x = this.px[idx]; target.y = this.py[idx]; target.z = this.pz[idx];
        }
    }

    get size() { return this.count; }

    clear() {
        this.count = 0;
        this.sparse.fill(-1);
    }

    private ensureCapacity(id: number) {
        if (id >= this.capacity || this.count >= this.capacity) {
            const newCapacity = Math.max(this.capacity * 2, id + 1);
            this.resize(newCapacity);
        }
    }

    private resize(newCapacity: number) {
        const oldSparse = this.sparse;
        this.sparse = new Int32Array(newCapacity).fill(-1);
        this.sparse.set(oldSparse);

        const resizeBuffer = (old: Float32Array) => {
            const n = new Float32Array(newCapacity);
            n.set(old); return n;
        };

        const resizeInt = (old: Int32Array) => {
            const n = new Int32Array(newCapacity);
            n.set(old); return n;
        };

        this.dense = resizeInt(this.dense);
        this.px = resizeBuffer(this.px); this.py = resizeBuffer(this.py); this.pz = resizeBuffer(this.pz);
        this.rx = resizeBuffer(this.rx); this.ry = resizeBuffer(this.ry); this.rz = resizeBuffer(this.rz); this.rw = resizeBuffer(this.rw);
        this.ppx = resizeBuffer(this.ppx); this.ppy = resizeBuffer(this.ppy); this.ppz = resizeBuffer(this.ppz);
        this.prx = resizeBuffer(this.prx); this.pry = resizeBuffer(this.pry); this.prz = resizeBuffer(this.prz); this.prw = resizeBuffer(this.prw);
        this.sx = resizeBuffer(this.sx); this.sy = resizeBuffer(this.sy); this.sz = resizeBuffer(this.sz);

        this.capacity = newCapacity;
    }
}
