
import { Injectable, inject } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsWorldService } from './world.service';
import { PhysicsBodyDef, RigidBodyType } from '../engine/schema';
import { MassCalculator, MassData } from './logic/mass-calculator';
import { PhysicsOptimizerService } from './optimization/physics-optimizer.service';

@Injectable({ providedIn: 'root' })
export class ShapesFactory {
    private worldService = inject(PhysicsWorldService);
    private massCalc = inject(MassCalculator);
    private optimizer = inject(PhysicsOptimizerService);

    private readonly MIN_DIM = 0.001;

    private get world() {
        return this.worldService.world;
    }

    // --- Primitive Factories ---

    createBox(x: number, y: number, z: number, w?: number, h?: number, d?: number, mass?: number, material?: string, bodyType: RigidBodyType = 'dynamic', tags: string[] = []): PhysicsBodyDef {
        const size = { w: this.clamp(w), h: this.clamp(h), d: this.clamp(d) };
        const props = this.massCalc.resolve('box', size, mass, material);
        const colDesc = RAPIER.ColliderDesc.cuboid(size.w / 2, size.h / 2, size.d / 2);

        return this.finalizeBody(x, y, z, bodyType, props, colDesc, tags, {
            type: 'box', size
        });
    }

    createSphere(x: number, y: number, z: number, r?: number, mass?: number, material?: string, bodyType: RigidBodyType = 'dynamic', tags: string[] = []): PhysicsBodyDef {
        const radius = this.clamp(r);
        const props = this.massCalc.resolve('sphere', { r: radius }, mass, material);
        const colDesc = RAPIER.ColliderDesc.ball(radius);

        return this.finalizeBody(x, y, z, bodyType, props, colDesc, tags, {
            type: 'sphere', radius
        });
    }

    createCylinder(x: number, y: number, z: number, height: number, radius: number, mass: number = 1, material?: string, bodyType: RigidBodyType = 'dynamic', tags: string[] = []): PhysicsBodyDef {
        const r = this.clamp(radius); const h = this.clamp(height);
        const props = this.massCalc.resolve('cylinder', { r, h }, mass, material);
        const colDesc = RAPIER.ColliderDesc.cylinder(h / 2, r);

        return this.finalizeBody(x, y, z, bodyType, props, colDesc, tags, {
            type: 'cylinder', height: h, radius: r
        });
    }

    createCone(x: number, y: number, z: number, height: number, radius: number, mass: number = 1, material?: string, bodyType: RigidBodyType = 'dynamic', tags: string[] = []): PhysicsBodyDef {
        const r = this.clamp(radius); const h = this.clamp(height);
        const props = this.massCalc.resolve('cone', { r, h }, mass, material);
        const colDesc = RAPIER.ColliderDesc.cone(h / 2, r);

        return this.finalizeBody(x, y, z, bodyType, props, colDesc, tags, {
            type: 'cone', height: h, radius: r
        });
    }

    createCapsule(x: number, y: number, z: number, height: number, radius: number, mass: number = 1, material?: string, bodyType: RigidBodyType = 'dynamic', tags: string[] = []): PhysicsBodyDef {
        const r = this.clamp(radius); const h = this.clamp(height);
        const props = this.massCalc.resolve('cylinder', { r, h }, mass, material); // Mass calc uses cylinder approximation
        const halfH = Math.max(0.1, (h / 2) - r);
        const colDesc = RAPIER.ColliderDesc.capsule(halfH, r);

        return this.finalizeBody(x, y, z, bodyType, props, colDesc, tags, {
            type: 'capsule', height: h, radius: r
        });
    }

    // --- Complex Geometry Factories ---

    createTrimesh(x: number, y: number, z: number, vertices: Float32Array, indices: Uint32Array, tags: string[] = []): PhysicsBodyDef {
        if (!this.world) throw new Error('Physics not initialized');

        // Trimeshes are strictly static/fixed in Rapier
        const colDesc = RAPIER.ColliderDesc.trimesh(vertices, indices);
        const rbDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z);

        // Default material for static geometry
        colDesc.setRestitution(0.1).setFriction(0.8);

        this.optimizer.applyTo(colDesc, rbDesc, [...tags, 'static'], true);
        const rigidBody = this.world.createRigidBody(rbDesc);
        this.world.createCollider(colDesc, rigidBody);

