
import * as THREE from 'three';

export interface CelestialState {
    position: THREE.Vector3;
    intensity: number;
    color: THREE.Color;
    elevation: number; // -1 to 1
    azimuth: number;
    ambientSky: THREE.Color;
    ambientGround: THREE.Color;
}

/**
 * CelestialEngine: Pure logic for planetary orbital lighting.
 * Part of RUN_REF Phase 41.0.
 * Updated RUN_OPT Phase 62.1: Zero-Allocation Singleton Pattern.
 */
export class CelestialEngine {
    private static readonly RADIUS = 150;
    
    // Persistent Scratch Objects
    private static readonly _pos = new THREE.Vector3();
    private static readonly _color = new THREE.Color();
    private static readonly _sky = new THREE.Color();
    private static readonly _ground = new THREE.Color();

    // Singleton Result Container
    private static readonly _result: CelestialState = {
        position: new THREE.Vector3(),
        intensity: 0,
        color: new THREE.Color(),
        elevation: 0,
        azimuth: 0,
        ambientSky: new THREE.Color(),
        ambientGround: new THREE.Color()
    };

    /**
     * Calculates solar parameters based on current hour (0-24).
     * Returns a reference to the shared static state object. 
     * Do NOT hold this reference across frames if values are needed later; copy them.
     */
    static calculateSun(hour: number): Readonly<CelestialState> {
        // Orbit Math
        const normTime = ((hour - 6) / 24) * Math.PI * 2;
        const x = Math.cos(normTime) * this.RADIUS;
        const y = Math.sin(normTime) * this.RADIUS;
        const z = Math.cos(normTime * 0.5) * 40; // Slight seasonal wobble
        
        this._pos.set(x, y, z);
        const elevation = y / this.RADIUS;

        // Visual Interpolation
        let intensity = 0.0;
        if (elevation > 0) {
            // Day cycle: 0 -> 1.0 (noon) -> 0
            const t = Math.min(1.0, elevation / 0.2); // Snap up quickly at sunrise
            intensity = t;
            
            if (elevation < 0.2) {
                // Golden Hour (Warm)
                this._color.setHSL(0.06 + (0.04 * t), 0.9, 0.5 + (0.1 * t));
            } else {
                // High Sun (Neutral)
                this._color.setHSL(0.12, 0.1, 0.95);
            }
        } else {
            // Night cycle
            this._color.setHSL(0.64, 0.5, 0.2); 
            intensity = 0.05; // Faint moonlight/starlight
        }

        this.updateSkyColor(elevation);
        
        // Ground bounce is essentially sky color reflected + local shadow darkening
        this._ground.copy(this._sky).multiplyScalar(0.4);

        // Update Singleton Result
        this._result.position.copy(this._pos);
        this._result.intensity = intensity;
        this._result.color.copy(this._color);
        this._result.elevation = elevation;
        this._result.azimuth = normTime;
        this._result.ambientSky.copy(this._sky);
        this._result.ambientGround.copy(this._ground);

        return this._result;
    }

    /**
     * Updates internal sky color based on solar elevation.
     */
    private static updateSkyColor(elevation: number) {
        if (elevation > 0) {
            const t = Math.min(1.0, elevation / 0.3);
            this._sky.setHSL(0.6, 0.5, 0.2 + (0.45 * t)); // Blue gradient
        } else {
            this._sky.setHSL(0.65, 0.8, 0.01); // Deep night
        }
    }
}
