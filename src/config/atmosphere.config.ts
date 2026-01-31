
import * as THREE from 'three';

export interface AtmosphereDefinition {
    id: string;
    fog: THREE.Fog | THREE.FogExp2 | null;
    background: THREE.Color;
    hemiColor?: number; // Sky color override
    hemiGround?: number; // Ground color override
    hemiInt?: number;
    sunShadows: boolean;
}

export const ATMOSPHERE_PRESETS: Record<string, () => AtmosphereDefinition> = {
    'clear': () => ({
        id: 'clear',
        // Optical Blue - deeper and less neon than Tailwind cyan
        fog: new THREE.Fog(0x5a7d9a, 80, 500), 
        background: new THREE.Color(0x5a7d9a),
        hemiColor: 0xffffff,
        hemiInt: 0.4, // Reduced for higher contrast shadows
        sunShadows: true
    }),
    'fog': () => ({
        id: 'fog',
        fog: new THREE.FogExp2(0x8da3b0, 0.015),
        background: new THREE.Color(0x8da3b0),
        hemiInt: 0.3,
        sunShadows: true
    }),
    'night': () => ({
        id: 'night',
        fog: new THREE.FogExp2(0x050508, 0.015),
        background: new THREE.Color(0x050508),
        hemiColor: 0x0a0a14,
        hemiGround: 0x000000,
        hemiInt: 0.05, // Starlight only
        sunShadows: true // Moon shadows
    }),
    'forest': () => ({
        id: 'forest',
        fog: new THREE.FogExp2(0x1a261a, 0.025),
        background: new THREE.Color(0x1a261a),
        hemiInt: 0.25,
        sunShadows: true
    }),
    'ice': () => ({
        id: 'ice',
        // Glacial glare - bright but desaturated
        fog: new THREE.Fog(0xcfe9f4, 40, 300),
        background: new THREE.Color(0xcfe9f4),
        hemiColor: 0xeef7fa,
        hemiInt: 0.7, // High albedo bounce
        sunShadows: true
    }),
    'blizzard': () => ({
        id: 'blizzard',
        // Increased density, darker grey-blue to simulate storm cloud cover
        fog: new THREE.FogExp2(0x8faab9, 0.025),
        background: new THREE.Color(0x8faab9),
        // Bright ground bounce from snow, dark sky
        hemiColor: 0x8faab9, 
        hemiGround: 0xeef7fa,
        hemiInt: 0.5,
        // ENABLED shadows for depth perception, but they will be softened by high ambient/fog visually
        sunShadows: true 
    }),
    'space': () => ({
        id: 'space',
        fog: null,
        background: new THREE.Color(0x000000),
        hemiColor: 0x111111,
        hemiGround: 0x000000,
        hemiInt: 0.02, // Harsh vacuum contrast
        sunShadows: true
    }),
    'city': () => ({
        id: 'city',
        // Darker Smog (Slate/Blue Grey)
        fog: new THREE.Fog(0x64748b, 60, 450),
        background: new THREE.Color(0x64748b),
        hemiColor: 0x94a3b8,
        hemiInt: 0.5,
        sunShadows: true
    }),
    'desert': () => ({
        id: 'desert',
        // Heat Haze & Sand Dust
        // Color match: #e6c288 (Sand Texture) -> 0xe6c288
        fog: new THREE.FogExp2(0xe6c288, 0.012), 
        background: new THREE.Color(0x87ceeb), // Pale Blue Sky
        hemiColor: 0xffffff,
        hemiGround: 0xe6c288, // Strong bounce from sand
        hemiInt: 0.6,
        sunShadows: true
    })
};