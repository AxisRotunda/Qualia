
import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class RendererService {
  public renderer!: THREE.WebGLRenderer;
  public pmremGenerator!: THREE.PMREMGenerator;

  init(canvas: HTMLCanvasElement) {
    // Renderer Setup - HIGH REALISM CONFIG
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    
    // Shadow Map
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    
    // Tone Mapping & Color Space for Hard Realism
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0; // Balanced exposure for brighter sun
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; // Essential for correct PBR colors

    // PMREM for IBL
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();
  }

  resize(width: number, height: number, camera: THREE.PerspectiveCamera) {
    if (!this.renderer) return;
    this.renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  render(scene: THREE.Scene, camera: THREE.Camera) {
    if (!this.renderer) return;
    this.renderer.render(scene, camera);
  }

  get domElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }
}
