
import { Injectable, inject } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsWorldService } from '../physics/world.service';
import { PhysicsMaterialsService } from '../physics/physics-materials.service';
import { ShapesFactory } from '../physics/shapes.factory';
import { PhysicsInteractionService } from '../physics/physics-interaction.service';

// Re-export type for compatibility
export interface PhysicsBodyDef {
  handle: number;
  type: 'box' | 'sphere' | 'cylinder' | 'capsule' | 'cone' | 'trimesh' | 'convex-hull';
  position: { x: number, y: number, z: number };
  rotation: { x: number, y: number, z: number, w: number };
  size?: { w: number, h: number, d: number };
  radius?: number;
  height?: number;
  mass?: number;
  lockRotation?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PhysicsService {
  private worldService = inject(PhysicsWorldService);
  private materialsService = inject(PhysicsMaterialsService);
  private shapesFactory = inject(ShapesFactory);
  private interactionService = inject(PhysicsInteractionService);

  // Events
  public collision$ = this.worldService.collision$;

  get rWorld(): RAPIER.World | null {
      return this.worldService.rWorld;
  }

  async init(): Promise<void> {
    await this.worldService.init();
    this.interactionService.init();
  }

  step(dtMs: number): void {
    this.worldService.step(dtMs);
  }

  setGravity(y: number) {
    this.worldService.setGravity(y);
  }

  resetWorld() {
    this.interactionService.reset();
    this.worldService.resetWorld();
    this.interactionService.init(); // Re-init hand
  }

  registerEntity(handle: number, entityId: number) {
    this.worldService.registerEntity(handle, entityId);
  }

  unregisterEntity(handle: number) {
    this.worldService.unregisterEntity(handle);
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

  getDebugBuffers() {
    return this.worldService.getDebugBuffers();
  }

  // --- Interaction API Delegates ---

  grabBody(handle: number, position: { x: number, y: number, z: number }) {
    this.interactionService.startGrab(handle, position);
  }

  moveGrabbed(position: { x: number, y: number, z: number }) {
    this.interactionService.moveHand(position);
  }

  releaseGrab() {
    this.interactionService.endGrab();
  }
}
