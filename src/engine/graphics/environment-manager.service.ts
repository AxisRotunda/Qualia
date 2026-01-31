
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { ATMOSPHERE_PRESETS } from '../../config/atmosphere.config';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentManagerService {
  private scene!: THREE.Scene;
  private ambientLight!: THREE.AmbientLight;
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  
  private currentAtmosphere = 'clear';

  init(scene: THREE.Scene) {
    this.scene = scene;
    this.initLights();
    this.setAtmosphere('clear');
  }

  // Generates a high-contrast procedural Studio environment for realistic reflections
  generateDefaultEnvironment(pmremGenerator: THREE.PMREMGenerator) {
      const envScene = new THREE.Scene();
      envScene.background = new THREE.Color(0x050505); // Near-black base for high contrast

      // 1. Main Overhead Light (Softbox)
      const topLight = new THREE.Mesh(
          new THREE.PlaneGeometry(20, 20),
          new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, side: THREE.DoubleSide })
      );
      topLight.position.set(0, 20, 0);
      topLight.rotation.x = Math.PI / 2;
      envScene.add(topLight);

      // 2. Rim Light (Cold)
      const rimLight = new THREE.Mesh(
          new THREE.PlaneGeometry(40, 10),
          new THREE.MeshBasicMaterial({ color: 0x445566, toneMapped: false, side: THREE.DoubleSide })
      );
      rimLight.position.set(-20, 10, -20);
      rimLight.lookAt(0, 0, 0);
      envScene.add(rimLight);

      // 3. Warm Fill (Ground Bounce) - Minimal intensity
      const fillLight = new THREE.Mesh(
          new THREE.PlaneGeometry(40, 10),
          new THREE.MeshBasicMaterial({ color: 0x110802, toneMapped: false, side: THREE.DoubleSide })
      );
      fillLight.position.set(20, 0, 20);
      fillLight.lookAt(0, 0, 0);
      envScene.add(fillLight);

      const renderTarget = pmremGenerator.fromScene(envScene);
      this.scene.environment = renderTarget.texture;

      // Cleanup
      topLight.geometry.dispose(); topLight.material.dispose();
      rimLight.geometry.dispose(); rimLight.material.dispose();
      fillLight.geometry.dispose(); fillLight.material.dispose();
      envScene.background = null;
  }

  private initLights() {
    // Reduced base intensity to allow Directional Light to dominate (High contrast)
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x050505, 0.15); // Darker ground bounce
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // Minimal ambient to prevent crushed blacks
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 4.5); // High intensity sunlight
    this.dirLight.position.set(30, 80, 40);
    this.dirLight.castShadow = true;
    
    // Performance Tuning: Increased to 2048 for Hard Realism sharpness
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 300;
    const d = 100;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    
    // Hard Realism Tuning: Very tight bias for accurate contact shadows on procedural terrain
    this.dirLight.shadow.bias = -0.00002; 
    this.dirLight.shadow.normalBias = 0.02; 
    this.dirLight.shadow.radius = 1.5; // Slightly softer penumbra
    
    this.scene.add(this.dirLight);
  }
  
  setTimeOfDay(hour: number) {
      if (!this.dirLight || !this.hemiLight) return;
      
      const safeHour = hour % 24;
      const normTime = (safeHour + 18) % 24; 
      const theta = (normTime / 24) * Math.PI * 2;
      
      const radius = 100;
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * radius;
      const z = Math.sin(theta) * 40 + 20; 
      
      this.dirLight.position.set(x, y, z);
      
      if (y <= 0) {
          // Night
          this.dirLight.intensity = 0;
          this.hemiLight.groundColor.setHex(0x000000);
          this.hemiLight.color.setHex(0x05050a);
          this.hemiLight.intensity = 0.02;
      } else {
          // Day
          const elevation = y / radius;
          const sunColor = new THREE.Color();
          
          if (elevation < 0.15) {
              // Sunset / Sunrise
              sunColor.setHSL(0.05, 0.9, 0.5); 
              this.dirLight.intensity = 3.0 * (elevation * 6); 
          } else if (elevation < 0.4) {
              // Golden Hour
              sunColor.setHSL(0.1, 0.5, 0.8);
              this.dirLight.intensity = 3.5;
          } else {
              // Noon
              sunColor.setHSL(0.1, 0.05, 0.98);
              this.dirLight.intensity = 4.5;
          }
          this.dirLight.color.copy(sunColor);
          
          // Re-apply atmosphere overrides if valid for day
          if (ATMOSPHERE_PRESETS[this.currentAtmosphere]) {
              const preset = ATMOSPHERE_PRESETS[this.currentAtmosphere]();
              if (preset.hemiColor) this.hemiLight.color.setHex(preset.hemiColor);
              if (preset.hemiInt) this.hemiLight.intensity = preset.hemiInt;
          }
      }
      this.dirLight.updateMatrixWorld();
  }

  setAtmosphere(presetId: string) {
    if (!this.scene) return;
    this.currentAtmosphere = presetId;

    const generator = ATMOSPHERE_PRESETS[presetId] || ATMOSPHERE_PRESETS['clear'];
    const preset = generator();

    // Apply Fog
    if (preset.fog) {
        this.scene.fog = preset.fog;
    } else {
        this.scene.fog = null;
    }

    // Apply Background
    this.scene.background = preset.background;

    // Apply Shadows
    if (this.dirLight) this.dirLight.castShadow = preset.sunShadows;

    // Apply Hemisphere overrides
    if (this.hemiLight) {
        if (preset.hemiColor !== undefined) this.hemiLight.color.setHex(preset.hemiColor);
        else this.hemiLight.color.setHex(0xffffff); // Reset if not specified

        if (preset.hemiGround !== undefined) this.hemiLight.groundColor.setHex(preset.hemiGround);
        else this.hemiLight.groundColor.setHex(0x050505); // Reset

        if (preset.hemiInt !== undefined) this.hemiLight.intensity = preset.hemiInt;
    }
  }

  setLightSettings(settings: { ambientIntensity?: number; dirIntensity?: number; dirColor?: string }) {
    if (settings.ambientIntensity !== undefined && this.ambientLight) this.ambientLight.intensity = settings.ambientIntensity;
    if (settings.dirIntensity !== undefined && this.dirLight) this.dirLight.intensity = settings.dirIntensity;
    if (settings.dirColor !== undefined && this.dirLight) this.dirLight.color.set(settings.dirColor);
  }
}
