
import { Injectable, inject, signal } from '@angular/core';
import { World, Entity } from './core';
import { PhysicsService, PhysicsBodyDef } from '../services/physics.service';
import { SceneService } from '../services/scene.service';
import { PhysicsFactoryService } from '../services/factories/physics-factory.service';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class EntityManager {
  public world = new World();
  public objectCount = signal(0);
  public selectedEntity = signal<Entity | null>(null);

  private physics = inject(PhysicsService);
  private physicsFactory = inject(PhysicsFactoryService);
  private scene = inject(SceneService);
  
  // Create an entity with fully formed physics and mesh
  createEntityFromDef(bodyDef: PhysicsBodyDef, visualOpts: { color?: number, materialId?: string, meshId?: string }, name: string, templateId?: string): Entity {
      // Mesh creation now delegated to SceneService
      const mesh = this.scene.createMesh(bodyDef, visualOpts);
      
      const entity = this.world.createEntity();
      
      this.world.rigidBodies.add(entity, { handle: bodyDef.handle });
      this.world.meshes.add(entity, { mesh });
      this.world.transforms.add(entity, {
        position: { ...bodyDef.position },
        rotation: { ...bodyDef.rotation },
        scale: { x: 1, y: 1, z: 1 }
      });
      this.world.bodyDefs.add(entity, bodyDef);
      
      // Default props, should ideally come from template
      this.world.physicsProps.add(entity, { friction: 0.5, restitution: 0.5 });
      this.world.names.add(entity, name);
      if (templateId) this.world.templateIds.add(entity, templateId);

      this.objectCount.update(c => c + 1);
      return entity;
  }

  destroyEntity(e: Entity) {
    if (this.selectedEntity() === e) this.selectedEntity.set(null);
    
    const rb = this.world.rigidBodies.get(e);
    if (rb) this.physics.removeBody(rb.handle);
    
    const meshRef = this.world.meshes.get(e);
    if (meshRef) {
        this.scene.removeMesh(meshRef.mesh);
        this.scene.disposeMesh(meshRef.mesh);
    }
    
    this.world.destroyEntity(e);
    this.objectCount.update(c => c - 1);
  }

  duplicateEntity(e: Entity) {
      const t = this.world.transforms.get(e);
      const oldDef = this.world.bodyDefs.get(e);
      const meshRef = this.world.meshes.get(e);
      const name = this.world.names.get(e) || 'Object';
      const tplId = this.world.templateIds.get(e);

      if (!t || !oldDef || !meshRef) return;

      const newPos = { x: t.position.x + 1, y: t.position.y, z: t.position.z };
      
      let bodyDef: PhysicsBodyDef;
      if (oldDef.type === 'sphere') {
           bodyDef = this.physicsFactory.createSphere(newPos.x, newPos.y, newPos.z, oldDef.radius, oldDef.mass);
      } else if (oldDef.type === 'cylinder') {
            bodyDef = this.physicsFactory.createCylinder(newPos.x, newPos.y, newPos.z, oldDef.height!, oldDef.radius!, oldDef.mass);
      } else {
           bodyDef = this.physicsFactory.createBox(newPos.x, newPos.y, newPos.z, oldDef.size?.w, oldDef.size?.h, oldDef.size?.d, oldDef.mass);
      }

      // Re-apply scale
      this.physics.updateBodyScale(bodyDef.handle, bodyDef, t.scale);
      bodyDef.rotation = { ...t.rotation };
      this.physics.updateBodyTransform(bodyDef.handle, newPos, t.rotation);

      // Visuals
      const mat = meshRef.mesh.material as THREE.MeshStandardMaterial;
      const visualOpts = {
          color: mat.color?.getHex(),
          materialId: this.resolveMaterialId(mat),
      };
      
      const newEntity = this.createEntityFromDef(bodyDef, visualOpts, `${name}_copy`, tplId);
      
      // Copy Transform Scale to ECS
      const newT = this.world.transforms.get(newEntity);
      if (newT) newT.scale = { ...t.scale };
      
      // Copy Props
      const oldProps = this.world.physicsProps.get(e);
      if (oldProps) {
          this.world.physicsProps.add(newEntity, { ...oldProps });
          this.physics.updateBodyMaterial(bodyDef.handle, oldProps);
      }
  }

  private resolveMaterialId(mat: THREE.Material): string | undefined {
      // Helper to try and reverse look up or use userData
      return mat.userData['mapId'] ? undefined : undefined;
  }

  syncPhysicsTransforms(mode: 'edit' | 'play', isDragging: boolean) {
    // ECS <-> Physics Sync
    this.world.rigidBodies.forEach((rb, entity) => {
      // If dragging in edit mode, don't overwrite with physics
      if (mode === 'edit' && isDragging && this.selectedEntity() === entity) return;

      const pose = this.physics.getBodyPose(rb.handle);
      if (pose) {
        const transform = this.world.transforms.get(entity);
        const meshRef = this.world.meshes.get(entity);
        
        if (transform) {
            transform.position = pose.p;
            transform.rotation = pose.q;

            if (meshRef) {
                meshRef.mesh.position.set(pose.p.x, pose.p.y, pose.p.z);
                meshRef.mesh.quaternion.set(pose.q.x, pose.q.y, pose.q.z, pose.q.w);
                meshRef.mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
            }
        }
      }
    });
  }

  // Update specific entity from visual transform (Gizmo)
  updateSingleEntityFromVisual(entity: Entity) {
      const meshRef = this.world.meshes.get(entity);
      const transform = this.world.transforms.get(entity);
      
      if (meshRef && transform) {
          const mesh = meshRef.mesh;
          transform.position = { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z };
          transform.rotation = { x: mesh.quaternion.x, y: mesh.quaternion.y, z: mesh.quaternion.z, w: mesh.quaternion.w };
          transform.scale = { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z };
          
          const rb = this.world.rigidBodies.get(entity);
          const def = this.world.bodyDefs.get(entity);
          if (rb) {
              this.physics.updateBodyTransform(rb.handle, transform.position, transform.rotation);
              if (def) this.physics.updateBodyScale(rb.handle, def, transform.scale);
          }
      }
  }

  reset() {
      this.selectedEntity.set(null);
      const all = Array.from(this.world.entities);
      all.forEach(e => this.destroyEntity(e));
      this.physics.resetWorld();
      this.objectCount.set(0);
  }
}
