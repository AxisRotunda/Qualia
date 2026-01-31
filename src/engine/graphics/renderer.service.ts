
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
      antialias: false, // Disabling MSAA on mobile by default for performance
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // CRITICAL OPTIMIZATION: Mobile GPUs cannot handle DPR > 1.0 with PBR and Shadows.
    // We strictly cap DPR to 1.0 on mobile, and 1.5 on desktop (2.0 is usually overkill/slow).
    const isMobile = window.innerWidth < 800;
    this.renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
    
    // Shadow Map
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    
    // Tone Mapping & Color Space for Hard Realism
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0; // Standard exposure for high-intensity lighting
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; // Essential for correct PBR colors

    // PMREM for IBL
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();
  }

  resize(width: number, height: number, camera: THREE.PerspectiveCamera) {
    if (!this.renderer) return;
    this.renderer.setSize(width, height);
    
    // Re-evaluate DPR on resize (e.g. orientation change)
    const isMobile = width < 800;
    this.renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));

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
