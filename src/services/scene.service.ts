import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { SceneGraphService } from '../engine/graphics/scene-graph.service';
import { EnvironmentManagerService } from '../engine/graphics/environment-manager.service';
import { GizmoManagerService, GizmoConfig } from '../engine/graphics/gizmo-manager.service';
import { InstancedMeshService } from '../engine/graphics/instanced-mesh.service';
import { CameraManagerService } from '../engine/graphics/camera-manager.service';
import { StageService } from '../engine/graphics/stage.service';
import { RendererService } from '../engine/graphics/renderer.service';
import { PostProcessingService } from '../engine/graphics/post-processing.service';

@Injectable({
    providedIn: 'root'
})
export class SceneService {
    // Public for Engine Facade
    public graph = inject(SceneGraphService);
    public stageService = inject(StageService);
    public gizmoManager = inject(GizmoManagerService);

    private envManager = inject(EnvironmentManagerService);
    private instancedMeshService = inject(InstancedMeshService);
    private cameraManager = inject(CameraManagerService);
    private rendererService = inject(RendererService);
    private postProcessing = inject(PostProcessingService);

    public get isDraggingGizmo() { return this.gizmoManager.isDraggingGizmo; }

    init(canvas: HTMLCanvasElement) {
        const scene = this.graph.scene;
        const camera = this.cameraManager.getCamera();

        // 1. Initialize Renderer
        this.rendererService.init(canvas);

        // 2. Setup Subsystems
        this.envManager.init(scene);
        this.stageService.init(scene);

        // 3. Post Processing initialization
        this.postProcessing.init(this.rendererService.renderer, scene, camera);

        // 4. IBL Generation
        this.envManager.generateDefaultEnvironment(this.rendererService.pmremGenerator);

        // 5. Gizmos
        this.gizmoManager.init(
            camera,
            this.rendererService.domElement,
            scene
        );
    }

    // --- Accessors ---
    getScene(): THREE.Scene { return this.graph.scene; }
    getCamera(): THREE.PerspectiveCamera { return this.cameraManager.getCamera(); }
    getDomElement(): HTMLCanvasElement { return this.rendererService.domElement; }

    setTransformMode(mode: 'translate' | 'rotate' | 'scale') {
        this.gizmoManager.setMode(mode);
    }

    setGizmoConfig(config: GizmoConfig) {
        this.gizmoManager.setConfig(config);
    }

    // --- Rendering Lifecycle ---
    resize(width: number, height: number) {
        this.cameraManager.resize(width, height);
        const camera = this.cameraManager.getCamera();
        this.rendererService.resize(width, height, camera);
        this.postProcessing.resize(width, height);
    }
}
