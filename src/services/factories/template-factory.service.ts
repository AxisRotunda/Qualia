
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EntityAssemblerService, EntityMetadata } from '../../engine/ecs/entity-assembler.service';
import { EntityStoreService } from '../../engine/ecs/entity-store.service';
import { PhysicsFactoryService } from './physics-factory.service';
import { PhysicsService } from '../physics.service';
import { AssetService } from '../asset.service';
import { EntityLibraryService } from '../../engine/features/entity-library.service';
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

  spawn(
      entityMgr: EntityStoreService, 
      template: any, 
      position: THREE.Vector3, 
      rotation?: THREE.Quaternion, 
      options?: SpawnOptions
  ): Entity {
    const scale = options?.scale ?? 1;
    const spawnPos = position.clone();
    
    if (options?.alignToBottom) {
        spawnPos.y += ((template.size.y * scale) / 2) + 0.005;
    }

    let geometry: THREE.BufferGeometry | undefined;
    if (template.geometry === 'mesh' && template.meshId) {
        if (template.physicsShape === 'convex-hull' || template.physicsShape === 'trimesh') {
             geometry = this.assetService.getGeometry(template.meshId);
        }
    }

    const bodyDef = this.physicsFactory.createFromTemplate(template, spawnPos.x, spawnPos.y, spawnPos.z, geometry, scale);

    if (rotation) {
        this.physics.world.updateBodyTransform(bodyDef.handle, bodyDef.position, {x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w});
        bodyDef.rotation = {x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w};
    }

    this.physics.materials.updateBodyMaterial(bodyDef.handle, { friction: template.friction, restitution: template.restitution });
    if (template.lockRotation) this.physics.shapes.setLockRotation(bodyDef.handle, true);

    const isStatic = !(template.mass > 0 || template.tags.includes('dynamic') || template.tags.includes('hero') || template.tags.includes('vehicle'));

    const meta: EntityMetadata = {
        name: template.label,
        templateId: template.id,
        category: template.category,
        tags: template.tags,
        isStatic
    };

    const entity = this.assembler.createEntityFromDef(bodyDef, { color: template.color, materialId: template.materialId, meshId: template.meshId }, meta);
    if (scale !== 1) {
        entityMgr.world.transforms.setScale(entity, scale, scale, scale);
        const meshRef = entityMgr.world.meshes.get(entity);
        if (meshRef) meshRef.mesh.scale.set(scale, scale, scale);
    }

    let density = 1000;
    if (template.physicsMaterial) {
        const matData = this.physics.materials.getMaterialData(template.physicsMaterial);
        density = matData.density;
    }

    entityMgr.world.physicsProps.add(entity, { 
        friction: template.friction, 
        restitution: template.restitution,
        density: density,
        materialType: template.physicsMaterial
    });

    return entity;
  }
}
