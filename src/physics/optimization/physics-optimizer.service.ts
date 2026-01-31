
import { Injectable } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';

// Collision Bitmasks (16-bit)
export const CG = {
  NONE:      0x0000,
  STATIC:    0x0001, // Walls, Floor, Terrain
  DYNAMIC:   0x0002, // Props, Crates
  PLAYER:    0x0004, // Character Controller
  SENSOR:    0x0008, // Triggers
  DEBRIS:    0x0010, // Small particles, performance heavy
  ALL:       0xFFFF
};

export interface OptimizerConfig {
  groups: number; // Membership | Filter
  events: RAPIER.ActiveEvents;
  solverGroups?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PhysicsOptimizerService {

  getConfig(tags: string[], isStatic: boolean): OptimizerConfig {
    let membership = isStatic ? CG.STATIC : CG.DYNAMIC;
    let filter = CG.ALL;
    let events = RAPIER.ActiveEvents.NONE;

    // 1. Determine Membership
    if (tags.includes('player')) {
      membership = CG.PLAYER;
    } else if (tags.includes('debris')) {
      membership = CG.DEBRIS;
      // Optimization: Debris does NOT collide with other Debris or Sensors
      filter = CG.STATIC | CG.DYNAMIC | CG.PLAYER; 
    } else if (tags.includes('sensor')) {
      membership = CG.SENSOR;
      filter = CG.PLAYER | CG.DYNAMIC; // Sensors usually only care about active actors
    }

    // 2. Event Filtering
    // Only generate collision events for logic-heavy entities
    if (tags.includes('hero') || tags.includes('sensor') || tags.includes('interactable') || tags.includes('trigger')) {
        events = RAPIER.ActiveEvents.COLLISION_EVENTS;
    }

    // 3. Construct Rapier Interaction Group
    // [High 16: Membership] [Low 16: Filter]
    const interactionGroups = (membership << 16) | filter;

    return {
      groups: interactionGroups,
      events: events
    };
  }

  /**
   * Applies optimization settings to a collider description
   */
  applyTo(desc: RAPIER.ColliderDesc, tags: string[], isStatic: boolean) {
    const config = this.getConfig(tags, isStatic);
    desc.setCollisionGroups(config.groups);
    desc.setActiveEvents(config.events);
    return desc;
  }
}
