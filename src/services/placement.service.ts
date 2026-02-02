
import { Injectable, inject, signal } from '@angular/core';
import * as THREE from 'three';
import { SceneService } from './scene.service';
import { GhostVisualsService } from '../engine/graphics/ghost-visuals.service';
import { EntityLibraryService } from './entity-library.service';
import { TemplateFactoryService } from './factories/template-factory.service';
import { EntityStoreService } from '../engine/ecs/entity-store.service';
import { EntityTemplate } from '../data/entity-types';
import { RaycasterService, SurfaceHit } from '../engine/interaction/raycaster.service';
import { EngineStateService } from '../engine/engine-state.service';

@Injectable({
  providedIn: 'root'
})
export class PlacementService {
  private sceneService = inject(SceneService);
  private ghostService = inject(GhostVisualsService);
  private entityLib = inject(EntityLibraryService);
  private factory = inject(TemplateFactoryService);
  private entityStore = inject(EntityStoreService);
  private raycaster = inject(RaycasterService);
  private state = inject(EngineStateService);

  active = signal(false);
  valid = signal(true);
  currentTemplate = signal<EntityTemplate | null>(null);
  
  private ghost: THREE.Object3D | null = null;
  private currentRotation = 0;
  private ghostBox = new THREE.Box3();
  private otherBox = new THREE.Box3();

  startPlacement(templateId: string) {
    this.stopPlacement();

    const tpl = this.entityLib.getTemplate(templateId);
    if (!tpl) return;

    this.currentTemplate.set(tpl);
    this.active.set(true);
    this.valid.set(true);
    this.state.setPlacementActive(true);

    this.ghost = this.ghostService.createGhostFromTemplate(tpl);
    this.sceneService.getScene().add(this.ghost);
    this.currentRotation = 0;

    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('keydown', this.onKeyDown);
  }

  stopPlacement() {
    this.active.set(false);
    this.state.setPlacementActive(false);
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
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('keydown', this.onKeyDown);
  }

  private onPointerMove = (e: PointerEvent) => {
      if (!this.active()) return;
      const hit = this.raycaster.raycastSurface(e.clientX, e.clientY);
      if (hit) this.updatePlacement(hit);
  };

  private onPointerUp = (e: PointerEvent) => {
      if (!this.active()) return;
      // Only confirm on Left Click
      if (e.button === 0) this.confirmPlacement();
      // Cancel on Right Click
      if (e.button === 2) this.stopPlacement();
  };

  private onKeyDown = (e: KeyboardEvent) => {
      if (!this.active()) return;
      if (e.key === 'Escape') {
          this.stopPlacement();
          return;
      }
      
      const step = 45;
      if (e.key === '[' || e.key === 'q') {
          this.rotate(step);
      } else if (e.key === ']' || e.key === 'e') {
          this.rotate(-step);
      }
  };

  updatePlacement(hit: SurfaceHit) {
    if (!this.ghost || !this.active()) return;
    
    const tpl = this.currentTemplate();
    if (!tpl) return;

    this.ghost.position.copy(hit.point);
    this.ghost.quaternion.identity();

    const isProp = tpl.category === 'prop' || tpl.category === 'shape';
    
    if (isProp) {
        const up = new THREE.Vector3(0, 1, 0);
        if (hit.normal.distanceToSquared(up) > 0.001) {
             const alignQuat = new THREE.Quaternion().setFromUnitVectors(up, hit.normal);
             this.ghost.quaternion.copy(alignQuat);
        }
    }

    this.ghost.rotateY(this.currentRotation);

    if (tpl.geometry !== 'mesh' && tpl.geometry !== 'sphere') {
         this.ghost.translateY(tpl.size.y / 2);
    }

    this.validatePlacement();
  }

  rotate(deltaDeg: number) {
      this.currentRotation += deltaDeg * (Math.PI / 180);
      if (this.ghost) {
          this.ghost.rotateY(deltaDeg * (Math.PI / 180));
      }
  }

  confirmPlacement() {
    if (!this.active() || !this.currentTemplate() || !this.ghost) return;
    
    this.validatePlacement();
    if (!this.valid()) return;

    const pos = this.ghost.position.clone();
    const rot = this.ghost.quaternion.clone();
    
    this.factory.spawn(this.entityStore, this.currentTemplate()!, pos, rot);
    
    this.stopPlacement();
  }

  private validatePlacement() {
      if (!this.ghost) return;
      this.ghost.updateMatrixWorld(true);
      this.ghostBox.setFromObject(this.ghost);
      this.ghostBox.expandByScalar(-0.05);

      let isOverlapping = false;
      this.entityStore.world.meshes.forEach((ref) => {
          if (isOverlapping) return;
          const mesh = ref.mesh;
          if (!mesh.geometry) return;
          if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
          this.otherBox.copy(mesh.geometry.boundingBox!).applyMatrix4(mesh.matrixWorld);
          if (this.ghostBox.intersectsBox(this.otherBox)) isOverlapping = true;
      });

      this.setGhostValid(!isOverlapping);
  }

  private setGhostValid(isValid: boolean) {
      if (this.valid() === isValid) return;
      this.valid.set(isValid);
      if (!this.ghost) return;
      const color = isValid ? 0x22d3ee : 0xf43f5e;
      this.ghost.traverse((c) => {
          if (c instanceof THREE.Mesh) {
              (c.material as THREE.MeshBasicMaterial).color.setHex(color);
          }
      });
  }
}
