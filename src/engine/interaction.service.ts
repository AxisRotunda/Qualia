
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { SceneService } from '../services/scene.service';
import { EntityManager } from './entity-manager.service';
import { Entity } from './core';

@Injectable({
  providedIn: 'root'
})
export class InteractionService {
  private sceneService = inject(SceneService);
  private entityManager = inject(EntityManager);
  
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  raycastFromScreen(clientX: number, clientY: number): Entity | null {
    const domEl = this.sceneService.getDomElement();
    if (!domEl) return null;
    
    const rect = domEl.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.sceneService.getCamera());

    const meshes: THREE.Object3D[] = [];
    const meshToEntity = new Map<number, Entity>();

    this.entityManager.world.meshes.forEach((ref, entity) => {
      meshes.push(ref.mesh);
      meshToEntity.set(ref.mesh.id, entity);
    });

    const intersects = this.raycaster.intersectObjects(meshes, false);
    return intersects.length > 0 ? (meshToEntity.get(intersects[0].object.id) ?? null) : null;
  }
  
  raycastGround(): THREE.Vector3 | null {
      this.raycaster.setFromCamera(new THREE.Vector2(0,0), this.sceneService.getCamera());
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const target = new THREE.Vector3();
      return this.raycaster.ray.intersectPlane(plane, target);
  }
}
