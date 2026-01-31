
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
    this.state.wireframe.update(v => !v);
    this.materials.setWireframeForAll(this.state.wireframe());
  }

  toggleTextures() {
    this.state.texturesEnabled.update(v => !v);
    this.materials.setTexturesEnabled(this.state.texturesEnabled());
  }

  setPerformanceMode(isPerformance: boolean) {
    if (isPerformance) {
        if (this.state.texturesEnabled()) this.toggleTextures();
    } else {
        if (!this.state.texturesEnabled()) this.toggleTextures();
    }
  }

  togglePhysicsDebug() {
    this.state.showPhysicsDebug.update(v => !v);
  }

  toggleHud() {
    this.state.hudVisible.update(v => !v);
  }

  setDebugOverlayVisible(v: boolean) {
    this.state.showDebugOverlay.set(v);
  }

  setTransformMode(m: 'translate' | 'rotate' | 'scale') {
    this.state.transformMode.set(m);
    this.scene.setTransformMode(m);
  }

  setGizmoConfig(config: GizmoConfig) {
    this.scene.setGizmoConfig(config);
  }
}
