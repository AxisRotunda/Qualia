
// DEPRECATED: Logic moved to src/engine/graphics/visuals-factory.service.ts
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { PhysicsBodyDef } from '../physics.service';

@Injectable({
  providedIn: 'root'
})
export class MeshFactoryService {
  createMesh(data: PhysicsBodyDef, options: any): THREE.Mesh {
    console.warn('MeshFactoryService is deprecated. Use SceneService/VisualsFactory.');
    return new THREE.Mesh();
  }
  
  disposeMesh(mesh: THREE.Mesh) {}
}
