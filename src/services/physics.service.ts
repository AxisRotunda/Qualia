
import { Injectable, inject } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsWorldService } from '../physics/world.service';
import { PhysicsMaterialsService } from '../physics/physics-materials.service';
import { ShapesFactory } from '../physics/shapes.factory';

// Re-export type for compatibility
export interface PhysicsBodyDef {
  handle: number;
  type: 'box' | 'sphere' | 'cylinder' | 'capsule';
  position: { x: number, y: number, z: number };
  rotation: { x: number, y: number, z: number, w: number };
  size?: { w: number, h: number, d: number };
  radius?: number;
  height?: number;
  mass?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PhysicsService {
  private worldService = inject(PhysicsWorldService);
  private materialsService = inject(PhysicsMaterialsService);
  private shapesFactory = inject(ShapesFactory);

  get rWorld(): RAPIER.World | null {
      return this.worldService.rWorld;
  }

  async init(): Promise<void> {
    await this.worldService.init();
  }

  step(): void {
    this.worldService.step();
  }

  setGravity(y: number) {
    this.worldService.setGravity(y);
  }

  resetWorld() {
    this.worldService.resetWorld();
  }

  getBodyPose(handle: number) {
    return this.worldService.getBodyPose(handle);
  }

  updateBodyTransform(handle: number, position: { x: number, y: number, z: number }, rotation?: { x: number, y: number, z: number, w: number }) {
    this.worldService.updateBodyTransform(handle, position, rotation);
  }

  updateBodyMaterial(handle: number, props: { friction: number, restitution: number }) {
    this.materialsService.updateBodyMaterial(handle, props);
  }

  updateBodyScale(handle: number, def: PhysicsBodyDef, scale: { x: number, y: number, z: number }) {
    this.shapesFactory.updateBodyScale(handle, def, scale);
  }

  removeBody(handle: number) {
    this.worldService.removeBody(handle);
  }
}
