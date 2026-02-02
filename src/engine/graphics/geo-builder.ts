import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';

// Optimization: Module-level scratch objects to prevent GC churn
const _mat = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _euler = new THREE.Euler();
const _v = new THREE.Vector3(); 
const _color = new THREE.Color(); 

/**
 * Scales UV coordinates of a BoxGeometry to simulate box mapping.
 */
export function scaleUVs(geo: THREE.BufferGeometry, w: number, h: number, d: number, factor = 0.5) {
    const uvs = geo.getAttribute('uv');
    if (!uvs) return;

    scaleFaceUVs(uvs, 0, d, h, factor); // Right (+x)
    scaleFaceUVs(uvs, 1, d, h, factor); // Left (-x)
    scaleFaceUVs(uvs, 2, w, d, factor); // Top (+y)
    scaleFaceUVs(uvs, 3, w, d, factor); // Bottom (-y)
    scaleFaceUVs(uvs, 4, w, h, factor); // Front (+z)
    scaleFaceUVs(uvs, 5, w, h, factor); // Back (-z)
    
    uvs.needsUpdate = true;
}

function scaleFaceUVs(uvs: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, faceIdx: number, uScale: number, vScale: number, factor: number) {
    const offset = faceIdx * 4;
    for (let i = 0; i < 4; i++) {
        const idx = offset + i;
        if (idx >= uvs.count) return;
        const u = uvs.getX(idx);
        const v = uvs.getY(idx);
        uvs.setXY(idx, u * uScale * factor, v * vScale * factor);
    }
}

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
 */
export class Geo {
    constructor(public raw: THREE.BufferGeometry) {}

    static box(w: number, h: number, d: number, wSegs = 1, hSegs = 1, dSegs = 1): Geo {
        return new Geo(new THREE.BoxGeometry(w, h, d, wSegs, hSegs, dSegs));
    }

    static sharpBox(w: number, h: number, d: number): Geo {
        return new Geo(new THREE.BoxGeometry(w, h, d, 1, 1, 1));
    }

    static cylinder(topR: number, botR: number, h: number, segs = 8): Geo {
        return new Geo(new THREE.CylinderGeometry(topR, botR, h, segs));
    }

    static plane(w: number, h: number, wSegs = 1, hSegs = 1): Geo {
        return new Geo(new THREE.PlaneGeometry(w, h, wSegs, hSegs));
    }

    static cone(r: number, h: number, segs = 16): Geo {
        return new Geo(new THREE.ConeGeometry(r, h, segs));
    }

    static torus(r: number, tube: number, radSegs = 8, tubSegs = 16): Geo {
        return new Geo(new THREE.TorusGeometry(r, tube, radSegs, tubSegs));
    }

    static sphere(r: number, wSegs = 16, hSegs = 16): Geo {
        return new Geo(new THREE.SphereGeometry(r, wSegs, hSegs));
    }

    static dodecahedron(radius: number = 1, detail: number = 0): Geo {
        return new Geo(new THREE.DodecahedronGeometry(radius, detail));
    }

    setColors(hex: number): this {
        const count = this.raw.getAttribute('position').count;
        const colors = new Float32Array(count * 3);
        _color.setHex(hex);
        const r = _color.r, g = _color.g, b = _color.b;
        for(let i=0; i<count; i++) {
            colors[i*3] = r; colors[i*3+1] = g; colors[i*3+2] = b;
        }
        this.raw.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        return this;
    }

    /**
     * Prevents BufferGeometryUtils mismatch by ensuring a color attribute exists.
     */
    ensureColor(hex: number = 0xffffff): this {
        if (this.raw.getAttribute('color')) return this;
        return this.setColors(hex);
    }

    /**
     * Ensures tangent attributes exist for PBR materials.
     */
    ensureTangents(): this {
        if (this.raw.getAttribute('tangent')) return this;
        if (this.raw.getAttribute('uv')) this.raw.computeTangents();
        return this;
    }

    gradientY(hexBot: number, hexTop: number, minY: number, maxY: number): this {
        const pos = this.raw.getAttribute('position');
        const count = pos.count;
        const colors = new Float32Array(count * 3);
        const colBot = new THREE.Color(hexBot);
        const colTop = new THREE.Color(hexTop);
        
        for(let i=0; i<count; i++) {
            const y = pos.getY(i);
            const t = Math.max(0, Math.min(1, (y - minY) / (maxY - minY)));
            _color.copy(colBot).lerp(colTop, t);
            colors[i*3] = _color.r; colors[i*3+1] = _color.g; colors[i*3+2] = _color.b;
        }
        this.raw.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        return this;
    }

    mapBox(w: number, h: number, d: number, scale = 0.5): this {
        scaleUVs(this.raw, w, h, d, scale);
        return this;
    }

    mapCylinder(radius: number, height: number, scale = 0.5): this {
        const uvs = this.raw.getAttribute('uv');
        if (!uvs) return this;
        const circumference = 2 * Math.PI * radius;
        for (let i = 0; i < uvs.count; i++) {
            uvs.setXY(i, uvs.getX(i) * circumference * scale, uvs.getY(i) * height * scale);
        }
        uvs.needsUpdate = true;
        return this;
    }

    mapPlanar(scale = 0.1): this {
        projectPlanarUVs(this.raw, scale);
        return this;
    }

    mapVertices(callback: (v: THREE.Vector3, i: number) => void): this {
        const pos = this.raw.getAttribute('position');
        if (!pos) return this;
        for (let i = 0; i < pos.count; i++) {
            _v.fromBufferAttribute(pos, i);
            callback(_v, i);
            pos.setXYZ(i, _v.x, _v.y, _v.z);
        }
        return this;
    }

    computeVertexNormals(): this {
        this.raw.computeVertexNormals();
        return this;
    }

    mergeVertices(tolerance: number = 1e-4): this {
        const merged = BufferUtils.mergeVertices(this.raw, tolerance);
        this.raw.dispose();
        this.raw = merged;
        return this;
    }

    transform(tx = 0, ty = 0, tz = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1): this {
        _pos.set(tx, ty, tz);
        _euler.set(rx, ry, rz, 'XYZ');
        _quat.setFromEuler(_euler);
        _scale.set(sx, sy, sz);
        _mat.compose(_pos, _quat, _scale);
        this.raw.applyMatrix4(_mat);
        return this;
    }

    transformQ(pos: THREE.Vector3, quat: THREE.Quaternion, scale: THREE.Vector3): this {
        _mat.compose(pos, quat, scale);
        this.raw.applyMatrix4(_mat);
        return this;
    }

    translate(x: number, y: number, z: number): this {
        this.raw.translate(x, y, z);
        return this;
    }

    rotateX(rad: number): this { this.raw.rotateX(rad); return this; }
    rotateY(rad: number): this { this.raw.rotateY(rad); return this; }
    rotateZ(rad: number): this { this.raw.rotateZ(rad); return this; }
    scale(x: number, y: number, z: number): this { this.raw.scale(x, y, z); return this; }
    applyQuaternion(q: THREE.Quaternion): this { this.raw.applyQuaternion(q); return this; }

    toNonIndexed(): this {
        if (this.raw.index) {
            const nonIndexed = this.raw.toNonIndexed();
            this.raw.dispose();
            this.raw = nonIndexed;
        }
        return this;
    }

    clone(): Geo { return new Geo(this.raw.clone()); }
    get(): THREE.BufferGeometry { return this.raw; }
}