        return {
            handle: rigidBody.handle,
            type: 'trimesh',
            bodyType: 'fixed',
            position: { x, y, z },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            vertices, indices, mass: 0
        };
    }

    createConvexHull(x: number, y: number, z: number, vertices: Float32Array, mass: number = 1, material?: string, bodyType: RigidBodyType = 'dynamic', tags: string[] = []): PhysicsBodyDef {
        if (!this.world) throw new Error('Physics not initialized');

        if (vertices.length < 9) throw new Error('Convex hull requires at least 3 vertices');
        const cleanVertices = this.sanitizeBuffer(vertices);

        const matData = this.massCalc.resolveMaterialOnly(material);
        const colDesc = RAPIER.ColliderDesc.convexHull(cleanVertices);

        if (!colDesc) {
        // Fallback for degenerate hulls to prevent crash
            console.warn('Convex hull generation failed, falling back to box.');
            return this.createBox(x, y, z, 1, 1, 1, mass, material, bodyType, tags);
        }

        // Reuse finalize logic with manual props
        const props: MassData = {
            mass,
            friction: matData.friction,
            restitution: matData.restitution,
            volume: 0, density: matData.density
        };

        return this.finalizeBody(x, y, z, bodyType, props, colDesc, tags, {
            type: 'convex-hull', vertices: cleanVertices
        });
    }

    createHeightfield(x: number, y: number, z: number, nrows: number, ncols: number, heights: Float32Array, size: {x: number, y: number, z: number}, tags: string[] = []): PhysicsBodyDef {
        if (!this.world) throw new Error('Physics not initialized');

        // RUN_REPAIR: Enforce strict Integer dimensions for WASM parity
        const nr = Math.floor(nrows);
        const nc = Math.floor(ncols);
        const expectedLength = nr * nc;

        if (heights.length !== expectedLength) {
            throw new Error(`[WASM_SHIELD] Heightfield dimension mismatch: Expected ${expectedLength} (${nr}x${nc}), got ${heights.length}`);
        }

        const cleanHeights = this.sanitizeBuffer(heights);

        // WASM_GUARD: Ensure scale components are finite and > 0
        const sx = this.clamp(size.x / Math.max(1, nc - 1));
        const sy = this.clamp(size.y);
        const sz = this.clamp(size.z / Math.max(1, nr - 1));
        const scale = { x: sx, y: sy, z: sz };

        // Sanitized Body Position
        const px = Number.isFinite(x) ? x : 0;
        const py = Number.isFinite(y) ? y : 0;
        const pz = Number.isFinite(z) ? z : 0;

        // Heightfields are always fixed (terrain)
        const rbDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz);

        // Sanitize Translation Components
        const tx = Number.isFinite(size.x) ? -size.x / 2 : 0;
        const tz = Number.isFinite(size.z) ? -size.z / 2 : 0;

        const colDesc = RAPIER.ColliderDesc.heightfield(nr, nc, cleanHeights, scale)
            .setFriction(0.5)
            .setRestitution(0.1)
            .setTranslation(tx, 0, tz); // Center alignment fix

        this.optimizer.applyTo(colDesc, rbDesc, [...tags, 'terrain'], true);
        const rigidBody = this.world.createRigidBody(rbDesc);
        this.world.createCollider(colDesc, rigidBody);

        return {
            handle: rigidBody.handle,
            type: 'heightfield',
            bodyType: 'fixed',
            position: { x: px, y: py, z: pz },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            heightData: cleanHeights,
            fieldSize: { rows: nr, cols: nc },
            size: { w: size.x, h: size.y, d: size.z },
            mass: 0
        };
    }

    // --- Runtime Modification ---

    updateBodyScale(handle: number, def: PhysicsBodyDef, scale: { x: number, y: number, z: number }) {
        if (!this.world) return;
        const body = this.world.getRigidBody(handle);
        if (!body) return;

        // 1. Snapshot previous state
        let oldGroups = 0xFFFF;
        let oldEvents = RAPIER.ActiveEvents.NONE;
        if (body.numColliders() > 0) {
            const c = body.collider(0);
            oldGroups = c.collisionGroups();
            oldEvents = c.activeEvents();
        }

        // 2. Clear old colliders
        const count = body.numColliders();
        for (let i = count - 1; i >= 0; i--) {
            this.world.removeCollider(body.collider(i), false);
        }

        // 3. Generate new ColliderDesc
        const sx = this.clamp(scale.x);
        const sy = this.clamp(scale.y);
        const sz = this.clamp(scale.z);

        const colliderDesc = this.getScaledCollider(def, sx, sy, sz);

        // 4. Apply & Attach
        if (colliderDesc) {
            if (def.mass && def.mass > 0) colliderDesc.setMass(def.mass * (sx * sy * sz));
            else colliderDesc.setDensity(1.0);

            colliderDesc.setCollisionGroups(oldGroups);
            colliderDesc.setActiveEvents(oldEvents);
            this.world.createCollider(colliderDesc, body);
        }
    }

    setLockRotation(handle: number, locked: boolean) {
        this.world?.getRigidBody(handle)?.lockRotations(locked, true);
    }

    // --- Internal Helpers ---

    /**
   * Centralized pipeline for finalizing RigidBody creation.
   * Handles Optimization, Property Assignment, and ECS Def creation.
   */
    private finalizeBody(
        x: number, y: number, z: number,
        requestedType: RigidBodyType,
        props: MassData,
        colDesc: RAPIER.ColliderDesc,
        tags: string[],
        defPartial: Partial<PhysicsBodyDef>
    ): PhysicsBodyDef {
        if (!this.world) throw new Error('Physics not initialized');

        // Promote dynamic bodies with 0 mass to fixed to prevent physics errors
        const finalBodyType = (props.mass === 0 && requestedType === 'dynamic') ? 'fixed' : requestedType;

        const rbDesc = this.createDesc(finalBodyType);
        rbDesc.setTranslation(x, y, z);

        colDesc.setRestitution(props.restitution).setFriction(props.friction);
        if (props.mass > 0) colDesc.setMass(props.mass);

        this.optimizer.applyTo(colDesc, rbDesc, tags, finalBodyType === 'fixed');

        const rigidBody = this.world.createRigidBody(rbDesc);
        this.world.createCollider(colDesc, rigidBody);

        return {
            handle: rigidBody.handle,
            bodyType: finalBodyType,
            position: { x, y, z },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            mass: props.mass,
            ...defPartial
        } as PhysicsBodyDef;
    }

    private getScaledCollider(def: PhysicsBodyDef, sx: number, sy: number, sz: number): RAPIER.ColliderDesc | null {
        switch (def.type) {
            case 'box':
                return RAPIER.ColliderDesc.cuboid((def.size!.w / 2) * sx, (def.size!.h / 2) * sy, (def.size!.d / 2) * sz);
            case 'sphere':
                return RAPIER.ColliderDesc.ball(def.radius! * Math.max(sx, sy, sz));
            case 'cylinder':
                return RAPIER.ColliderDesc.cylinder((def.height! * sy) / 2, def.radius! * Math.max(sx, sz));
            case 'cone':
                return RAPIER.ColliderDesc.cone((def.height! * sy) / 2, def.radius! * Math.max(sx, sz));
            case 'capsule':
                const r = def.radius! * Math.max(sx, sz);
                const h = Math.max(0.1, (def.height! * sy) / 2 - r);
                return RAPIER.ColliderDesc.capsule(h, r);
            case 'convex-hull': {
                if (!def.vertices) return null;
                const scaledHull = this.scaleVertices(def.vertices, sx, sy, sz);
                return RAPIER.ColliderDesc.convexHull(scaledHull);
            }
            case 'trimesh': {
                if (!def.vertices || !def.indices) return null;
                const scaledMesh = this.scaleVertices(def.vertices, sx, sy, sz);
                return RAPIER.ColliderDesc.trimesh(scaledMesh, def.indices);
            }
            case 'heightfield': {
                if (!def.heightData || !def.fieldSize || !def.size) return null;
                const nr = Math.floor(def.fieldSize.rows);
                const nc = Math.floor(def.fieldSize.cols);
                const hScale = {
                    x: (def.size.w * sx) / Math.max(1, nc - 1),
                    y: sy,
                    z: (def.size.d * sz) / Math.max(1, nr - 1)
                };
                const hf = RAPIER.ColliderDesc.heightfield(nr, nc, def.heightData, hScale);
                hf.setTranslation(-(def.size.w * sx) / 2, 0, -(def.size.d * sz) / 2);
                return hf;
            }
            default:
                return null;
        }
    }

    private scaleVertices(vertices: Float32Array, sx: number, sy: number, sz: number): Float32Array {
        const out = new Float32Array(vertices.length);
        for (let i = 0; i < vertices.length; i += 3) {
            const vx = vertices[i] * sx;
            const vy = vertices[i + 1] * sy;
            const vz = vertices[i + 2] * sz;
            out[i] = Number.isFinite(vx) ? vx : 0;
            out[i + 1] = Number.isFinite(vy) ? vy : 0;
            out[i + 2] = Number.isFinite(vz) ? vz : 0;
        }
        return out;
    }

    private sanitizeBuffer(buffer: Float32Array): Float32Array {
        const out = new Float32Array(buffer.length);
        for (let i = 0; i < buffer.length; i++) {
            const v = buffer[i];
            out[i] = Number.isFinite(v) ? v : 0;
        }
        return out;
    }

    private createDesc(type: RigidBodyType): RAPIER.RigidBodyDesc {
        switch (type) {
            case 'fixed': return RAPIER.RigidBodyDesc.fixed();
            case 'kinematicPosition': return RAPIER.RigidBodyDesc.kinematicPositionBased();
            case 'kinematicVelocity': return RAPIER.RigidBodyDesc.kinematicVelocityBased();
            default: return RAPIER.RigidBodyDesc.dynamic();
        }
    }

    private clamp(val: number | undefined): number {
        const v = val ?? 1;
        const f = Number.isFinite(v) ? v : 1;
        return Math.max(this.MIN_DIM, f);
    }
}
