
export type PhysicsMaterialType = 'concrete' | 'wood' | 'metal' | 'plastic' | 'polystyrene' | 'ice' | 'rock' | 'basalt' | 'sandstone' | 'glass' | 'rubber' | 'titanium' | 'carbon-fiber' | 'lead' | 'aerogel' | 'default';

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
    'concrete': { density: 2400, friction: 0.8, restitution: 0.05 }, // Standard cured concrete. Low bounce.
    'wood': { density: 700, friction: 0.7, restitution: 0.1 },
    'metal': { density: 7850, friction: 0.6, restitution: 0.15 }, // Steel. Slightly elastic but heavy.
    'plastic': { density: 950, friction: 0.5, restitution: 0.2 },
    'polystyrene': { density: 50, friction: 0.8, restitution: 0.4 },
    'ice': { density: 917, friction: 0.005, restitution: 0.05 }, // Near frictionless
    'rock': { density: 2700, friction: 0.9, restitution: 0.02 }, // Rough, heavy impact. Almost no bounce.
    'basalt': { density: 3000, friction: 0.95, restitution: 0.01 },
    'sandstone': { density: 2200, friction: 1.0, restitution: 0.01 }, // Very abrasive
    'glass': { density: 2500, friction: 0.3, restitution: 0.15 },
    'rubber': { density: 1100, friction: 0.9, restitution: 0.65 }, // High energy return
    
    // Advanced Engineering Materials
    'titanium': { density: 4500, friction: 0.6, restitution: 0.2 },
    'carbon-fiber': { density: 1600, friction: 0.4, restitution: 0.2 },

    // Extremes
    'lead': { density: 11340, friction: 0.4, restitution: 0.02 }, // Dead weight
    'aerogel': { density: 2, friction: 0.1, restitution: 0.1 } // Ultralight
};
