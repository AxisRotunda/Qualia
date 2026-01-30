
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { PhysicsFactoryService } from '../../services/factories/physics-factory.service';
import { AssetService } from '../../services/asset.service';

export const SPACESHIP_SCENE: ScenePreset = {
  id: 'spaceship-envoy', 
  label: 'Envoy Vessel', 
  description: 'A massive exploration ship orbiting a red giant star.', 
  theme: 'space', 
  previewColor: 'from-orange-700 to-amber-900',
  load: (engine, lib) => {
      // 1. Setup Environment
      engine.sceneService.setAtmosphere('space'); 
      engine.particleService.setWeather('clear', engine.sceneService.getScene());
      
      // Star lighting
      engine.setLightSettings({
          dirIntensity: 2.0, 
          ambientIntensity: 0.2,
          dirColor: '#ff8800' // Red/Orange Star
      });

      // Position Sun to shine into the ship
      const cam = engine.sceneService.getCamera();
      engine.sceneService['envManager'].setTimeOfDay(16); // Late afternoon position = Low angle sun
      
      if (!engine.texturesEnabled()) engine.toggleTextures();

      // Access services for custom spawning
      const physicsFactory = engine.entityMgr['physicsFactory'] as PhysicsFactoryService;
      const assetService = engine.sceneService['visualsFactory']['assetService'] as AssetService;

      // Helper to spawn trimesh structure
      const spawnStructure = (id: string, x: number, y: number, z: number, rotationY = 0) => {
          // Centered geometries now.
          const pos = new THREE.Vector3(x, y + 4, z); // Center at H/2 (H=8 approx)
          const rot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), rotationY);
          
          // Visual
          const mesh = engine.sceneService.createEntityVisual({
             type: 'box', handle: -1, position: pos, rotation: {x: rot.x, y: rot.y, z: rot.z, w: rot.w}
          }, { meshId: id });
          
          // Physics
          const geo = assetService.getGeometry(id);
          const bodyDef = physicsFactory.createTrimeshFromGeometry(geo, pos.x, pos.y, pos.z);
          
          // Update physics rotation
          engine.physicsService.updateBodyTransform(bodyDef.handle, pos, {x: rot.x, y: rot.y, z: rot.z, w: rot.w});

          const entity = engine.world.createEntity();
          engine.world.rigidBodies.add(entity, { handle: bodyDef.handle });
          engine.world.meshes.add(entity, { mesh });
          engine.world.transforms.add(entity, { position: pos, rotation: {x: rot.x, y: rot.y, z: rot.z, w: rot.w}, scale: {x:1,y:1,z:1} });
          engine.world.bodyDefs.add(entity, bodyDef);
          engine.world.names.add(entity, `Hull Segment ${entity}`);
          engine.objectCount.update(c => c + 1);
      };

      // 2. Build Ship
      const bridgeZ = -24;
      
      // Central Bridge (Hub)
      spawnStructure('gen-scifi-hub', 0, 0, bridgeZ);

      // Main Corridor Spine (South from Bridge)
      for(let i=0; i<4; i++) {
          spawnStructure('gen-scifi-corridor', 0, 0, bridgeZ + 15 + (i * 12));
      }

      // Cross Corridor
      const crossZ = bridgeZ + 15 + 12; // Middle of spine
      spawnStructure('gen-scifi-corridor', -12, 0, crossZ, Math.PI/2);
      spawnStructure('gen-scifi-corridor', 12, 0, crossZ, Math.PI/2);

      // Cargo Bays (Ends of cross corridor)
      spawnStructure('gen-scifi-hub', -24, 0, crossZ);
      spawnStructure('gen-scifi-hub', 24, 0, crossZ);

      // 3. Props
      // Bridge Holotable markers
      lib.spawnFromTemplate(engine.entityMgr, 'prop-sensor-unit', new THREE.Vector3(0, 2, bridgeZ));
      lib.spawnFromTemplate(engine.entityMgr, 'shape-sphere-lg', new THREE.Vector3(0, 5, bridgeZ));

      // Crates in Cargo Bays
      for(let i=0; i<5; i++) {
          lib.spawnFromTemplate(engine.entityMgr, 'prop-crate', new THREE.Vector3(-24 + (Math.random()-0.5)*8, 1, crossZ + (Math.random()-0.5)*8));
          lib.spawnFromTemplate(engine.entityMgr, 'prop-barrel', new THREE.Vector3(24 + (Math.random()-0.5)*8, 1, crossZ + (Math.random()-0.5)*8));
      }

      // 4. Player Setup
      engine.setGravity(-5.0); // Lower gravity for space feel
      engine.setMode('walk');
      cam.position.set(0, 2, 0); // Start in corridor
      cam.lookAt(0, 2, bridgeZ);
  }
};
