
import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { GizmoManagerService } from './graphics/gizmo-manager.service';
import { EntityStoreService } from './ecs/entity-store.service';
import { PointerListenerService, PointerEventData } from './input/pointer-listener.service';
import { RaycasterService, SurfaceHit } from './interaction/raycaster.service';
import { EngineStateService } from './engine-state.service';
import { GameInputService } from '../services/game-input.service';
import { Entity } from './core';

export type { SurfaceHit };

/**
 * InteractionService: Top-level coordinator for input semantics.
 * Refactored for RUN_INDUSTRY: High-fidelity selection response.
 */
@Injectable({
    providedIn: 'root'
})
export class InteractionService {
    private gizmoManager = inject(GizmoManagerService);
    private entityStore = inject(EntityStoreService);
    private pointerListener = inject(PointerListenerService);
    private raycaster = inject(RaycasterService);
    private state = inject(EngineStateService);
    private gameInput = inject(GameInputService);

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

    selectEntity(entity: Entity | null) {
        const current = this.entityStore.selectedEntity();
        if (entity !== current) {
            this.entityStore.selectedEntity.set(entity);

            // RUN_INDUSTRY: Distinct tactile feedback for Acquisition vs Release
            if (entity !== null) {
                this.gameInput.vibrate(15);
            } else {
                this.gameInput.vibrate(5);
            }
        }
    }

    selectEntityAt(clientX: number, clientY: number) {
        if (this.state.isPlacementActive()) return;
        const entity = this.raycaster.raycastFromScreen(clientX, clientY);
        this.selectEntity(entity);
    }

    openContextMenu(clientX: number, clientY: number) {
        if (this.state.isPlacementActive()) return;
        const entity = this.raycaster.raycastFromScreen(clientX, clientY);
        if (entity !== null) {
            this.contextMenuRequest.set({ x: clientX, y: clientY, entity });
            this.selectEntity(entity);
        }
    }

    private handleClick(e: PointerEventData) {
        if (this.ignoreNextClick) {
            this.ignoreNextClick = false;
            return;
        }

        if (this.state.isPlacementActive()) return;
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
            this.selectEntity(entity);
            this.gameInput.vibrate([10, 30, 10]); // Multi-pulse "Analysis" vibe
        } else {
            this.contextMenuRequest.set(null);
        }
    }
}
