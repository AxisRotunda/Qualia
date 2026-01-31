
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
  
  // Override cache
  private overrides = {
      ambientIntensity: -1,
      dirIntensity: -1,
      dirColor: null as string | null
  };

  init(scene: THREE.Scene) {
    this.scene = scene;
    this.initLights();
    this.setAtmosphere('clear');
  }

  generateDefaultEnvironment(pmremGenerator: THREE.PMREMGenerator) {
      const envScene = new THREE.Scene();
      envScene.background = new THREE.Color(0x050505);

      const topLight = new THREE.Mesh(
          new THREE.PlaneGeometry(20, 20),
          new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, side: THREE.DoubleSide })
      );
      topLight.position.set(0, 20, 0);
      topLight.rotation.x = Math.PI / 2;
      envScene.add(topLight);

      const rimLight = new THREE.Mesh(
          new THREE.PlaneGeometry(40, 10),
          new THREE.MeshBasicMaterial({ color: 0x445566, toneMapped: false, side: THREE.DoubleSide })
      );
      rimLight.position.set(-20, 10, -20);
      rimLight.lookAt(0, 0, 0);
      envScene.add(rimLight);

      const fillLight = new THREE.Mesh(
          new THREE.PlaneGeometry(40, 10),
          new THREE.MeshBasicMaterial({ color: 0x110802, toneMapped: false, side: THREE.DoubleSide })
      );
      fillLight.position.set(20, 0, 20);
      fillLight.lookAt(0, 0, 0);
      envScene.add(fillLight);

      const renderTarget = pmremGenerator.fromScene(envScene);
      this.scene.environment = renderTarget.texture;

      topLight.geometry.dispose(); topLight.material.dispose();
      rimLight.geometry.dispose(); rimLight.material.dispose();
      fillLight.geometry.dispose(); fillLight.material.dispose();
      envScene.background = null;
  }

  private initLights() {
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x050505, 0.15);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 4.5);
    this.dirLight.position.set(30, 80, 40);
    this.dirLight.castShadow = true;
    
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 300;
    const d = 100;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.00002; 
    this.dirLight.shadow.normalBias = 0.02; 
    this.dirLight.shadow.radius = 1.5;
    
    this.scene.add(this.dirLight);
  }
  
  setTimeOfDay(hour: number) {
      if (!this.dirLight || !this.hemiLight) return;
      
      // Biome-agnostic orbit calculation
      // 06:00 = Sunrise (X+, Y0)
      // 12:00 = Noon (Y+)
      // 18:00 = Sunset (X-, Y0)
      // 24:00 = Midnight (Y-)
      
      // Convert hour 0-24 to radians 0-2PI, offset by -PI/2 so 6am is 0 radians (horizon)
      const normTime = ((hour - 6) / 24) * Math.PI * 2;
      
      const radius = 150;
      const x = Math.cos(normTime) * radius; // East-West
      const y = Math.sin(normTime) * radius; // Up-Down
      const z = Math.cos(normTime * 0.5) * 40; // Slight seasonal wobble
      
      this.dirLight.position.set(x, y, z);
      this.dirLight.updateMatrixWorld();

      // --- Biome-Aware Lighting Calculation ---
      
      const elevation = y / radius; // -1 to 1
      const isSpace = this.currentAtmosphere === 'space';
      
      if (isSpace) {
          // Space is simple: constant harsh light, rotating source
          this.dirLight.intensity = this.overrides.dirIntensity >= 0 ? this.overrides.dirIntensity : 2.5;
          this.dirLight.color.setHex(0xffffff);
          return;
      }

      // Procedural Sky Colors
      const sunColor = new THREE.Color();
      const skyColor = new THREE.Color();
      
      // Base Biome Factors
      let fogDensityScale = 1.0;
      let ambientBase = 0.1;
      
      if (this.currentAtmosphere === 'desert') {
          ambientBase = 0.3; // Brighter bounces
      } else if (this.currentAtmosphere === 'ice' || this.currentAtmosphere === 'blizzard') {
          ambientBase = 0.5; // Snow reflects lots of light
      } else if (this.currentAtmosphere === 'night') {
          ambientBase = 0.02;
      }

      if (elevation > 0) {
          // DAYTIME
          if (elevation < 0.2) {
              // Golden Hour / Sunrise / Sunset
              const t = elevation / 0.2; // 0..1
              sunColor.setHSL(0.08, 0.9, 0.6); // Orange
              // Sky gradient from deep purple to orange to blue
              skyColor.setHSL(0.6 + (0.1 * t), 0.5, 0.2 + (0.4 * t));
              
              this.dirLight.intensity = Math.max(0, t * 3.5);
          } else {
              // Mid-day
              sunColor.setHSL(0.1, 0.1, 0.98); // White-ish
              skyColor.setHSL(0.6, 0.6, 0.6); // Sky Blue
              this.dirLight.intensity = 4.5;
          }
          
          this.dirLight.castShadow = true;

      } else {
          // NIGHTTIME
          sunColor.setHSL(0.6, 0.4, 0.3); // Moon blue
          skyColor.setHSL(0.66, 0.8, 0.02); // Deep Midnight Blue
          this.dirLight.intensity = 0.2; // Moonlight
          this.dirLight.castShadow = true; // Moon shadows are real
      }

      // Apply Overrides if manually set
      if (this.overrides.dirIntensity >= 0) this.dirLight.intensity = this.overrides.dirIntensity;
      if (this.overrides.dirColor) sunColor.set(this.overrides.dirColor);

      this.dirLight.color.copy(sunColor);

      // --- Atmosphere / Fog Updates ---
      
      // Interpolate background color
      const preset = ATMOSPHERE_PRESETS[this.currentAtmosphere]();
      const baseBg = preset.background;
      
      // Blend base preset color with calculated sky color based on time
      // This allows 'Desert' to be orange-tinted but still get dark at night
      const blendedBg = baseBg.clone().lerp(skyColor, 0.5);
      
      // Darken significantly at night
      if (elevation < 0) {
          blendedBg.multiplyScalar(0.1); 
      } else if (elevation < 0.2) {
          blendedBg.multiplyScalar(0.5 + (elevation/0.2)*0.5);
      }

      this.scene.background = blendedBg;

      // Update Fog
      if (this.scene.fog && this.scene.fog instanceof THREE.Fog) {
          this.scene.fog.color.copy(blendedBg);
      } else if (this.scene.fog && this.scene.fog instanceof THREE.FogExp2) {
          this.scene.fog.color.copy(blendedBg);
      }

      // Update Hemi Light (Ambient)
      // Ground color mirrors sky but darker/earthier
      this.hemiLight.color.copy(blendedBg).offsetHSL(0, 0, 0.1);
      this.hemiLight.groundColor.copy(blendedBg).offsetHSL(0, 0, -0.1);
      
      const targetAmbient = (elevation > 0) ? ambientBase : ambientBase * 0.2;
      this.hemiLight.intensity = this.overrides.ambientIntensity >= 0 ? this.overrides.ambientIntensity : targetAmbient;
  }

  setAtmosphere(presetId: string) {
    if (!this.scene) return;
    this.currentAtmosphere = presetId;
    this.overrides = { ambientIntensity: -1, dirIntensity: -1, dirColor: null }; // Reset overrides

    const generator = ATMOSPHERE_PRESETS[presetId] || ATMOSPHERE_PRESETS['clear'];
    const preset = generator();

    // Apply Fog
    if (preset.fog) {
        this.scene.fog = preset.fog;
    } else {
        this.scene.fog = null;
    }

    // Background and Shadows are now dynamic in setTimeOfDay, but we set initial state
    this.scene.background = preset.background;
    if (this.dirLight) this.dirLight.castShadow = preset.sunShadows;
    
    // Force update to snap colors immediately
    // Use a default time if none set, or current engine time via separate call
    // We assume the engine loop will call setTimeOfDay shortly
  }

  setLightSettings(settings: { ambientIntensity?: number; dirIntensity?: number; dirColor?: string }) {
    if (settings.ambientIntensity !== undefined) this.overrides.ambientIntensity = settings.ambientIntensity;
    if (settings.dirIntensity !== undefined) this.overrides.dirIntensity = settings.dirIntensity;
    if (settings.dirColor !== undefined) this.overrides.dirColor = settings.dirColor;
    
    // Apply immediately
    if (settings.ambientIntensity !== undefined && this.ambientLight) this.hemiLight.intensity = settings.ambientIntensity;
    if (settings.dirIntensity !== undefined && this.dirLight) this.dirLight.intensity = settings.dirIntensity;
    if (settings.dirColor !== undefined && this.dirLight) this.dirLight.color.set(settings.dirColor);
  }
}
