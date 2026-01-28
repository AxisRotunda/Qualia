
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { AssetService } from '../../services/asset.service';
import { MaterialService } from '../../services/material.service';
import { PhysicsBodyDef } from '../../services/physics.service';

@Injectable({
  providedIn: 'root'
})
export class VisualsFactoryService {
  private materialService = inject(MaterialService);
  private assetService = inject(AssetService);
  
  // Track created primitive geometries for disposal to prevent memory leaks
  private geometries: THREE.BufferGeometry[] = [];

  createMesh(data: PhysicsBodyDef, options: { color?: number, materialId?: string, meshId?: string }): THREE.Mesh {
    let mesh: THREE.Mesh;

    if (options.meshId) {
        // Asset-based mesh generation (Shared geometries, managed by AssetService)
        mesh = this.assetService.getMesh(options.meshId);
    } else {
        // Primitive generation (Unique geometries, managed here)
        let geometry: THREE.BufferGeometry;
        
        if (data.type === 'box') {
            geometry = new THREE.BoxGeometry(data.size!.w, data.size!.h, data.size!.d);
        } else if (data.type === 'cylinder') {
            geometry = new THREE.CylinderGeometry(data.radius, data.radius, data.height, 32);
        } else {
            geometry = new THREE.SphereGeometry(data.radius!, 32, 32);
        }
        this.geometries.push(geometry);

        let material: THREE.Material | THREE.Material[];
        if (options.materialId && this.materialService.hasMaterial(options.materialId)) {
            material = this.materialService.getMaterial(options.materialId)!;
        } else if (options.color) {
            material = new THREE.MeshStandardMaterial({ color: options.color, roughness: 0.5 });
        } else {
            material = this.materialService.getMaterial('mat-default')!;
        }

        mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
    }

    mesh.position.set(data.position.x, data.position.y, data.position.z);
    
    if (data.rotation) {
        mesh.quaternion.set(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.w);
    }
    
    return mesh;
  }

  disposeMesh(mesh: THREE.Mesh) {
      if (mesh.geometry && this.geometries.includes(mesh.geometry)) {
          mesh.geometry.dispose();
          // Remove from tracking array to prevent memory leak
          const idx = this.geometries.indexOf(mesh.geometry);
          if (idx > -1) {
              this.geometries.splice(idx, 1);
          }
      }
      // Note: We do not dispose AssetService geometries as they are shared/cached
  }
}
