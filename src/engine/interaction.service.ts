
import { Injectable, inject, signal } from '@angular/core';
import * as THREE from 'three';
import { SceneService } from '../services/scene.service';
import { EntityManager } from './entity-manager.service';
import { Entity } from './core';

@Injectable({
  providedIn: 'root'
})
export class InteractionService {
  private sceneService = inject(SceneService);
  private entityManager = inject(EntityManager);
  
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  
  // Selection Logic State
  private pointerDownPos = { x: 0, y: 0 };
  private pointerDownTime = 0;
  
  // Signal for UI to react to context menu requests
  contextMenuRequest = signal<{x: number, y: number, entity: number} | null>(null);

  raycastFromScreen(clientX: number, clientY: number): Entity | null {
    const domEl = this.sceneService.getDomElement();
    if (!domEl) return null;
    
    const rect = domEl.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.sceneService.getCamera());

    const meshes: THREE.Object3D[] = [];
    const meshToEntity = new Map<number, Entity>();

    this.entityManager.world.meshes.forEach((ref, entity) => {
      meshes.push(ref.mesh);
      meshToEntity.set(ref.mesh.id, entity);
    });

    const intersects = this.raycaster.intersectObjects(meshes, false);
    return intersects.length > 0 ? (meshToEntity.get(intersects[0].object.id) ?? null) : null;
  }
  
  raycastGround(): THREE.Vector3 | null {
      this.raycaster.setFromCamera(new THREE.Vector2(0,0), this.sceneService.getCamera());
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const target = new THREE.Vector3();
      return this.raycaster.ray.intersectPlane(plane, target);
  }
  
  // --- Event Handling Delegates ---

  handlePointerDown(event: PointerEvent) {
      this.pointerDownPos = { x: event.clientX, y: event.clientY };
      this.pointerDownTime = performance.now();
      // Close context menu on down
      this.contextMenuRequest.set(null);
  }

  handlePointerUp(event: PointerEvent) {
      // Guard: If dragging a gizmo, do not process selection
      if (this.sceneService.isDraggingGizmo()) return;

      const dx = event.clientX - this.pointerDownPos.x;
      const dy = event.clientY - this.pointerDownPos.y;
      const distSq = dx*dx + dy*dy;
      const dt = performance.now() - this.pointerDownTime;

      // Relaxed threshold: < 10px linear (100sq) AND < 300ms
      // Allows for slight mouse jitter during clicks
      const isClick = distSq < 100 && dt < 300;

      if (isClick && event.button === 0) {
          const entity = this.raycastFromScreen(event.clientX, event.clientY);
          this.entityManager.selectedEntity.set(entity);
      }
  }
  
  handleContextMenu(event: MouseEvent) {
      if (this.sceneService.isDraggingGizmo()) return;

      event.preventDefault();
      const entity = this.raycastFromScreen(event.clientX, event.clientY);
      
      if (entity !== null) {
          this.contextMenuRequest.set({ x: event.clientX, y: event.clientY, entity });
      } else {
          this.contextMenuRequest.set(null);
      }
  }
}
