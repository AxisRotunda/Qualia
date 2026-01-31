
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

    // 1. Snapshot existing properties before removal
    let oldGroups = 0xFFFF;
    let oldEvents = RAPIER.ActiveEvents.NONE;
    
    if (body.numColliders() > 0) {
        const c = body.collider(0);
        oldGroups = c.collisionGroups();
        oldEvents = c.activeEvents();
    }

    // 2. Remove existing colliders
    const n = body.numColliders();
    const collidersToRemove: RAPIER.Collider[] = [];
    for(let i=0; i<n; i++) collidersToRemove.push(body.collider(i));
    collidersToRemove.forEach(c => this.world!.removeCollider(c, false));

    // 3. Create Scaled Collider Desc
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
        const targetW = def.size.w * scale.x;
        const targetD = def.size.d * scale.z;
        const targetH = scale.y;
        
        colliderDesc = RAPIER.ColliderDesc.heightfield(
            def.fieldSize.rows, 
            def.fieldSize.cols, 
            def.heightData, 
            { x: targetW, y: targetH, z: targetD }
        );
    }

    // 4. Apply & Reattach
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
        
        // Restore Optimization Config
        colliderDesc.setCollisionGroups(oldGroups);
        colliderDesc.setActiveEvents(oldEvents);

        this.world.createCollider(colliderDesc, body);
    }
  }
}
