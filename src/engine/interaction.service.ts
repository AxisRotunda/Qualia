
import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { GizmoManagerService } from './graphics/gizmo-manager.service';
import { EntityStoreService } from './ecs/entity-store.service';
import { PointerListenerService, PointerEventData } from './input/pointer-listener.service';
import { RaycasterService, SurfaceHit } from './interaction/raycaster.service';
import { EngineStateService } from './engine-state.service';

export { SurfaceHit };

@Injectable({
  providedIn: 'root'
})
export class InteractionService {
  private gizmoManager = inject(GizmoManagerService);
  private entityStore = inject(EntityStoreService);
  private pointerListener = inject(PointerListenerService);
  private raycaster = inject(RaycasterService);
  private state = inject(EngineStateService);
  
  private ignoreNextClick = false;
  contextMenuRequest: WritableSignal<{x: number, y: number, entity: number} | null>;

  constructor() {
    this.contextMenuRequest = signal(null);
    
    this.pointerListener.onClick.subscribe(e => this.handleClick(e));
    this.pointerListener.onRightClick.subscribe(e => this.handleContextMenu(e));
    this.pointerListener.onLongPress.subscribe(e => this.handleContextMenu(e));
  }

  bind(canvas: HTMLCanvasElement) {
      this.pointerListener.bind(canvas);
  }

  setIgnoreNextClick(value: boolean) {
      this.ignoreNextClick = value;
  }

  raycastSurface(clientX: number, clientY: number): SurfaceHit | null {
      return this.raycaster.raycastSurface(clientX, clientY);
  }

  selectEntityAt(clientX: number, clientY: number) {
      if (this.state.isPlacementActive()) return;
      const entity = this.raycaster.raycastFromScreen(clientX, clientY);
      this.entityStore.selectedEntity.set(entity);
  }
  
  // Public API for Overlays (e.g. Mobile Touch Layer) to trigger menus
  openContextMenu(clientX: number, clientY: number) {
      if (this.state.isPlacementActive()) return;
      const entity = this.raycaster.raycastFromScreen(clientX, clientY);
      if (entity !== null) {
          this.contextMenuRequest.set({ x: clientX, y: clientY, entity });
          this.entityStore.selectedEntity.set(entity);
      }
  }
  
  private handleClick(e: PointerEventData) {
      if (this.ignoreNextClick) {
          this.ignoreNextClick = false;
          return;
      }

      if (this.state.isPlacementActive()) {
          return;
      }

      if (this.gizmoManager.isDraggingGizmo()) return;

      this.selectEntityAt(e.x, e.y);
      
      if (this.contextMenuRequest()) {
          this.contextMenuRequest.set(null);
      }
  }

  private handleContextMenu(e: PointerEventData) {
      if (this.gizmoManager.isDraggingGizmo() || this.state.isPlacementActive()) return;

      const entity = this.raycaster.raycastFromScreen(e.x, e.y);
      
      if (entity !== null) {
          this.contextMenuRequest.set({ x: e.x, y: e.y, entity });
          this.entityStore.selectedEntity.set(entity);
      } else {
          this.contextMenuRequest.set(null);
      }
  }
}
