
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { Entity } from '../../engine/core';

// State for the elevator
let shaftEntity: Entity | null = null;
let currentDepth = 0;
let targetDepth = 0; // 0 is top, 400 is bottom
let velocity = 0;
const ACCEL = 5.0;
const MAX_SPEED = 15.0;
const MAX_DEPTH = 400;

let btnUpEntity: Entity | null = null;
let btnDownEntity: Entity | null = null;
let statusLight: THREE.PointLight | null = null;

export const ELEVATOR_SCENE: ScenePreset = {
  id: 'elevator-deep', 
  label: 'Deep Descent', 
  description: 'A functional elevator descending into the crust. Glass walls reveal the geological strata.', 
  theme: 'city', 
  previewColor: 'from-gray-800 to-black',
  
  load: (engine, lib) => {
      // Reset State
      currentDepth = 0;
      targetDepth = 0;
      velocity = 0;
      shaftEntity = null;

      // 1. Setup Environment
      engine.sceneService.setAtmosphere('night'); 
      engine.particleService.setWeather('clear', engine.sceneService.getScene());
      
      // Clinical lighting inside cabin
      engine.setLightSettings({
          dirIntensity: 0.0, 
          ambientIntensity: 0.1, // Very dark outside
          dirColor: '#000000'
      });

      // Cabin Light
      const cabinLight = new THREE.PointLight(0xffffff, 0.8, 8);
      cabinLight.position.set(0, 2.8, 0);
      engine.sceneService.getScene().add(cabinLight);

      // Status Light (Red/Green)
      statusLight = new THREE.PointLight(0x22c55e, 1.0, 3);
      statusLight.position.set(1.2, 1.5, 1.3);
      engine.sceneService.getScene().add(statusLight);

      if (!engine.texturesEnabled()) engine.toggleTextures();

      // 2. Spawn Stationary Cabin (Player is here)
      // Cabin H=3. Center at Y=1.5.
      lib.spawnFromTemplate(engine.entityMgr, 'structure-elevator-cabin', new THREE.Vector3(0, 1.5, 0));

      // 3. Spawn Controls
      // Button Up
      const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/4, 0, 0));
      btnUpEntity = lib.spawnFromTemplate(engine.entityMgr, 'prop-elevator-button', new THREE.Vector3(1.1, 1.35, 1.4), rot);
      const bUpMesh = engine.world.meshes.get(btnUpEntity);
      if(bUpMesh) (bUpMesh.mesh.material as THREE.MeshStandardMaterial).color.setHex(0x22c55e); // Green
      engine.setEntityName(btnUpEntity, 'CALL UP');

      // Button Down
      btnDownEntity = lib.spawnFromTemplate(engine.entityMgr, 'prop-elevator-button', new THREE.Vector3(1.3, 1.35, 1.4), rot);
      engine.setEntityName(btnDownEntity, 'CALL DOWN');

      // 4. Spawn Moving Shaft (Kinematic)
      // Shaft geometry is centered (previously bottom-up).
      // We need to move it manually.
      
      const shaftGeo = engine.sceneService['visualsFactory']['assetService'].getGeometry('gen-elevator-shaft');
      // Create visual only entity
      const mesh = new THREE.Mesh(shaftGeo, engine.sceneService['visualsFactory']['assetService']['materialService'].getMaterial('mat-concrete')); 
      const realMesh = engine.sceneService['visualsFactory']['assetService'].getMesh('gen-elevator-shaft');
      
      engine.sceneService.getScene().add(realMesh);
      
      // Create Entity manually
      shaftEntity = engine.world.createEntity();
      engine.world.meshes.add(shaftEntity, { mesh: realMesh });
      engine.world.transforms.add(shaftEntity, { position: {x:0, y:0, z:0}, rotation: {x:0,y:0,z:0,w:1}, scale: {x:1,y:1,z:1} });
      engine.world.names.add(shaftEntity, 'Elevator Shaft');
      
      // 5. Agency Preview (Top)
      const agencyFloor = new THREE.Mesh(
          new THREE.BoxGeometry(20, 1, 20),
          new THREE.MeshStandardMaterial({ color: 0x334155 })
      );
      // Top of shaft is ~ +200 relative to center (height 400).
      // Let's assume shaft center Y moves.
      // agency floor should be at top.
      agencyFloor.position.set(0, 200, 0); 
      realMesh.add(agencyFloor);


      // Player Setup
      engine.setGravity(-9.81);
      engine.setMode('walk');
      const cam = engine.sceneService.getCamera();
      cam.position.set(0, 1.6, 0);
      cam.lookAt(0, 1.6, -1);
  },

  onUpdate: (dt, totalTime, engine) => {
      // 1. Interaction Logic
      const selected = engine.entityMgr.selectedEntity();
      if (selected === btnUpEntity) {
          targetDepth = 0;
          engine.entityMgr.selectedEntity.set(null); // Deselect
      } else if (selected === btnDownEntity) {
          targetDepth = MAX_DEPTH;
          engine.entityMgr.selectedEntity.set(null);
      }

      // 2. Movement Logic
      const diff = targetDepth - currentDepth;
      const dist = Math.abs(diff);
      
      if (dist > 0.1) {
          const dir = Math.sign(diff);
          
          // Simple accel/decel
          if (dist < 20) {
              // Decel
              velocity = Math.max(0.5, velocity * 0.95);
          } else {
              // Accel
              velocity = Math.min(MAX_SPEED, velocity + (ACCEL * (dt/1000)));
          }
          
          currentDepth += dir * velocity * (dt/1000);
          
          // Update Status Light
          if (statusLight) {
              statusLight.color.setHex(0xf59e0b); // Amber while moving
              statusLight.intensity = 1.0 + Math.sin(totalTime * 0.01) * 0.5;
          }

      } else {
          velocity = 0;
          currentDepth = targetDepth;
          if (statusLight) statusLight.color.setHex(0x22c55e); // Green
      }

      // 3. Update Shaft Position
      if (shaftEntity !== null) {
          const t = engine.world.transforms.get(shaftEntity);
          const m = engine.world.meshes.get(shaftEntity);
          if (t && m) {
              // Relative trick: Shaft goes UP as we go DOWN
              // Center Y moves.
              // At depth 0, we want to be at top. 
              // Shaft center Y should be -200? (If H=400).
              const y = -200 + currentDepth;
              t.position.y = y;
              m.mesh.position.y = y;
          }
      }
  }
};
