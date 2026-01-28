
import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentManagerService {
  private scene!: THREE.Scene;
  private ambientLight!: THREE.AmbientLight;
  private dirLight!: THREE.DirectionalLight;

  init(scene: THREE.Scene) {
    this.scene = scene;
    this.initLights();
    this.setAtmosphere('clear');
  }

  private initLights() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);

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
    this.scene.add(this.dirLight);
  }

  setAtmosphere(preset: 'clear'|'fog'|'night'|'forest'|'ice') {
    if (!this.scene) return;
    
    // Reset defaults
    if (this.dirLight) {
        this.dirLight.color.setHex(0xffffff);
        this.dirLight.intensity = 0.8;
    }
    if (this.ambientLight) {
        this.ambientLight.intensity = 0.4;
    }

    switch(preset) {
      case 'clear':
        this.scene.fog = new THREE.Fog(0x0f172a, 40, 200);
        this.scene.background = new THREE.Color(0x0f172a);
        if(this.ambientLight) this.ambientLight.intensity = 0.5;
        break;
      case 'fog':
        this.scene.fog = new THREE.FogExp2(0x1a1a2e, 0.015);
        this.scene.background = new THREE.Color(0x0f0f1e);
        break;
      case 'night':
        this.scene.fog = new THREE.FogExp2(0x050510, 0.025);
        this.scene.background = new THREE.Color(0x000008);
        if(this.ambientLight) this.ambientLight.intensity = 0.1;
        if(this.dirLight) {
            this.dirLight.intensity = 0.5;
            this.dirLight.color.setHex(0x6688ff);
        }
        break;
      case 'forest':
        this.scene.fog = new THREE.FogExp2(0x1a2e1a, 0.035);
        this.scene.background = new THREE.Color(0x0f1a0f);
        if (this.dirLight) {
            this.dirLight.intensity = 0.5;
            this.dirLight.color.setHex(0xffecc7);
        }
        break;
      case 'ice':
        this.scene.fog = new THREE.Fog(0xe0f7ff, 30, 300);
        this.scene.background = new THREE.Color(0xbae6fd);
        if (this.ambientLight) this.ambientLight.intensity = 0.6;
        if (this.dirLight) {
            this.dirLight.intensity = 1.1;
            this.dirLight.color.setHex(0xf0faff);
        }
        break;
    }
  }

  setLightSettings(settings: { ambientIntensity?: number; dirIntensity?: number; dirColor?: string }) {
    if (settings.ambientIntensity !== undefined && this.ambientLight) this.ambientLight.intensity = settings.ambientIntensity;
    if (settings.dirIntensity !== undefined && this.dirLight) this.dirLight.intensity = settings.dirIntensity;
    if (settings.dirColor !== undefined && this.dirLight) this.dirLight.color.set(settings.dirColor);
  }
}
