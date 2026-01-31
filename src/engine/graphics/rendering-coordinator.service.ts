
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { RendererService } from './renderer.service';
import { CameraManagerService } from './camera-manager.service';
import { SceneGraphService } from './scene-graph.service';

@Injectable({
  providedIn: 'root'
})
export class RenderingCoordinatorService {
  private rendererService = inject(RendererService);
  private cameraManager = inject(CameraManagerService);
  private graph = inject(SceneGraphService);

  init(canvas: HTMLCanvasElement) {
    this.rendererService.init(canvas);
  }

  resize(width: number, height: number) {
    this.cameraManager.resize(width, height);
    this.rendererService.resize(width, height, this.cameraManager.getCamera());
  }

  render() {
    this.rendererService.render(this.graph.scene, this.cameraManager.getCamera());
  }

  get domElement(): HTMLCanvasElement {
    return this.rendererService.domElement;
  }
  
  get pmremGenerator(): THREE.PMREMGenerator {
      return this.rendererService.pmremGenerator;
  }
}
