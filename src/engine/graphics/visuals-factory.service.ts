
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { AssetService } from '../../services/asset.service';
import { MaterialService } from '../../services/material.service';
import { InstancedMeshService } from './instanced-mesh.service';
import { PrimitiveRegistryService } from './primitive-registry.service';
import { SceneGraphService } from './scene-graph.service';
import { PhysicsBodyDef } from '../../engine/schema';
import { Entity } from '../core';

export interface VisualContext {
    entity: Entity;
    templateId: string;
    category: string;
    tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class VisualsFactoryService {
  private materialService = inject(MaterialService);
  private assetService = inject(AssetService);
  private instancedService = inject(InstancedMeshService);
  private primitiveRegistry = inject(PrimitiveRegistryService);
  private sceneGraph = inject(SceneGraphService);

  createMesh(data: PhysicsBodyDef, options: { color?: number, materialId?: string, meshId?: string }, context?: VisualContext): THREE.Object3D {
    
    // Check for Instancing Eligibility
    const isInstanced = context && (context.tags.includes('instanced') || context.category === 'nature');

    if (isInstanced && options.meshId) {
       // Create a proxy object. It holds the transform but renders nothing directly.
       const proxy = new THREE.Object3D();
       proxy.position.set(data.position.x, data.position.y, data.position.z);
       if (data.rotation) {
           proxy.quaternion.set(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.w);
       }
       proxy.updateMatrix();

       // Register with Service
       // Use asset material config if no override provided
       let matId = options.materialId;
       if (!matId) {
           const assetMats = this.assetService.getAssetMaterials(options.meshId);
           if (typeof assetMats === 'string') matId = assetMats;
       }

       // Determine if dynamic based on mass or tags
       const isDynamic = (data.mass !== undefined && data.mass > 0) || context.tags.includes('dynamic');

       this.instancedService.register(
           context!.templateId, 
           context!.entity, 
           proxy, 
           options.meshId, 
           matId, 
           options.color,
           isDynamic
       );

       return proxy; // Return proxy (not added to scene graph)
    }

    // --- Standard Path ---
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material | THREE.Material[];

    if (options.meshId) {
        // Asset Path
        geometry = this.assetService.getGeometry(options.meshId);
        
        if (options.materialId) {
            // Explicit override
            material = this.materialService.getMaterial(options.materialId);
        } else {
            // Load from Asset Config
            const matDef = this.assetService.getAssetMaterials(options.meshId);
            if (Array.isArray(matDef)) {
                material = matDef.map(id => this.materialService.getMaterial(id) as THREE.Material);
            } else {
                material = this.materialService.getMaterial(matDef) as THREE.Material;
            }
        }
    } else {
        // Primitive Path
        geometry = this.primitiveRegistry.getGeometry(data);

        if (options.materialId && this.materialService.hasMaterial(options.materialId)) {
            material = this.materialService.getMaterial(options.materialId)!;
        } else if (options.color) {
            material = new THREE.MeshStandardMaterial({ color: options.color, roughness: 0.5 });
        } else {
            material = this.materialService.getMaterial('mat-default')!;
        }
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    mesh.position.set(data.position.x, data.position.y, data.position.z);
    
    if (data.rotation) {
        mesh.quaternion.set(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.w);
    }
    
    // Automatically add to Scene Graph
    this.sceneGraph.addEntity(mesh);
    
    return mesh;
  }

  disposeMesh(mesh: THREE.Mesh | THREE.Object3D) {
      // Geometry is managed by registries.
      // We only dispose bespoke materials if necessary, but standard materials are shared.
      if (mesh instanceof THREE.Mesh && mesh.material instanceof THREE.MeshStandardMaterial && !mesh.material.userData['mapId']) {
          // It might be a custom color material created in createMesh
          mesh.material.dispose();
      }
  }
}
