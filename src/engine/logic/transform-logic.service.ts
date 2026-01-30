
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EntityManager } from '../entity-manager.service';
import { PhysicsService } from '../../services/physics.service';
import { SceneService } from '../../services/scene.service';
import { Entity } from '../core';

@Injectable({
  providedIn: 'root'
})
export class TransformLogicService {
  private entityMgr = inject(EntityManager);
  private physics = inject(PhysicsService);
  private scene = inject(SceneService);

  applyTransformDelta(e: Entity, dPos: {x: number, y: number, z: number}, dRotY: number, camera: THREE.Camera) {
      const t = this.entityMgr.world.transforms.get(e);
      if (!t) return;
      
      // Calculate movement relative to camera orientation for intuitive control
      const quat = camera.quaternion;
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(quat);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quat);
      
      // Project to XZ plane (Ground) to avoid weird flying when looking down
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
      const rb = this.entityMgr.world.rigidBodies.get(e);
      if (rb) {
          this.physics.updateBodyTransform(rb.handle, t.position, t.rotation);
      }
      
      // Apply to Visuals immediately for smoothness
      const meshRef = this.entityMgr.world.meshes.get(e);
      if (meshRef) {
          meshRef.mesh.position.copy(newPos as any);
          meshRef.mesh.quaternion.copy(q);
      }
      
      // Sync Selection Helper
      this.scene.updateSelectionHelper();
  }

  applyScaleDelta(e: Entity, dScale: number) {
      const t = this.entityMgr.world.transforms.get(e);
      if (!t) return;

      const newScale = Math.max(0.1, t.scale.x + dScale); // Uniform scaling for simplicity
      
      t.scale = { x: newScale, y: newScale, z: newScale };
      
      // Visuals
      const meshRef = this.entityMgr.world.meshes.get(e);
      if (meshRef) {
          meshRef.mesh.scale.set(newScale, newScale, newScale);
      }
      
      // Physics (Rebuild colliders)
      const rb = this.entityMgr.world.rigidBodies.get(e);
      const def = this.entityMgr.world.bodyDefs.get(e);
      if (rb && def) {
           this.physics.updateBodyScale(rb.handle, def, t.scale);
      }

      // Sync Selection Helper
      this.scene.updateSelectionHelper();
  }
}
