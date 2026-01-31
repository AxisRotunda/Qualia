
import * as THREE from 'three';
import { SceneContext } from '../../engine/level/scene-context';
import { EngineService } from '../../services/engine.service';
import { yieldToMain } from '../../engine/utils/thread.utils';

export class CityAlgorithm {
  static async generate(ctx: SceneContext, engine: EngineService) {
      // --- Precise Metric Configuration ---
      const blockSize = 24; 
      const highwayHeight = 8;
      
      // Highway Math
      // We want the ring to enclose the grid with some buffer
      // Grid Extent: +/- (gridSize * blockSize) = +/- 96m
      // Buffer for Ramps: ~35m
      const ringRadius = 135; 
      const highwaySegLen = 30; // Asset length
      
      // Calculate segment count to close the loop
      const circumference = 2 * Math.PI * ringRadius;
      const segmentCount = Math.round(circumference / highwaySegLen);
      const angleStep = (Math.PI * 2) / segmentCount;
      // Recalculate exact radius to match integer segments
      const exactRadius = (segmentCount * highwaySegLen) / (2 * Math.PI);

      engine.state.loadingStage.set('PAVING HIGHWAYS');

      // 1. Highway Ring
      for(let i=0; i<segmentCount; i++) {
          const angle = i * angleStep;
          const x = Math.cos(angle) * exactRadius;
          const z = Math.sin(angle) * exactRadius;
          
          // Tangent rotation (Perpendicular to radius)
          const rot = new THREE.Euler(0, -angle + Math.PI/2, 0);
          
          ctx.spawn('terrain-highway', x, highwayHeight, z, { alignToBottom: true, rotation: rot });
      }
      
      // 2. Interchanges (Ramps connecting Ground to Highway)
      // Cardinal Directions (N, S, E, W)
      const rampLen = 30;
      // Start of ramp (Ground) should be at: exactRadius - rampLen_projected
      const rampStartX = exactRadius - (rampLen * 0.98); // Slight overlap
      
      const directions = [
          { angle: 0, x: rampStartX, z: 0 },       // East
          { angle: Math.PI, x: -rampStartX, z: 0 }, // West
          { angle: Math.PI/2, x: 0, z: rampStartX }, // South
          { angle: -Math.PI/2, x: 0, z: -rampStartX } // North
      ];

      directions.forEach(dir => {
          const rampRot = new THREE.Euler(0, -dir.angle, 0); 
          const dist = exactRadius - (rampLen / 2) - 1.0; 
          const rx = Math.cos(dir.angle) * dist;
          const rz = Math.sin(dir.angle) * dist;
          
          ctx.spawn('terrain-ramp', rx, 0, rz, { alignToBottom: true, rotation: rampRot });
      });

      engine.state.loadingStage.set('ZONING DISTRICTS');
      // Set progress to start from 50% (after preloading)
      engine.state.loadingProgress.set(50);
      await yieldToMain();

      // 3. Inner City Grid
      const gridRange = 4; // -4 to 4
      
      for (let x = -gridRange; x <= gridRange; x++) {
          // Progress 50% -> 90%
          const prog = 50 + ((x + gridRange) / (gridRange * 2)) * 40; 
          engine.state.loadingProgress.set(prog);
          
          if (x % 2 === 0) await yieldToMain();

          for (let z = -gridRange; z <= gridRange; z++) {
              const px = x * blockSize;
              const pz = z * blockSize;
              
              const dist = Math.sqrt(px*px + pz*pz);
              
              // Center Plaza Clearance
              if (dist < 30) continue; 

              // Check if this is a main arterial road (X=0 or Z=0)
              const isArterialX = (z === 0);
              const isArterialZ = (x === 0);
              
              const isRoadX = (z % 2 === 0);
              const isRoadZ = (x % 2 === 0);
              
              let spawned = false;

              // Force Arterial Connections
              if (isArterialX) {
                  // Connects East-West
                  if (x % 2 === 0) {
                      ctx.spawn('terrain-intersection', px, 0, pz, { alignToBottom: true });
                  } else {
                      ctx.spawn('terrain-road', px, 0, pz, { alignToBottom: true, scale: 1.6 });
                  }
                  spawned = true;
              } else if (isArterialZ) {
                  // Connects North-South
                  if (z % 2 === 0) {
                      ctx.spawn('terrain-intersection', px, 0, pz, { alignToBottom: true });
                  } else {
                      const rot = new THREE.Euler(0, Math.PI/2, 0);
                      ctx.spawn('terrain-road', px, 0, pz, { alignToBottom: true, rotation: rot, scale: 1.6 });
                  }
                  spawned = true;
              }

              if (spawned) continue;

              // Standard Grid Filling
              if (isRoadX && isRoadZ) {
                  ctx.spawn('terrain-intersection', px, 0, pz, { alignToBottom: true });
                  ctx.spawn('prop-sensor-unit', px - 6, 0, pz - 6, { alignToBottom: true });
              } 
              else if (isRoadX) {
                  ctx.spawn('terrain-road', px, 0, pz, { alignToBottom: true, scale: 1.6 });
              }
              else if (isRoadZ) {
                  const rot = new THREE.Euler(0, Math.PI/2, 0);
                  ctx.spawn('terrain-road', px, 0, pz, { alignToBottom: true, rotation: rot, scale: 1.6 });
              }
              else {
                  // Zoning
                  const normalizedDist = dist / exactRadius;
                  
                  // Add some randomness but generally denser near center
                  if (normalizedDist < 0.5) {
                      if (Math.random() > 0.3) {
                          ctx.spawn('building-skyscraper', px, 0, pz, { alignToBottom: true });
                      } else {
                          ctx.spawn('building-tall', px, 0, pz, { alignToBottom: true });
                      }
                  } else {
                      if (Math.random() > 0.4) {
                          ctx.spawn('building-wide', px, 0, pz, { alignToBottom: true });
                      } else {
                          ctx.spawn('building-small', px, 0, pz, { alignToBottom: true });
                      }
                  }
              }
          }
      }
      
      // 4. Roundabout Plaza
      engine.state.loadingStage.set('FINALIZING');
      
      ctx.spawn('terrain-roundabout', 0, 0.05, 0, { alignToBottom: true });
      
      // Hero Feature
      const treeId = ctx.spawn('hero-tree', 0, 0, 0, { alignToBottom: true, scale: 2.5 });
      ctx.modify(treeId, { rotation: new THREE.Euler(0, Math.random()*6, 0) });

      // 5. Populate Details
      ctx.scatter(20, 25, (x, z) => {
          if (Math.sqrt(x*x + z*z) > 8) { 
             ctx.spawn(Math.random() > 0.5 ? 'prop-crate' : 'prop-barrel', x, 10, z);
          }
      });

      return exactRadius;
  }
}
