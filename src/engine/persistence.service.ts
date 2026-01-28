
import { Injectable, inject } from '@angular/core';
import { EntityManager } from './entity-manager.service';
import { SceneRegistryService } from '../services/scene-registry.service';
import { EntityLibraryService } from '../services/entity-library.service';
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
  private entityMgr = inject(EntityManager);
  private sceneRegistry = inject(SceneRegistryService);
  private entityLib = inject(EntityLibraryService);

  exportScene(currentSceneId: string | null, gravity: number, textures: boolean): SavedScene {
    const entities: SavedScene['entities'] = [];
    
    this.entityMgr.world.entities.forEach(e => {
        const tplId = this.entityMgr.world.templateIds.get(e);
        const t = this.entityMgr.world.transforms.get(e);
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
      // engine passed as 'any' or interface to avoid circular dep on full EngineService, 
      // primarily we just need specific setters or we act on managers directly.
      
      this.entityMgr.reset();
      engine.setGravity(data.engine.gravityY);
      if (engine.texturesEnabled() !== data.engine.texturesEnabled) {
          engine.toggleTextures();
      }

      // Restore Atmosphere
      if (data.meta.sceneId) {
          engine.currentSceneId.set(data.meta.sceneId);
          const preset = this.sceneRegistry.getPreset(data.meta.sceneId);
          // Assuming SceneService is accessible via engine or injected here if we moved setAtmosphere
          const atm = preset?.theme === 'forest' ? 'forest' : preset?.theme === 'ice' ? 'ice' : 'clear';
          engine.sceneService.setAtmosphere(atm);
      } else {
          engine.currentSceneId.set(null);
          engine.sceneService.setAtmosphere('clear');
      }

      // Spawn Entities
      data.entities.forEach(e => {
          const pos = new THREE.Vector3(e.position.x, e.position.y, e.position.z);
          const rot = new THREE.Quaternion(e.rotation.x, e.rotation.y, e.rotation.z, e.rotation.w);
          
          try {
              // We need EntityLibrary here
              const ent = this.entityLib.spawnFromTemplate(this.entityMgr, e.tplId, pos, rot);
              
              if (e.scale.x !== 1 || e.scale.y !== 1 || e.scale.z !== 1) {
                   const t = this.entityMgr.world.transforms.get(ent);
                   const def = this.entityMgr.world.bodyDefs.get(ent);
                   const rb = this.entityMgr.world.rigidBodies.get(ent);
                   if(t && def && rb) {
                       t.scale = { ...e.scale };
                       // We need access to physics update logic
                       engine.physicsService.updateBodyScale(rb.handle, def, t.scale);
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
