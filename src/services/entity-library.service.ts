
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EntityManager } from '../engine/entity-manager.service';
import { MaterialService } from './material.service';
import { PhysicsFactoryService } from './factories/physics-factory.service';
import { PhysicsService } from './physics.service';
import { AssetService } from './asset.service';
import { Entity } from '../engine/core';
import { ENTITY_TEMPLATES } from '../data/entity-templates';
import { EntityTemplate } from '../data/entity-types';
import { ShapesFactory } from '../physics/shapes.factory';

@Injectable({
  providedIn: 'root'
})
export class EntityLibraryService {
  private physicsFactory = inject(PhysicsFactoryService);
  private physics = inject(PhysicsService);
  private assetService = inject(AssetService);
  private shapesFactory = inject(ShapesFactory);
  
  readonly templates: EntityTemplate[] = ENTITY_TEMPLATES;

  validateTemplates(matService: MaterialService) {
    this.templates.forEach(tpl => {
      if (tpl.materialId && !matService.hasMaterial(tpl.materialId)) {
        console.warn(`[Validation Warning] Template '${tpl.id}' references missing material '${tpl.materialId}'`);
      }
    });
  }

  // Uses EntityManager to spawn
  spawnFromTemplate(entityMgr: EntityManager, templateId: string, position: THREE.Vector3, rotation?: THREE.Quaternion): Entity {
    const tpl = this.templates.find(t => t.id === templateId);
    if (!tpl) throw new Error(`Template ${templateId} not found`);

    // Fetch geometry if needed for advanced physics hulls
    let geometry: THREE.BufferGeometry | undefined;
    if (tpl.geometry === 'mesh' && tpl.meshId) {
        if (tpl.physicsShape === 'convex-hull' || tpl.physicsShape === 'trimesh') {
             geometry = this.assetService.getGeometry(tpl.meshId);
        }
    }

    // Use Factory for body creation
    const bodyDef = this.physicsFactory.createFromTemplate(tpl, position.x, position.y, position.z, geometry);

    // Apply Rotation
    if (rotation) {
        this.physics.updateBodyTransform(bodyDef.handle, bodyDef.position, {x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w});
        bodyDef.rotation = {x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w};
    }

    // Apply Material Props
    this.physics.updateBodyMaterial(bodyDef.handle, { friction: tpl.friction, restitution: tpl.restitution });

    // Apply Lock Rotation if specified
    if (tpl.lockRotation) {
        this.shapesFactory.setLockRotation(bodyDef.handle, true);
    }

    // Use EntityManager to complete the spawn
    const entity = entityMgr.createEntityFromDef(bodyDef, { 
        color: tpl.color, 
        materialId: tpl.materialId, 
        meshId: tpl.meshId 
    }, tpl.label, tpl.id);

    // Apply template properties
    entityMgr.world.physicsProps.add(entity, { friction: tpl.friction, restitution: tpl.restitution });

    return entity;
  }
}
