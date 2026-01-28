
import { Injectable, inject } from '@angular/core';
import { SceneVisualsService } from '../scene/scene-visuals.service';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  private visuals = inject(SceneVisualsService);

  get isDraggingGizmo() { return this.visuals.isDraggingGizmo; }

  init(canvas: HTMLCanvasElement) { this.visuals.init(canvas); }
  getScene() { return this.visuals.getScene(); }
  getCamera() { return this.visuals.getCamera(); }
  getDomElement() { return this.visuals.getDomElement(); }
  
  removeMesh(mesh: THREE.Mesh) { this.visuals.removeMesh(mesh); }
  setSelection(mesh: THREE.Mesh | null) { this.visuals.setSelection(mesh); }
  setTransformMode(mode: 'translate'|'rotate'|'scale') { this.visuals.setTransformMode(mode); }
  updateSelectionHelper() { this.visuals.updateSelectionHelper(); }
  resize(w: number, h: number) { this.visuals.resize(w, h); }
  render() { this.visuals.render(); }
}
