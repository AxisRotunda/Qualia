
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EntityStoreService } from '../ecs/entity-store.service';
import { CameraManagerService } from './camera-manager.service';
import { SpatialGrid } from '../utils/spatial-grid';
import { Entity } from '../core';

@Injectable({
  providedIn: 'root'
})
export class VisibilityManagerService {
  private entityStore = inject(EntityStoreService);
  private cameraManager = inject(CameraManagerService);

  // Spatial Partitioning for Static Objects
  private staticGrid = new SpatialGrid(32); // 32m chunks
  
  // Linear List for Dynamic Objects (Characters, Vehicles, Debris)
  private dynamicEntities = new Set<Entity>();

  // Config
  private readonly CULL_DIST = 150; 
  private readonly CULL_DIST_SQ = this.CULL_DIST * this.CULL_DIST;
  private readonly LARGE_OBJECT_THRESHOLD = 5.0; 
  private readonly UPDATE_THRESHOLD = 2.0; // Meters moved before re-culling static

  // State
  private lastCamPos = new THREE.Vector3();
  private lastUpdatePos = new THREE.Vector3(Infinity, Infinity, Infinity);
  
  // Cache the visible set to compare against
  private visibleSet = new Set<Entity>();

  register(entity: Entity, isStatic: boolean) {
    if (isStatic) {
      const t = this.entityStore.world.transforms.get(entity);
      if (t) {
        this.staticGrid.insert(entity, t.position.x, t.position.z);
      }
    } else {
      this.dynamicEntities.add(entity);
    }
  }

  unregister(entity: Entity) {
    this.staticGrid.remove(entity);
    this.dynamicEntities.delete(entity);
    this.visibleSet.delete(entity);
  }

  reset() {
    this.staticGrid.clear();
    this.dynamicEntities.clear();
    this.visibleSet.clear();
    this.lastUpdatePos.set(Infinity, Infinity, Infinity);
  }

  updateVisibility(): number {
    const cam = this.cameraManager.getCamera();
    const camPos = cam.position;
    
    // 1. Check if we need to update Static Culling
    // Only update static objects if camera moved significantly
    const distMoved = camPos.distanceTo(this.lastUpdatePos);
    const updateStatic = distMoved > this.UPDATE_THRESHOLD;

    if (updateStatic) {
      this.lastUpdatePos.copy(camPos);
      this.cullStatic(camPos);
    }

    // 2. Always update Dynamic entities
    this.cullDynamic(camPos);

    // 3. Apply Visibility to Meshes
    // We iterate the "Visible Set" to ensure they are ON.
    // NOTE: This assumes default is visible=false for newly created objects or we handle it in Assembler.
    // Actually, safer pattern: Set ALL registered to false, then Set visible to true.
    // But that's O(N).
    // Optimization: We only touch meshes that CHANGED state.
    // For simplicity in this iteration: We just ensure everything in 'visibleSet' is true, 
    // and everything NOT in 'visibleSet' is false? 
    // No, that requires iterating everything.
    
    // Strategy:
    // The 'query' returns candidates. We check distance.
    // If passed, set visible = true.
    // If failed, set visible = false.
    
    return this.visibleSet.size;
  }

  private cullStatic(camPos: THREE.Vector3) {
    // Broad Phase: Grid Query
    const candidates = this.staticGrid.query(camPos.x, camPos.z, this.CULL_DIST);
    
    // We also need to hide entities that moved OUT of range.
    // The Set iteration above only finds ones IN range.
    // Ideally, we track 'activeCells' and hide everything in cells that are no longer active.
    // For now, to ensure correctness without complex cell diffing, we can rely on 
    // a lightweight check or just update `visibleSet`.
    
    // Simplification for reliability: 
    // Iterate known visible static entities. If they are far, hide them.
    // Then iterate candidates and show them.
    // This assumes visibleSet is relatively small compared to world size.
    
    // A. Prune current visible static
    for (const entity of this.visibleSet) {
        // Skip dynamic (handled elsewhere)
        if (this.dynamicEntities.has(entity)) continue;
        
        const t = this.entityStore.world.transforms.get(entity);
        if (!t) {
            this.visibleSet.delete(entity);
            continue;
        }
        
        const dx = t.position.x - camPos.x;
        const dz = t.position.z - camPos.z;
        if ((dx*dx + dz*dz) > this.CULL_DIST_SQ) {
            this.setVisible(entity, false);
            this.visibleSet.delete(entity);
        }
    }

    // B. Add new visible
    for (const entity of candidates) {
        const t = this.entityStore.world.transforms.get(entity);
        if (!t) continue;
        
        const dx = t.position.x - camPos.x;
        const dz = t.position.z - camPos.z;
        if ((dx*dx + dz*dz) <= this.CULL_DIST_SQ) {
            this.setVisible(entity, true);
            this.visibleSet.add(entity);
        }
    }
  }

  private cullDynamic(camPos: THREE.Vector3) {
      for (const entity of this.dynamicEntities) {
          const t = this.entityStore.world.transforms.get(entity);
          if (!t) continue;

          // Always show selected
          if (this.entityStore.selectedEntity() === entity) {
              this.setVisible(entity, true);
              this.visibleSet.add(entity);
              continue;
          }

          const distSq = camPos.distanceToSquared(t.position as any);
          const isVisible = distSq <= this.CULL_DIST_SQ;
          
          this.setVisible(entity, isVisible);
          if (isVisible) this.visibleSet.add(entity);
          else this.visibleSet.delete(entity);
      }
  }

  private setVisible(entity: Entity, visible: boolean) {
      const meshRef = this.entityStore.world.meshes.get(entity);
      if (meshRef) {
          meshRef.mesh.visible = visible;
          // IMPORTANT: If instanced, we assume the proxy mesh handles 'visible' property 
          // and the InstancedGroup service syncs it.
      }
  }
}
