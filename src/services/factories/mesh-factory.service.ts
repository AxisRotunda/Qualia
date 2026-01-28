
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { PhysicsBodyDef } from '../physics.service';

/**
 * @deprecated Use SceneService.createMesh instead.
 * Logic has been consolidated into SceneService to reduce dependency scattering.
 */
@Injectable({
  providedIn: 'root'
})
export class MeshFactoryService {
  createMesh(data: PhysicsBodyDef, options: any): THREE.Mesh {
    console.warn('MeshFactoryService is deprecated. Use SceneService.');
    return new THREE.Mesh();
  }
  
  disposeMesh(mesh: THREE.Mesh) {}
}
