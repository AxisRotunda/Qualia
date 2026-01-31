
import { Entity } from '../schema';

// Optimized Component Store using Sparse Sets for O(1) access and contiguous iteration
export class ComponentStore<T> {
  // Contiguous data arrays for cache locality
  private dense: Entity[] = [];
  private components: T[] = [];
  
  // Map Entity ID -> Index in dense array
  private sparse = new Map<Entity, number>();

  add(e: Entity, component: T) {
    if (this.sparse.has(e)) {
      // Update existing
      this.components[this.sparse.get(e)!] = component;
      return;
    }
    
    this.sparse.set(e, this.dense.length);
    this.dense.push(e);
    this.components.push(component);
  }

  get(e: Entity): T | undefined {
    const idx = this.sparse.get(e);
    return idx !== undefined ? this.components[idx] : undefined;
  }

  has(e: Entity): boolean {
    return this.sparse.has(e);
  }

  remove(e: Entity) {
    const idx = this.sparse.get(e);
    if (idx === undefined) return;

    const lastIdx = this.dense.length - 1;
    const lastEntity = this.dense[lastIdx];
    const lastComp = this.components[lastIdx];

    // Swap and Pop strategy to maintain contiguity
    if (idx !== lastIdx) {
      this.dense[idx] = lastEntity;
      this.components[idx] = lastComp;
      this.sparse.set(lastEntity, idx);
    }

    this.dense.pop();
    this.components.pop();
    this.sparse.delete(e);
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
    this.dense = [];
    this.components = [];
    this.sparse.clear();
  }

  get size(): number {
    return this.dense.length;
  }
}
