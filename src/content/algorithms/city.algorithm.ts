
import * as THREE from 'three';
import { SceneContext } from '../../engine/level/scene-context';
import { EngineService } from '../../services/engine.service';
import { yieldToMain } from '../../engine/utils/thread.utils';

export class CityAlgorithm {
  static async generate(ctx: SceneContext, engine: EngineService) {
      // --- Urban Planning Constants ---
      const blockSize = 30; // Meters per grid cell
      const cityRadius = 8; // Blocks in each direction (16x16 grid)
      const streetWidth = 12; // Visual width of asphalt
      const halfStreet = streetWidth / 2;
      
      // Highway Config
      const highwayY = 12;
      const highwayZ = -3 * blockSize; // Offset highway to one side
      
      engine.state.loadingStage.set('SURVEYING LAND');

      // 1. Grid Generation
      // Iterate from -Range to +Range
      for (let x = -cityRadius; x <= cityRadius; x++) {
          
          // Progressive Loading
          const progress = 20 + ((x + cityRadius) / (cityRadius * 2)) * 60; 
          engine.state.loadingProgress.set(progress);
          if (x % 2 === 0) await yieldToMain();

          for (let z = -cityRadius; z <= cityRadius; z++) {
              const px = x * blockSize;
              const pz = z * blockSize;
              
              // Distance from center (Manhattan distance for square city feel, or Euclidean for radial)
              const dist = Math.sqrt(px*px + pz*pz);
              const isHighwayPath = Math.abs(pz - highwayZ) < 10;
              
              // --- INFRASTRUCTURE LAYER ---
              
              // Determine if this cell is a road intersection, road segment, or building lot
              // Simple Grid: Every N blocks is a street? 
              // Hard Realism: We build the roads, everything else is a lot.
              
              // Let's assume the grid lines are roads.
              // Currently spawning templates on centers.
              // To make a grid, we fill the ground with 'lots' and place roads at intervals.
              // Better: This loop REPRESENTS the city blocks.
              
              // We'll create a dense block layout.
              // x, z represent the CENTER of a block.
              
              // 1. Ground Plane (Sidewalk/Concrete Base for the whole block)
              // We'll rely on the global floor for asphalt, and spawn sidewalks/curbs?
              // No, let's spawn road segments.
              
              // Check for Arterials (Every 4th block is a wide avenue)
              const isArterialX = (x % 4 === 0);
              const isArterialZ = (z % 4 === 0);
              const isRoad = isArterialX || isArterialZ;

              if (isRoad) {
                  // INTERSECTION
                  if (isArterialX && isArterialZ) {
                      ctx.spawn('terrain-intersection', px, 0, pz, { alignToBottom: true });
                      // Traffic Lights
                      if (dist < 150) {
                          ctx.spawn('prop-sensor-unit', px - 6, 0, pz - 6, { alignToBottom: true });
                      }
                  } 
                  // ROAD X
                  else if (isArterialZ) {
                      const rot = new THREE.Euler(0, Math.PI/2, 0);
                      ctx.spawn('terrain-road', px, 0, pz, { alignToBottom: true, rotation: rot, scale: 1.0 });
                      
                      // Street lights
                      if (x % 2 !== 0) {
                          const lightZ = pz - 6; 
                          // Simulating street lamps with vertical poles
                          ctx.spawn('util-roof-cap', px, 6, lightZ, { scale: 0.5 }); // Lamp head
                          const pid = ctx.spawn('prop-pillar', px, 0, lightZ, { alignToBottom: true }); // Pole
                          ctx.modify(pid, { scale: {x: 0.2, y: 0.8, z: 0.2} });
                      }
                  } 
                  // ROAD Z
                  else if (isArterialX) {
                      ctx.spawn('terrain-road', px, 0, pz, { alignToBottom: true, scale: 1.0 });
                  }
                  continue; // Slot filled by road
              }

              // --- ZONING LAYER (Lots) ---
              
              // Skip if under highway
              if (isHighwayPath) continue;

              // Zoning Logic
              // Downtown: Center (0,0) radius 100m
              // Midtown: Radius 200m
              // Industrial: Outer
              
              let zone = 'industrial';
              if (dist < 120) zone = 'downtown';
              else if (dist < 280) zone = 'midtown';

              // Random seed for this lot
              const seed = Math.abs(Math.sin(x * 12.9898 + z * 78.233));
              
              // BUILDING PLACEMENT
              // Align randomly 0, 90, 180, 270
              const rotY = Math.floor(seed * 4) * (Math.PI / 2);
              const rot = new THREE.Euler(0, rotY, 0);

              if (zone === 'downtown') {
                  if (seed > 0.4) {
                      ctx.spawn('building-skyscraper', px, 0, pz, { alignToBottom: true, rotation: rot });
                  } else {
                      ctx.spawn('building-tall', px, 0, pz, { alignToBottom: true, rotation: rot });
                  }
              } 
              else if (zone === 'midtown') {
                  if (seed > 0.6) {
                      ctx.spawn('building-tall', px, 0, pz, { alignToBottom: true, rotation: rot });
                  } else if (seed > 0.3) {
                      ctx.spawn('building-wide', px, 0, pz, { alignToBottom: true, rotation: rot });
                  } else {
                      // Plaza / Open Space
                      ctx.spawn('terrain-platform', px, 0.2, pz, { alignToBottom: true });
                      ctx.spawn('hero-tree', px, 0.2, pz, { alignToBottom: true });
                  }
              } 
              else { // Industrial / Outskirts
                  if (seed > 0.5) {
                      ctx.spawn('building-small', px, 0, pz, { alignToBottom: true, rotation: rot });
                  } else {
                      // Storage Yard
                      ctx.spawn('terrain-platform', px, 0.1, pz, { alignToBottom: true });
                      // Stacked crates
                      ctx.spawn('prop-crate', px + 2, 0, pz + 2, { alignToBottom: true });
                      ctx.spawn('prop-crate', px + 2, 1.5, pz + 2, { alignToBottom: true });
                      ctx.spawn('prop-crate', px - 2, 0, pz - 2, { alignToBottom: true });
                  }
              }
          }
      }

      // 2. Highway Spine (The "Hard Realism" Megastructure)
      engine.state.loadingStage.set('CONSTRUCTING VIADUCT');
      await yieldToMain();

      const highwayRange = cityRadius * blockSize + 60;
      const highwayStep = 30; // Length of segment
      
      for (let x = -highwayRange; x <= highwayRange; x += highwayStep) {
          // Highway Bed
          ctx.spawn('terrain-highway', x, highwayY, highwayZ, { alignToBottom: true });
          
          // Supports (Pillars)
          if (x % (highwayStep * 2) === 0) {
              const pid = ctx.spawn('prop-pillar', x, 0, highwayZ, { alignToBottom: true });
              // Scale pillar to reach highway (height 12)
              // Pillar default height is 8. Scale Y = 1.5 -> 12.
              ctx.modify(pid, { scale: { x: 2, y: 1.5, z: 2 } });
          }
      }

      // 3. Ramps (Connecting Arterials to Highway)
      // Look for intersections with Arterial Z-roads (where x % 4 == 0 blocks -> x % 120m == 0)
      for (let x = -highwayRange; x <= highwayRange; x += blockSize) {
          // Roughly align with grid arterials
          if (Math.abs(x % (blockSize * 4)) < 5) {
              // Create an Off-Ramp
              // Determine direction based on side of city
              const isEast = x > 0;
              const rampRot = new THREE.Euler(0, isEast ? -Math.PI/2 : Math.PI/2, 0);
              const rampZ = highwayZ + (isEast ? 15 : -15); // Offset slightly
              
              // We need a ramp template or reuse highway segment tilted?
              // Using existing 'terrain-ramp' which is quite large.
              // Let's place it perpendicular to highway?
              // Actually, highway ramps usually run parallel. 
              // For now, place a simplified ramp structure.
              
              // ctx.spawn('terrain-ramp', x, 0, highwayZ + 20, { alignToBottom: true, rotation: rampRot });
          }
      }

      // 4. Atmosphere & Final Touches
      engine.state.loadingStage.set('FINALIZING');
      
      // Central Monument
      ctx.spawn('structure-monolith', 0, 0, 0, { alignToBottom: true, scale: 2 });
      
      return cityRadius * blockSize;
  }
}
