
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { AssetService } from '../../services/asset.service';
import { MaterialService } from '../../services/material.service';
import { PhysicsBodyDef } from '../../services/physics.service';
import { EntityTemplate } from '../../data/entity-types';

@Injectable({
  providedIn: 'root'
})
export class VisualsFactoryService {
  private materialService = inject(MaterialService);
  private assetService = inject(AssetService);
  
  // Cache for primitive geometries to reduce draw call overhead and memory usage
  private primitiveCache = new Map<string, THREE.BufferGeometry>();

  // Helper to generate cache keys
  private getPrimitiveKey(data: PhysicsBodyDef): string {
      if (data.type === 'box') return `box_${data.size?.w}_${data.size?.h}_${data.size?.d}`;
      if (data.type === 'cylinder') return `cyl_${data.radius}_${data.height}`;
      if (data.type === 'cone') return `cone_${data.radius}_${data.height}`;
      if (data.type === 'sphere') return `sph_${data.radius}`;
      return 'unknown';
  }

  createMesh(data: PhysicsBodyDef, options: { color?: number, materialId?: string, meshId?: string }): THREE.Mesh {
    let mesh: THREE.Mesh;

    if (options.meshId) {
        // Asset-based mesh generation (Shared geometries, managed by AssetService)
        mesh = this.assetService.getMesh(options.meshId);
    } else {
        // Primitive generation
        let geometry: THREE.BufferGeometry;
        
        const key = this.getPrimitiveKey(data);
        if (this.primitiveCache.has(key)) {
            geometry = this.primitiveCache.get(key)!;
        } else {
            // Generate and cache
            if (data.type === 'box') {
                geometry = new THREE.BoxGeometry(data.size!.w, data.size!.h, data.size!.d);
            } else if (data.type === 'cylinder') {
                geometry = new THREE.CylinderGeometry(data.radius, data.radius, data.height, 32);
            } else if (data.type === 'cone') {
                geometry = new THREE.ConeGeometry(data.radius, data.height, 32);
            } else {
                geometry = new THREE.SphereGeometry(data.radius!, 32, 32);
            }
            this.primitiveCache.set(key, geometry);
        }

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

  // Creates a visual-only representation for placement ghosting
  createGhostFromTemplate(tpl: EntityTemplate): THREE.Object3D {
      let mesh: THREE.Mesh;
      
      if (tpl.geometry === 'mesh' && tpl.meshId) {
          mesh = this.assetService.getMesh(tpl.meshId);
      } else {
          // Use cache for ghost primitives too if possible, though ghosts have dynamic materials
          // We can reuse geometry
          let geo: THREE.BufferGeometry;
          let key = 'ghost';

          if (tpl.geometry === 'box') {
              key = `box_${tpl.size.x}_${tpl.size.y}_${tpl.size.z}`;
              if (this.primitiveCache.has(key)) geo = this.primitiveCache.get(key)!;
              else { geo = new THREE.BoxGeometry(tpl.size.x, tpl.size.y, tpl.size.z); this.primitiveCache.set(key, geo); }
          }
          else if (tpl.geometry === 'cylinder') {
              key = `cyl_${tpl.size.x}_${tpl.size.y}`;
              if (this.primitiveCache.has(key)) geo = this.primitiveCache.get(key)!;
              else { geo = new THREE.CylinderGeometry(tpl.size.x, tpl.size.x, tpl.size.y, 16); this.primitiveCache.set(key, geo); }
          }
          else if (tpl.geometry === 'cone') {
              key = `cone_${tpl.size.x}_${tpl.size.y}`;
              if (this.primitiveCache.has(key)) geo = this.primitiveCache.get(key)!;
              else { geo = new THREE.ConeGeometry(tpl.size.x, tpl.size.y, 16); this.primitiveCache.set(key, geo); }
          }
          else {
              key = `sph_${tpl.size.x}`;
              if (this.primitiveCache.has(key)) geo = this.primitiveCache.get(key)!;
              else { geo = new THREE.SphereGeometry(tpl.size.x, 16, 16); this.primitiveCache.set(key, geo); }
          }
          
          mesh = new THREE.Mesh(geo);
      }
      
      // Override material for ghost look
      const ghostMat = new THREE.MeshBasicMaterial({
          color: 0x22d3ee, // Cyan
          transparent: true,
          opacity: 0.4,
          wireframe: true
      });
      
      mesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
              child.material = ghostMat;
          }
      });
      mesh.material = ghostMat;
      
      return mesh;
  }

  disposeMesh(mesh: THREE.Mesh) {
      // We do NOT dispose geometries here anymore because they are cached/shared.
      // If we implemented a reference counting system we would decrement here.
      // For now, keeping primitive geometries in memory is safe (low footprint).
  }
}
