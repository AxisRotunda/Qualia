
import { Injectable, inject } from '@angular/core';
import { EngineStateService } from '../engine-state.service';
import { MaterialService } from '../../services/material.service';
import { SceneService } from '../../services/scene.service';
import { GizmoConfig } from '../graphics/gizmo-manager.service';

@Injectable({
    providedIn: 'root'
})
export class ViewportService {
    private state = inject(EngineStateService);
    private materials = inject(MaterialService);
    private scene = inject(SceneService);

    toggleWireframe() {
        this.state.toggleWireframe();
        this.materials.setWireframeForAll(this.state.wireframe());
    }

    toggleTextures() {
        this.state.toggleTexturesEnabled();
        this.materials.setTexturesEnabled(this.state.texturesEnabled());
    }

    togglePostProcessing() {
        this.state.togglePostProcessing();
    }

    setPerformanceMode(isPerformance: boolean) {
        if (isPerformance) {
            if (this.state.texturesEnabled()) this.toggleTextures();
            if (this.state.postProcessingEnabled()) this.togglePostProcessing();
        } else {
            if (!this.state.texturesEnabled()) this.toggleTextures();
            if (!this.state.postProcessingEnabled()) this.togglePostProcessing();
        }
    }

    togglePhysicsDebug() {
        this.state.togglePhysicsDebug();
    }

    toggleHud() {
        this.state.toggleHudVisible();
    }

    setDebugOverlayVisible(v: boolean) {
        this.state.setDebugOverlay(v);
    }

    setTransformMode(m: 'translate' | 'rotate' | 'scale') {
        this.state.setTransformMode(m);
        this.scene.setTransformMode(m);
    }

    setGizmoConfig(config: GizmoConfig) {
        this.scene.setGizmoConfig(config);
    }

    toggleViewMode() {
        const current = this.state.viewMode();
        this.state.setViewMode(current === 'fp' ? 'tp' : 'fp');
    }
}
