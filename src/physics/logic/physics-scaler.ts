
import { Injectable, inject } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsWorldService } from '../world.service';
import { PhysicsBodyDef } from '../../engine/schema';

@Injectable({
  providedIn: 'root'
})
export class PhysicsScaler {
  private worldService = inject(PhysicsWorldService);

  private get world() {
    return this.worldService.world;
  }

  updateBodyScale(handle: number, def: PhysicsBodyDef, scale: { x: number, y: number, z: number }) {
    if (!this.world) return;
    const body = this.world.getRigidBody(handle);
    if (!body) return;

    // Remove existing colliders
    const n = body.numColliders();
    const collidersToRemove: RAPIER.Collider[] = [];
    for(let i=0; i<n; i++) collidersToRemove.push(body.collider(i));
    collidersToRemove.forEach(c => this.world!.removeCollider(c, false));

    let colliderDesc: RAPIER.ColliderDesc | null = null;

    if (def.type === 'box' && def.size) {
        const hx = (def.size.w / 2) * scale.x;
        const hy = (def.size.h / 2) * scale.y;
        const hz = (def.size.d / 2) * scale.z;
        colliderDesc = RAPIER.ColliderDesc.cuboid(Math.abs(hx), Math.abs(hy), Math.abs(hz));
    } else if (def.type === 'sphere' && def.radius) {
        const s = Math.max(scale.x, Math.max(scale.y, scale.z));
        colliderDesc = RAPIER.ColliderDesc.ball(def.radius * s);
    } else if (def.type === 'cylinder' && def.height && def.radius) {
        const h = (def.height / 2) * scale.y;
        const r = def.radius * Math.max(scale.x, scale.z);
        colliderDesc = RAPIER.ColliderDesc.cylinder(Math.abs(h), Math.abs(r));
    } else if (def.type === 'cone' && def.height && def.radius) {
        const h = (def.height / 2) * scale.y;
        const r = def.radius * Math.max(scale.x, scale.z);
        colliderDesc = RAPIER.ColliderDesc.cone(Math.abs(h), Math.abs(r));
    } else if (def.type === 'heightfield' && def.heightData && def.fieldSize && def.size) {
        const nrows = def.fieldSize.rows;
        const ncols = def.fieldSize.cols;
        const heights = def.heightData;
        
        const numVerts = nrows * ncols;
        const vertices = new Float32Array(numVerts * 3);
        const indices = new Uint32Array((nrows - 1) * (ncols - 1) * 6);

        const targetW = def.size.w * scale.x;
        const targetD = def.size.d * scale.z;
        const stepX = targetW / Math.max(1, ncols - 1);
        const stepZ = targetD / Math.max(1, nrows - 1);
        const startX = -targetW / 2;
        const startZ = -targetD / 2;

        for (let i = 0; i < nrows; i++) {
            for (let j = 0; j < ncols; j++) {
                const idx = i * ncols + j;
                vertices[idx * 3 + 0] = startX + j * stepX;
                vertices[idx * 3 + 1] = heights[idx] * scale.y;
                vertices[idx * 3 + 2] = startZ + i * stepZ;
            }
        }

        let ptr = 0;
        for (let i = 0; i < nrows - 1; i++) {
            for (let j = 0; j < ncols - 1; j++) {
                const row1 = i * ncols;
                const row2 = (i + 1) * ncols;
                
                indices[ptr++] = row1 + j;
                indices[ptr++] = row2 + j;
                indices[ptr++] = row1 + j + 1;
                
                indices[ptr++] = row1 + j + 1;
                indices[ptr++] = row2 + j;
                indices[ptr++] = row2 + j + 1;
            }
        }

        colliderDesc = RAPIER.ColliderDesc.trimesh(vertices, indices);
    }

    if (colliderDesc) {
        // Retrieve base mass from userdata if available
        const userData = (body as any).userData;
        const baseMass = userData?.baseMass ?? def.mass;

        if (baseMass && baseMass > 0) {
            colliderDesc.setMass(baseMass * scale.x * scale.y * scale.z);
        } else {
            colliderDesc.setDensity(1.0);
        }
        
        colliderDesc.setRestitution(0.3).setFriction(0.6); 
        this.world.createCollider(colliderDesc, body);
    }
  }
}
