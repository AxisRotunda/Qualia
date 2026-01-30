
import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentManagerService {
  private scene!: THREE.Scene;
  private ambientLight!: THREE.AmbientLight;
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  
  // Track state to blend interactions
  private currentAtmosphere = 'clear';

  init(scene: THREE.Scene) {
    this.scene = scene;
    this.initLights();
    this.setAtmosphere('clear');
  }

  // Generates a procedural Environment Map for PBR reflections (IBL)
  generateDefaultEnvironment(pmremGenerator: THREE.PMREMGenerator) {
      const envScene = new THREE.Scene();
      envScene.background = new THREE.Color(0x444444);

      // Create some emissive geometry to simulate light sources in the reflection map
      const boxGeo = new THREE.BoxGeometry(10, 10, 10);
      const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
      
      // Top light (Sky)
      const light1 = new THREE.Mesh(boxGeo, lightMat);
      light1.position.set(0, 50, 0);
      light1.scale.set(10, 1, 10);
      envScene.add(light1);

      // Side rim light
      const light2 = new THREE.Mesh(boxGeo, lightMat);
      light2.position.set(40, 10, 20);
      envScene.add(light2);

      // Generate the texture
      const renderTarget = pmremGenerator.fromScene(envScene);
      this.scene.environment = renderTarget.texture;

      // Clean up
      light1.geometry.dispose();
      light1.material.dispose();
      envScene.background = null;
  }

  private initLights() {
    // Hemispheric light provides the base ambient fill (Sky vs Ground)
    // Lower intensity because IBL (scene.environment) now handles reflections
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x222222, 0.2); 
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // Very weak base ambient to prevent absolute blacks in crevices
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
    this.scene.add(this.ambientLight);

    // Main Sun Light - High Intensity for "Hard" Realism
    this.dirLight = new THREE.DirectionalLight(0xffffff, 3.0);
    this.dirLight.position.set(30, 80, 40);
    this.dirLight.castShadow = true;
    
    // High Res Shadows
    this.dirLight.shadow.mapSize.width = 4096;
    this.dirLight.shadow.mapSize.height = 4096;
    
    // Tighter Shadow Volume
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 250;
    const d = 80;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    
    // Shadow Bias Tuning for artifact removal
    this.dirLight.shadow.bias = -0.0001;
    this.dirLight.shadow.normalBias = 0.02; // Crucial for smooth curved shadows
    this.dirLight.shadow.radius = 1; // Slight PCF softness
    
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
      const z = Math.cos(theta * 0.5) * 30;
      
      this.dirLight.position.set(x, y, z);
      
      if (y <= 0) {
          // Night
          this.dirLight.intensity = 0;
          this.hemiLight.groundColor.setHex(0x000000);
          this.hemiLight.color.setHex(0x1a1a2e);
          this.hemiLight.intensity = 0.1;
      } else {
          // Day
          const elevation = y / radius;
          
          const sunColor = new THREE.Color();
          if (elevation < 0.2) {
              sunColor.setHSL(0.08, 1.0, 0.6); 
              this.dirLight.intensity = 2.0 * (elevation * 5); 
          } else {
              sunColor.setHSL(0.1, 0.1, 1.0);
              this.dirLight.intensity = 3.0;
          }
          this.dirLight.color.copy(sunColor);
          
          if (this.currentAtmosphere === 'clear' || this.currentAtmosphere === 'city') {
               this.hemiLight.color.setHex(0xdbeafe);
               this.hemiLight.intensity = 0.3;
          }
      }
      
      this.dirLight.updateMatrixWorld();
  }

  setAtmosphere(preset: 'clear'|'fog'|'night'|'forest'|'ice'|'space'|'city'|'blizzard') {
    if (!this.scene) return;
    this.currentAtmosphere = preset;

    if (this.dirLight) this.dirLight.castShadow = true;

    switch(preset) {
      case 'clear':
        this.scene.fog = new THREE.Fog(0x38bdf8, 60, 400); 
        this.scene.background = new THREE.Color(0x38bdf8);
        break;
      case 'fog':
        this.scene.fog = new THREE.FogExp2(0x94a3b8, 0.02);
        this.scene.background = new THREE.Color(0x94a3b8);
        break;
      case 'night':
        this.scene.fog = new THREE.FogExp2(0x020617, 0.02);
        this.scene.background = new THREE.Color(0x020617);
        break;
      case 'forest':
        this.scene.fog = new THREE.FogExp2(0x0f1a0f, 0.035);
        this.scene.background = new THREE.Color(0x0f1a0f);
        break;
      case 'ice':
        this.scene.fog = new THREE.Fog(0xe0f7ff, 30, 400);
        this.scene.background = new THREE.Color(0xbae6fd);
        break;
      case 'blizzard':
        const whiteout = 0xcbd5e1;
        this.scene.fog = new THREE.FogExp2(whiteout, 0.045);
        this.scene.background = new THREE.Color(whiteout);
        if (this.dirLight) this.dirLight.castShadow = false; 
        break;
      case 'space':
        this.scene.fog = null;
        this.scene.background = new THREE.Color(0x000000);
        break;
      case 'city':
        const skyColor = 0xdbeafe;
        const fogColor = 0xcad4e0;
        this.scene.fog = new THREE.Fog(fogColor, 60, 500);
        this.scene.background = new THREE.Color(skyColor);
        break;
    }
  }

  setLightSettings(settings: { ambientIntensity?: number; dirIntensity?: number; dirColor?: string }) {
    if (settings.ambientIntensity !== undefined && this.ambientLight) this.ambientLight.intensity = settings.ambientIntensity;
    if (settings.dirIntensity !== undefined && this.dirLight) this.dirLight.intensity = settings.dirIntensity;
    if (settings.dirColor !== undefined && this.dirLight) this.dirLight.color.set(settings.dirColor);
  }
}
