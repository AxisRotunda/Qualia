
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EntityManager } from '../engine/entity-manager.service';
import { MaterialService } from './material.service';
import { PhysicsFactoryService } from './factories/physics-factory.service';
import { PhysicsService } from './physics.service';
import { Entity } from '../engine/core';
import { ENTITY_TEMPLATES, EntityTemplate } from '../data/entity-templates';

@Injectable({
  providedIn: 'root'
})
export class EntityLibraryService {
  private physicsFactory = inject(PhysicsFactoryService);
  private physics = inject(PhysicsService);
  
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

    let bodyDef;
    if (tpl.geometry === 'mesh') {
        if (tpl.physicsShape === 'capsule' || tpl.physicsShape === 'cylinder') {
             bodyDef = this.physicsFactory.createCylinder(position.x, position.y + (tpl.size.y/2), position.z, tpl.size.y, tpl.size.x, tpl.mass);
        } else if (tpl.physicsShape === 'sphere') {
             bodyDef = this.physicsFactory.createSphere(position.x, position.y, position.z, tpl.size.x, tpl.mass);
        } else {
             bodyDef = this.physicsFactory.createBox(position.x, position.y, position.z, 1, 1, 1, tpl.mass);
        }
    } else {
        if (tpl.geometry === 'box') {
          bodyDef = this.physicsFactory.createBox(position.x, position.y, position.z, tpl.size.x, tpl.size.y, tpl.size.z, tpl.mass);
        } else if (tpl.geometry === 'cylinder') {
          bodyDef = this.physicsFactory.createCylinder(position.x, position.y, position.z, tpl.size.y, tpl.size.x, tpl.mass);
        } else {
          bodyDef = this.physicsFactory.createSphere(position.x, position.y, position.z, tpl.size.x, tpl.mass);
        }
    }

    if (rotation) {
        this.physics.updateBodyTransform(bodyDef.handle, bodyDef.position, {x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w});
        bodyDef.rotation = {x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w};
    }

    this.physics.updateBodyMaterial(bodyDef.handle, { friction: tpl.friction, restitution: tpl.restitution });

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
