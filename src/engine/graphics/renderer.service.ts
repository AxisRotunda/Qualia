
import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class RendererService {
  public renderer!: THREE.WebGLRenderer;
  public pmremGenerator!: THREE.PMREMGenerator;

  init(canvas: HTMLCanvasElement) {
    // RUN_INDUSTRY: Advanced Mobile Hardware Detection
    const isMobile = window.innerWidth < 1024 || window.matchMedia('(pointer: coarse)').matches;
    
    // On high-DPI mobile, MSAA (antialias) is often unnecessary and costly.
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: !isMobile, 
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
      alpha: false
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // RUN_INDUSTRY: Enforce strict pixel ratio caps to prevent 4K/Retina fill-rate death
    this.renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
    
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25; 
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();
  }

  setExposure(val: number) {
      if (this.renderer) {
          this.renderer.toneMappingExposure = val;
      }
  }

  resize(width: number, height: number, camera: THREE.PerspectiveCamera) {
    if (!this.renderer) return;
    this.renderer.setSize(width, height);
    
    const isMobile = width < 1024 || window.matchMedia('(pointer: coarse)').matches;
    this.renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  render(scene: THREE.Scene, camera: THREE.Camera) {
    if (this.renderer) {
        this.renderer.render(scene, camera);
    }
  }

  get domElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }
}
