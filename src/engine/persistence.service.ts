
import { Injectable, inject } from '@angular/core';
import { EntityStoreService } from './ecs/entity-store.service';
import { SceneRegistryService } from '../services/scene-registry.service';
import { EntityLibraryService } from '../services/entity-library.service';
import { TemplateFactoryService } from '../services/factories/template-factory.service';
import * as THREE from 'three';

export interface SavedScene {
  version: number;
  meta: {
      sceneId?: string;
      label?: string;
      timestamp: number;
  };
  entities: {
    tplId: string;
    position: {x:number, y:number, z:number};
    rotation: {x:number, y:number, z:number, w:number};
    scale: {x:number, y:number, z:number};
  }[];
  engine: {
    gravityY: number;
    texturesEnabled: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {
  private entityStore = inject(EntityStoreService);
  private sceneRegistry = inject(SceneRegistryService);
  private entityLib = inject(EntityLibraryService);
  private factory = inject(TemplateFactoryService);

  exportScene(currentSceneId: string | null, gravity: number, textures: boolean): SavedScene {
    const entities: SavedScene['entities'] = [];
    
    this.entityStore.world.entities.forEach(e => {
        const tplId = this.entityStore.world.templateIds.get(e);
        const t = this.entityStore.world.transforms.get(e); // Snapshot
        if (tplId && t) {
            entities.push({
                tplId,
                position: { ...t.position },
                rotation: { ...t.rotation },
                scale: { ...t.scale }
            });
        }
    });

    return {
        version: 1,
        meta: {
            sceneId: currentSceneId ?? undefined,
            label: currentSceneId ? this.sceneRegistry.getLabel(currentSceneId) : 'Custom Sandbox',
            timestamp: Date.now()
        },
        entities,
        engine: {
            gravityY: gravity,
            texturesEnabled: textures
        }
    };
  }

  loadSceneData(data: SavedScene, engine: any) {
      this.entityStore.reset();
      engine.setGravity(data.engine.gravityY);
      if (engine.texturesEnabled() !== data.engine.texturesEnabled) {
          engine.toggleTextures();
      }

      // Restore Atmosphere
      if (data.meta.sceneId) {
          engine.currentSceneId.set(data.meta.sceneId);
          const preset = this.sceneRegistry.getPreset(data.meta.sceneId);
          const atm = preset?.theme === 'forest' ? 'forest' : preset?.theme === 'ice' ? 'ice' : 'clear';
          engine.setAtmosphere(atm);
      } else {
          engine.currentSceneId.set(null);
          engine.setAtmosphere('clear');
      }

      // Spawn Entities
      data.entities.forEach(e => {
          const pos = new THREE.Vector3(e.position.x, e.position.y, e.position.z);
          const rot = new THREE.Quaternion(e.rotation.x, e.rotation.y, e.rotation.z, e.rotation.w);
          
          try {
              const tpl = this.entityLib.getTemplate(e.tplId);
              if (tpl) {
                  const ent = this.factory.spawn(this.entityStore, tpl, pos, rot);
                  
                  if (e.scale.x !== 1 || e.scale.y !== 1 || e.scale.z !== 1) {
                       // Apply scale to ECS & Physics
                       this.entityStore.world.transforms.setScale(ent, e.scale.x, e.scale.y, e.scale.z);
                       
                       const def = this.entityStore.world.bodyDefs.get(ent);
                       const rb = this.entityStore.world.rigidBodies.get(ent);
                       if(def && rb) {
                           engine.physicsService.shapes.updateBodyScale(rb.handle, def, e.scale);
                       }
                  }
              }
          } catch(err) {
              console.warn(`Failed to spawn ${e.tplId}`, err);
          }
      });
  }

  saveToLocal(data: SavedScene) {
      localStorage.setItem('qualia_quick_save', JSON.stringify(data));
  }

  loadFromLocal(): SavedScene | null {
      const raw = localStorage.getItem('qualia_quick_save');
      if (raw) {
          try {
              return JSON.parse(raw);
          } catch { return null; }
      }
      return null;
  }
}
