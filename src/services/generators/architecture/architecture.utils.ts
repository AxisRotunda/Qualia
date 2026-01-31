
import * as THREE from 'three';

/**
 * Scales UV coordinates of a BoxGeometry to simulate box mapping.
 * Useful for tiling textures on procedural geometry.
 */
export function scaleUVs(geo: THREE.BufferGeometry, w: number, h: number, d: number, factor = 0.5) {
    const uvs = geo.getAttribute('uv');
    if (!uvs) return;

    // Only works reliably on BoxGeometry structure where faces are axis-aligned
    // This is a simplified box mapping assuming standard Three.js BoxGeometry layout
    const scaleFace = (faceIdx: number, uScale: number, vScale: number) => {
        const offset = faceIdx * 4;
        for (let i = 0; i < 4; i++) {
            const idx = offset + i;
            if (idx >= uvs.count) return;
            const u = uvs.getX(idx);
            const v = uvs.getY(idx);
            uvs.setXY(idx, u * uScale * factor, v * vScale * factor);
        }
    };

    // Standard BoxGeometry face order: +x, -x, +y, -y, +z, -z
    // Dimensions: (d,h), (d,h), (w,d), (w,d), (w,h), (w,h)
    scaleFace(0, d, h); // Right (+x)
    scaleFace(1, d, h); // Left (-x)
    scaleFace(2, w, d); // Top (+y)
    scaleFace(3, w, d); // Bottom (-y)
    scaleFace(4, w, h); // Front (+z)
    scaleFace(5, w, h); // Back (-z)
    
    uvs.needsUpdate = true;
}

/**
 * Projects UVs onto the XZ plane. Useful for flat road geometry or extrusions.
 */
export function projectPlanarUVs(geo: THREE.BufferGeometry, scale = 0.1) {
    const pos = geo.getAttribute('position');
    const uvs = geo.getAttribute('uv');
    if (!pos || !uvs) return;

    for(let i=0; i<pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        uvs.setXY(i, x * scale, z * scale);
    }
    uvs.needsUpdate = true;
}

/**
 * Fluent API for Geometry Operations.
 * Reduces verbosity in procedural generators.
 */
export class Geo {
    constructor(public raw: THREE.BufferGeometry) {}

    static box(w: number, h: number, d: number): Geo {
        return new Geo(new THREE.BoxGeometry(w, h, d));
    }

    static cylinder(topR: number, botR: number, h: number, segs = 8): Geo {
        return new Geo(new THREE.CylinderGeometry(topR, botR, h, segs));
    }

    /**
     * Applies Box UV Scaling.
     * @param w Width factor
     * @param h Height factor
     * @param d Depth factor
     * @param scale Global scale multiplier (default 0.5)
     */
    mapBox(w: number, h: number, d: number, scale = 0.5): this {
        scaleUVs(this.raw, w, h, d, scale);
        return this;
    }

    translate(x: number, y: number, z: number): this {
        this.raw.translate(x, y, z);
        return this;
    }

    rotateX(rad: number): this {
        this.raw.rotateX(rad);
        return this;
    }

    rotateY(rad: number): this {
        this.raw.rotateY(rad);
        return this;
    }

    rotateZ(rad: number): this {
        this.raw.rotateZ(rad);
        return this;
    }

    /**
     * Converts geometry to non-indexed. 
     * Essential for merging primitives with extrusions or when hard edges are needed.
     */
    toNonIndexed(): this {
        if (this.raw.index) {
            this.raw = this.raw.toNonIndexed();
        }
        return this;
    }

    /**
     * Clones the current geometry state into a new builder instance.
     */
    clone(): Geo {
        return new Geo(this.raw.clone());
    }

    /**
     * Returns the underlying BufferGeometry.
     */
    get(): THREE.BufferGeometry {
        return this.raw;
    }
}
