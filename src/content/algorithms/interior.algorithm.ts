
import * as THREE from 'three';
import { SceneContext } from '../../engine/level/scene-context';
import { EngineService } from '../../services/engine.service';

export class InteriorAlgorithm {
  static generateLobby(ctx: SceneContext, engine: EngineService) {
      const roomW = 32;
      const roomD = 40;
      const floorH = 5;
      const ceilingH = 10;
      
      // 1. Structural Shell
      // Floor Plan
      for(let x = -roomW/2; x < roomW/2; x+=4) {
          for(let z = -roomD/2; z < roomD/2; z+=4) {
              ctx.spawn('structure-floor-marble', x + 2, 0, z + 2, { alignToBottom: true });
              ctx.spawn('structure-ceiling', x + 2, ceilingH - 0.1, z + 2);
          }
      }

      // Walls
      const wallTemplate = 'structure-wall-interior'; 
      const rotY90 = new THREE.Euler(0, Math.PI/2, 0);

      const placeWall = (x: number, y: number, z: number, rot?: THREE.Euler) => {
          ctx.spawn(wallTemplate, x, y, z, { alignToBottom: true, rotation: rot });
      };

      // Perimeter Walls
      for(let y = 0; y < ceilingH; y += 5) {
          for(let x = -roomW/2; x < roomW/2; x+=4) {
              placeWall(x + 2, y, -roomD/2);
              if (Math.abs(x) > 4) {
                  placeWall(x + 2, y, roomD/2);
              }
          }
          for(let z = -roomD/2; z < roomD/2; z+=4) {
              placeWall(-roomW/2, y, z + 2, rotY90);
              placeWall(roomW/2, y, z + 2, rotY90);
          }
      }

      // Entrance Vestibule
      ctx.spawn('structure-glass-partition', -3, 0, roomD/2, { alignToBottom: true });
      ctx.spawn('structure-glass-partition', 3, 0, roomD/2, { alignToBottom: true });

      // 2. Mezzanine Structure
      for(let x = -roomW/2; x < roomW/2; x+=4) {
          for(let z = -roomD/2; z < roomD/2; z+=4) {
              const isSide = (x < -roomW/2 + 8) || (x >= roomW/2 - 8);
              const isBack = (z < -8);
              
              if (isSide || isBack) {
                  ctx.spawn('structure-floor-marble', x + 2, floorH, z + 2, { alignToBottom: true });
                  
                  const cx = x+2; const cz = z+2;
                  const railY = floorH + 0.2;

                  if (Math.abs(cx - (-roomW/2 + 8)) < 1 && cz > -8) {
                      ctx.spawn('structure-railing', cx + 2, railY, cz, { alignToBottom: true, rotation: rotY90 });
                  }
                  if (Math.abs(cx - (roomW/2 - 8)) < 1 && cz > -8) {
                      ctx.spawn('structure-railing', cx - 2, railY, cz, { alignToBottom: true, rotation: rotY90 });
                  }
                  if (Math.abs(cz - (-8)) < 1 && Math.abs(cx) < roomW/2 - 8) {
                      ctx.spawn('structure-railing', cx, railY, cz + 2, { alignToBottom: true });
                  }
              }
          }
      }

      // Columns
      const colX = roomW/2 - 8;
      const colZ_Start = -roomD/2 + 4;
      const colZ_End = roomD/2 - 4;
      
      for(let z = colZ_Start; z <= colZ_End; z += 8) {
          ctx.spawn('prop-column-ornate', -colX, 0, z, { alignToBottom: true });
          ctx.spawn('prop-column-ornate', -colX, floorH, z, { alignToBottom: true });
          ctx.spawn('prop-column-ornate', colX, 0, z, { alignToBottom: true });
          ctx.spawn('prop-column-ornate', colX, floorH, z, { alignToBottom: true });
      }

      // 3. Grand Staircase
      ctx.spawn('structure-staircase', -6, 0, 8, { alignToBottom: true }); 
      ctx.spawn('structure-staircase', 6, 0, 8, { alignToBottom: true });
      
      const landingY = 2.3;
      ctx.spawn('structure-floor-marble', -6, landingY, 2, { alignToBottom: true });
      ctx.spawn('structure-floor-marble', 6, landingY, 2, { alignToBottom: true });
      ctx.spawn('structure-floor-marble', -2, landingY, 2, { alignToBottom: true });
      ctx.spawn('structure-floor-marble', 2, landingY, 2, { alignToBottom: true });

      ctx.spawn('structure-staircase', 0, 2.5, -4, { alignToBottom: true });

      // 4. Zones
      // Reception
      const recepX = -8;
      const recepZ = 10;
      const counterId = ctx.spawn('shape-neon-cube', recepX, 0, recepZ, { alignToBottom: true });
      const t = engine.world.transforms.get(counterId);
      if(t) { 
          t.scale = {x: 6, y: 1.2, z: 1};
          t.position.y = 0.6;
          const rb = engine.world.rigidBodies.get(counterId);
          const def = engine.world.bodyDefs.get(counterId);
          if (rb && def) {
              engine.physicsService.shapes.updateBodyScale(rb.handle, def, t.scale); 
              engine.physicsService.world.updateBodyTransform(rb.handle, t.position);
          }
      }
      engine.ops.setEntityName(counterId, 'Reception Desk');
      ctx.spawn('prop-monitor-triple', recepX, 1.2, recepZ, { alignToBottom: true });

      // Lounge
      const carpetId = ctx.spawn('structure-floor-linoleum', 0, 0, 4, { alignToBottom: true });
      const ct = engine.world.transforms.get(carpetId);
      const cm = engine.world.meshes.get(carpetId);
      if(ct && cm) {
          ct.scale = {x: 2.5, y: 0.1, z: 3}; 
          ct.position.y = 0.01;
          const rb = engine.world.rigidBodies.get(carpetId);
          const def = engine.world.bodyDefs.get(carpetId);
          if (rb && def) {
              engine.physicsService.shapes.updateBodyScale(rb.handle, def, ct.scale);
              engine.physicsService.world.updateBodyTransform(rb.handle, ct.position);
          }
          (cm.mesh.material as THREE.MeshStandardMaterial).color.setHex(0x7f1d1d);
          (cm.mesh.material as THREE.MeshStandardMaterial).map = null;
      }

      ctx.spawn('prop-sofa', -3, 0, 4, { alignToBottom: true });
      ctx.spawn('prop-sofa', 3, 0, 4, { alignToBottom: true });
      const rot180 = new THREE.Euler(0, Math.PI, 0);
      ctx.spawn('prop-sofa', -3, 0, 8, { alignToBottom: true, rotation: rot180 });
      ctx.spawn('prop-sofa', 3, 0, 8, { alignToBottom: true, rotation: rot180 });
      
      const tableId = ctx.spawn('prop-glass-block', 0, 0, 6, { alignToBottom: true });
      const tt = engine.world.transforms.get(tableId);
      if(tt) { 
          tt.scale = {x: 1.5, y: 0.2, z: 2.5};
          tt.position.y = 0.2; 
          const rb = engine.world.rigidBodies.get(tableId);
          const def = engine.world.bodyDefs.get(tableId);
          if (rb && def) {
              engine.physicsService.shapes.updateBodyScale(rb.handle, def, tt.scale);
              engine.physicsService.world.updateBodyTransform(rb.handle, tt.position);
          }
      }

      ctx.spawn('prop-chandelier', 0, 8, 0);
      const mainLight = new THREE.PointLight(0xffaa00, 2.0, 20);
      mainLight.position.set(0, 7, 0);
      engine.sceneService.getScene().add(mainLight);
  }
}
