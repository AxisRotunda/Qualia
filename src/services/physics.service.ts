
import { Injectable, inject } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsWorldService } from '../physics/world.service';
import { PhysicsMaterialsService } from '../physics/physics-materials.service';
import { ShapesFactory } from '../physics/shapes.factory';
import { PhysicsInteractionService } from '../physics/physics-interaction.service';
import { PhysicsRegistryService } from '../physics/physics-registry.service';
import { PhysicsBodyDef } from '../engine/schema';

export { PhysicsBodyDef } from '../engine/schema';

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

  resetWorld() {
    this.interaction.reset();
    this.world.resetWorld();
    this.interaction.init(); 
  }
}
