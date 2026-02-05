
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

    public sunPosition = new THREE.Vector3(30, 80, 40);

    // Height Fog Uniforms (Shared by custom materials)
    public readonly heightFogUniforms = {
        uFogHeight: { value: 0.0 },
        uFogFalloff: { value: 0.01 },
        uFogColor: { value: new THREE.Color(0xffffff) },
        uFogScattering: { value: 0.0 }, // Simulation of light bloom in fog
        uSunDir: { value: new THREE.Vector3(0, 1, 0) } // Direction to sun for Mie scattering
    };

    private readonly SHADOW_RADIUS = 300;
    private readonly SHADOW_MAP_SIZE = window.innerWidth < 800 ? 1024 : 4096;

    // Scratch for snapping
    private readonly _tempVec = new THREE.Vector3();

    init(scene: THREE.Scene) {
        this.scene = scene;
        this.initLights();
    }

    /**
   * Generates enriched IBL environment.
   * RUN_REF: Added colorful synthetic emitters to ensure interesting surface reflections.
   */
    generateDefaultEnvironment(pmremGenerator: THREE.PMREMGenerator) {
        const envScene = new THREE.Scene();
        envScene.background = new THREE.Color(0x020205);

        // Primary Ceiling Panel (White)
        const topLight = new THREE.Mesh(
            new THREE.PlaneGeometry(50, 50),
            new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, side: THREE.DoubleSide })
        );
        topLight.position.set(0, 30, 0);
        topLight.rotation.x = Math.PI / 2;
        envScene.add(topLight);

        // Accent Panels for Specular Detail
        // Cyan Rim
        const rimLight = new THREE.Mesh(
            new THREE.PlaneGeometry(40, 20),
            new THREE.MeshBasicMaterial({ color: 0x0ea5e9, toneMapped: false, side: THREE.DoubleSide })
        );
        rimLight.position.set(-30, 10, -20);
        rimLight.lookAt(0, 0, 0);
        envScene.add(rimLight);

        // Amber Fill
        const fillLight = new THREE.Mesh(
            new THREE.PlaneGeometry(30, 30),
            new THREE.MeshBasicMaterial({ color: 0xf59e0b, toneMapped: false, side: THREE.DoubleSide })
        );
        fillLight.position.set(30, 5, 20);
        fillLight.lookAt(0, 0, 0);
        envScene.add(fillLight);

        // Bottom Bounce (Subtle Slate)
        const botLight = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshBasicMaterial({ color: 0x1e293b, toneMapped: false, side: THREE.DoubleSide })
        );
        botLight.position.set(0, -20, 0);
        botLight.rotation.x = -Math.PI / 2;
        envScene.add(botLight);

        const renderTarget = pmremGenerator.fromScene(envScene);
        this.scene.environment = renderTarget.texture;

        // GPU Cleanup
        topLight.geometry.dispose(); (topLight.material as THREE.Material).dispose();
        rimLight.geometry.dispose(); (rimLight.material as THREE.Material).dispose();
        fillLight.geometry.dispose(); (fillLight.material as THREE.Material).dispose();
        botLight.geometry.dispose(); (botLight.material as THREE.Material).dispose();
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

        this.dirLight.shadow.mapSize.width = this.SHADOW_MAP_SIZE;
        this.dirLight.shadow.mapSize.height = this.SHADOW_MAP_SIZE;
        this.dirLight.shadow.camera.near = 0.5;
        this.dirLight.shadow.camera.far = 1000;

        this.dirLight.shadow.camera.left = -this.SHADOW_RADIUS;
        this.dirLight.shadow.camera.right = this.SHADOW_RADIUS;
        this.dirLight.shadow.camera.top = this.SHADOW_RADIUS;
        this.dirLight.shadow.camera.bottom = -this.SHADOW_RADIUS;

        this.dirLight.shadow.bias = -0.0001;
        this.dirLight.shadow.normalBias = 0.05;
        this.dirLight.shadow.radius = 1.0;

        this.scene.add(this.dirLight);
    }

    snapShadowCamera(camera: THREE.Camera) {
        if (!this.dirLight) return;

        const shadowCam = this.dirLight.shadow.camera;
        shadowCam.position.copy(camera.position).add(this.sunPosition);
        this.dirLight.position.copy(shadowCam.position);
        this.dirLight.target.position.copy(camera.position);

        shadowCam.updateMatrixWorld();
        this._tempVec.set(0, 0, 0).project(shadowCam);

        const texelSize = (this.SHADOW_RADIUS * 2) / this.SHADOW_MAP_SIZE;
        this._tempVec.x = Math.round(this._tempVec.x / texelSize) * texelSize;
        this._tempVec.y = Math.round(this._tempVec.y / texelSize) * texelSize;

        this.dirLight.shadow.camera.updateProjectionMatrix();
    }

    setSunPosition(x: number, y: number, z: number) {
        if (!this.dirLight) return;
        this.sunPosition.set(x, y, z);
        this.dirLight.position.copy(this.sunPosition);
    }

    setSunProperties(color: THREE.Color, intensity: number, castShadow: boolean) {
        if (!this.dirLight) return;
        this.dirLight.color.copy(color);
        this.dirLight.intensity = intensity;
        this.dirLight.castShadow = castShadow;
        this.dirLight.shadow.normalBias = THREE.MathUtils.lerp(0.02, 0.08, 1.0 - Math.min(1.0, intensity / 2.0));
    }

    setEnvironmentLights(hemiColor: THREE.Color, groundColor: THREE.Color, hemiIntensity: number, ambientIntensity: number) {
        if (!this.hemiLight || !this.ambientLight) return;
        this.hemiLight.color.copy(hemiColor);
        this.hemiLight.groundColor.copy(groundColor);
        this.hemiLight.intensity = hemiIntensity;
        this.ambientLight.intensity = ambientIntensity;
    }

    setBackground(color: THREE.Color) {
        if (this.scene) {
            this.scene.background = color;
            this.heightFogUniforms.uFogColor.value.copy(color);
        }
    }

    setFog(fog: THREE.Fog | THREE.FogExp2 | null) {
        if (this.scene) this.scene.fog = fog;
    }

    updateFogColor(color: THREE.Color) {
        if (this.scene && this.scene.fog) {
            this.scene.fog.color.copy(color);
            this.heightFogUniforms.uFogColor.value.copy(color);
        }
    }
}
