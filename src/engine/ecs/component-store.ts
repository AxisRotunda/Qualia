
import { Entity } from '../schema';

/**
 * Optimized Component Store using Sparse Sets.
 * Updated for RUN_OPT: Uses Int32Array for both Sparse and Dense sets to maximize cache locality.
 */
export class ComponentStore<T> {
    private capacity: number;
    private count = 0;

    // Contiguous array of active entities
    private dense: Int32Array;
    // Contiguous array of component data
    private components: T[] = [];

    // Sparse lookup (Entity ID -> Dense Index)
    private sparse: Int32Array;

    constructor(initialCapacity = 4096) {
        this.capacity = initialCapacity;
        this.sparse = new Int32Array(initialCapacity).fill(-1);
        this.dense = new Int32Array(initialCapacity);
    }

    add(e: Entity, component: T) {
        if (e < 0) return;
        this.ensureCapacity(e);

        const idx = this.sparse[e];
        if (idx !== -1) {
            this.components[idx] = component;
            return;
        }

        const newIdx = this.count;
        this.sparse[e] = newIdx;
        this.dense[newIdx] = e;
        this.components[newIdx] = component;
        this.count++;
    }

    get(e: Entity): T | undefined {
        if (e < 0 || e >= this.sparse.length) return undefined;
        const idx = this.sparse[e];
        return idx !== -1 ? this.components[idx] : undefined;
    }

    has(e: Entity): boolean {
        if (e < 0 || e >= this.sparse.length) return false;
        return this.sparse[e] !== -1;
    }

    remove(e: Entity) {
        if (e < 0 || e >= this.sparse.length) return;
        const idx = this.sparse[e];
        if (idx === -1) return;

        const lastIdx = this.count - 1;
        const lastEntity = this.dense[lastIdx];
        const lastComp = this.components[lastIdx];

        // Swap and Pop
        if (idx !== lastIdx) {
            this.dense[idx] = lastEntity;
            this.components[idx] = lastComp;
            this.sparse[lastEntity] = idx;
        }

        this.components.pop();
        this.sparse[e] = -1;
        this.count--;
    }

    forEach(callback: (val: T, e: Entity) => void) {
        const len = this.count;
        for (let i = 0; i < len; i++) {
            callback(this.components[i], this.dense[i]);
        }
    }

    clear() {
        this.count = 0;
        this.sparse.fill(-1);
        this.components.length = 0;
    }

    get size(): number {
        return this.count;
    }

    private ensureCapacity(entityId: number) {
        if (entityId >= this.sparse.length || this.count >= this.capacity) {
            const newSize = Math.max(this.sparse.length * 2, entityId + 1);

            const newSparse = new Int32Array(newSize).fill(-1);
            newSparse.set(this.sparse);
            this.sparse = newSparse;

            const newDense = new Int32Array(newSize);
            newDense.set(this.dense);
            this.dense = newDense;

            this.capacity = newSize;
        }
    }
}
