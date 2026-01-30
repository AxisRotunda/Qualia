
import * as THREE from 'three';

export interface MaterialDef {
    id: string;
    type: 'standard' | 'physical';
    props: any;
    mapId?: string;
}

export const MATERIAL_DEFINITIONS: MaterialDef[] = [
    // Standards
    { id: 'mat-concrete', type: 'standard', props: { color: 0xdddddd, roughness: 0.9, metalness: 0.1 }, mapId: 'tex-concrete' },
    { id: 'mat-dark-metal', type: 'standard', props: { color: 0x334155, roughness: 0.3, metalness: 0.9 } },
    { id: 'mat-metal', type: 'standard', props: { color: 0x94a3b8, roughness: 0.2, metalness: 0.9 }, mapId: 'tex-concrete' },
    { id: 'mat-asphalt', type: 'standard', props: { color: 0x202020, roughness: 0.95, metalness: 0.0 }, mapId: 'tex-concrete' },
    { id: 'mat-pavement', type: 'standard', props: { color: 0xd4d4d8, roughness: 0.8, metalness: 0.0 }, mapId: 'tex-concrete' },
    { id: 'mat-curb', type: 'standard', props: { color: 0x94a3b8, roughness: 0.7, metalness: 0.0 }, mapId: 'tex-concrete' },
    
    // Nature
    { id: 'mat-wood', type: 'standard', props: { color: 0x8B4513, roughness: 0.8, metalness: 0.0 }, mapId: 'tex-bark' },
    { id: 'mat-forest', type: 'standard', props: { color: 0x3d5a38, roughness: 0.8, metalness: 0.0 }, mapId: 'tex-leaf' },
    { id: 'mat-snow', type: 'standard', props: { color: 0xffffff, roughness: 0.9, metalness: 0.0 }, mapId: 'tex-snow' },
    { id: 'mat-bark', type: 'standard', props: { color: 0x5c4033, roughness: 0.9, metalness: 0.0 }, mapId: 'tex-bark' },
    { id: 'mat-leaf', type: 'standard', props: { color: 0x4ade80, roughness: 0.8, metalness: 0.0 }, mapId: 'tex-leaf' },
    { id: 'mat-rock', type: 'standard', props: { color: 0x94a3b8, roughness: 0.9, metalness: 0.0 }, mapId: 'tex-rock' },
    
    // Sci-Fi / Tech
    { id: 'mat-tech-hull', type: 'standard', props: { color: 0x1e293b, roughness: 0.6, metalness: 0.4 }, mapId: 'tex-scifi-panel' },
    { id: 'mat-tech-orange', type: 'standard', props: { color: 0xf97316, roughness: 0.4, metalness: 0.1 } },
    { id: 'mat-tech-floor', type: 'standard', props: { color: 0x334155, roughness: 0.5, metalness: 0.3 }, mapId: 'tex-station-floor' },
    { id: 'mat-tech-dark', type: 'standard', props: { color: 0x0f172a, roughness: 0.4, metalness: 0.2 } },
    { id: 'mat-scifi-panel-dark', type: 'standard', props: { color: 0x0f172a, roughness: 0.3, metalness: 0.6 }, mapId: 'tex-scifi-panel' },
    { id: 'mat-scifi-panel-light', type: 'standard', props: { color: 0x94a3b8, roughness: 0.4, metalness: 0.5 } },
    { id: 'mat-scifi-floor', type: 'standard', props: { color: 0x18181b, roughness: 0.5, metalness: 0.2 }, mapId: 'tex-hex-floor' },
    
    // Glows
    { id: 'mat-glow-blue', type: 'standard', props: { color: 0x0ea5e9, emissive: 0x0ea5e9, emissiveIntensity: 2.0, toneMapped: false } },
    { id: 'mat-glow-orange', type: 'standard', props: { color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 2.0, toneMapped: false } },
    { id: 'mat-glow-white', type: 'standard', props: { color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.0, toneMapped: false } },
    
    // Interior
    { id: 'mat-carpet-red', type: 'standard', props: { color: 0x7f1d1d, roughness: 1.0, metalness: 0.0 }, mapId: 'tex-carpet' },
    { id: 'mat-wall-cream', type: 'standard', props: { color: 0xfefce8, roughness: 0.9, metalness: 0.0 } },
    { id: 'mat-fabric-gray', type: 'standard', props: { color: 0x475569, roughness: 1.0, metalness: 0.0 }, mapId: 'tex-fabric-gray' },
    { id: 'mat-stone-dark', type: 'standard', props: { color: 0x334155, roughness: 0.9, metalness: 0.0 }, mapId: 'tex-rock' },
    { id: 'mat-hazard', type: 'standard', props: { color: 0xfacc15, roughness: 0.6, metalness: 0.1 } },
    { id: 'mat-ground', type: 'standard', props: { color: 0x1e293b, roughness: 0.9, metalness: 0.1 }, mapId: 'tex-ground' },
    { id: 'mat-default', type: 'standard', props: { color: 0xffffff, roughness: 0.5, metalness: 0.0 } },
    
    // Office
    { id: 'mat-plastic-black', type: 'standard', props: { color: 0x111111, roughness: 0.4, metalness: 0.0 } },
    { id: 'mat-plastic-beige', type: 'standard', props: { color: 0xdcd7cd, roughness: 0.5, metalness: 0.0 } },
    { id: 'mat-cabinet-metal', type: 'standard', props: { color: 0x94a3b8, roughness: 0.3, metalness: 0.6 } },
    { id: 'mat-linoleum', type: 'standard', props: { color: 0x334155, roughness: 0.6, metalness: 0.1 }, mapId: 'tex-linoleum' },
    { id: 'mat-desk-top', type: 'standard', props: { color: 0xffffff, roughness: 0.2, metalness: 0.0 } },

    // Physical
    { id: 'mat-void', type: 'physical', props: { color: 0x000000, roughness: 0.1, metalness: 0.5, clearcoat: 1.0, emissive: 0x000000 } },
    { id: 'mat-glass', type: 'physical', props: { color: 0x0f172a, roughness: 0.0, metalness: 0.9, transmission: 0.0, opacity: 1.0, clearcoat: 1.0, reflectivity: 1.0, ior: 1.5 } },
    { id: 'mat-gold', type: 'standard', props: { color: 0xffd700, roughness: 0.2, metalness: 1.0 } },
];
