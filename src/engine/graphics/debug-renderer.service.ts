
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { SceneService } from '../../services/scene.service';

@Injectable({
  providedIn: 'root'
})
export class DebugRendererService {
  private sceneService = inject(SceneService);
  private debugMesh: THREE.LineSegments | null = null;

  update(buffers: { vertices: Float32Array, colors: Float32Array } | null) {
      if (!buffers) {
          if (this.debugMesh) {
              this.debugMesh.visible = false;
          }
          return;
      }

      // Copy buffers immediately to JS memory. 
      // The Raw buffers are views into WASM memory which may resize/invalidate 
      // during the next physics step, causing WebGL errors.
      const vCopy = new Float32Array(buffers.vertices);
      const cCopy = new Float32Array(buffers.colors);

      const scene = this.sceneService.getScene();
      if (!scene) return;

      if (!this.debugMesh) {
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.BufferAttribute(vCopy, 3));
          geometry.setAttribute('color', new THREE.BufferAttribute(cCopy, 4));

          const material = new THREE.LineBasicMaterial({ vertexColors: true, depthTest: false, depthWrite: false });
          this.debugMesh = new THREE.LineSegments(geometry, material);
          this.debugMesh.frustumCulled = false;
          this.debugMesh.renderOrder = 999; // Draw on top
          scene.add(this.debugMesh);
      } else {
          this.debugMesh.visible = true;
          const geo = this.debugMesh.geometry;
          geo.setAttribute('position', new THREE.BufferAttribute(vCopy, 3));
          geo.setAttribute('color', new THREE.BufferAttribute(cCopy, 4));
          geo.attributes['position'].needsUpdate = true;
          geo.attributes['color'].needsUpdate = true;
      }
  }
}
