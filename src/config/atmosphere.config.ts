
import * as THREE from 'three';
import { WeatherType } from '../services/particle.service';

export interface AtmosphereDefinition {
    id: string;
    fog: THREE.Fog | THREE.FogExp2 | null;
    background: THREE.Color;
    hemiColor?: number;
    hemiGround?: number;

    // Lighting Defaults (RUN_REF Phase 42.0)
    sunIntensity: number;
    ambientIntensity: number;
    sunColor?: string;
    sunShadows: boolean;

    // Volumetric Height Fog (RUN_VOLUMETRICS)
    fogHeight?: number;
    fogFalloff?: number;
    fogScattering?: number;

    // Weather Defaults
    defaultWeather?: WeatherType;
    defaultTime?: number;
}

// RUN_LIGHT: Tuned presets for better visibility (Ambient Boost)
export const ATMOSPHERE_PRESETS: Record<string, () => AtmosphereDefinition> = {
    'clear': () => ({
        id: 'clear',
        fog: new THREE.Fog(0x5a7d9a, 80, 500),
        background: new THREE.Color(0x5a7d9a),
        sunIntensity: 1.8,
        ambientIntensity: 1.2, // Boosted from 0.8
        sunShadows: true,
        fogHeight: 0,
        fogFalloff: 0.005,
        fogScattering: 0.1,
        defaultWeather: 'clear',
        defaultTime: 12
    }),
    'fog': () => ({
        id: 'fog',
        fog: new THREE.FogExp2(0x8da3b0, 0.015),
        background: new THREE.Color(0x8da3b0),
        sunIntensity: 1.2,
        ambientIntensity: 1.0, // Boosted from 0.6
        sunShadows: true,
        fogHeight: 5,
        fogFalloff: 0.08,
        fogScattering: 0.4,
        defaultWeather: 'clear',
        defaultTime: 8
    }),
    'night': () => ({
        id: 'night',
        fog: new THREE.FogExp2(0x050508, 0.015),
        background: new THREE.Color(0x050508),
        sunIntensity: 0.1,
        ambientIntensity: 0.6, // Boosted from 0.25 to make shapes visible
        hemiGround: 0x1a1a2e,  // Lighter ground bounce
        sunShadows: true,
        fogHeight: 0,
        fogFalloff: 0.02,
        fogScattering: 0.05,
        defaultWeather: 'clear',
        defaultTime: 22
    }),
    'forest': () => ({
        id: 'forest',
        fog: new THREE.FogExp2(0x1a261a, 0.025),
        background: new THREE.Color(0x1a261a),
        sunIntensity: 2.5,
        ambientIntensity: 0.8, // Boosted from 0.5
        hemiGround: 0x1a331a,
        sunShadows: true,
        fogHeight: 3,
        fogFalloff: 0.1,
        fogScattering: 0.3,
        defaultWeather: 'clear',
        defaultTime: 8
    }),
    'ice': () => ({
        id: 'ice',
        fog: new THREE.Fog(0xcfe9f4, 40, 300),
        background: new THREE.Color(0xcfe9f4),
        sunIntensity: 2.8,
        ambientIntensity: 1.4, // Boosted from 0.9 (Snow reflects light)
        hemiGround: 0xcceeff,
        sunShadows: true,
        fogHeight: -10,
        fogFalloff: 0.02,
        fogScattering: 0.6,
        defaultWeather: 'snow',
        defaultTime: 14
    }),
    'blizzard': () => ({
        id: 'blizzard',
        fog: new THREE.FogExp2(0x8faab9, 0.035),
        background: new THREE.Color(0x8faab9),
        sunIntensity: 0.8,
        ambientIntensity: 1.2, // Boosted from 0.8
        sunShadows: true,
        fogHeight: 25,
        fogFalloff: 0.04,
        fogScattering: 0.8,
        defaultWeather: 'snow',
        defaultTime: 10
    }),
    'space': () => ({
        id: 'space',
        fog: null,
        background: new THREE.Color(0x000000),
        sunIntensity: 4.5,
        ambientIntensity: 0.3, // Boosted from 0.1 (Fill light for ship hulls)
        sunShadows: true,
        defaultWeather: 'clear',
        defaultTime: 12
    }),
    'city': () => ({
        id: 'city',
        fog: new THREE.FogExp2(0x64748b, 0.008),
        background: new THREE.Color(0x64748b),
        sunIntensity: 2.2,
        ambientIntensity: 1.5, // Boosted from 1.0 (Urban light pollution)
        hemiGround: 0x2d3748,
        sunShadows: true,
        fogHeight: 0,
        fogFalloff: 0.03,
        fogScattering: 0.25,
        defaultWeather: 'clear',
        defaultTime: 14
    }),
    'citadel': () => ({
        id: 'citadel',
        fog: new THREE.Fog(0x8b735b, 50, 400),
        background: new THREE.Color(0x8b735b),
        sunIntensity: 3.5,
        ambientIntensity: 1.2,
        sunColor: '#ffaa44', // Warm orange sunset
        hemiGround: 0x4a3728,
        sunShadows: true,
        fogHeight: 2,
        fogFalloff: 0.05,
        fogScattering: 0.4,
        defaultWeather: 'clear',
        defaultTime: 18.5
    }),
    'desert': () => ({
        id: 'desert',
        fog: new THREE.FogExp2(0xe6c288, 0.012),
        background: new THREE.Color(0x87ceeb),
        sunIntensity: 4.5,
        ambientIntensity: 1.2, // Boosted from 0.8 (Bright sand bounce)
        hemiGround: 0x7f5539,
        sunShadows: true,
        fogHeight: -2,
        fogFalloff: 0.04,
        fogScattering: 0.2,
        defaultWeather: 'clear',
        defaultTime: 15
    }),
    'factory': () => ({
        id: 'factory',
        fog: new THREE.FogExp2(0x1a1c12, 0.04),
        background: new THREE.Color(0x0a0b08),
        sunIntensity: 0.8,
        ambientIntensity: 0.6, // Boosted from 0.5
        hemiGround: 0x2a1a0a,
        sunShadows: true,
        fogHeight: 8,
        fogFalloff: 0.15,
        fogScattering: 0.5,
        defaultWeather: 'ash',
        defaultTime: 0
    }),
    'summit': () => ({
        id: 'summit',
        fog: new THREE.FogExp2(0xc0dbe8, 0.005),
        background: new THREE.Color(0xc0dbe8),
        sunIntensity: 3.0,
        ambientIntensity: 1.3,
        hemiGround: 0x475569,
        sunShadows: true,
        fogHeight: -50,
        fogFalloff: 0.01,
        fogScattering: 0.4,
        defaultWeather: 'clear',
        defaultTime: 9
    }),
    'volcanic': () => ({
        id: 'volcanic',
        fog: new THREE.FogExp2(0x8c7b6c, 0.02), // Hazy sulfuric fog
        background: new THREE.Color(0x2b241d),
        sunIntensity: 2.5,
        ambientIntensity: 0.7,
        sunColor: '#ffaa66',
        hemiGround: 0x3d3329,
        sunShadows: true,
        fogHeight: 10,
        fogFalloff: 0.05,
        fogScattering: 0.6,
        defaultWeather: 'ash',
        defaultTime: 16 // Late afternoon orange light
    }),
    'underwater': () => ({
        id: 'underwater',
        fog: new THREE.FogExp2(0x001e1f, 0.08), // Dense oceanic fog
        background: new THREE.Color(0x001e1f),
        sunIntensity: 0.4, // Murky surface light
        ambientIntensity: 1.8, // SSS Approximation
        hemiGround: 0x002233,
        sunShadows: false,
        fogHeight: 100, // Uniform density
        fogFalloff: 0,
        fogScattering: 0.9,
        defaultWeather: 'clear',
        defaultTime: 12
    }),
    'fallout': () => ({
        id: 'fallout',
        fog: new THREE.FogExp2(0x3c4a21, 0.025), // Sickly toxic fog
        background: new THREE.Color(0x3c4a21),
        sunIntensity: 0.6, // Dust-occluded sun
        ambientIntensity: 0.8,
        sunColor: '#e0d7a3', // Pale dusty yellow
        hemiGround: 0x2a2e12,
        sunShadows: true,
        fogHeight: 15,
        fogFalloff: 0.06,
        fogScattering: 0.45,
        defaultWeather: 'ash',
        defaultTime: 15
    })
};
