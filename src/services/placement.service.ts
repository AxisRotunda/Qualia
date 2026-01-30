
import { Injectable, inject, signal } from '@angular/core';
import * as THREE from 'three';
import { SceneService } from './scene.service';
import { VisualsFactoryService } from '../engine/graphics/visuals-factory.service';
import { EntityLibraryService } from './entity-library.service';
import { EntityManager } from '../engine/entity-manager.service';
import { EntityTemplate } from '../data/entity-types';
import { SurfaceHit } from '../engine/interaction.service';

@Injectable({
  providedIn: 'root'
})
export class PlacementService {
  private sceneService = inject(SceneService);
  private visualsFactory = inject(VisualsFactoryService);
  private entityLib = inject(EntityLibraryService);
  private entityMgr = inject(EntityManager);

  active = signal(false);
  valid = signal(true);
  currentTemplate = signal<EntityTemplate | null>(null);
  
  private ghost: THREE.Object3D | null = null;
  private currentRotation = 0;
  
  // Reuse Box3 for checking
  private ghostBox = new THREE.Box3();
  private otherBox = new THREE.Box3();

  startPlacement(templateId: string) {
    this.stopPlacement();

    const tpl = this.entityLib.templates.find(t => t.id === templateId);
    if (!tpl) return;

    this.currentTemplate.set(tpl);
    this.active.set(true);
    this.valid.set(true);

    this.ghost = this.visualsFactory.createGhostFromTemplate(tpl);
    this.sceneService.getScene().add(this.ghost);
    this.currentRotation = 0;
  }

  stopPlacement() {
    this.active.set(false);
    this.currentTemplate.set(null);
    if (this.ghost) {
      this.sceneService.getScene().remove(this.ghost);
      this.ghost.traverse((c) => {
          if (c instanceof THREE.Mesh) {
              if (c.geometry) c.geometry.dispose();
          }
      });
      this.ghost = null;
    }
  }

  // Called by InteractionService on move
  updatePlacement(hit: SurfaceHit) {
    if (!this.ghost || !this.active()) return;
    
    const tpl = this.currentTemplate();
    if (!tpl) return;

    // 1. Position Snapping
    this.ghost.position.copy(hit.point);
    
    // 2. Alignment Logic
    // Reset to identity first
    this.ghost.quaternion.identity();

    const isProp = tpl.category === 'prop' || tpl.category === 'shape';
    
    if (isProp) {
        // Align Up vector to Surface Normal
        const up = new THREE.Vector3(0, 1, 0);
        // Avoid degenerate case where normal is close to up (standard)
        if (hit.normal.distanceToSquared(up) > 0.001) {
             const alignQuat = new THREE.Quaternion().setFromUnitVectors(up, hit.normal);
             this.ghost.quaternion.copy(alignQuat);
        }
    }

    // 3. User Rotation (Y-Axis relative to current orientation)
    this.ghost.rotateY(this.currentRotation);

    // 4. Height Offset (Pivot adjustment)
    // Most primitives are centered. We need to push them "Up" (Locally) by half height
    // so they sit ON the surface, not IN it.
    if (tpl.geometry !== 'mesh' && tpl.geometry !== 'sphere') {
         this.ghost.translateY(tpl.size.y / 2);
    } else if (tpl.geometry === 'mesh') {
         // Meshes might have pivot at bottom or center. 
         // Assuming bottom pivot for complex assets (trees), center for others?
         // For now, assume center logic for consistent "Hard Realism" physics bounds
         // unless specific tag. 
         // Actually, VisualsFactory centers meshes often.
    }

    // 5. Validation (Overlap Check)
    this.validatePlacement();
  }

  rotate(deltaDeg: number) {
      this.currentRotation += deltaDeg * (Math.PI / 180);
      // We don't update visual here, it updates on next pointer move or we could force a re-eval
      // Ideally we should cache the last hit and re-apply, but for now simple input usually implies mouse movement.
  }

  confirmPlacement() {
    if (!this.active() || !this.currentTemplate() || !this.ghost) return;
    
    // Validate again
    this.validatePlacement();
    if (!this.valid()) return; // Block placement if invalid

    const pos = this.ghost.position.clone();
    const rot = this.ghost.quaternion.clone();
    
    this.entityLib.spawnFromTemplate(this.entityMgr, this.currentTemplate()!.id, pos, rot);
    
    this.stopPlacement();
  }

  private validatePlacement() {
      if (!this.ghost) return;

      // Update Matrix
      this.ghost.updateMatrixWorld(true);
      
      // Compute AABB
      this.ghostBox.setFromObject(this.ghost);
      // Shrink slightly to allow touching
      this.ghostBox.expandByScalar(-0.05);

      let isOverlapping = false;

      // Check against World Entities
      // Optimization: In a real ECS, use a spatial index. Here we iterate.
      // We iterate Meshes because they represent the visual volume.
      for (const ref of this.entityMgr.world.meshes.data.values()) {
          const mesh = ref.mesh;
          if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
          
          this.otherBox.copy(mesh.geometry.boundingBox!).applyMatrix4(mesh.matrixWorld);
          
          if (this.ghostBox.intersectsBox(this.otherBox)) {
              isOverlapping = true;
              break;
          }
      }

      this.setGhostValid(!isOverlapping);
  }

  private setGhostValid(isValid: boolean) {
      if (this.valid() === isValid) return;
      this.valid.set(isValid);
      
      if (!this.ghost) return;

      const color = isValid ? 0x22d3ee : 0xf43f5e; // Cyan vs Rose
      
      this.ghost.traverse((c) => {
          if (c instanceof THREE.Mesh) {
              (c.material as THREE.MeshBasicMaterial).color.setHex(color);
          }
      });
  }
}
