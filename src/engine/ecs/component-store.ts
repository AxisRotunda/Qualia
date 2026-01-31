
import { Entity } from '../schema';

// Optimized Component Store using Sparse Sets for O(1) access and contiguous iteration
export class ComponentStore<T> {
  // Contiguous data arrays for cache locality
  private dense: Entity[] = [];
  private components: T[] = [];
  
  // Direct Memory Access for Sparse Lookup (Entity ID -> Dense Index)
  // Initialized to -1 to represent 'empty'
  private sparse: Int32Array;

  constructor(initialCapacity = 4096) {
      this.sparse = new Int32Array(initialCapacity).fill(-1);
  }

  add(e: Entity, component: T) {
    this.ensureCapacity(e);

    const idx = this.sparse[e];
    if (idx !== -1) {
      // Update existing
      this.components[idx] = component;
      return;
    }
    
    this.sparse[e] = this.dense.length;
    this.dense.push(e);
    this.components.push(component);
  }

  get(e: Entity): T | undefined {
    if (e >= this.sparse.length) return undefined;
    const idx = this.sparse[e];
    return idx !== -1 ? this.components[idx] : undefined;
  }

  has(e: Entity): boolean {
    if (e >= this.sparse.length) return false;
    return this.sparse[e] !== -1;
  }

  remove(e: Entity) {
    if (e >= this.sparse.length) return;
    const idx = this.sparse[e];
    if (idx === -1) return;

    const lastIdx = this.dense.length - 1;
    const lastEntity = this.dense[lastIdx];
    const lastComp = this.components[lastIdx];

    // Swap and Pop strategy to maintain contiguity
    if (idx !== lastIdx) {
      this.dense[idx] = lastEntity;
      this.components[idx] = lastComp;
      // Update sparse pointer for the swapped entity
      this.sparse[lastEntity] = idx;
    }

    this.dense.pop();
    this.components.pop();
    this.sparse[e] = -1;
  }

  // Linear iteration over contiguous array - much faster than Map iteration
  forEach(callback: (val: T, e: Entity) => void) {
    // Cache length to avoid property access in loop
    const len = this.dense.length;
    for (let i = 0; i < len; i++) {
      callback(this.components[i], this.dense[i]);
    }
  }

  clear() {
    this.dense.length = 0;
    this.components.length = 0;
    this.sparse.fill(-1);
  }

  get size(): number {
    return this.dense.length;
  }

  private ensureCapacity(entityId: number) {
      if (entityId >= this.sparse.length) {
          let newSize = this.sparse.length;
          while (newSize <= entityId) {
              newSize *= 2;
          }
          const newSparse = new Int32Array(newSize).fill(-1);
          newSparse.set(this.sparse);
          this.sparse = newSparse;
      }
  }
}
