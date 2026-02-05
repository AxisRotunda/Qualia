
import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
    providedIn: 'root'
})
export class SceneGraphService {
    public readonly scene = new THREE.Scene();

    // Dedicated groups for optimized raycasting and rendering layers
    public readonly entityGroup = new THREE.Group();
    public readonly helperGroup = new THREE.Group();
    public readonly stageGroup = new THREE.Group();

    constructor() {
        this.entityGroup.name = 'Entities';
        this.helperGroup.name = 'Helpers';
        this.stageGroup.name = 'Stage';

        this.scene.add(this.stageGroup);
        this.scene.add(this.entityGroup);
        this.scene.add(this.helperGroup);
    }

    /**
   * Adds an object representing a game entity.
   * These are included in raycasting checks.
   */
    addEntity(object: THREE.Object3D) {
        this.entityGroup.add(object);
    }

    removeEntity(object: THREE.Object3D) {
        this.entityGroup.remove(object);
    }

    /**
   * Adds utility objects (Grid, Gizmos, Lights).
   * Usually excluded from entity raycasting.
   */
    add(object: THREE.Object3D) {
        this.scene.add(object);
    }

    remove(object: THREE.Object3D) {
        this.scene.remove(object);
    }
}
