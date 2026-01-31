
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
  
  // Public for read access if needed
  public sunPosition = new THREE.Vector3(30, 80, 40);

  init(scene: THREE.Scene) {
    this.scene = scene;
    this.initLights();
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
    this.dirLight.position.copy(this.sunPosition);
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

  // --- Atomic Setters (Dumb Renderer) ---

  setSunPosition(x: number, y: number, z: number) {
      if (!this.dirLight) return;
      this.dirLight.position.set(x, y, z);
      this.dirLight.updateMatrixWorld();
      this.sunPosition.set(x, y, z);
  }

  setSunProperties(color: THREE.Color, intensity: number, castShadow: boolean) {
      if (!this.dirLight) return;
      this.dirLight.color.copy(color);
      this.dirLight.intensity = intensity;
      this.dirLight.castShadow = castShadow;
  }

  setEnvironmentLights(hemiColor: THREE.Color, groundColor: THREE.Color, hemiIntensity: number, ambientIntensity: number) {
      if (!this.hemiLight || !this.ambientLight) return;
      this.hemiLight.color.copy(hemiColor);
      this.hemiLight.groundColor.copy(groundColor);
      this.hemiLight.intensity = hemiIntensity;
      // Ambient light usually acts as a minimum fill
      this.ambientLight.intensity = ambientIntensity;
  }

  setBackground(color: THREE.Color) {
      if (!this.scene) return;
      this.scene.background = color;
  }

  setFog(fog: THREE.Fog | THREE.FogExp2 | null) {
      if (!this.scene) return;
      this.scene.fog = fog;
  }

  updateFogColor(color: THREE.Color) {
      if (this.scene && this.scene.fog) {
          this.scene.fog.color.copy(color);
      }
  }
}
