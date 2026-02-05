
import { Entity, RigidBodyRef } from '../schema';

export class RigidBodyStore {
    private capacity: number;
    private count = 0;
    private sparse: Int32Array;
    private dense: Int32Array;
    private handles: Int32Array;

    constructor(initialCapacity = 4096) {
        this.capacity = initialCapacity;
        this.sparse = new Int32Array(initialCapacity).fill(-1);
        this.dense = new Int32Array(initialCapacity);
        this.handles = new Int32Array(initialCapacity);
    }

    add(e: Entity, handle: number) {
        if (e < 0) return;
        this.ensureCapacity(e);
        let idx = this.sparse[e];
        if (idx === -1) {
            idx = this.count;
            this.sparse[e] = idx;
            this.dense[idx] = e;
            this.count++;
        }
        this.handles[idx] = handle;
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
            this.handles[idx] = this.handles[lastIdx];
        }

        this.sparse[e] = -1;
        this.count--;
    }

    has(e: Entity): boolean {
        return e >= 0 && e < this.sparse.length && this.sparse[e] !== -1;
    }

    /**
   * Compatibility method for standard ECS access.
   * Returns a temporary object wrapper.
   */
    get(e: Entity): RigidBodyRef | undefined {
        const handle = this.getHandle(e);
        return handle !== undefined ? { handle } : undefined;
    }

    /**
   * Performance method for high-frequency systems.
   * Returns the raw numeric handle without object allocation.
   */
    getHandle(e: Entity): number | undefined {
        if (e < 0 || e >= this.sparse.length) return undefined;
        const idx = this.sparse[e];
        return idx !== -1 ? this.handles[idx] : undefined;
    }

    forEach(callback: (handle: number, e: Entity) => void) {
        const len = this.count;
        for (let i = 0; i < len; i++) {
            callback(this.handles[i], this.dense[i]);
        }
    }

    clear() {
        this.count = 0;
        this.sparse.fill(-1);
    }

    get size() {
        return this.count;
    }

    private ensureCapacity(id: number) {
        if (id >= this.capacity || this.count >= this.capacity) {
            const newCapacity = Math.max(this.capacity * 2, id + 1);
            const oldSparse = this.sparse;
            this.sparse = new Int32Array(newCapacity).fill(-1);
            this.sparse.set(oldSparse);

            const newDense = new Int32Array(newCapacity);
            newDense.set(this.dense);
            this.dense = newDense;

            const newHandles = new Int32Array(newCapacity);
            newHandles.set(this.handles);
            this.handles = newHandles;

            this.capacity = newCapacity;
        }
    }
}
