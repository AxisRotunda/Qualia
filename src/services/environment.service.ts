
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { SceneService } from './scene.service';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private sceneService = inject(SceneService);

  private ambientLight!: THREE.AmbientLight;
  private dirLight!: THREE.DirectionalLight;

  init() {
    const scene = this.sceneService.getScene();

    // Default Lights
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.dirLight.position.set(20, 50, 20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 100;
    this.dirLight.shadow.camera.left = -50;
    this.dirLight.shadow.camera.right = 50;
    this.dirLight.shadow.camera.top = 50;
    this.dirLight.shadow.camera.bottom = -50;
    this.dirLight.shadow.bias = -0.0005;
    scene.add(this.dirLight);
    
    // Default Atmosphere
    this.setAtmosphere('clear');
  }

  setAtmosphere(preset: 'clear'|'fog'|'night'|'forest'|'ice') {
    const scene = this.sceneService.getScene();
    
    if (this.dirLight) {
        this.dirLight.color.setHex(0xffffff);
        this.dirLight.intensity = 0.8;
    }
    if (this.ambientLight) {
        this.ambientLight.intensity = 0.4;
    }

    switch(preset) {
      case 'clear':
        scene.fog = new THREE.Fog(0x0f172a, 40, 200);
        scene.background = new THREE.Color(0x0f172a);
        if(this.ambientLight) this.ambientLight.intensity = 0.5;
        break;
      case 'fog':
        scene.fog = new THREE.FogExp2(0x1a1a2e, 0.015);
        scene.background = new THREE.Color(0x0f0f1e);
        break;
      case 'night':
        scene.fog = new THREE.FogExp2(0x050510, 0.025);
        scene.background = new THREE.Color(0x000008);
        if(this.ambientLight) this.ambientLight.intensity = 0.1;
        if(this.dirLight) {
            this.dirLight.intensity = 0.5;
            this.dirLight.color.setHex(0x6688ff);
        }
        break;
      case 'forest':
        scene.fog = new THREE.FogExp2(0x1a2e1a, 0.035);
        scene.background = new THREE.Color(0x0f1a0f);
        if (this.dirLight) {
            this.dirLight.intensity = 0.5;
            this.dirLight.color.setHex(0xffecc7);
        }
        break;
      case 'ice':
        scene.fog = new THREE.Fog(0xe0f7ff, 30, 300);
        scene.background = new THREE.Color(0xbae6fd);
        if (this.ambientLight) this.ambientLight.intensity = 0.6;
        if (this.dirLight) {
            this.dirLight.intensity = 1.1;
            this.dirLight.color.setHex(0xf0faff);
        }
        break;
    }
  }

  setLightSettings(settings: { ambientIntensity?: number; dirIntensity?: number; dirColor?: string }) {
    if (settings.ambientIntensity !== undefined) this.ambientLight.intensity = settings.ambientIntensity;
    if (settings.dirIntensity !== undefined) this.dirLight.intensity = settings.dirIntensity;
    if (settings.dirColor !== undefined) this.dirLight.color.set(settings.dirColor);
  }
}
