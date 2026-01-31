
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EntityStoreService } from '../ecs/entity-store.service';
import { PhysicsService } from '../../services/physics.service';
import { SelectionManagerService } from '../graphics/selection-manager.service';
import { Entity } from '../core';

@Injectable({
  providedIn: 'root'
})
export class TransformLogicService {
  private entityStore = inject(EntityStoreService);
  private physics = inject(PhysicsService);
  private selectionManager = inject(SelectionManagerService);

  applyTransformDelta(e: Entity, dPos: {x: number, y: number, z: number}, dRotY: number, camera: THREE.Camera) {
      const t = this.entityStore.world.transforms.get(e);
      if (!t) return;
      
      // Calculate movement relative to camera orientation for intuitive control
      const quat = camera.quaternion;
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(quat);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quat);
      
      forward.y = 0; forward.normalize();
      right.y = 0; right.normalize();
      
      const move = new THREE.Vector3();
      move.addScaledVector(right, dPos.x);
      move.addScaledVector(forward, dPos.z); 
      move.y += dPos.y;

      const newPos = {
          x: t.position.x + move.x,
          y: t.position.y + move.y,
          z: t.position.z + move.z
      };
      
      // Rotation (World Y Axis)
      const q = new THREE.Quaternion(t.rotation.x, t.rotation.y, t.rotation.z, t.rotation.w);
      const rot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dRotY);
      q.premultiply(rot);

      // Apply to ECS
      t.position = newPos;
      t.rotation = { x: q.x, y: q.y, z: q.z, w: q.w };
      
      // Apply to Physics
      const rb = this.entityStore.world.rigidBodies.get(e);
      if (rb) {
          this.physics.world.updateBodyTransform(rb.handle, t.position, t.rotation);
      }
      
      // Apply to Visuals immediately for smoothness
      const meshRef = this.entityStore.world.meshes.get(e);
      if (meshRef) {
          meshRef.mesh.position.copy(newPos as any);
          meshRef.mesh.quaternion.copy(q);
      }
      
      // Sync Selection Helper
      this.selectionManager.updateHelper();
  }

  applyScaleDelta(e: Entity, dScale: number) {
      const t = this.entityStore.world.transforms.get(e);
      if (!t) return;

      const newScale = Math.max(0.1, t.scale.x + dScale); // Uniform scaling for simplicity
      
      t.scale = { x: newScale, y: newScale, z: newScale };
      
      // Visuals
      const meshRef = this.entityStore.world.meshes.get(e);
      if (meshRef) {
          meshRef.mesh.scale.set(newScale, newScale, newScale);
      }
      
      // Physics (Rebuild colliders)
      const rb = this.entityStore.world.rigidBodies.get(e);
      const def = this.entityStore.world.bodyDefs.get(e);
      if (rb && def) {
           this.physics.shapes.updateBodyScale(rb.handle, def, t.scale);
      }

      // Sync Selection Helper
      this.selectionManager.updateHelper();
  }

  setEntityTransform(e: Entity, pos?: {x: number, y: number, z: number}, rot?: {x: number, y: number, z: number, w: number}, scale?: {x: number, y: number, z: number}) {
      const t = this.entityStore.world.transforms.get(e);
      if (!t) return;

      if (pos) t.position = { ...pos };
      if (rot) t.rotation = { ...rot };
      if (scale) t.scale = { ...scale };

      // Physics Sync
      const rb = this.entityStore.world.rigidBodies.get(e);
      const def = this.entityStore.world.bodyDefs.get(e);
      
      if (rb) {
          if (pos || rot) {
             this.physics.world.updateBodyTransform(rb.handle, t.position, t.rotation);
          }
          if (scale && def) {
             this.physics.shapes.updateBodyScale(rb.handle, def, t.scale);
          }
      }

      // Visual Sync
      const meshRef = this.entityStore.world.meshes.get(e);
      if (meshRef) {
          if (pos) meshRef.mesh.position.set(pos.x, pos.y, pos.z);
          if (rot) meshRef.mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
          if (scale) meshRef.mesh.scale.set(scale.x, scale.y, scale.z);
      }

      this.selectionManager.updateHelper();
  }
}
