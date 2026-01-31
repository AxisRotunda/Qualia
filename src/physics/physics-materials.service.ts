
import { Injectable, inject } from '@angular/core';
import { PhysicsWorldService } from './world.service';

export type PhysicsMaterialType = 'concrete' | 'wood' | 'metal' | 'plastic' | 'polystyrene' | 'ice' | 'rock' | 'basalt' | 'sandstone' | 'glass' | 'rubber' | 'titanium' | 'carbon-fiber' | 'default';

export interface MaterialData {
    density: number; // kg/m^3
    friction: number;
    restitution: number;
}

// Tuned for "Hard Realism"
// - Low restitution for heavy/hard objects (Rocks don't bounce)
// - High friction for rough surfaces
// - Accurate densities
export const PHYSICS_MATERIALS: Record<PhysicsMaterialType, MaterialData> = {
    'default': { density: 1000, friction: 0.5, restitution: 0.1 },
    'concrete': { density: 2400, friction: 0.8, restitution: 0.1 }, // Standard cured concrete
    'wood': { density: 700, friction: 0.7, restitution: 0.1 },
    'metal': { density: 7850, friction: 0.5, restitution: 0.25 }, // Steel (elastic, smooth)
    'plastic': { density: 950, friction: 0.5, restitution: 0.25 },
    'polystyrene': { density: 50, friction: 0.8, restitution: 0.5 },
    'ice': { density: 917, friction: 0.005, restitution: 0.05 }, // Near frictionless
    'rock': { density: 2700, friction: 0.9, restitution: 0.05 }, // Rough, heavy impact
    'basalt': { density: 3000, friction: 0.95, restitution: 0.02 },
    'sandstone': { density: 2200, friction: 1.0, restitution: 0.01 }, // Very abrasive
    'glass': { density: 2500, friction: 0.3, restitution: 0.15 },
    'rubber': { density: 1100, friction: 0.9, restitution: 0.7 }, // High energy return
    
    // Advanced Engineering Materials
    'titanium': { density: 4500, friction: 0.6, restitution: 0.3 }, // Lighter than steel, strong
    'carbon-fiber': { density: 1600, friction: 0.4, restitution: 0.2 } // Very light, rigid
};

@Injectable({ providedIn: 'root' })
export class PhysicsMaterialsService {
  private worldService = inject(PhysicsWorldService);

  getMaterialData(type: PhysicsMaterialType | string): MaterialData {
      return PHYSICS_MATERIALS[type as PhysicsMaterialType] || PHYSICS_MATERIALS['default'];
  }

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
