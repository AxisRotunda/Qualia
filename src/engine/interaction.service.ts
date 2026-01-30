
import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import * as THREE from 'three';
import { SceneService } from '../services/scene.service';
import { GizmoManagerService } from './graphics/gizmo-manager.service';
import { EntityManager } from './entity-manager.service';
import { Entity } from './core';
import { PlacementService } from '../services/placement.service';
import { PointerListenerService, PointerEventData } from './input/pointer-listener.service';

export interface SurfaceHit {
  point: THREE.Vector3;
  normal: THREE.Vector3;
  entity: Entity | null;
}

@Injectable({
  providedIn: 'root'
})
export class InteractionService {
  private sceneService = inject(SceneService);
  private gizmoManager = inject(GizmoManagerService);
  private entityManager = inject(EntityManager);
  private placementService = inject(PlacementService);
  private pointerListener = inject(PointerListenerService);
  
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  
  // UI Pass-through flag
  private ignoreNextClick = false;
  
  // Signal for UI to react to context menu requests
  contextMenuRequest: WritableSignal<{x: number, y: number, entity: number} | null>;

  constructor() {
    this.contextMenuRequest = signal(null);
    
    // Subscribe to semantic pointer events
    this.pointerListener.onClick.subscribe(e => this.handleClick(e));
    this.pointerListener.onRightClick.subscribe(e => this.handleContextMenu(e));
    this.pointerListener.onLongPress.subscribe(e => this.handleContextMenu(e));
    
    // Placement Loop
    window.addEventListener('pointermove', (e) => {
        if (this.placementService.active()) {
            const hit = this.raycastSurface(e.clientX, e.clientY);
            if (hit) this.placementService.updatePlacement(hit);
        }
    });
  }

  bind(canvas: HTMLCanvasElement) {
      this.pointerListener.bind(canvas);
  }

  setIgnoreNextClick(value: boolean) {
      this.ignoreNextClick = value;
  }

  private updateRaycaster(clientX: number, clientY: number): boolean {
      const domEl = this.sceneService.getDomElement();
      if (!domEl) return false;

      // Check for Pointer Lock (FPS Mode)
      if (document.pointerLockElement === domEl) {
          this.mouse.set(0, 0);
      } else {
          const rect = domEl.getBoundingClientRect();
          this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
          this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      }
      
      this.raycaster.setFromCamera(this.mouse, this.sceneService.getCamera());
      return true;
  }

  raycastFromScreen(clientX: number, clientY: number): Entity | null {
    if (!this.updateRaycaster(clientX, clientY)) return null;

    // 1. Check Gizmo Intersection (Priority)
    const gizmo = this.gizmoManager.getControl();
    if (gizmo && gizmo.visible && gizmo.enabled) {
        const gizmoHits = this.raycaster.intersectObject(gizmo, true);
        if (gizmoHits.length > 0) {
            return this.entityManager.selectedEntity();
        }
    }

    // 2. Check Scene Entities
    const meshes: THREE.Object3D[] = [];
    const meshToEntity = new Map<number, Entity>();

    this.entityManager.world.meshes.forEach((ref, entity) => {
      meshes.push(ref.mesh);
      meshToEntity.set(ref.mesh.id, entity);
    });

    const intersects = this.raycaster.intersectObjects(meshes, false);
    return intersects.length > 0 ? (meshToEntity.get(intersects[0].object.id) ?? null) : null;
  }
  
  // Legacy support for simple ground checks, now strictly plane-based
  raycastGround(clientX?: number, clientY?: number): THREE.Vector3 | null {
      const x = clientX ?? (window.innerWidth / 2);
      const y = clientY ?? (window.innerHeight / 2);
      
      if (!this.updateRaycaster(x, y)) return null;
      
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const target = new THREE.Vector3();
      return this.raycaster.ray.intersectPlane(plane, target);
  }

  // Advanced raycast against geometry for placement
  raycastSurface(clientX: number, clientY: number): SurfaceHit | null {
      if (!this.updateRaycaster(clientX, clientY)) return null;

      // 1. Collect Valid Mesh Targets (Entities)
      const meshes: THREE.Object3D[] = [];
      const meshToEntity = new Map<number, Entity>();
      
      this.entityManager.world.meshes.forEach((ref, entity) => {
          // Ignore selected entity if in some specific mode? No, usually valid to place ON it.
          // We MUST ignore the ghost, but the ghost is managed by PlacementService and is NOT in ECS.
          meshes.push(ref.mesh);
          meshToEntity.set(ref.mesh.id, entity);
      });

      const intersects = this.raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
          const hit = intersects[0];
          const entity = meshToEntity.get(hit.object.id) ?? null;
          
          // Get World Normal
          const normal = hit.face?.normal?.clone() ?? new THREE.Vector3(0, 1, 0);
          normal.transformDirection(hit.object.matrixWorld).normalize();

          return { point: hit.point, normal, entity };
      }

      // 2. Fallback: Infinite Ground Plane
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const target = new THREE.Vector3();
      const planeHit = this.raycaster.ray.intersectPlane(plane, target);

      if (planeHit) {
          return { point: planeHit, normal: new THREE.Vector3(0, 1, 0), entity: null };
      }

      return null;
  }

  selectEntityAt(clientX: number, clientY: number) {
      const entity = this.raycastFromScreen(clientX, clientY);
      this.entityManager.selectedEntity.set(entity);
  }
  
  // --- Event Handlers ---

  private handleClick(e: PointerEventData) {
      if (this.ignoreNextClick) {
          this.ignoreNextClick = false;
          return;
      }

      // If placing, confirm
      if (this.placementService.active()) {
          this.placementService.confirmPlacement();
          return;
      }

      // If dragging gizmo, ignore
      if (this.gizmoManager.isDraggingGizmo()) return;

      // Select
      this.selectEntityAt(e.x, e.y);
      
      // Clear context menu if open
      if (this.contextMenuRequest()) {
          this.contextMenuRequest.set(null);
      }
  }

  private handleContextMenu(e: PointerEventData) {
      if (this.gizmoManager.isDraggingGizmo() || this.placementService.active()) return;

      const entity = this.raycastFromScreen(e.x, e.y);
      
      if (entity !== null) {
          this.contextMenuRequest.set({ x: e.x, y: e.y, entity });
          this.entityManager.selectedEntity.set(entity);
      } else {
          this.contextMenuRequest.set(null);
      }
  }
}
