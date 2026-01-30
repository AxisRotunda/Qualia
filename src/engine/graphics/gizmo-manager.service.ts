
import { Injectable, signal } from '@angular/core';
import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

export interface GizmoConfig {
  size?: number;
  translationSnap?: number | null;
  rotationSnap?: number | null;
  scaleSnap?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class GizmoManagerService {
  private transformControl: TransformControls | null = null;
  
  // Signals
  public readonly isDraggingGizmo = signal(false);

  init(camera: THREE.Camera, domElement: HTMLElement, scene: THREE.Scene) {
    this.transformControl = new TransformControls(camera, domElement);
    this.transformControl.size = 1.0; 
    
    this.transformControl.addEventListener('dragging-changed', (event: any) => {
        this.isDraggingGizmo.set(event.value);
    });
    
    scene.add(this.transformControl);
  }

  getControl(): TransformControls | null { 
    return this.transformControl; 
  }

  attach(object: THREE.Object3D) {
    this.transformControl?.attach(object);
  }

  detach() {
    this.transformControl?.detach();
  }

  setMode(mode: 'translate' | 'rotate' | 'scale') {
      if (!this.transformControl) return;
      this.transformControl.setMode(mode);
      
      // Auto-configure space for better UX
      if (mode === 'translate') {
          this.transformControl.setSpace('world');
      } else {
          this.transformControl.setSpace('local');
      }
  }

  setConfig(config: GizmoConfig) {
      if (!this.transformControl) return;
      
      if (config.size !== undefined) {
          this.transformControl.size = config.size;
      }
      
      if (config.translationSnap !== undefined) {
          this.transformControl.translationSnap = config.translationSnap;
      }
      
      if (config.rotationSnap !== undefined) {
          this.transformControl.rotationSnap = config.rotationSnap;
      }
      
      if (config.scaleSnap !== undefined) {
          this.transformControl.scaleSnap = config.scaleSnap;
      }
  }

  // Updates the Selection Helper logic often needed when gizmo moves
  updateSelectionHelper(selectionMesh: THREE.Group | null) {
    if (selectionMesh && this.transformControl?.object) {
        const target = this.transformControl.object;
        selectionMesh.position.copy(target.position);
        selectionMesh.quaternion.copy(target.quaternion);
        selectionMesh.scale.copy(target.scale);
    }
  }
}
