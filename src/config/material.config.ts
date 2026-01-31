
import * as THREE from 'three';

export interface MaterialDef {
    id: string;
    type: 'standard' | 'physical';
    props: any;
    mapId?: string;
    normalMapId?: string; 
    displacementMapId?: string;
    userData?: Record<string, any>;
}

export const MATERIAL_DEFINITIONS: MaterialDef[] = [
    // Safe Fallback
    {
        id: 'mat-default',
        type: 'standard',
        props: { color: 0x333333, roughness: 0.5, metalness: 0.0 }
    },

    // Standards
    { 
        id: 'mat-concrete', 
        type: 'standard', 
        props: { 
            color: 0x444444, // Further darkened from 0x555555
            roughness: 0.9, 
            metalness: 0.0 
        }, 
        mapId: 'tex-concrete-base', 
        normalMapId: 'tex-concrete-normal' 
    },
    { id: 'mat-dark-metal', type: 'standard', props: { color: 0x1e293b, roughness: 0.4, metalness: 1.0 }, mapId: 'tex-metal-scratched', normalMapId: 'tex-metal-normal' },
    { id: 'mat-metal', type: 'standard', props: { color: 0x94a3b8, roughness: 0.3, metalness: 1.0 }, mapId: 'tex-metal-scratched', normalMapId: 'tex-metal-normal' },
    
    // Road Surfaces
    { 
        id: 'mat-asphalt', 
        type: 'standard', 
        props: { 
            color: 0x1a1a1a, // Darker asphalt
            roughness: 0.7, 
            metalness: 0.0 
        }, 
        mapId: 'tex-concrete-base', 
        normalMapId: 'tex-concrete-normal' 
    },
    { id: 'mat-pavement', type: 'standard', props: { color: 0xaaaaaa, roughness: 0.8, metalness: 0.0 }, mapId: 'tex-concrete-base', normalMapId: 'tex-concrete-normal' },
    { id: 'mat-curb', type: 'standard', props: { color: 0x737373, roughness: 0.7, metalness: 0.0 }, mapId: 'tex-concrete-base' },
    
    // Architecture Special
    { 
        id: 'mat-city-window', 
        type: 'standard', 
        props: { 
            color: 0x050505, // Almost black base to look like dark glass
            roughness: 0.2,  
            metalness: 0.9,  
            emissive: 0x000000, 
            emissiveIntensity: 0.0 
        },
        mapId: 'tex-city-window',
        normalMapId: 'tex-city-window-normal',
        userData: { textureTarget: 'emissive' } 
    },
    { 
        id: 'mat-city-window-lit', 
        type: 'standard', 
        props: { 
            color: 0xffffff, 
            roughness: 0.2, 
            metalness: 0.5,
            emissive: 0xffeebb, 
            emissiveIntensity: 1.5 
        } 
    },

    // Nature
    { id: 'mat-wood', type: 'standard', props: { color: 0x5D4037, roughness: 0.8, metalness: 0.0 }, mapId: 'tex-bark', normalMapId: 'tex-bark-normal' },
    { id: 'mat-forest', type: 'standard', props: { color: 0x1a2f1a, roughness: 0.9, metalness: 0.0 }, mapId: 'tex-leaf' }, 
    { id: 'mat-dirt', type: 'standard', props: { color: 0x3e2723, roughness: 1.0, metalness: 0.0 } },
    { id: 'mat-leaf', type: 'standard', props: { color: 0x2f5c35, roughness: 0.8, metalness: 0.0, side: THREE.DoubleSide }, mapId: 'tex-leaf' },
    { id: 'mat-rock', type: 'standard', props: { color: 0x64748b, roughness: 0.9, metalness: 0.0 }, mapId: 'tex-rock', normalMapId: 'tex-rock-normal' },
    { id: 'mat-sandstone', type: 'standard', props: { color: 0xd6b483, roughness: 1.0, metalness: 0.0 }, mapId: 'tex-rock', normalMapId: 'tex-rock-normal' },
    { id: 'mat-sand', type: 'standard', props: { color: 0xe6c288, roughness: 1.0, metalness: 0.0 }, mapId: 'tex-sand' },
    { id: 'mat-snow', type: 'standard', props: { color: 0xf1f5f9, roughness: 0.6, metalness: 0.1 }, mapId: 'tex-snow' },
    
    // Sci-Fi
    { id: 'mat-scifi-panel-dark', type: 'standard', props: { color: 0x27272a, roughness: 0.4, metalness: 0.8 }, mapId: 'tex-scifi-panel' },
    { id: 'mat-scifi-floor', type: 'standard', props: { color: 0x18181b, roughness: 0.5, metalness: 0.6 }, mapId: 'tex-hex-floor' },
    { id: 'mat-hazard', type: 'standard', props: { color: 0xfacc15, roughness: 0.6, metalness: 0.4 } }, // Yellow
    { id: 'mat-void', type: 'standard', props: { color: 0x000000, roughness: 0.0, metalness: 0.0 } },
    
    // Tech / Station
    { id: 'mat-tech-hull', type: 'standard', props: { color: 0xd4d4d8, roughness: 0.5, metalness: 0.7 }, mapId: 'tex-metal-scratched', normalMapId: 'tex-metal-normal' },
    { id: 'mat-tech-floor', type: 'standard', props: { color: 0x3f3f46, roughness: 0.6, metalness: 0.5 }, mapId: 'tex-station-floor' },
    { id: 'mat-tech-dark', type: 'standard', props: { color: 0x18181b, roughness: 0.4, metalness: 0.8 }, mapId: 'tex-metal-scratched' },
    { 
        id: 'mat-tech-orange', 
        type: 'standard', 
        props: { 
            color: 0xf97316, 
            roughness: 0.4, 
            metalness: 0.2, 
            emissive: 0xc2410c, 
            emissiveIntensity: 0.5 
        }
    },

    // Interior
    { id: 'mat-marble', type: 'standard', props: { color: 0xffffff, roughness: 0.1, metalness: 0.0 }, mapId: 'tex-marble' },
    { id: 'mat-fabric-gray', type: 'standard', props: { color: 0x475569, roughness: 1.0, metalness: 0.0 }, mapId: 'tex-fabric-gray' },
    { id: 'mat-gold', type: 'standard', props: { color: 0xffd700, roughness: 0.2, metalness: 1.0 } },
    { id: 'mat-glass', type: 'physical', props: { color: 0xffffff, roughness: 0.0, metalness: 0.0, transmission: 0.95, thickness: 0.5 } },
    { id: 'mat-wall-cream', type: 'standard', props: { color: 0xfefce8, roughness: 0.9, metalness: 0.0 } },
    { id: 'mat-carpet-red', type: 'standard', props: { color: 0x7f1d1d, roughness: 1.0, metalness: 0.0 }, mapId: 'tex-carpet' },
    { id: 'mat-plastic-black', type: 'standard', props: { color: 0x111111, roughness: 0.5, metalness: 0.0 } },
    { id: 'mat-plastic-beige', type: 'standard', props: { color: 0xf5f5dc, roughness: 0.5, metalness: 0.0 } },
    { id: 'mat-cabinet-metal', type: 'standard', props: { color: 0x94a3b8, roughness: 0.4, metalness: 0.6 } },
    { id: 'mat-desk-top', type: 'standard', props: { color: 0x3f2e26, roughness: 0.6, metalness: 0.0 } }, // Wood
    { id: 'mat-linoleum', type: 'standard', props: { color: 0x334155, roughness: 0.4, metalness: 0.0 }, mapId: 'tex-linoleum' },

    // Glows
    { id: 'mat-glow-blue', type: 'standard', props: { color: 0x0ea5e9, emissive: 0x0ea5e9, emissiveIntensity: 2.0, toneMapped: false } },
    { id: 'mat-glow-orange', type: 'standard', props: { color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 2.0, toneMapped: false } },
    { id: 'mat-glow-white', type: 'standard', props: { color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.0, toneMapped: false } },
];