
import { ComponentStore } from './component-store';
import { TransformStore } from './transform-store';
import { Entity, RigidBodyRef, MeshRef, PhysicsBodyDef, PhysicsProps } from '../schema';

export class World {
  private nextId = 0;
  private freeIds: Entity[] = []; // ID Recycling Stack
  
  entities = new Set<Entity>();

  // Component Storages
  transforms = new TransformStore(); // Optimized SoA Store
  rigidBodies = new ComponentStore<RigidBodyRef>();
  meshes = new ComponentStore<MeshRef>();
  
  // Data needed for reconstruction/logic
  bodyDefs = new ComponentStore<PhysicsBodyDef>();
  physicsProps = new ComponentStore<PhysicsProps>();
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
    this.bodyDefs.remove(e);
    this.physicsProps.remove(e);
    this.names.remove(e);
    this.templateIds.remove(e);
    this.buoyant.remove(e);
    
    this.freeIds.push(e);
  }

  clear() {
    this.entities.clear();
    this.transforms.clear();
    this.rigidBodies.clear();
    this.meshes.clear();
    this.bodyDefs.clear();
    this.physicsProps.clear();
    this.names.clear();
    this.templateIds.clear();
    this.buoyant.clear();
    
    this.nextId = 0;
    this.freeIds = [];
  }
}
