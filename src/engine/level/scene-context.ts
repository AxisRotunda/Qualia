
import * as THREE from 'three';
import { Ray } from '@dimforge/rapier3d-compat';
import { EngineService } from '../../services/engine.service';
import { SpawnOptions } from '../../services/factories/template-factory.service';
import { Entity } from '../core';
import { TerrainLayerConfig } from '../features/terrain-manager.service';
import { ProceduralUtils } from '../utils/procedural.utils';

export interface ModifyProps {
    position?: { x: number, y: number, z: number };
    rotation?: THREE.Euler | THREE.Quaternion;
    scale?: { x: number, y: number, z: number } | number;
    physicsMaterial?: string;
}

export type SceneSpawnOptions = SpawnOptions & {
    rotation?: THREE.Euler;
    snapToSurface?: boolean;
    snapOffset?: number;
};

export class SceneContext {
    constructor(public engine: EngineService) {}

    /**
   * Applies a predefined atmospheric preset.
   */
    atmosphere(preset: 'clear'|'fog'|'night'|'forest'|'ice'|'space'|'city'|'blizzard'|'desert'|'summit'|'factory'|'volcanic'|'underwater'|'fallout'|'citadel'): this {
        this.engine.env.setAtmosphere(preset); return this;
    }
    weather(type: 'clear' | 'snow' | 'rain' | 'ash'): this {
        this.engine.env.setWeather(type); return this;
    }
    time(hour: number): this {
        this.engine.env.setTimeOfDay(hour); return this;
    }
    light(settings: { dirIntensity?: number; ambientIntensity?: number; dirColor?: string }): this {
        this.engine.env.setLightSettings(settings); return this;
    }
    gravity(g: number): this {
        this.engine.sim.setGravity(g); return this;
    }
    water(level: number | null, timeScale: number = 1.0): this {
        this.engine.state.setWaterLevel(level);
        this.engine.state.setWaveTimeScale(timeScale);
        return this;
    }
    cameraPreset(preset: 'top' | 'front' | 'side'): this {
        this.engine.input.setCameraPreset(preset); return this;
    }

    spawn(templateId: string, x: number, y: number, z: number, options?: SceneSpawnOptions): Entity {
        let spawnY = y;

        if (options?.snapToSurface) {
            const hitY = this.raycastGround(x, z, y + 200);
            if (hitY !== null) {
                spawnY = hitY;
            } else {
                const activeTerrain = this.engine.terrain.activeTerrainType();
                spawnY = ProceduralUtils.getTerrainHeight(x, z, activeTerrain);
            }
            spawnY += (options.snapOffset || 0);
        }

        const pos = new THREE.Vector3(x, spawnY + 0.01, z);
        const rot = options?.rotation ? new THREE.Quaternion().setFromEuler(options.rotation) : undefined;
        const tpl = this.engine.library.getTemplate(templateId);

        return tpl ? this.engine.sys.entityFactory.spawn(this.engine.entityMgr, tpl, pos, rot, options) : -1;
    }

    modify(entity: Entity, props: ModifyProps): this {
        const store = this.engine.entityMgr;
        if (!store.world.entities.has(entity)) return this;

        if (props.scale !== undefined) {
            const s = typeof props.scale === 'number' ? { x: props.scale, y: props.scale, z: props.scale } : props.scale;
            store.world.transforms.setScale(entity, s.x, s.y, s.z);

            const rb = store.world.rigidBodies.get(entity);
            const def = store.world.bodyDefs.get(entity);
            if (rb && def) {
                this.engine.sys.physics.shapes.updateBodyScale(rb.handle, def, s);
            }
        }

        const current = store.world.transforms.get(entity)!;
        const pos = props.position ? { ...props.position } : current.position;
        let rot = current.rotation;

        if (props.rotation) {
            const q = (props.rotation instanceof THREE.Euler) ? new THREE.Quaternion().setFromEuler(props.rotation) : props.rotation;
            rot = { x: q.x, y: q.y, z: q.z, w: q.w };
        }

        if (props.position || props.rotation) {
            store.world.transforms.setPosition(entity, pos.x, pos.y, pos.z);
            store.world.transforms.setRotation(entity, rot.x, rot.y, rot.z, rot.w);

            const rb = store.world.rigidBodies.get(entity);
            if (rb) {
                this.engine.sys.physics.world.updateBodyTransform(rb.handle, pos, rot);
            }
        }

        if (props.physicsMaterial) {
            const rb = store.world.rigidBodies.get(entity);
            if (rb) {
                const matData = this.engine.sys.physics.materials.getMaterialData(props.physicsMaterial);
                this.engine.sys.physics.materials.updateBodyMaterial(rb.handle, matData);
            }
        }

        const meshRef = store.world.meshes.get(entity);
        if (meshRef) {
            const updated = store.world.transforms.get(entity)!;
            meshRef.mesh.position.set(updated.position.x, updated.position.y, updated.position.z);
            meshRef.mesh.quaternion.set(updated.rotation.x, updated.rotation.y, updated.rotation.z, updated.rotation.w);
            meshRef.mesh.scale.set(updated.scale.x, updated.scale.y, updated.scale.z);
        }

        return this;
    }

    async terrain(config: Omit<TerrainLayerConfig, 'centerResolution' | 'edgeResolution'> & { resolution?: number }): Promise<this> {
        const fullConfig: TerrainLayerConfig = { centerResolution: 100, edgeResolution: 50, ...config };
        if (config.resolution) { fullConfig.centerResolution = config.resolution; fullConfig.edgeResolution = Math.floor(config.resolution / 2); }
        await this.engine.terrain.generateSurroundingGrid(fullConfig);
        return this;
    }

    grid(cols: number, rows: number, step: number, callback: (x: number, z: number, col: number, row: number) => void): this {
        const offsetX = ((cols - 1) * step) / 2; const offsetZ = ((rows - 1) * step) / 2;
        for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) callback(i * step - offsetX, j * step - offsetZ, i, j);
        return this;
    }

    scatter(count: number, range: number, callback: (x: number, z: number) => void): this {
        for (let i = 0; i < count; i++) callback((Math.random() - 0.5) * range, (Math.random() - 0.5) * range);
        return this;
    }

    private raycastGround(x: number, z: number, startY: number): number | null {
        const world = this.engine.sys.physics.rWorld;
        if (!world) return null;
        const ray = new Ray({ x, y: startY, z }, { x: 0, y: -1, z: 0 });
        const hit = world.castRay(ray, 1000, true);
        if (hit) return startY - hit.timeOfImpact;
        return null;
    }
}
