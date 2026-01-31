
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EntityStoreService } from './entity-store.service';
import { PhysicsService, PhysicsBodyDef } from '../../services/physics.service';
import { SceneGraphService } from '../graphics/scene-graph.service';
import { VisualsFactoryService } from '../graphics/visuals-factory.service';
import { InstancedMeshService } from '../graphics/instanced-mesh.service';
import { EntityLibraryService } from '../../services/entity-library.service';
import { EntityLifecycleService } from './entity-lifecycle.service';
import { Entity } from '../core';

@Injectable({
  providedIn: 'root'
})
export class EntityAssemblerService {
  private store = inject(EntityStoreService);
  private physics = inject(PhysicsService);
  private sceneGraph = inject(SceneGraphService);
  private visualsFactory = inject(VisualsFactoryService);
  private instancedService = inject(InstancedMeshService);
  private entityLib = inject(EntityLibraryService);
  private lifecycle = inject(EntityLifecycleService);

  /**
   * Core Assembler: Wires up Physics, Visuals, and ECS Data for a new entity.
   */
  createEntityFromDef(
    bodyDef: PhysicsBodyDef, 
    visualOpts: { color?: number, materialId?: string, meshId?: string }, 
    name: string, 
    templateId?: string
  ): Entity {
      const world = this.store.world;
      const entity = world.createEntity();
      
      let category = 'prop';
      let tags: string[] = [];
      let isStatic = true; // Default to static
      
      if (templateId) {
          const tpl = this.entityLib.getTemplate(templateId);
          if (tpl) {
              category = tpl.category;
              tags = tpl.tags;
              // Determine if dynamic based on mass or explicit tags
              if (tpl.mass > 0 || tags.includes('dynamic') || tags.includes('hero') || tags.includes('vehicle')) {
                  isStatic = false;
              }
          }
      }
      // Fallback: If mass in bodyDef is > 0, it's dynamic
      if (bodyDef.mass && bodyDef.mass > 0) isStatic = false;

      // Create Visual Representation (Mesh or Proxy)
      const mesh = this.visualsFactory.createMesh(
          bodyDef, 
          visualOpts, 
          templateId ? { entity, templateId, category, tags } : undefined
      );
      
      // Add to optimized entity group if it's a real mesh (Proxies are handled by InstancedMeshService)
      if (mesh instanceof THREE.Mesh) {
          this.sceneGraph.addEntity(mesh);
      }

      // Populate ECS Components
      world.rigidBodies.add(entity, { handle: bodyDef.handle });
      world.meshes.add(entity, { mesh: mesh as THREE.Mesh });
      world.transforms.add(entity, {
        position: { ...bodyDef.position },
        rotation: { ...bodyDef.rotation },
        scale: { x: 1, y: 1, z: 1 }
      });
      world.bodyDefs.add(entity, bodyDef);
      world.physicsProps.add(entity, { friction: 0.5, restitution: 0.5 });
      world.names.add(entity, name);
      if (templateId) world.templateIds.add(entity, templateId);

      // Auto-Apply Buoyancy for dynamic props
      if (tags.includes('dynamic') || tags.includes('prop') || tags.includes('debris') || tags.includes('hero')) {
          world.buoyant.add(entity, true);
      }

      // Register with Physics Registry (Handle -> Entity)
      // Kept here as it's tightly coupled with the Handle creation which just happened
      this.physics.registry.register(bodyDef.handle, entity);
      
      // Notify Systems via Event Bus
      this.lifecycle.onEntityCreated.next({ entity, isStatic, tags });
      
      this.store.objectCount.update(c => c + 1);
      
      return entity;
  }

  destroyEntity(e: Entity) {
    if (this.store.selectedEntity() === e) this.store.selectedEntity.set(null);
    
    // Cleanup Physics
    const rb = this.store.world.rigidBodies.get(e);
    if (rb) {
        this.physics.world.removeBody(rb.handle);
    }
    
    // Cleanup Visuals
    const meshRef = this.store.world.meshes.get(e);
    if (meshRef) {
        const mesh = meshRef.mesh;
        const tplId = this.store.world.templateIds.get(e);
        if (tplId) {
             this.instancedService.unregister(tplId, e);
        }
        
        this.sceneGraph.removeEntity(mesh);
        this.visualsFactory.disposeMesh(mesh);
    }
    
    // Notify Systems
    this.lifecycle.onEntityDestroyed.next(e);
    
    // Cleanup ECS
    this.store.world.destroyEntity(e);
    this.store.objectCount.update(c => c - 1);
  }
}
