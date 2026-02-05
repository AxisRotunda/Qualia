
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { PhysicsBodyDef } from '../../engine/schema';
import { Geo } from './geo-builder';

@Injectable({
    providedIn: 'root'
})
export class PrimitiveRegistryService {
    private cache = new Map<string, THREE.BufferGeometry>();

    /**
   * Retrieves geometry with support for Level of Detail (LOD).
   * @param data Physics definition
   * @param lod Level of Detail (0 = High, 1 = Med, 2 = Low)
   */
    getGeometry(data: PhysicsBodyDef, lod: number = 0): THREE.BufferGeometry {
        const key = this.getCacheKey(data, lod);

        if (this.cache.has(key)) {
            return this.cache.get(key)!;
        }

        const geometry = this.generateGeometry(data, lod);
        this.cache.set(key, geometry);
        return geometry;
    }

    getGhostGeometry(type: 'box'|'cylinder'|'cone'|'sphere', size: THREE.Vector3): THREE.BufferGeometry {
        const key = `ghost_${type}_${size.x}_${size.y}_${size.z}`;
        if (this.cache.has(key)) return this.cache.get(key)!;

        let geo: THREE.BufferGeometry;
        // Ghosts are always low poly (LOD 2 equivalent)
        if (type === 'box') geo = Geo.box(size.x, size.y, size.z).get();
        else if (type === 'cylinder') geo = Geo.cylinder(size.x, size.x, size.y, 16).get();
        else if (type === 'cone') geo = Geo.cone(size.x, size.y, 16).get();
        else geo = Geo.sphere(size.x, 16, 16).get();

        this.cache.set(key, geo);
        return geo;
    }

    private generateGeometry(data: PhysicsBodyDef, lod: number): THREE.BufferGeometry {
    // LOD Heuristics (Self-Learning from Protocol)
        const radialSegs = lod === 0 ? 32 : (lod === 1 ? 16 : 8);

        switch (data.type) {
            case 'box':
                // RUN_GEO: Ensure UVs are scaled for box mapping to prevent texture stretch
                return Geo.box(data.size!.w, data.size!.h, data.size!.d)
                    .mapBox(data.size!.w, data.size!.h, data.size!.d)
                    .get();

            case 'cylinder':
                // RUN_GEO: Normalize UVs for cylindrical mapping
                return Geo.cylinder(data.radius!, data.radius!, data.height!, radialSegs)
                    .mapCylinder(data.radius!, data.height!)
                    .get();

            case 'cone':
                return Geo.cone(data.radius!, data.height!, radialSegs).get();

            case 'capsule':
                // Polyfill for Capsule using Three.js built-in geometry
                // Height in CapsuleGeometry is the Length of the cylindrical part
                const capHeight = Math.max(0, data.height! - (data.radius! * 2));
                return new THREE.CapsuleGeometry(data.radius, capHeight, 4, radialSegs * 2);

            case 'sphere':
            default:
                // Spheres degrade to 16x16 or 8x8
                return Geo.sphere(data.radius!, radialSegs, Math.max(8, radialSegs / 2)).get();
        }
    }

    private getCacheKey(data: PhysicsBodyDef, lod: number): string {
        const base = this.getBaseKey(data);
        return `${base}_lod${lod}`;
    }

    private getBaseKey(data: PhysicsBodyDef): string {
        if (data.type === 'box') return `box_${data.size?.w}_${data.size?.h}_${data.size?.d}`;
        if (data.type === 'cylinder') return `cyl_${data.radius}_${data.height}`;
        if (data.type === 'cone') return `cone_${data.radius}_${data.height}`;
        if (data.type === 'capsule') return `cap_${data.radius}_${data.height}`;
        if (data.type === 'sphere') return `sph_${data.radius}`;
        return 'unknown';
    }

    dispose() {
        this.cache.forEach(geo => geo.dispose());
        this.cache.clear();
    }
}
