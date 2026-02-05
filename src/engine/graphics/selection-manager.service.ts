
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { SceneService } from '../../services/scene.service';
import { SelectionVisualsFactory } from './selection-visuals.factory';
import { GizmoManagerService } from './gizmo-manager.service';

@Injectable({
    providedIn: 'root'
})
export class SelectionManagerService {
    private sceneService = inject(SceneService);
    private selectionFactory = inject(SelectionVisualsFactory);
    private gizmoManager = inject(GizmoManagerService);

    private selectionMesh: THREE.Group | null = null;

    setSelection(mesh: THREE.Mesh | null) {
        const scene = this.sceneService.getScene();
        if (!scene) return;

        // 1. Clean up existing selection visual
        if (this.selectionMesh) {
            scene.remove(this.selectionMesh);
            this.selectionFactory.dispose(this.selectionMesh);
            this.selectionMesh = null;
        }

        // 2. Setup new selection
        if (mesh) {
            this.gizmoManager.attach(mesh);
            this.selectionMesh = this.selectionFactory.createSelectionVisuals(mesh);
            scene.add(this.selectionMesh);
        } else {
            this.gizmoManager.detach();
        }
    }

    updateHelper() {
        if (this.selectionMesh && this.gizmoManager.getControl()?.object) {
            const target = this.gizmoManager.getControl()!.object!;
            this.selectionMesh.position.copy(target.position);
            this.selectionMesh.quaternion.copy(target.quaternion);
            this.selectionMesh.scale.copy(target.scale);
        }
    }
}
