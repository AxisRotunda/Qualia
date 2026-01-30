
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';

export const INTERIOR_SCENE: ScenePreset = {
  id: 'interior-hotel', 
  label: 'Grand Hotel Lobby', 
  description: 'A lavish interior space with marble floors, grand staircases, and a mezzanine.', 
  theme: 'city', 
  previewColor: 'from-amber-700 to-yellow-900',
  load: (engine, lib) => {
      // 1. Setup Environment
      engine.sceneService.setAtmosphere('city'); 
      engine.particleService.setWeather('clear', engine.sceneService.getScene());
      
      // Warm, inviting indoor lighting
      engine.setLightSettings({
          dirIntensity: 0.5, 
          ambientIntensity: 0.7,
          dirColor: '#fff7ed' // Warm white
      });
      
      if (!engine.texturesEnabled()) engine.toggleTextures();

      // --- Dimensions ---
      const roomW = 32;
      const roomD = 40;
      const floorH = 5;
      const ceilingH = 10;
      
      // 2. Structural Shell
      
      // Floor Plan (Grid of Marble Slabs)
      // Spawning at Y=0.1 (height 0.2 / 2)
      for(let x = -roomW/2; x < roomW/2; x+=4) {
          for(let z = -roomD/2; z < roomD/2; z+=4) {
              lib.spawnFromTemplate(engine.entityMgr, 'structure-floor-marble', new THREE.Vector3(x + 2, 0.1, z + 2));
              
              // Ceiling Panels
              lib.spawnFromTemplate(engine.entityMgr, 'structure-ceiling', new THREE.Vector3(x + 2, ceilingH - 0.1, z + 2));
          }
      }

      // Walls
      const wallTemplate = 'structure-wall-interior'; 
      const rotY90 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI/2, 0));

      const placeWall = (x: number, y: number, z: number, rot?: THREE.Quaternion) => {
          // Walls are 5m high. Center is 2.5 + Y_Offset.
          lib.spawnFromTemplate(engine.entityMgr, wallTemplate, new THREE.Vector3(x, y + 2.5, z), rot);
      };

      // Perimeter Walls (Double Height)
      for(let y = 0; y < ceilingH; y += 5) {
          for(let x = -roomW/2; x < roomW/2; x+=4) {
              // Back Wall (North)
              placeWall(x + 2, y, -roomD/2);
              // Front Wall (South) - Leave Gap for Entrance
              if (Math.abs(x) > 4) {
                  placeWall(x + 2, y, roomD/2);
              }
          }
          for(let z = -roomD/2; z < roomD/2; z+=4) {
              // West
              placeWall(-roomW/2, y, z + 2, rotY90);
              // East
              placeWall(roomW/2, y, z + 2, rotY90);
          }
      }

      // Entrance Vestibule (Glass)
      // Glass partition height 5. Center 2.5.
      lib.spawnFromTemplate(engine.entityMgr, 'structure-glass-partition', new THREE.Vector3(-3, 2.5, roomD/2));
      lib.spawnFromTemplate(engine.entityMgr, 'structure-glass-partition', new THREE.Vector3(3, 2.5, roomD/2));

      // 3. Mezzanine Structure (U-Shape)
      const balconyDepth = 8;
      
      // Floor & Railings
      for(let x = -roomW/2; x < roomW/2; x+=4) {
          for(let z = -roomD/2; z < roomD/2; z+=4) {
              // Create U-shape opening at back for stairs
              const isSide = (x < -roomW/2 + 8) || (x >= roomW/2 - 8);
              const isBack = (z < -8); // Extended back to Z=-8
              
              if (isSide || isBack) {
                  // Floor at 5m height. Thickness 0.2. Center Y = 5.1
                  lib.spawnFromTemplate(engine.entityMgr, 'structure-floor-marble', new THREE.Vector3(x + 2, floorH + 0.1, z + 2));
                  
                  // Railings on inner edges
                  const cx = x+2; const cz = z+2;
                  
                  const nearInnerEdgeX_Left = Math.abs(cx - (-roomW/2 + 8)) < 1;
                  const nearInnerEdgeX_Right = Math.abs(cx - (roomW/2 - 8)) < 1;
                  const nearInnerEdgeZ_Back = Math.abs(cz - (-8)) < 1; 

                  if (nearInnerEdgeX_Left && cz > -8) {
                      lib.spawnFromTemplate(engine.entityMgr, 'structure-railing', new THREE.Vector3(cx + 2, floorH + 0.5, cz), rotY90);
                  }
                  if (nearInnerEdgeX_Right && cz > -8) {
                      lib.spawnFromTemplate(engine.entityMgr, 'structure-railing', new THREE.Vector3(cx - 2, floorH + 0.5, cz), rotY90);
                  }
                  if (nearInnerEdgeZ_Back && Math.abs(cx) < roomW/2 - 8) {
                      lib.spawnFromTemplate(engine.entityMgr, 'structure-railing', new THREE.Vector3(cx, floorH + 0.5, cz + 2));
                  }
              }
          }
      }

      // Structural Columns
      const colX = roomW/2 - 8;
      const colZ_Start = -roomD/2 + 4;
      const colZ_End = roomD/2 - 4;
      
      for(let z = colZ_Start; z <= colZ_End; z += 8) {
          // Columns are 5m tall. Center at 2.5 and 7.5.
          lib.spawnFromTemplate(engine.entityMgr, 'prop-column-ornate', new THREE.Vector3(-colX, 2.5, z));
          lib.spawnFromTemplate(engine.entityMgr, 'prop-column-ornate', new THREE.Vector3(-colX, floorH + 2.5, z));
          
          lib.spawnFromTemplate(engine.entityMgr, 'prop-column-ornate', new THREE.Vector3(colX, 2.5, z));
          lib.spawnFromTemplate(engine.entityMgr, 'prop-column-ornate', new THREE.Vector3(colX, floorH + 2.5, z));
      }

      // 4. Grand Staircase (Double Return)
      // Two flights up to a landing, then one flight up to mezzanine.
      
      // Bottom Flights (Z=12 up to Z=4)
      // Height 2.5. Center Y = 1.25.
      // Flight L
      lib.spawnFromTemplate(engine.entityMgr, 'structure-staircase', new THREE.Vector3(-6, 1.25, 8)); 
      // Flight R
      lib.spawnFromTemplate(engine.entityMgr, 'structure-staircase', new THREE.Vector3(6, 1.25, 8));
      
      // Landing at Z=0?
      // Flight length 8. Center Z=8 means Z goes from 12 down to 4. Top is at Z=4.
      // Landing at Z=2 (4m deep).
      // Floor Slab. Center Y = 2.5 (Flush with stair top).
      lib.spawnFromTemplate(engine.entityMgr, 'structure-floor-marble', new THREE.Vector3(-6, 2.4, 2));
      lib.spawnFromTemplate(engine.entityMgr, 'structure-floor-marble', new THREE.Vector3(6, 2.4, 2));
      // Center connector
      lib.spawnFromTemplate(engine.entityMgr, 'structure-floor-marble', new THREE.Vector3(-2, 2.4, 2));
      lib.spawnFromTemplate(engine.entityMgr, 'structure-floor-marble', new THREE.Vector3(2, 2.4, 2));

      // Top Flight (Center)
      // Goes from Z=0 up to Z=-8 (Mezzanine edge).
      // Center Z=-4. Height 2.5. Center Y = 2.5 + 1.25 = 3.75.
      const stairRot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)); // Default points -Z
      lib.spawnFromTemplate(engine.entityMgr, 'structure-staircase', new THREE.Vector3(0, 3.75, -4));

      // 5. Zones & Furnishing

      // A. Reception (Front Left)
      const recepX = -8;
      const recepZ = 10;
      // Counter - Center Y adjusted for scale height
      const counterId = lib.spawnFromTemplate(engine.entityMgr, 'shape-neon-cube', new THREE.Vector3(recepX, 0.6, recepZ));
      const t = engine.world.transforms.get(counterId);
      if(t) { 
          t.scale = {x: 6, y: 1.2, z: 1}; 
          // Physics scaling needs center update? No, center is transform pos.
          engine.physicsService.updateBodyScale(engine.world.rigidBodies.get(counterId)!.handle, engine.world.bodyDefs.get(counterId)!, t.scale); 
      }
      engine.setEntityName(counterId, 'Reception Desk');
      // Computer (H=0.5 approx). Placed on desk (Y=1.2).
      lib.spawnFromTemplate(engine.entityMgr, 'prop-monitor-triple', new THREE.Vector3(recepX, 1.2 + 0.25, recepZ));

      // B. Lounge Area (Center)
      // Carpet (Visual only flattened box)
      const carpetId = lib.spawnFromTemplate(engine.entityMgr, 'structure-floor-linoleum', new THREE.Vector3(0, 0.05, 4));
      const ct = engine.world.transforms.get(carpetId);
      const cm = engine.world.meshes.get(carpetId);
      if(ct && cm) {
          ct.scale = {x: 2.5, y: 0.1, z: 3}; 
          engine.physicsService.updateBodyScale(engine.world.rigidBodies.get(carpetId)!.handle, engine.world.bodyDefs.get(carpetId)!, ct.scale);
          (cm.mesh.material as THREE.MeshStandardMaterial).color.setHex(0x7f1d1d);
          (cm.mesh.material as THREE.MeshStandardMaterial).map = null;
      }

      // Sofa Height ~0.8. Center Y = 0.4.
      lib.spawnFromTemplate(engine.entityMgr, 'prop-sofa', new THREE.Vector3(-3, 0.4, 4));
      lib.spawnFromTemplate(engine.entityMgr, 'prop-sofa', new THREE.Vector3(3, 0.4, 4));
      const rot180 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0));
      lib.spawnFromTemplate(engine.entityMgr, 'prop-sofa', new THREE.Vector3(-3, 0.4, 8), rot180);
      lib.spawnFromTemplate(engine.entityMgr, 'prop-sofa', new THREE.Vector3(3, 0.4, 8), rot180);
      
      // Table
      const tableId = lib.spawnFromTemplate(engine.entityMgr, 'prop-glass-block', new THREE.Vector3(0, 0.2, 6));
      const tt = engine.world.transforms.get(tableId);
      if(tt) { tt.scale = {x: 1.5, y: 0.2, z: 2.5}; engine.physicsService.updateBodyScale(engine.world.rigidBodies.get(tableId)!.handle, engine.world.bodyDefs.get(tableId)!, tt.scale); }

      // 6. Lighting Feature
      // Chandelier: Center Y = 8 (hanging from 10). Height ~4.5.
      lib.spawnFromTemplate(engine.entityMgr, 'prop-chandelier', new THREE.Vector3(0, 8, 0));
      const mainLight = new THREE.PointLight(0xffaa00, 2.0, 20);
      mainLight.position.set(0, 7, 0);
      engine.sceneService.getScene().add(mainLight);

      // Player Start
      engine.setGravity(-9.81);
      engine.setMode('walk');
      const cam = engine.sceneService.getCamera();
      cam.position.set(0, 1.7, 18); // Near entrance
      cam.lookAt(0, 1.7, 0);
  }
};
