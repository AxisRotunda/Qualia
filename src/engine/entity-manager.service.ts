
import { Injectable, inject, signal } from '@angular/core';
import { World, Entity } from './core';
import { PhysicsService, PhysicsBodyDef } from '../services/physics.service';
import { SceneService } from '../services/scene.service';
import { PhysicsFactoryService } from '../services/factories/physics-factory.service';
import { PhysicsMaterialsService } from '../physics/physics-materials.service';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class EntityManager {
  public world = new World();
  public objectCount = signal(0);
  public selectedEntity = signal<Entity | null>(null);

  private physics = inject(PhysicsService);
  private physicsMaterials = inject(PhysicsMaterialsService);
  private physicsFactory = inject(PhysicsFactoryService);
  private scene = inject(SceneService);
  
  // Create an entity with fully formed physics and mesh
  createEntityFromDef(bodyDef: PhysicsBodyDef, visualOpts: { color?: number, materialId?: string, meshId?: string }, name: string, templateId?: string): Entity {
      // Delegate visual creation to SceneService façade
      const mesh = this.scene.createEntityVisual(bodyDef, visualOpts);
      
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

      // Map Physics Handle to Entity ID for Collision Events
      this.physics.registerEntity(bodyDef.handle, entity);

      this.objectCount.update(c => c + 1);
      return entity;
  }

  destroyEntity(e: Entity) {
    if (this.selectedEntity() === e) this.selectedEntity.set(null);
    
    const rb = this.world.rigidBodies.get(e);
    if (rb) {
        this.physics.removeBody(rb.handle);
        this.physics.unregisterEntity(rb.handle);
    }
    
    const meshRef = this.world.meshes.get(e);
    if (meshRef) {
        // Delegate visual destruction to SceneService façade
        this.scene.removeEntityVisual(meshRef.mesh);
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
      
      // Use Factory to recreate body logic
      const bodyDef = this.physicsFactory.recreateBody(oldDef, newPos.x, newPos.y, newPos.z);

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

  updateEntityPhysics(e: Entity, props: {friction: number, restitution: number}) {
      const safe = { friction: Math.max(0, Math.min(props.friction, 5)), restitution: Math.max(0, Math.min(props.restitution, 2)) };
      const rb = this.world.rigidBodies.get(e);
      if(rb) {
          this.physicsMaterials.updateBodyMaterial(rb.handle, safe);
          this.world.physicsProps.add(e, safe);
      }
  }

  private resolveMaterialId(mat: THREE.Material): string | undefined {
      return mat.userData['mapId'] ? undefined : undefined;
  }

  reset() {
      this.selectedEntity.set(null);
      const all = Array.from(this.world.entities);
      all.forEach(e => this.destroyEntity(e));
      this.physics.resetWorld();
      this.objectCount.set(0);
  }
}
