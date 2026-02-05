
import { ComponentStore } from './component-store';
import { TransformStore } from './transform-store';
import { PhysicsPropsStore } from './physics-props-store';
import { KinematicStore } from './kinematic-store';
import { RigidBodyStore } from './rigid-body-store';
import { IntegrityStore } from './integrity-store';
import { ProjectileStore } from './projectile-store';
import { AgentStore } from './agent-store';
import { Entity, MeshRef, PhysicsBodyDef, AnimationRef } from '../schema';

export class World {
    private nextId = 0;
    private freeIds: Entity[] = []; // ID Recycling Stack

    entities = new Set<Entity>();

    // Component Storages (Optimized SoA)
    transforms = new TransformStore();
    physicsProps = new PhysicsPropsStore();
    kinematicControllers = new KinematicStore();
    rigidBodies = new RigidBodyStore();
    integrity = new IntegrityStore();
    projectiles = new ProjectileStore();
    agents = new AgentStore(); // New: Biological Intelligence Store

    // Component Storages (Standard)
    meshes = new ComponentStore<MeshRef>();
    animations = new ComponentStore<AnimationRef>();

    // Data needed for reconstruction/logic
    bodyDefs = new ComponentStore<PhysicsBodyDef>();
    names = new ComponentStore<string>();
    templateIds = new ComponentStore<string>();

    // Tags / Flags
    buoyant = new ComponentStore<boolean>();

    createEntity(): Entity {
        let id: Entity;
        if (this.freeIds.length > 0) {
            id = this.freeIds.pop()!;
        } else {
            id = this.nextId++;
        }

        this.entities.add(id);
        return id;
    }

    destroyEntity(e: Entity) {
        if (!this.entities.has(e)) return;

        this.entities.delete(e);
        this.transforms.remove(e);
        this.rigidBodies.remove(e);
        this.meshes.remove(e);
        this.kinematicControllers.remove(e);
        this.animations.remove(e);
        this.bodyDefs.remove(e);
        this.physicsProps.remove(e);
        this.names.remove(e);
        this.templateIds.remove(e);
        this.buoyant.remove(e);
        this.integrity.remove(e);
        this.projectiles.remove(e);
        this.agents.remove(e);

        this.freeIds.push(e);
    }

    clear() {
        this.entities.clear();
        this.transforms.clear();
        this.rigidBodies.clear();
        this.meshes.clear();
        this.kinematicControllers.clear();
        this.animations.clear();
        this.bodyDefs.clear();
        this.physicsProps.clear();
        this.names.clear();
        this.templateIds.clear();
        this.buoyant.clear();
        this.integrity.clear();
        this.projectiles.clear();
        this.agents.clear();

        this.nextId = 0;
        this.freeIds = [];
    }
}
