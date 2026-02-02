
import { Injectable, inject } from '@angular/core';
import { GameSystem } from '../system';
import { EntityStoreService } from '../ecs/entity-store.service';
import { EntityAssemblerService } from '../ecs/entity-assembler.service';
import { PhysicsService } from '../../services/physics.service';
import { TerrainManagerService } from '../features/terrain-manager.service';
import { ProceduralUtils } from '../utils/procedural.utils';
import { Entity } from '../schema';
import { NullShield } from '../utils/string.utils';
import { EngineStateService } from '../engine-state.service';

/**
 * RepairSystem: Post-Physics stability and data hygiene enforcement.
 * RUN_REPAIR: Enforces kinetic boundaries and prevents simulation collapse.
 * RUN_OPT: Zero-allocation hotpath for stability checks.
 */
@Injectable({
  providedIn: 'root'
})
export class RepairSystem implements GameSystem {
  readonly priority = 210;

  private entityStore = inject(EntityStoreService);
  private physics = inject(PhysicsService);
  private assembler = inject(EntityAssemblerService);
  private terrainManager = inject(TerrainManagerService);
  private state = inject(EngineStateService);

  private readonly VOID_Y = -100;
  private readonly VOID_Z_LIMIT = 600; 
  private readonly VOID_X_LIMIT = 600;
  
  private readonly SAFE_SPAWN = { x: 0, y: 5, z: 0 };
  private readonly MAX_LINVEL_SQ = 500 * 500; 
  private readonly MAX_ANGVEL_SQ = 100 * 100; 
  
  private readonly purgeBuffer: Entity[] = [];
  private readonly ghostBuffer: number[] = []; 
  private readonly _zeroVel = { x: 0, y: 0, z: 0 };

  update(): void {
    const world = this.entityStore.world;
    const transforms = world.transforms;
    const names = world.names;
    const rigidBodies = world.rigidBodies;
    const registry = this.physics.registry;
    const rWorld = this.physics.rWorld;
    const playerEntity = this.state.playerEntity();
    const terrainType = this.terrainManager.activeTerrainType();

    if (!rWorld) return;

    this.purgeBuffer.length = 0;
    this.ghostBuffer.length = 0;

    // 1. ECS -> Physics Audit (Simulation Healing)
    transforms.forEach((px, py, pz, rx, ry, rz, rw, sx, sy, sz, entity) => {
        
        const posCorrupt = !Number.isFinite(px) || !Number.isFinite(py) || !Number.isFinite(pz);
        const scaleCorrupt = !Number.isFinite(sx) || sx <= 0;

        if (posCorrupt || scaleCorrupt) {
            const targetPos = posCorrupt ? this.SAFE_SPAWN : { x: px, y: py, z: pz };
            transforms.setPose(entity, targetPos.x, targetPos.y, targetPos.z, rx, ry, rz, rw);
            
            const rbHandle = rigidBodies.getHandle(entity);
            if (rbHandle !== undefined) {
                this.physics.world.updateBodyTransform(rbHandle, targetPos);
                const body = rWorld.getRigidBody(rbHandle);
                if (body) {
                    body.setLinvel(this._zeroVel, true);
                    body.setAngvel(this._zeroVel, true);
                }
            }
            return;
        }

        // --- Ground Integrity Check (Anti-Clip) ---
        // If player falls below the calculated terrain height significantly, assume clip-through
        if (entity === playerEntity) {
            const groundY = ProceduralUtils.getTerrainHeight(px, pz, terrainType);
            if (py < groundY - 2.0) {
                // Rescue Player
                const rescueY = groundY + 2.0;
                transforms.setPose(entity, px, rescueY, pz, rx, ry, rz, rw);
                const rbHandle = rigidBodies.getHandle(entity);
                if (rbHandle !== undefined) {
                     this.physics.world.updateBodyTransform(rbHandle, {x: px, y: rescueY, z: pz});
                     const body = rWorld.getRigidBody(rbHandle);
                     if (body) {
                         body.setLinvel(this._zeroVel, true);
                         body.setNextKinematicTranslation({x: px, y: rescueY, z: pz});
                     }
                }
            }
        }

        const outOfBounds = (py < this.VOID_Y) || 
                            (Math.abs(pz) > this.VOID_Z_LIMIT) || 
                            (Math.abs(px) > this.VOID_X_LIMIT);
                            
        if (outOfBounds) {
            this.purgeBuffer.push(entity);
            return;
        }

        const handle = rigidBodies.getHandle(entity);
        if (handle !== undefined) {
            const body = rWorld.getRigidBody(handle);
            if (body && body.isDynamic()) {
                const lv = body.linvel();
                const av = body.angvel();
                if ((lv.x*lv.x + lv.y*lv.y + lv.z*lv.z) > this.MAX_LINVEL_SQ) {
                    body.setLinvel(this._zeroVel, true);
                }
                if ((av.x*av.x + av.y*av.y + av.z*av.z) > this.MAX_ANGVEL_SQ) {
                    body.setAngvel(this._zeroVel, true);
                }
            }
        }

        // --- Identity Sanitization (RUN_REPAIR: Shield against Null-Trim) ---
        const currentName = names.get(entity);
        const safeName = NullShield.entityName(entity, currentName);
        if (currentName !== safeName) {
            names.add(entity, safeName);
        }
    });

    // 2. Ghost Detection
    rWorld.forEachRigidBody((body) => {
        if (body.handle < 0) return; 
        
        const entityId = registry.getEntityId(body.handle);
        if (entityId === undefined || !world.entities.has(entityId)) {
            this.ghostBuffer.push(body.handle);
        }
    });

    // 3. Execution
    if (this.purgeBuffer.length > 0) {
        for (let i = 0; i < this.purgeBuffer.length; i++) {
            this.assembler.destroyEntity(this.purgeBuffer[i]);
        }
    }

    if (this.ghostBuffer.length > 0) {
        for (let i = 0; i < this.ghostBuffer.length; i++) {
            this.physics.world.removeBody(this.ghostBuffer[i]);
        }
    }
  }
}
