
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { Subject } from 'rxjs';
import { AssetService } from '../../services/asset.service';
import { MaterialService } from '../../services/material.service';
import { SceneGraphService } from './scene-graph.service';
import { Entity } from '../core';
import { InstancedGroup } from './instancing/instanced-group';

@Injectable({
  providedIn: 'root'
})
export class InstancedMeshService {
  private assetService = inject(AssetService);
  private materialService = inject(MaterialService);
  private sceneGraph = inject(SceneGraphService);
  
  public readonly meshCreated$ = new Subject<THREE.InstancedMesh>();

  private groups = new Map<string, InstancedGroup>();
  private readonly MAX_INSTANCES = 1024;

  register(
      templateId: string, 
      entity: Entity, 
      proxy: THREE.Object3D, 
      meshId: string, 
      materialConfig?: string | string[], 
      color?: number,
      isDynamic: boolean = false
  ) {
    let group = this.groups.get(templateId);

    if (!group) {
      this.createGroup(templateId, meshId, materialConfig, color);
      group = this.groups.get(templateId)!;
    }

    group.addInstance(entity, proxy, isDynamic);
  }

  unregister(templateId: string, entity: Entity) {
    const group = this.groups.get(templateId);
    if (group) {
      group.removeInstance(entity);
    }
  }

  update() {
    this.groups.forEach(group => group.update());
  }

  getMeshes(): THREE.InstancedMesh[] {
    return Array.from(this.groups.values()).map(g => g.mesh);
  }

  getEntityId(mesh: THREE.InstancedMesh, instanceId: number): Entity | null {
    for (const group of this.groups.values()) {
      if (group.mesh === mesh) {
        return group.getEntityId(instanceId);
      }
    }
    return null;
  }

  /**
   * Universal purge of all instanced resources.
   * Part of RUN_LIFECYCLE protocol.
   */
  clear() {
      this.groups.forEach(group => {
          this.sceneGraph.removeEntity(group.mesh);
          group.dispose();
      });
      this.groups.clear();
  }

  private createGroup(id: string, meshId: string, materialConfig?: string | string[], color?: number) {
    const geometry = this.assetService.getGeometry(meshId);
    
    let material: THREE.Material | THREE.Material[];

    // RUN_REF: Enhanced material resolution for arrays (Multi-material instancing)
    if (Array.isArray(materialConfig)) {
        material = materialConfig.map(mid => this.materialService.getMaterial(mid) as THREE.Material);
    } else if (materialConfig && this.materialService.hasMaterial(materialConfig)) {
        material = this.materialService.getMaterial(materialConfig);
    } else if (color) {
        material = new THREE.MeshStandardMaterial({ color: color });
    } else {
        material = this.materialService.getMaterial('mat-default');
    }

    const group = new InstancedGroup(id, geometry, material, this.MAX_INSTANCES);
    
    this.groups.set(id, group);
    this.sceneGraph.addEntity(group.mesh);
    this.meshCreated$.next(group.mesh);
  }
}
