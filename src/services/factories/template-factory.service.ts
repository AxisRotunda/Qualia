
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EntityAssemblerService } from '../../engine/ecs/entity-assembler.service';
import { EntityStoreService } from '../../engine/ecs/entity-store.service';
import { PhysicsFactoryService } from './physics-factory.service';
import { PhysicsService } from '../physics.service';
import { AssetService } from '../asset.service';
import { ShapesFactory } from '../../physics/shapes.factory';
import { EntityTemplate } from '../../data/entity-templates';
import { Entity } from '../../engine/core';

export interface SpawnOptions {
    alignToBottom?: boolean;
    scale?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateFactoryService {
  private assembler = inject(EntityAssemblerService);
  private physicsFactory = inject(PhysicsFactoryService);
  private physics = inject(PhysicsService);
  private assetService = inject(AssetService);
  private shapesFactory = inject(ShapesFactory);

  spawn(
      entityMgr: EntityStoreService, 
      template: EntityTemplate, 
      position: THREE.Vector3, 
      rotation?: THREE.Quaternion, 
      options?: SpawnOptions
  ): Entity {
    // 1. Calculate Spawn Position
    const spawnPos = position.clone();
    if (options?.alignToBottom) {
        const scale = options.scale ?? 1;
        // Center is at bottom + (height * scale) / 2
        spawnPos.y += (template.size.y * scale) / 2;
    }

    // 2. Resolve Geometry for Physics Hulls
    let geometry: THREE.BufferGeometry | undefined;
    if (template.geometry === 'mesh' && template.meshId) {
        if (template.physicsShape === 'convex-hull' || template.physicsShape === 'trimesh') {
             geometry = this.assetService.getGeometry(template.meshId);
        }
    }

    // 3. Create Physics Body Definition
    const bodyDef = this.physicsFactory.createFromTemplate(template, spawnPos.x, spawnPos.y, spawnPos.z, geometry);

    // 4. Apply Initial Rotation
    if (rotation) {
        // Update both definition and actual physics body immediately
        this.physics.world.updateBodyTransform(
            bodyDef.handle, 
            bodyDef.position, 
            {x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w}
        );
        bodyDef.rotation = {x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w};
    }

    // 5. Apply Physics Material Properties (Friction/Restitution)
    this.physics.materials.updateBodyMaterial(
        bodyDef.handle, 
        { friction: template.friction, restitution: template.restitution }
    );

    // 6. Apply Locks
    if (template.lockRotation) {
        this.shapesFactory.setLockRotation(bodyDef.handle, true);
    }

    // 7. Assemble ECS Entity
    const entity = this.assembler.createEntityFromDef(
        bodyDef, 
        { 
            color: template.color, 
            materialId: template.materialId, 
            meshId: template.meshId 
        }, 
        template.label, 
        template.id
    );

    // 8. Store Physics Props in ECS
    if (entityMgr && entityMgr.world) {
        // Resolve Density for Hard Realism Buoyancy
        let density = 1000; // Default water-like
        if (template.physicsMaterial) {
            const matData = this.physics.materials.getMaterialData(template.physicsMaterial);
            density = matData.density;
        }

        entityMgr.world.physicsProps.add(entity, { 
            friction: template.friction, 
            restitution: template.restitution,
            density: density
        });
    }

    // 9. Handle Post-Spawn Scaling
    if (options?.scale && options.scale !== 1) {
        const t = entityMgr.world.transforms.get(entity);
        const def = entityMgr.world.bodyDefs.get(entity);
        const rb = entityMgr.world.rigidBodies.get(entity);
        if (t && def && rb) {
            t.scale = { x: options.scale, y: options.scale, z: options.scale };
            this.shapesFactory.updateBodyScale(rb.handle, def, t.scale);
        }
    }

    return entity;
  }
}
