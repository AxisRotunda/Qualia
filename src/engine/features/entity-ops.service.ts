
import { Injectable, inject } from '@angular/core';
import { EntityStoreService } from '../ecs/entity-store.service';
import { EntityAssemblerService } from '../ecs/entity-assembler.service';
import { PhysicsService } from '../../services/physics.service';
import { Entity } from '../core';

@Injectable({
  providedIn: 'root'
})
export class EntityOpsService {
  private store = inject(EntityStoreService);
  private assembler = inject(EntityAssemblerService);
  private physics = inject(PhysicsService);

  deleteEntity(e: Entity) {
    this.assembler.destroyEntity(e);
  }

  duplicateEntity(e: Entity) {
    this.assembler.duplicateEntity(e);
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
