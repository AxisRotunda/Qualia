
import * as THREE from 'three';

export type Entity = number;

export interface Transform {
  position: { x: number, y: number, z: number };
  rotation: { x: number, y: number, z: number, w: number };
}

export interface RigidBodyRef {
  handle: number;
}

export interface MeshRef {
  mesh: THREE.Mesh;
}

// Optimized Component Store using Maps for O(1) access
export class ComponentStore<T> {
  private data = new Map<Entity, T>();

  add(e: Entity, component: T) {
    this.data.set(e, component);
  }

  get(e: Entity): T | undefined {
    return this.data.get(e);
  }

  has(e: Entity): boolean {
    return this.data.has(e);
  }

  remove(e: Entity) {
    this.data.delete(e);
  }

  forEach(callback: (val: T, e: Entity) => void) {
    this.data.forEach(callback);
  }

  clear() {
    this.data.clear();
  }
}

export class World {
  private nextId = 0;
  entities = new Set<Entity>();

  // Component Storages
  transforms = new ComponentStore<Transform>();
  rigidBodies = new ComponentStore<RigidBodyRef>();
  meshes = new ComponentStore<MeshRef>();

  createEntity(): Entity {
    const id = this.nextId++;
    this.entities.add(id);
    return id;
  }

  destroyEntity(e: Entity) {
    this.entities.delete(e);
    this.transforms.remove(e);
    this.rigidBodies.remove(e);
    this.meshes.remove(e);
  }

  clear() {
    this.entities.clear();
    this.transforms.clear();
    this.rigidBodies.clear();
    this.meshes.clear();
    this.nextId = 0;
  }
}
