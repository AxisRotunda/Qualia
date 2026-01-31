
import * as THREE from 'three';

export interface MaterialDef {
    id: string;
    type: 'standard' | 'physical';
    props: any;
    mapId?: string;
    normalMapId?: string; 
    displacementMapId?: string; 
}

export const MATERIAL_DEFINITIONS: MaterialDef[] = [
    // Standards
    { 
        id: 'mat-concrete', 
        type: 'standard', 
        props: { 
            color: 0x8c8c8c, // Darker cured concrete
            roughness: 0.9, 
            metalness: 0.1 
        }, 
        mapId: 'tex-concrete-base', 
        normalMapId: 'tex-concrete-normal' 
    },
    { id: 'mat-dark-metal', type: 'standard', props: { color: 0x1e293b, roughness: 0.4, metalness: 0.95 }, mapId: 'tex-metal-scratched', normalMapId: 'tex-metal-normal' },
    { id: 'mat-metal', type: 'standard', props: { color: 0x64748b, roughness: 0.3, metalness: 0.9 }, mapId: 'tex-metal-scratched', normalMapId: 'tex-metal-normal' },
    
    { id: 'mat-asphalt', type: 'standard', props: { color: 0x18181b, roughness: 0.95, metalness: 0.0 }, mapId: 'tex-concrete-base', normalMapId: 'tex-concrete-normal' },
    { id: 'mat-pavement', type: 'standard', props: { color: 0xa1a1aa, roughness: 0.8, metalness: 0.0 }, mapId: 'tex-concrete-base', normalMapId: 'tex-concrete-normal' },
    { id: 'mat-curb', type: 'standard', props: { color: 0x71717a, roughness: 0.7, metalness: 0.0 }, mapId: 'tex-concrete-base' },
    
    // Nature
    { id: 'mat-wood', type: 'standard', props: { color: 0x5D4037, roughness: 0.8, metalness: 0.0 }, mapId: 'tex-bark', normalMapId: 'tex-bark-normal' },
    { id: 'mat-forest', type: 'standard', props: { color: 0x1a2f1a, roughness: 0.9, metalness: 0.0 }, mapId: 'tex-leaf' }, 
    { id: 'mat-dirt', type: 'standard', props: { color: 0x3e2723, roughness: 1.0, metalness: 0.0 }, mapId: 'tex-rock' }, 
    { id: 'mat-sand', type: 'standard', props: { color: 0xd4b996, roughness: 1.0, metalness: 0.0 }, mapId: 'tex-sand' },
    { id: 'mat-sandstone', type: 'standard', props: { color: 0xa67c52, roughness: 0.9, metalness: 0.0 }, mapId: 'tex-rock', normalMapId: 'tex-rock-normal' },
    { id: 'mat-palm-bark', type: 'standard', props: { color: 0x4e342e, roughness: 0.8, metalness: 0.0 }, mapId: 'tex-bark', normalMapId: 'tex-bark-normal' },
    { id: 'mat-palm-leaf', type: 'standard', props: { color: 0x334d2b, roughness: 0.6, metalness: 0.0, side: THREE.DoubleSide }, mapId: 'tex-leaf' },

    { id: 'mat-snow', type: 'standard', props: { color: 0xf1f5f9, roughness: 0.8, metalness: 0.1 }, mapId: 'tex-snow' },
    { id: 'mat-bark', type: 'standard', props: { color: 0x2d2420, roughness: 1.0, metalness: 0.0 }, mapId: 'tex-bark', normalMapId: 'tex-bark-normal' },
    { id: 'mat-leaf', type: 'standard', props: { color: 0x334d2b, roughness: 0.7, metalness: 0.0, side: THREE.DoubleSide }, mapId: 'tex-leaf' },
    { id: 'mat-rock', type: 'standard', props: { color: 0x57534e, roughness: 0.9, metalness: 0.0 }, mapId: 'tex-rock', normalMapId: 'tex-rock-normal' },
    
    // Sci-Fi / Tech
    { id: 'mat-tech-hull', type: 'standard', props: { color: 0x0f172a, roughness: 0.5, metalness: 0.7 }, mapId: 'tex-metal-scratched', normalMapId: 'tex-metal-normal' },
    { id: 'mat-tech-orange', type: 'standard', props: { color: 0xea580c, roughness: 0.4, metalness: 0.2 } },
    { id: 'mat-tech-floor', type: 'standard', props: { color: 0x1e293b, roughness: 0.5, metalness: 0.4 }, mapId: 'tex-station-floor' },
    { id: 'mat-tech-dark', type: 'standard', props: { color: 0x020617, roughness: 0.4, metalness: 0.3 } },
    { id: 'mat-scifi-panel-dark', type: 'standard', props: { color: 0x0f172a, roughness: 0.3, metalness: 0.7 }, mapId: 'tex-scifi-panel' },
    { id: 'mat-scifi-panel-light', type: 'standard', props: { color: 0x64748b, roughness: 0.4, metalness: 0.6 } },
    { id: 'mat-scifi-floor', type: 'standard', props: { color: 0x09090b, roughness: 0.5, metalness: 0.3 }, mapId: 'tex-hex-floor' },
    
    // Glows
    { id: 'mat-glow-blue', type: 'standard', props: { color: 0x0ea5e9, emissive: 0x0ea5e9, emissiveIntensity: 3.0, toneMapped: false } },
    { id: 'mat-glow-orange', type: 'standard', props: { color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 3.0, toneMapped: false } },
    { id: 'mat-glow-white', type: 'standard', props: { color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 3.0, toneMapped: false } },
    
    // Interior
    { id: 'mat-carpet-red', type: 'standard', props: { color: 0x7f1d1d, roughness: 1.0, metalness: 0.0 }, mapId: 'tex-carpet' },
    { id: 'mat-wall-cream', type: 'standard', props: { color: 0xfefce8, roughness: 0.9, metalness: 0.0 } },
    { id: 'mat-fabric-gray', type: 'standard', props: { color: 0x334155, roughness: 1.0, metalness: 0.0 }, mapId: 'tex-fabric-gray' },
    { id: 'mat-stone-dark', type: 'standard', props: { color: 0x1e293b, roughness: 0.9, metalness: 0.0 }, mapId: 'tex-rock', normalMapId: 'tex-rock-normal' },
    { id: 'mat-hazard', type: 'standard', props: { color: 0xeab308, roughness: 0.6, metalness: 0.1 } },
    
    // REALISTIC GROUND with Displacement
    { 
        id: 'mat-ground', 
        type: 'standard', 
        props: { 
            color: 0x78716c, 
            roughness: 0.85, 
            metalness: 0.0,
            displacementScale: 0.1, 
            displacementBias: -0.05
        }, 
        mapId: 'tex-concrete-base', 
        displacementMapId: 'tex-concrete-displacement' 
    },
    
    { id: 'mat-default', type: 'standard', props: { color: 0x94a3b8, roughness: 0.5, metalness: 0.0 } },
    
    // Office
    { id: 'mat-plastic-black', type: 'standard', props: { color: 0x0a0a0a, roughness: 0.4, metalness: 0.0 } },
    { id: 'mat-plastic-beige', type: 'standard', props: { color: 0xd6d3d1, roughness: 0.5, metalness: 0.0 } },
    { id: 'mat-cabinet-metal', type: 'standard', props: { color: 0x475569, roughness: 0.3, metalness: 0.7 }, mapId: 'tex-metal-scratched', normalMapId: 'tex-metal-normal' },
    { id: 'mat-linoleum', type: 'standard', props: { color: 0x334155, roughness: 0.5, metalness: 0.1 }, mapId: 'tex-linoleum' },
    { id: 'mat-desk-top', type: 'standard', props: { color: 0xf1f5f9, roughness: 0.2, metalness: 0.0 } },

    // Physical
    { id: 'mat-void', type: 'physical', props: { color: 0x000000, roughness: 0.1, metalness: 0.5, clearcoat: 1.0, emissive: 0x000000 } },
    { id: 'mat-glass', type: 'physical', props: { color: 0x0f172a, roughness: 0.0, metalness: 0.9, transmission: 0.0, opacity: 1.0, clearcoat: 1.0, reflectivity: 1.0, ior: 1.5 } },
    { id: 'mat-gold', type: 'standard', props: { color: 0xffd700, roughness: 0.2, metalness: 1.0 } },
];
