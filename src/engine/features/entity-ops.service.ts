
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EntityStoreService } from '../ecs/entity-store.service';
import { EntityAssemblerService } from '../ecs/entity-assembler.service';
import { PhysicsService } from '../../services/physics.service';
import { PhysicsFactoryService } from '../../services/factories/physics-factory.service';
import { EntityLibraryService } from '../../services/entity-library.service';
import { Entity } from '../core';

@Injectable({
  providedIn: 'root'
})
export class EntityOpsService {
  private store = inject(EntityStoreService);
  private assembler = inject(EntityAssemblerService);
  private physics = inject(PhysicsService);
  private physicsFactory = inject(PhysicsFactoryService);
  private entityLib = inject(EntityLibraryService);

  deleteEntity(e: Entity) {
    this.assembler.destroyEntity(e);
  }

  duplicateEntity(e: Entity) {
      const world = this.store.world;
      const t = world.transforms.get(e);
      const oldDef = world.bodyDefs.get(e);
      const meshRef = world.meshes.get(e);
      const name = world.names.get(e) || 'Object';
      const tplId = world.templateIds.get(e);

      if (!t || !oldDef || !meshRef) return;

      // 1. Calculate New Transform (Offset by 1 unit)
      const newPos = { x: t.position.x + 1, y: t.position.y, z: t.position.z };
      
      // 2. Recreate Physics Body Def (Cloned)
      const bodyDef = this.physicsFactory.recreateBody(oldDef, newPos.x, newPos.y, newPos.z);
      
      // 2a. Apply Scale to new Body Def
      this.physics.shapes.updateBodyScale(bodyDef.handle, bodyDef, t.scale);
      
      // 2b. Sync Rotation to new Body (recreateBody defaults to identity)
      bodyDef.rotation = { ...t.rotation };
      this.physics.world.updateBodyTransform(bodyDef.handle, newPos, t.rotation);

      // 3. Extract Visual Options
      const mat = (meshRef.mesh as any).material;
      const visualOpts = {
          color: mat?.color?.getHex(),
          materialId: mat?.userData ? mat.userData['mapId'] : undefined,
          // Lookup meshId from template if available to ensure correct geometry instancing
          meshId: tplId ? this.entityLib.getTemplate(tplId)?.meshId : undefined
      };
      
      // 4. Assemble New Entity
      const newEntity = this.assembler.createEntityFromDef(bodyDef, visualOpts, `${name}_copy`, tplId);
      
      // 5. Apply Scale to ECS Transform (Assembler defaults to 1,1,1)
      world.transforms.setScale(newEntity, t.scale.x, t.scale.y, t.scale.z);
      
      // 6. Copy Physics Material Properties
      const oldProps = world.physicsProps.get(e);
      if (oldProps) {
          world.physicsProps.add(newEntity, { ...oldProps });
          this.physics.materials.updateBodyMaterial(bodyDef.handle, oldProps);
      }
  }

  getEntityName(e: Entity): string {
    return this.store.world.names.get(e) ?? `Entity_${e}`;
  }

  setEntityName(e: Entity, name: string) {
    this.store.world.names.add(e, name);
  }

  updateEntityPhysics(e: Entity, props: { friction: number, restitution: number }) {
    // Clamp values for safety
    const safe = { 
        friction: Math.max(0, Math.min(props.friction, 5)), 
        restitution: Math.max(0, Math.min(props.restitution, 2)) 
    };
    
    // Update Physics Engine
    const rb = this.store.world.rigidBodies.get(e);
    if (rb) {
        this.physics.materials.updateBodyMaterial(rb.handle, safe);
    }
    
    // Update ECS Data
    this.store.world.physicsProps.add(e, safe);
  }
}
