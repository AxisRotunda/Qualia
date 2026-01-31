
import { Injectable, inject } from '@angular/core';
import { EntityLifecycleService, EntityCreatedEvent } from '../ecs/entity-lifecycle.service';
import { EntityStoreService } from '../ecs/entity-store.service';
import { Entity } from '../core';

@Injectable({
  providedIn: 'root'
})
export class SpatialHashService {
  private lifecycle = inject(EntityLifecycleService);
  private entityStore = inject(EntityStoreService);

  private cellSize = 10;
  private buckets = new Map<string, Set<Entity>>();
  
  // Optimization: Store tuple of indices [cx, cy, cz, key] to avoid string gen on every update
  private entityCells = new Map<Entity, { cx: number, cy: number, cz: number, key: string }>();

  constructor() {
      this.lifecycle.onEntityCreated.subscribe(e => this.handleCreation(e));
      this.lifecycle.onEntityDestroyed.subscribe(e => this.remove(e));
      this.lifecycle.onWorldReset.subscribe(() => this.clear());
  }

  private handleCreation(event: EntityCreatedEvent) {
      const t = this.entityStore.world.transforms.get(event.entity);
      if (t) {
          this.insert(event.entity, t.position.x, t.position.y, t.position.z);
      }
  }

  insert(entity: Entity, x: number, y: number, z: number) {
      const cx = Math.floor(x / this.cellSize);
      const cy = Math.floor(y / this.cellSize);
      const cz = Math.floor(z / this.cellSize);
      const key = `${cx}:${cy}:${cz}`;

      // Check if already in this cell
      const current = this.entityCells.get(entity);
      if (current && current.key === key) return;

      if (current) this.remove(entity);

      this.addToBucket(key, entity);
      this.entityCells.set(entity, { cx, cy, cz, key });
  }

  update(entity: Entity, x: number, y: number, z: number) {
      const current = this.entityCells.get(entity);
      
      const cx = Math.floor(x / this.cellSize);
      const cy = Math.floor(y / this.cellSize);
      const cz = Math.floor(z / this.cellSize);

      // Fast path: Integer comparison avoids String allocation
      if (current && current.cx === cx && current.cy === cy && current.cz === cz) {
          return;
      }
      
      // Changed cell, full update
      this.insert(entity, x, y, z);
  }

  remove(entity: Entity) {
      const cell = this.entityCells.get(entity);
      if (cell) {
          const bucket = this.buckets.get(cell.key);
          if (bucket) {
              bucket.delete(entity);
              if (bucket.size === 0) this.buckets.delete(cell.key);
          }
      }
      this.entityCells.delete(entity);
  }

  query(x: number, y: number, z: number, radius: number): Set<Entity> {
      const results = new Set<Entity>();
      const range = Math.ceil(radius / this.cellSize);
      
      const cx = Math.floor(x / this.cellSize);
      const cy = Math.floor(y / this.cellSize);
      const cz = Math.floor(z / this.cellSize);

      for (let i = -range; i <= range; i++) {
          for (let j = -range; j <= range; j++) {
              for (let k = -range; k <= range; k++) {
                  const key = `${cx+i}:${cy+j}:${cz+k}`;
                  const bucket = this.buckets.get(key);
                  if (bucket) {
                      for (const e of bucket) results.add(e);
                  }
              }
          }
      }
      return results;
  }

  clear() {
      this.buckets.clear();
      this.entityCells.clear();
  }

  private addToBucket(key: string, entity: Entity) {
      if (!this.buckets.has(key)) {
          this.buckets.set(key, new Set());
      }
      this.buckets.get(key)!.add(entity);
  }
}
