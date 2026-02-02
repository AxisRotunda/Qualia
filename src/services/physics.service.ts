
import { Injectable, inject } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsWorldService } from '../physics/world.service';
import { PhysicsMaterialsService } from '../physics/physics-materials.service';
import { ShapesFactory } from '../physics/shapes.factory';
import { PhysicsInteractionService } from '../physics/physics-interaction.service';
import { PhysicsRegistryService } from '../physics/physics-registry.service';
import { PhysicsOptimizerService } from '../physics/optimization/physics-optimizer.service';
import { PhysicsBodyDef, RigidBodyType } from '../engine/schema';

export { PhysicsBodyDef, RigidBodyType } from '../engine/schema';

@Injectable({
  providedIn: 'root'
})
export class PhysicsService {
  // Public Aggregation
  public readonly world = inject(PhysicsWorldService);
  public readonly registry = inject(PhysicsRegistryService);
  public readonly materials = inject(PhysicsMaterialsService);
  public readonly shapes = inject(ShapesFactory);
  public readonly interaction = inject(PhysicsInteractionService);
  public readonly optimizer = inject(PhysicsOptimizerService);

  // Events
  public collision$ = this.world.collision$;

  get rWorld(): RAPIER.World | null {
      return this.world.rWorld;
  }

  async init(): Promise<void> {
    await this.world.init();
    this.interaction.init();
  }
  
  setGravity(y: number) {
    this.world.setGravity(y);
  }

  /**
   * Complete reset of the physics simulation.
   * Delegates to subsystems in correct order to prevent memory access violations.
   */
  resetWorld() {
    // 1. Clear interaction constraints (Joints)
    this.interaction.reset();
    
    // 2. Clear world bodies
    this.world.resetWorld();
    
    // 3. Re-init essential kinematic actors (Hand)
    this.interaction.init(); 
  }
}
