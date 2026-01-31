
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EntityStoreService } from './entity-store.service';
import { PhysicsService, PhysicsBodyDef } from '../../services/physics.service';
import { SceneGraphService } from '../graphics/scene-graph.service';
import { VisualsFactoryService } from '../graphics/visuals-factory.service';
import { PhysicsFactoryService } from '../../services/factories/physics-factory.service';
import { InstancedMeshService } from '../graphics/instanced-mesh.service';
import { EntityTemplate, ENTITY_TEMPLATES } from '../../data/entity-templates';
import { Entity } from '../core';
import { VisibilityManagerService } from '../graphics/visibility-manager.service';

@Injectable({
  providedIn: 'root'
})
export class EntityAssemblerService {
  private store = inject(EntityStoreService);
  private physics = inject(PhysicsService);
  private sceneGraph = inject(SceneGraphService);
  private visualsFactory = inject(VisualsFactoryService);
  private instancedService = inject(InstancedMeshService);
  private physicsFactory = inject(PhysicsFactoryService);
  private visibilityManager = inject(VisibilityManagerService);

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
          const tpl = ENTITY_TEMPLATES.find(t => t.id === templateId);
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

      const mesh = this.visualsFactory.createMesh(
          bodyDef, 
          visualOpts, 
          templateId ? { entity, templateId, category, tags } : undefined
      );
      
      // Add to optimized entity group
      if (mesh instanceof THREE.Mesh) {
          this.sceneGraph.addEntity(mesh);
      }

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

      // Register with new Registry Service
      this.physics.registry.register(bodyDef.handle, entity);
      
      // Register for Culling
      this.visibilityManager.register(entity, isStatic);
      
      this.store.objectCount.update(c => c + 1);
      
      return entity;
  }

  duplicateEntity(e: Entity) {
      const world = this.store.world;
      const t = world.transforms.get(e);
      const oldDef = world.bodyDefs.get(e);
      const meshRef = world.meshes.get(e);
      const name = world.names.get(e) || 'Object';
      const tplId = world.templateIds.get(e);

      if (!t || !oldDef || !meshRef) return;

      const newPos = { x: t.position.x + 1, y: t.position.y, z: t.position.z };
      
      const bodyDef = this.physicsFactory.recreateBody(oldDef, newPos.x, newPos.y, newPos.z);
      this.physics.shapes.updateBodyScale(bodyDef.handle, bodyDef, t.scale);
      
      bodyDef.rotation = { ...t.rotation };
      this.physics.world.updateBodyTransform(bodyDef.handle, newPos, t.rotation);

      const mat = (meshRef.mesh as any).material;
      const visualOpts = {
          color: mat?.color?.getHex(),
          materialId: mat?.userData ? mat.userData['mapId'] : undefined,
          meshId: tplId ? ENTITY_TEMPLATES.find(x => x.id === tplId)?.meshId : undefined
      };
      
      const newEntity = this.createEntityFromDef(bodyDef, visualOpts, `${name}_copy`, tplId);
      
      const newT = world.transforms.get(newEntity);
      if (newT) newT.scale = { ...t.scale };
      
      const oldProps = world.physicsProps.get(e);
      if (oldProps) {
          world.physicsProps.add(newEntity, { ...oldProps });
          this.physics.materials.updateBodyMaterial(bodyDef.handle, oldProps);
      }
  }

  destroyEntity(e: Entity) {
    if (this.store.selectedEntity() === e) this.store.selectedEntity.set(null);
    
    const rb = this.store.world.rigidBodies.get(e);
    if (rb) {
        this.physics.world.removeBody(rb.handle);
    }
    
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
    
    this.visibilityManager.unregister(e);
    this.store.world.destroyEntity(e);
    this.store.objectCount.update(c => c - 1);
  }
}
