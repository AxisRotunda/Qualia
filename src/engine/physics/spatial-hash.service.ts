
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
  private entityBuckets = new Map<Entity, string[]>();

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
      this.remove(entity);
      const key = this.getKey(x, y, z);
      this.addToBucket(key, entity);
      this.entityBuckets.set(entity, [key]);
  }

  update(entity: Entity, x: number, y: number, z: number) {
      const oldKeys = this.entityBuckets.get(entity);
      const newKey = this.getKey(x, y, z);
      
      // Optimization: Only update if changed cell
      if (oldKeys && oldKeys[0] === newKey) return;
      
      this.insert(entity, x, y, z);
  }

  remove(entity: Entity) {
      const keys = this.entityBuckets.get(entity);
      if (keys) {
          for (const k of keys) {
              const bucket = this.buckets.get(k);
              if (bucket) {
                  bucket.delete(entity);
                  if (bucket.size === 0) this.buckets.delete(k);
              }
          }
      }
      this.entityBuckets.delete(entity);
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
      this.entityBuckets.clear();
  }

  private getKey(x: number, y: number, z: number): string {
      return `${Math.floor(x / this.cellSize)}:${Math.floor(y / this.cellSize)}:${Math.floor(z / this.cellSize)}`;
  }

  private addToBucket(key: string, entity: Entity) {
      if (!this.buckets.has(key)) {
          this.buckets.set(key, new Set());
      }
      this.buckets.get(key)!.add(entity);
  }
}
