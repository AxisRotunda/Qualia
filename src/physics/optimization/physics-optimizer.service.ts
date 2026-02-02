
import { Injectable } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';

// Collision Bitmasks (16-bit)
export const CG = {
  NONE:       0x0000,
  STATIC:     0x0001, // Walls, Floor, Terrain
  DYNAMIC:    0x0002, // Props, Crates
  PLAYER:     0x0004, // Character Controller
  SENSOR:     0x0008, // Triggers
  DEBRIS:     0x0010, // Small particles
  PROJECTILE: 0x0020, // Bullets, bolts
  ALL:        0xFFFF
};

export interface RigidityConfig {
    linearDamping: number;
    angularDamping: number;
    canSleep: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PhysicsOptimizerService {

  // RUN_REF: Rigidity Presets for terrestrial stability.
  // Updated for Hard Realism: Increased linear damping to simulate air resistance.
  private readonly RIGIDITY_PRESETS: Record<string, RigidityConfig> = {
      'industrial': { linearDamping: 0.2, angularDamping: 0.8, canSleep: true },
      'debris':     { linearDamping: 0.5, angularDamping: 1.5, canSleep: true },
      'hero':       { linearDamping: 0.05, angularDamping: 0.1, canSleep: false },
      'projectile': { linearDamping: 0.0, angularDamping: 0.0, canSleep: false }, // Zero drag from physics, handled manually in CombatSystem
      'default':    { linearDamping: 0.1, angularDamping: 0.4, canSleep: true }
  };

  /**
   * Applies optimization settings directly to descriptors without intermediate object allocation.
   * RUN_OPT: Zero-Alloc implementation.
   */
  applyTo(desc: RAPIER.ColliderDesc, rbDesc: RAPIER.RigidBodyDesc, tags: string[], isStatic: boolean) {
    // 1. Resolve Collision Groups
    let membership = isStatic ? CG.STATIC : CG.DYNAMIC;
    let filter = CG.ALL;
    let events = RAPIER.ActiveEvents.NONE;

    if (tags.includes('player')) {
        membership = CG.PLAYER;
    } else if (tags.includes('debris')) {
        membership = CG.DEBRIS;
        filter = CG.STATIC | CG.DYNAMIC | CG.PLAYER; 
    } else if (tags.includes('projectile')) {
        membership = CG.PROJECTILE;
        // Projectiles hit everything EXCEPT Player and other Projectiles
        filter = CG.ALL & ~CG.PLAYER & ~CG.PROJECTILE;
        events = RAPIER.ActiveEvents.COLLISION_EVENTS; // Ensure impact callback fires
    }

    if (tags.includes('hero') || tags.includes('sensor')) {
        events = RAPIER.ActiveEvents.COLLISION_EVENTS;
    }

    const interactionGroups = (membership << 16) | filter;
    desc.setCollisionGroups(interactionGroups);
    desc.setActiveEvents(events);
    
    // 2. Resolve & Apply Rigidity (Only for dynamic bodies)
    if (!isStatic) {
        let rigidity = this.RIGIDITY_PRESETS['default'];
        if (tags.includes('projectile')) rigidity = this.RIGIDITY_PRESETS['projectile'];
        else if (tags.includes('heavy') || tags.includes('building')) rigidity = this.RIGIDITY_PRESETS['industrial'];
        else if (tags.includes('debris')) rigidity = this.RIGIDITY_PRESETS['debris'];
        else if (tags.includes('hero')) rigidity = this.RIGIDITY_PRESETS['hero'];

        rbDesc.setLinearDamping(rigidity.linearDamping)
              .setAngularDamping(rigidity.angularDamping)
              .setCanSleep(rigidity.canSleep);
              
        if (rigidity.canSleep) {
            rbDesc.setSleeping(false);
        }
    }
  }
}
