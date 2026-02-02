
import { Injectable, inject, effect } from '@angular/core';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { COMPOSITE_POST_SHADER } from './shaders/post.shader';
import { LayoutService } from '../../services/ui/layout.service';
import { EngineStateService } from '../engine-state.service';
import { POST_PROCESS_CONFIG } from '../../config/post-process.config';

@Injectable({
  providedIn: 'root'
})
export class PostProcessingService {
  private layout = inject(LayoutService);
  private state = inject(EngineStateService);

  private composer!: EffectComposer;
  private renderPass!: RenderPass;
  private compositePass!: ShaderPass;
  private bloomPass!: UnrealBloomPass;

  constructor() {
      // Create reactive effects for calibration
      effect(() => {
          if (this.bloomPass) {
              this.bloomPass.strength = this.state.bloomStrength();
              this.bloomPass.threshold = this.state.bloomThreshold();
          }
      });

      effect(() => {
          if (this.compositePass) {
              this.compositePass.uniforms['uGrainIntensity'].value = this.state.grainIntensity();
              this.compositePass.uniforms['uVignetteIntensity'].value = this.state.vignetteIntensity();
              this.compositePass.uniforms['uAberrationIntensity'].value = this.state.aberrationIntensity();
              // Sync Industry Standard Submersion
              this.compositePass.uniforms['uUnderwater'].value = this.state.isUnderwater() ? 1.0 : 0.0;
          }
      });
  }

  init(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
      const size = new THREE.Vector2();
      renderer.getSize(size);

      // 1. Composer Initialization
      this.composer = new EffectComposer(renderer);
      
      // 2. Base Render Pass
      this.renderPass = new RenderPass(scene, camera);
      this.composer.addPass(this.renderPass);

      // 3. Bloom Pass
      this.bloomPass = new UnrealBloomPass(
          size, 
          this.state.bloomStrength(), 
          POST_PROCESS_CONFIG.BLOOM.RADIUS, 
          this.state.bloomThreshold()
      ); 
      this.composer.addPass(this.bloomPass);

      // 4. Composite Shader Pass (Vignette + Grain + Aberration)
      this.compositePass = new ShaderPass(COMPOSITE_POST_SHADER);
      this.compositePass.uniforms['uVignetteIntensity'].value = this.state.vignetteIntensity();
      this.compositePass.uniforms['uGrainIntensity'].value = this.state.grainIntensity();
      this.compositePass.uniforms['uAberrationIntensity'].value = this.state.aberrationIntensity();
      this.composer.addPass(this.compositePass);

      // 5. Final Output Pass
      const outputPass = new OutputPass();
      this.composer.addPass(outputPass);

      this.updateQualitySettings();
  }

  update(totalTimeMs: number, scene: THREE.Scene, camera: THREE.Camera) {
      if (!this.composer) return;
      
      this.renderPass.scene = scene;
      this.renderPass.camera = camera;

      if (this.compositePass) {
          this.compositePass.uniforms['uTime'].value = totalTimeMs / 1000.0;
      }
  }

  render() {
      if (this.composer) {
          this.composer.render();
      }
  }

  resize(width: number, height: number) {
      if (this.composer) {
          this.composer.setSize(width, height);
          this.updateQualitySettings();
      }
  }

  private updateQualitySettings() {
      const isMobile = this.layout.isMobile() || this.layout.isTouch();
      const cfg = isMobile ? POST_PROCESS_CONFIG.MOBILE : POST_PROCESS_CONFIG.DESKTOP;
      
      if (this.bloomPass) {
          this.bloomPass.enabled = cfg.BLOOM_ENABLED;
      }
  }
}
