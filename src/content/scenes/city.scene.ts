
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { yieldToMain } from '../../engine/utils/thread.utils';

export const CITY_SCENE: ScenePreset = {
  id: 'city', 
  label: 'Metropolis', 
  description: 'Dense urban center with elevated highway ring road, interchanges, and varied zoning.', 
  theme: 'city', 
  previewColor: 'from-blue-700 to-slate-900',
  load: async (ctx, engine) => {
      ctx.atmosphere('city')
         .weather('clear')
         .time(16.5) 
         .gravity(-9.81)
         .cameraPreset('top'); 

      if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

      // --- Precise Metric Configuration ---
      const blockSize = 24; 
      const gridSize = 4; // 4 blocks radius from center (Total 9x9 grid including 0)
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
      // The ramp is straight, so projected length is approx rampLen
      const rampStartX = exactRadius - (rampLen * 0.98); // Slight overlap
      
      const directions = [
          { angle: 0, x: rampStartX, z: 0 },       // East
          { angle: Math.PI, x: -rampStartX, z: 0 }, // West
          { angle: Math.PI/2, x: 0, z: rampStartX }, // South
          { angle: -Math.PI/2, x: 0, z: -rampStartX } // North
      ];

      directions.forEach(dir => {
          const rot = new THREE.Euler(0, -dir.angle + Math.PI/2, 0);
          // Ramps are spawned at center.
          // Architecture generator creates ramp from z = -L/2 to L/2. 
          // Center Y is at height/2? No, `alignToBottom` puts Y=0 at spawned Y.
          // The ramp goes UP in Z direction (in local space).
          // We need to position the center of the ramp such that the TOP touches highway radius.
          // Local Z top is +15. Local Z bottom is -15.
          // We want Local Z top (+15) to be at exactRadius.
          // So Center Z should be at exactRadius - 15.
          
          const dist = exactRadius - (rampLen / 2) - 1.0; // -1.0 for gap safety
          const rx = Math.cos(dir.angle) * dist;
          const rz = Math.sin(dir.angle) * dist;
          
          // We need to rotate 180 degrees because default ramp goes UP in +Z?
          // Check arch-road.service.ts:
          // "Slant geometry: lower z-start vertices, raise z-end vertices"
          // Z goes -L/2 to L/2. +Z is HIGH.
          // Highway is at Radius. Ground is at Center.
          // So we want +Z to point AWAY from center (towards Radius).
          // dir.angle 0 (East) -> (1, 0).
          // Rot should orient +Z to (1, 0).
          // Default +Z is (0, 1). So -90 deg rotation.
          
          const rampRot = new THREE.Euler(0, -dir.angle, 0); // Correct alignment
          
          ctx.spawn('terrain-ramp', rx, 0, rz, { alignToBottom: true, rotation: rampRot });
      });

      engine.state.loadingStage.set('ZONING DISTRICTS');
      await yieldToMain();

      // 3. Inner City Grid
      const gridRange = 4; // -4 to 4
      
      for (let x = -gridRange; x <= gridRange; x++) {
          const prog = ((x + gridRange) / (gridRange * 2)) * 60; 
          engine.state.loadingProgress.set(20 + prog);
          
          if (x % 2 === 0) await yieldToMain();

          for (let z = -gridRange; z <= gridRange; z++) {
              const px = x * blockSize;
              const pz = z * blockSize;
              
              const dist = Math.sqrt(px*px + pz*pz);
              
              // Center Plaza Clearance
              if (dist < 30) continue; 

              // Check if this is a main arterial road (X=0 or Z=0)
              // We ensure specific roads exist to connect to the ramps
              const isArterialX = (z === 0);
              const isArterialZ = (x === 0);
              
              const isRoadX = (z % 2 === 0);
              const isRoadZ = (x % 2 === 0);
              
              let spawned = false;

              // Force Arterial Connections
              if (isArterialX) {
                  // Connects East-West
                  if (x % 2 === 0) {
                      // Intersection on evens
                      ctx.spawn('terrain-intersection', px, 0, pz, { alignToBottom: true });
                  } else {
                      // Road
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

      // 6. View
      engine.input.setMode('walk');
      const cam = engine.sceneService.getCamera();
      cam.position.set(0, 15, exactRadius + 10); 
      cam.lookAt(0, 5, 0);
  }
};
