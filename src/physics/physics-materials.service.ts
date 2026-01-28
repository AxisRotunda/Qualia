
import { Injectable, inject } from '@angular/core';
import { PhysicsWorldService } from './world.service';

@Injectable({ providedIn: 'root' })
export class PhysicsMaterialsService {
  private worldService = inject(PhysicsWorldService);

  updateBodyMaterial(handle: number, props: { friction: number, restitution: number }) {
    const world = this.worldService.world;
    if (!world) return;
    
    const body = world.getRigidBody(handle);
    if (!body) return;

    for (let i = 0; i < body.numColliders(); i++) {
        const collider = body.collider(i);
        collider.setFriction(props.friction);
        collider.setRestitution(props.restitution);
    }
  }
}
