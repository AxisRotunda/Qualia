
import { Injectable, inject } from '@angular/core';
import { EntityStoreService } from './ecs/entity-store.service';
import { SceneRegistryService } from './level/scene-registry.service';
import { EntityLibraryService } from './features/entity-library.service';
import { TemplateFactoryService } from '../services/factories/template-factory.service';
import { NullShield } from './utils/string.utils';
import * as THREE from 'three';

export interface SavedEntity {
  tplId: string;
  position: { x: number, y: number, z: number };
  rotation: { x: number, y: number, z: number, w: number };
  scale: { x: number, y: number, z: number };
  props?: {
      friction: number;
      restitution: number;
      density: number;
  };
}

export interface SavedScene {
  version: number;
  meta: {
      sceneId?: string;
      label?: string;
      timestamp: number;
  };
  entities: SavedEntity[];
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
        const entities: SavedEntity[] = [];

        this.entityStore.world.entities.forEach(e => {
            const tplId = this.entityStore.world.templateIds.get(e);
            const t = this.entityStore.world.transforms.get(e);
            const p = this.entityStore.world.physicsProps.get(e);

            if (tplId && t) {
                entities.push({
                    tplId: String(tplId),
                    position: { x: t.position.x, y: t.position.y, z: t.position.z },
                    rotation: { x: t.rotation.x, y: t.rotation.y, z: t.rotation.z, w: t.rotation.w },
                    scale: { x: t.scale.x, y: t.scale.y, z: t.scale.z },
                    props: p ? {
                        friction: p.friction,
                        restitution: p.restitution,
                        density: p.density || 1000
                    } : undefined
                });
            }
        });

        return {
            version: 2,
            meta: {
                sceneId: currentSceneId ? String(currentSceneId) : undefined,
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
        if (!data || !data.entities) return;

        this.entityStore.reset();

        const gravity = typeof data.engine?.gravityY === 'number' ? data.engine.gravityY : -9.81;
        engine.setGravity(gravity);

        if (data.engine && engine.texturesEnabled() !== data.engine.texturesEnabled) {
            engine.viewport.toggleTextures();
        }

        const sceneId = NullShield.trim(data.meta?.sceneId);
        if (sceneId) {
            engine.state.setCurrentSceneId(sceneId);
            const preset = this.sceneRegistry.getPreset(sceneId);
            const atm = preset?.theme === 'forest' ? 'forest' : preset?.theme === 'ice' ? 'ice' : 'clear';
            engine.setAtmosphere(atm);
        } else {
            engine.state.setCurrentSceneId(null);
            engine.setAtmosphere('clear');
        }

        data.entities.forEach(e => {
            if (!e) return;
            const tplId = NullShield.trim(e.tplId);
            if (!tplId || !e.position || !e.rotation) return;

            const px = Number.isFinite(e.position.x) ? e.position.x : 0;
            const py = Number.isFinite(e.position.y) ? e.position.y : 5;
            const pz = Number.isFinite(e.position.z) ? e.position.z : 0;
            const rx = Number.isFinite(e.rotation.x) ? e.rotation.x : 0;
            const ry = Number.isFinite(e.rotation.y) ? e.rotation.y : 0;
            const rz = Number.isFinite(e.rotation.z) ? e.rotation.z : 0;
            const rw = Number.isFinite(e.rotation.w) ? e.rotation.w : 1;

            const pos = new THREE.Vector3(px, py, pz);
            const rot = new THREE.Quaternion(rx, ry, rz, rw);

            try {
                const tpl = this.entityLib.getTemplate(tplId);
                if (tpl) {
                    const ent = this.factory.spawn(this.entityStore, tpl, pos, rot);
                    if (e.scale) {
                        const sx = Number.isFinite(e.scale.x) ? e.scale.x : 1;
                        const sy = Number.isFinite(e.scale.y) ? e.scale.y : 1;
                        const sz = Number.isFinite(e.scale.z) ? e.scale.z : 1;
                        this.entityStore.world.transforms.setScale(ent, sx, sy, sz);
                        const rb = this.entityStore.world.rigidBodies.get(ent);
                        const def = this.entityStore.world.bodyDefs.get(ent);
                        if (def && rb) engine.physicsService.shapes.updateBodyScale(rb.handle, def, { x: sx, y: sy, z: sz });
                    }
                    if (e.props) engine.ops.updateEntityPhysics(ent, e.props);
                }
            } catch (err) { console.warn(`[PERSISTENCE_REPAIR] Skipped corrupted entry: ${tplId}`, err); }
        });
    }

    saveToLocal(data: SavedScene) { localStorage.setItem('qualia_quick_save', JSON.stringify(data)); }
    loadFromLocal(): SavedScene | null {
        const raw = localStorage.getItem('qualia_quick_save');
        if (raw) { try { return JSON.parse(raw); } catch { return null; } }
        return null;
    }
}
