
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

    // Standards (Hard Realism: Roughness > 0.8 for concrete, Metalness binary)
    {
        id: 'mat-concrete',
        type: 'standard',
        props: { color: 0x777777, roughness: 0.92, metalness: 0.0, vertexColors: true },
        mapId: 'tex-concrete-base',
        normalMapId: 'tex-concrete-normal'
    },
    {
        id: 'mat-dark-metal',
        type: 'standard',
        props: { color: 0x1a1a1a, roughness: 0.35, metalness: 1.0, vertexColors: true },
        mapId: 'tex-metal-scratched',
        normalMapId: 'tex-metal-normal'
    },
    {
        id: 'mat-metal',
        type: 'standard',
        props: { color: 0x888888, roughness: 0.22, metalness: 1.0, vertexColors: true },
        mapId: 'tex-metal-scratched',
        normalMapId: 'tex-metal-normal'
    },
    {
        id: 'mat-steel',
        type: 'standard',
        props: { color: 0xffffff, roughness: 0.08, metalness: 1.0, vertexColors: true },
        mapId: 'tex-metal-scratched',
        normalMapId: 'tex-metal-normal'
    },

    // Industrial Engineering (Upgraded to Physical for Anisotropy/Clearcoat)
    {
        id: 'mat-titanium',
        type: 'physical',
        props: { color: 0x9499a1, roughness: 0.28, metalness: 1.0, clearcoat: 0.5, clearcoatRoughness: 0.1 },
        normalMapId: 'tex-metal-normal'
    },
    {
        id: 'mat-carbon-fiber',
        type: 'physical',
        props: { color: 0x111111, roughness: 0.45, metalness: 0.0, clearcoat: 1.0, clearcoatRoughness: 0.02 },
        userData: { type: 'composite' }
    },
    {
        id: 'mat-hazard',
        type: 'standard',
        props: { color: 0xed8936, roughness: 0.6, metalness: 0.0, vertexColors: true },
        normalMapId: 'tex-metal-normal'
    },
    // New Industrial Materials
    {
        id: 'mat-wood-frame',
        type: 'standard',
        props: { color: 0x2d1b14, roughness: 0.9, metalness: 0.0, vertexColors: true },
        mapId: 'tex-wood-dark'
    },
    {
        id: 'mat-metal-painted',
        type: 'standard',
        props: { color: 0x3b82f6, roughness: 0.6, metalness: 0.1, vertexColors: true }, // Industrial Blue
        mapId: 'tex-metal-scratched'
    },

    // Industrial & Factory
    {
        id: 'mat-rust',
        type: 'standard',
        props: { color: 0x5a2e15, roughness: 0.95, metalness: 0.4, vertexColors: true },
        mapId: 'tex-rust',
        normalMapId: 'tex-rock-normal'
    },

    // Road Surfaces
    { id: 'mat-asphalt', type: 'standard', props: { color: 0x121212, roughness: 0.88, metalness: 0.0, vertexColors: true }, mapId: 'tex-asphalt', normalMapId: 'tex-asphalt-normal' },
    { id: 'mat-pavement', type: 'standard', props: { color: 0x777777, roughness: 0.85, metalness: 0.0, vertexColors: true }, mapId: 'tex-concrete-base', normalMapId: 'tex-concrete-normal' },
    { id: 'mat-curb', type: 'standard', props: { color: 0x555555, roughness: 0.7, metalness: 0.0 }, mapId: 'tex-concrete-base' },

    // Architecture Special
    {
        id: 'mat-city-window',
        type: 'standard',
        props: { color: 0xffffff, roughness: 0.1, metalness: 1.0, emissive: 0xffffff, emissiveIntensity: 1.2 },
        mapId: 'tex-city-window',
        normalMapId: 'tex-city-window-normal',
        userData: { mapId: 'tex-city-window', textureTarget: 'emissive' }
    },

    // Nature
    { id: 'mat-wood', type: 'standard', props: { color: 0x3e2723, roughness: 0.85, metalness: 0.0, vertexColors: true }, mapId: 'tex-bark', normalMapId: 'tex-bark-normal' },
    { id: 'mat-wood-dark', type: 'standard', props: { color: 0x2a1a15, roughness: 0.9, metalness: 0.0 }, mapId: 'tex-bark', normalMapId: 'tex-bark-normal' },
    { id: 'mat-charcoal', type: 'standard', props: { color: 0x111111, roughness: 1.0, metalness: 0.0 }, mapId: 'tex-bark', normalMapId: 'tex-bark-normal' },
    { id: 'mat-pine-leaf', type: 'standard', props: { color: 0x1a2e1a, roughness: 0.8, metalness: 0.0 }, mapId: 'tex-leaf' },
    { id: 'mat-palm-leaf', type: 'standard', props: { color: 0x4a6e3a, roughness: 0.6, metalness: 0.0 }, mapId: 'tex-leaf' },
    { id: 'mat-palm-bark', type: 'standard', props: { color: 0x5d4037, roughness: 0.9, metalness: 0.0 }, mapId: 'tex-bark' },
    { id: 'mat-forest', type: 'standard', props: { color: 0x1a261a, roughness: 0.92, metalness: 0.0 }, mapId: 'tex-leaf' },
    { id: 'mat-rock', type: 'standard', props: { color: 0x555555, roughness: 0.9, metalness: 0.0 }, mapId: 'tex-rock', normalMapId: 'tex-rock-normal' },
    { id: 'mat-sandstone', type: 'standard', props: { color: 0xb99a73, roughness: 1.0, metalness: 0.0 }, mapId: 'tex-rock', normalMapId: 'tex-rock-normal' },
    { id: 'mat-sand', type: 'standard', props: { color: 0xd4a373, roughness: 1.0, metalness: 0.0 }, mapId: 'tex-sand' },
    { id: 'mat-sand-tropical', type: 'standard', props: { color: 0xfff8e1, roughness: 0.9, metalness: 0.0 }, mapId: 'tex-sand' },
    { id: 'mat-snow', type: 'standard', props: { color: 0xe2e8f0, roughness: 0.55, metalness: 0.05 }, mapId: 'tex-snow' },

    // Volcanic
    {
        id: 'mat-magma',
        type: 'standard',
        props: { color: 0x000000, roughness: 0.9, metalness: 0.0, emissive: 0xff4500, emissiveIntensity: 2.0 },
        mapId: 'tex-rock',
        normalMapId: 'tex-rock-normal',
        userData: { textureTarget: 'emissive' }
    },
    {
        id: 'mat-thermal-water',
        type: 'physical',
        props: { color: 0x00ffff, roughness: 0.1, transmission: 0.8, thickness: 1.0, ior: 1.33 },
        mapId: 'tex-water-normal'
    },

    // Fauna - Penguin
    { id: 'mat-penguin-body', type: 'standard', props: { color: 0x1a1a1a, roughness: 0.4, metalness: 0.0 } },
    { id: 'mat-penguin-belly', type: 'standard', props: { color: 0xffffff, roughness: 0.5, metalness: 0.0 }, mapId: 'tex-snow' },
    { id: 'mat-penguin-feet', type: 'standard', props: { color: 0xff9900, roughness: 0.6, metalness: 0.0 } },

    // Obsidian (Physical Hero)
    { id: 'mat-obsidian', type: 'physical', props: { color: 0x050508, roughness: 0.02, metalness: 0.0, ior: 1.6, reflectivity: 1.0, clearcoat: 1.0, clearcoatRoughness: 0.02, specularColor: 0xffffff } },

    // Sci-Fi Base
    { id: 'mat-scifi-panel-dark', type: 'standard', props: { color: 0x1f2937, roughness: 0.3, metalness: 0.9 }, mapId: 'tex-scifi-panel' },
    { id: 'mat-scifi-floor', type: 'standard', props: { color: 0x111827, roughness: 0.4, metalness: 0.8 }, mapId: 'tex-hex-floor' },
    { id: 'mat-scifi-vent', type: 'standard', props: { color: 0x1f2937, roughness: 0.5, metalness: 0.7 }, mapId: 'tex-vent' },
    { id: 'mat-scifi-pipe', type: 'standard', props: { color: 0x94a3b8, roughness: 0.2, metalness: 1.0 }, mapId: 'tex-metal-scratched' },
    { id: 'mat-tech-hull', type: 'standard', props: { color: 0x334155, roughness: 0.6, metalness: 0.3 }, mapId: 'tex-robot-albedo', normalMapId: 'tex-robot-normal' },
    { id: 'mat-tech-floor', type: 'standard', props: { color: 0x0f172a, roughness: 0.4, metalness: 0.6 }, mapId: 'tex-station-floor' },
    { id: 'mat-tech-dark', type: 'standard', props: { color: 0x020617, roughness: 0.8, metalness: 0.2 } },
    { id: 'mat-tech-orange', type: 'standard', props: { color: 0xf97316, roughness: 0.4, metalness: 0.1 } },

    // Interior Base
    { id: 'mat-marble', type: 'standard', props: { color: 0xeeeeee, roughness: 0.06, metalness: 0.0 }, mapId: 'tex-marble' },
    { id: 'mat-fabric-gray', type: 'standard', props: { color: 0x334155, roughness: 1.0, metalness: 0.0 }, mapId: 'tex-fabric-gray' },
    { id: 'mat-glass', type: 'physical', props: { color: 0xffffff, roughness: 0.0, metalness: 0.0, transmission: 0.98, thickness: 0.4, ior: 1.52 } },
    { id: 'mat-carpet-red', type: 'standard', props: { color: 0x7f1d1d, roughness: 1.0, metalness: 0.0 }, mapId: 'tex-carpet' },
    { id: 'mat-linoleum', type: 'standard', props: { color: 0x1e293b, roughness: 0.45, metalness: 0.0 }, mapId: 'tex-linoleum' },
    { id: 'mat-wall-cream', type: 'standard', props: { color: 0xfdfbf7, roughness: 0.9, metalness: 0.0 } },
    { id: 'mat-wood-polish', type: 'standard', props: { color: 0x3e2723, roughness: 0.1, metalness: 0.0 }, mapId: 'tex-wood-dark' },
    { id: 'mat-gold', type: 'standard', props: { color: 0xffd700, roughness: 0.2, metalness: 1.0 } },
    { id: 'mat-server-face', type: 'standard', props: { color: 0x0f172a, roughness: 0.2, metalness: 0.5 }, mapId: 'tex-server-rack' },
    { id: 'mat-desk-top', type: 'standard', props: { color: 0x1e293b, roughness: 0.1, metalness: 0.0 } },
    { id: 'mat-cabinet-metal', type: 'standard', props: { color: 0x94a3b8, roughness: 0.4, metalness: 0.8 } },
    { id: 'mat-screen-matrix', type: 'standard', props: { color: 0x000000, emissive: 0x22c55e, emissiveIntensity: 1.5 }, mapId: 'tex-screen-matrix' },
    { id: 'mat-screen-map', type: 'standard', props: { color: 0x000000, emissive: 0x38bdf8, emissiveIntensity: 1.5 }, mapId: 'tex-screen-map' },
    { id: 'mat-plastic-beige', type: 'standard', props: { color: 0xf5f5dc, roughness: 0.6, metalness: 0.0 } },

    // Technical Glows
    { id: 'mat-glow-blue', type: 'standard', props: { color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 2.5, toneMapped: false } },
    { id: 'mat-glow-orange', type: 'standard', props: { color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 2.5, toneMapped: false } },
    { id: 'mat-glow-white', type: 'standard', props: { color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.0, toneMapped: false } },
    { id: 'mat-traffic-puck', type: 'standard', props: { color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 3.0, toneMapped: false } },
    { id: 'mat-void', type: 'standard', props: { color: 0x000000, roughness: 0.0, metalness: 0.0 } },

    // Weapon Materials (Tactical)
    { id: 'mat-plastic-black', type: 'standard', props: { color: 0x111111, roughness: 0.7, metalness: 0.1 } },
    { id: 'mat-rubber', type: 'standard', props: { color: 0x222222, roughness: 0.9, metalness: 0.0 } },
    { id: 'mat-tech-grip', type: 'standard', props: { color: 0x1a1a1a, roughness: 0.9, metalness: 0.0 }, mapId: 'tex-tech-grip', normalMapId: 'tex-tech-grip-normal' },

    // Robot
    { id: 'mat-robot', type: 'physical', props: { color: 0xffffff, roughness: 0.4, metalness: 0.8, clearcoat: 0.4, clearcoatRoughness: 0.1 } },

    // Ice (Upgraded for Realism - RUN_MAT)
    {
        id: 'mat-ice',
        type: 'physical',
        props: {
            color: 0xdbeeff,
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.95,
            thickness: 1.5,
            ior: 1.31,
            reflectivity: 1.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05
        },
        mapId: 'tex-ice',
        normalMapId: 'tex-ice-normal'
    }
];
