
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { Geo } from '../architecture/architecture.utils';

@Injectable({
    providedIn: 'root'
})
export class SciFiEnvironmentService {

    generateElevatorShaft(depth: number): THREE.BufferGeometry | null {
        const width = 12;
        const segments = Math.floor(depth / 10);

        const concreteParts: THREE.BufferGeometry[] = [];
        const rockParts: THREE.BufferGeometry[] = [];
        const crystalParts: THREE.BufferGeometry[] = [];

        for (let i = 0; i < segments; i++) {
            const y = i * 10;
            const segmentH = 10;

            if (y < 50) {
                const ring = this.createShaftRing(width, segmentH, 0.5, 0);
                ring.translate(0, y + segmentH / 2, 0);
                concreteParts.push(ring);

                concreteParts.push(
                    Geo.box(width + 2, 1, 1).toNonIndexed().translate(0, y + 5, -width / 2 - 0.5).get(),
                    Geo.box(width + 2, 1, 1).toNonIndexed().translate(0, y + 5, width / 2 + 0.5).get(),
                    Geo.box(1, 1, width).toNonIndexed().translate(-width / 2 - 0.5, y + 5, 0).get(),
                    Geo.box(1, 1, width).toNonIndexed().translate(width / 2 + 0.5, y + 5, 0).get()
                );

            } else if (y < 300) {
                const cave = this.createShaftRing(width + (Math.random() * 4), segmentH, 2.0, 1.5);
                cave.translate(0, y + segmentH / 2, 0);
                rockParts.push(cave);
            } else {
                const cave = this.createShaftRing(width + 8, segmentH, 1.0, 2.0);
                cave.translate(0, y + segmentH / 2, 0);
                crystalParts.push(cave);
            }
        }

        const geos: THREE.BufferGeometry[] = [];

        // Merge individual groups first, but only if they have content
        if (concreteParts.length > 0) {
            const merged = BufferUtils.mergeGeometries(concreteParts);
            if (merged) geos.push(merged);
        }

        if (rockParts.length > 0) {
            const merged = BufferUtils.mergeGeometries(rockParts);
            if (merged) geos.push(merged);
        }

        if (crystalParts.length > 0) {
            const merged = BufferUtils.mergeGeometries(crystalParts);
            if (merged) geos.push(merged);
        }

        // Final Merge
        if (geos.length === 0) return null;
        if (geos.length === 1) return geos[0];

        return BufferUtils.mergeGeometries(geos, true);
    }

    private createShaftRing(innerW: number, height: number, thickness: number, noise: number): THREE.BufferGeometry {
        const walls: THREE.BufferGeometry[] = [];

        const mkWall = (w: number, d: number, dx: number, dz: number) => {
            // Use segments (4,4,4) for noise resolution if needed
            const segs = noise > 0 ? 4 : 1;
            const geoBuilder = Geo.box(w, height, d, segs, segs, segs).toNonIndexed();
            const g = geoBuilder.get();

            if (noise > 0) {
                const pos = g.getAttribute('position');
                const v = new THREE.Vector3();
                for (let i = 0; i < pos.count; i++) {
                    v.fromBufferAttribute(pos, i);
                    v.x += (Math.random() - 0.5) * noise;
                    v.z += (Math.random() - 0.5) * noise;
                    pos.setXYZ(i, v.x, v.y, v.z);
                }
                g.computeVertexNormals();
            }
            geoBuilder.translate(dx, 0, dz);
            return g;
        };

        walls.push(mkWall(innerW + thickness * 2, thickness, 0, -innerW / 2 - thickness / 2));
        walls.push(mkWall(innerW + thickness * 2, thickness, 0, innerW / 2 + thickness / 2));
        walls.push(mkWall(thickness, innerW, -innerW / 2 - thickness / 2, 0));
        walls.push(mkWall(thickness, innerW, innerW / 2 + thickness / 2, 0));

        return BufferUtils.mergeGeometries(walls);
    }
}
