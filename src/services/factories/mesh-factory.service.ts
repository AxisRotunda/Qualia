
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { PhysicsBodyDef } from '../physics.service';
import { AssetService } from '../asset.service';
import { MaterialService } from '../material.service';
import { SceneService } from '../scene.service';

@Injectable({
  providedIn: 'root'
})
export class MeshFactoryService {
  private assetService = inject(AssetService);
  private materialService = inject(MaterialService);
  private sceneService = inject(SceneService);

  private geometries: THREE.BufferGeometry[] = [];

  createMesh(data: PhysicsBodyDef, options: { color?: number, materialId?: string, meshId?: string }): THREE.Mesh {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material | THREE.Material[];

    if (options.meshId) {
        geometry = this.assetService.getGeometry(options.meshId);
    } else {
        if (data.type === 'box') {
            geometry = new THREE.BoxGeometry(data.size!.w, data.size!.h, data.size!.d);
        } else if (data.type === 'cylinder') {
            geometry = new THREE.CylinderGeometry(data.radius, data.radius, data.height, 32);
        } else {
            geometry = new THREE.SphereGeometry(data.radius!, 32, 32);
        }
        this.geometries.push(geometry);
    }

    if (options.meshId === 'tree-01') {
        const trunk = this.materialService.getMaterial('mat-bark') as THREE.Material;
        const leaf = this.materialService.getMaterial('mat-leaf') as THREE.Material;
        material = [trunk, leaf];
    } else {
        if (options.materialId && this.materialService.hasMaterial(options.materialId)) {
            material = this.materialService.getMaterial(options.materialId)!;
        } else if (options.color) {
            material = new THREE.MeshStandardMaterial({ color: options.color, roughness: 0.5 });
        } else {
            material = this.materialService.getMaterial('mat-default')!;
        }
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(data.position.x, data.position.y, data.position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    this.sceneService.getScene().add(mesh);
    return mesh;
  }
  
  disposeMesh(mesh: THREE.Mesh) {
      if (this.geometries.includes(mesh.geometry)) {
          mesh.geometry.dispose();
      }
  }
}
