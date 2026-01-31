
import * as THREE from 'three';
import { Entity } from '../../core';

export interface ActiveInstance {
  entity: Entity;
  proxy: THREE.Object3D;
  instanceIndex: number;
  dynamic: boolean;      
  lastVisible: boolean;  
}

export class InstancedGroup {
  public readonly mesh: THREE.InstancedMesh;
  
  // Contiguous array for fast update loop
  private activeEntries: ActiveInstance[] = [];
  
  // Lookup Maps
  private entityToEntryIndex = new Map<Entity, number>();
  private indexToEntity = new Map<number, Entity>();
  
  // ID Recycling
  private freeIndices: number[] = [];
  private highWaterMark = 0;
  
  // Optimized Matrix memory (reduce allocations)
  private readonly ZERO_MATRIX = new THREE.Matrix4().set(0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0);

  constructor(
    public readonly id: string,
    geometry: THREE.BufferGeometry,
    material: THREE.Material | THREE.Material[],
    maxInstances: number
  ) {
    this.mesh = new THREE.InstancedMesh(geometry, material, maxInstances);
    this.mesh.count = 0;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = false; // Manual culling via scale=0 handled by VisibilityManager -> proxy.visible
  }

  addInstance(entity: Entity, proxy: THREE.Object3D, isDynamic: boolean) {
    if (this.highWaterMark >= this.mesh.instanceMatrix.count && this.freeIndices.length === 0) {
      console.warn(`[InstancedGroup] Max instances reached for ${this.id}`);
      return;
    }

    // Allocate Instance Index
    let instanceIdx: number;
    if (this.freeIndices.length > 0) {
      instanceIdx = this.freeIndices.pop()!;
    } else {
      instanceIdx = this.highWaterMark;
      this.highWaterMark++;
    }

    const entry: ActiveInstance = { 
        entity, 
        proxy, 
        instanceIndex: instanceIdx,
        dynamic: isDynamic,
        lastVisible: true // Assume visible on spawn
    };
    
    // Add to Active List
    const entryIdx = this.activeEntries.push(entry) - 1;
    this.entityToEntryIndex.set(entity, entryIdx);
    this.indexToEntity.set(instanceIdx, entity);
    
    // Initial State Sync
    proxy.updateMatrixWorld();
    this.mesh.setMatrixAt(instanceIdx, proxy.matrixWorld);
    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.count = this.highWaterMark;
  }

  removeInstance(entity: Entity) {
    const entryIdx = this.entityToEntryIndex.get(entity);
    if (entryIdx === undefined) return;

    const entry = this.activeEntries[entryIdx];
    const instanceIdx = entry.instanceIndex;

    // Visual Hide (Zero Scale)
    this.mesh.setMatrixAt(instanceIdx, this.ZERO_MATRIX);
    this.mesh.instanceMatrix.needsUpdate = true;

    // Cleanup Maps
    this.freeIndices.push(instanceIdx);
    this.indexToEntity.delete(instanceIdx);
    this.entityToEntryIndex.delete(entity);

    // Swap-and-Pop to keep array contiguous
    const lastIdx = this.activeEntries.length - 1;
    if (entryIdx !== lastIdx) {
        const lastEntry = this.activeEntries[lastIdx];
        this.activeEntries[entryIdx] = lastEntry;
        this.entityToEntryIndex.set(lastEntry.entity, entryIdx);
    }
    this.activeEntries.pop();
  }

  update() {
    if (this.activeEntries.length === 0) return;
    
    let dirty = false;
    const len = this.activeEntries.length;
    
    for (let i = 0; i < len; i++) {
        const entry = this.activeEntries[i];
        const isVisible = entry.proxy.visible;

        // 1. Culling Check (VisibilityManager toggles proxy.visible)
        if (isVisible !== entry.lastVisible) {
            if (isVisible) {
                entry.proxy.updateMatrixWorld();
                this.mesh.setMatrixAt(entry.instanceIndex, entry.proxy.matrixWorld);
            } else {
                this.mesh.setMatrixAt(entry.instanceIndex, this.ZERO_MATRIX);
            }
            entry.lastVisible = isVisible;
            dirty = true;
        } 
        // 2. Dynamic Transform Sync (Only if visible and tagged dynamic)
        else if (isVisible && entry.dynamic) {
            entry.proxy.updateMatrixWorld();
            this.mesh.setMatrixAt(entry.instanceIndex, entry.proxy.matrixWorld);
            dirty = true;
        }
    }

    if (dirty) {
      this.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  getEntityId(instanceId: number): Entity | null {
    return this.indexToEntity.get(instanceId) ?? null;
  }
}
