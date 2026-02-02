import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { InstancedMeshService } from './instanced-mesh.service';
import { SceneGraphService } from './scene-graph.service';
import { PhysicsBodyDef } from '../../engine/schema';
import { Entity } from '../core';
import { MaterialResolverService } from './materials/material-resolver.service';
import { GeometryResolverService } from './geometry/geometry-resolver.service';

export interface VisualContext {
    entity: Entity;
    templateId: string;
    category: string;
    tags: string[];
}

export interface VisualOptions {
    color?: number;
    materialId?: string;
    meshId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VisualsFactoryService {
  private instancedService = inject(InstancedMeshService);
  private sceneGraph = inject(SceneGraphService);
  private materialResolver = inject(MaterialResolverService);
  private geometryResolver = inject(GeometryResolverService);

  /**
   * Main entry point for entity visual creation.
   * RUN_REF Phase 81.0: Decomposed into specialized resolvers.
   */
  createMesh(data: PhysicsBodyDef, options: VisualOptions, context?: VisualContext): THREE.Object3D {
    // 1. Determine Instancing Eligibility
    const isInstanced = context && (context.tags.includes('instanced') || context.category === 'nature');

    if (isInstanced && options.meshId) {
       return this.createProxyMesh(data, options, context!);
    }

    // 2. Bespoke Path (Unique Meshes)
    const entityId = context ? context.entity : -1;
    return this.createStandardMesh(data, options, entityId);
  }

  private createProxyMesh(data: PhysicsBodyDef, options: VisualOptions, context: VisualContext): THREE.Object3D {
       const proxy = new THREE.Object3D();
       
       proxy.position.set(data.position.x, data.position.y, data.position.z);
       if (data.rotation) {
           proxy.quaternion.set(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.w);
       }
       proxy.updateMatrix();

       const materialConfig = this.materialResolver.resolveConfig(options);
       const isDynamic = (data.mass !== undefined && data.mass > 0) || context.tags.includes('dynamic');

       this.instancedService.register(
           context.templateId, 
           context.entity, 
           proxy, 
           options.meshId!, 
           materialConfig, 
           options.color,
           isDynamic
       );

       return proxy;
  }

  private createStandardMesh(data: PhysicsBodyDef, options: VisualOptions, entityId: number): THREE.Mesh {
    const geometry = this.geometryResolver.resolve(data, options);
    const material = this.materialResolver.resolveInstance(options);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(data.position.x, data.position.y, data.position.z);
    
    if (data.rotation) {
        mesh.quaternion.set(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.w);
    }
    
    mesh.userData['entityId'] = entityId;

    this.sceneGraph.addEntity(mesh);
    return mesh;
  }

  deleteVisuals(entity: Entity, mesh: THREE.Object3D, templateId?: string) {
      if (templateId) {
          this.instancedService.unregister(templateId, entity);
      }

      if (mesh.parent) {
          mesh.parent.remove(mesh);
      }

      this.disposeMesh(mesh);
  }

  disposeRegistries() {
      this.instancedService.clear();
  }

  private disposeMesh(mesh: THREE.Mesh | THREE.Object3D) {
      if (mesh instanceof THREE.Mesh && mesh.material instanceof THREE.MeshStandardMaterial && !mesh.material.userData['mapId']) {
          mesh.material.dispose();
      }
  }
}
