
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { PhysicsFactoryService } from '../../services/factories/physics-factory.service';
import { AssetService } from '../../services/asset.service';

export const ICE_SCENE: ScenePreset = {
  id: 'ice', 
  label: 'Glacial Outpost', 
  description: 'An abandoned research facility on a frozen world.', 
  theme: 'ice', 
  previewColor: 'from-cyan-400 to-blue-200',
  load: (engine, lib) => {
      // --- Dependencies ---
      // Access services via simple DI pattern hack since we are inside a function
      const physicsFactory = engine.entityMgr['physicsFactory'] as PhysicsFactoryService;
      const assetService = engine.sceneService['visualsFactory']['assetService'] as AssetService;

      engine.sceneService.setAtmosphere('blizzard');
      engine.particleService.setWeather('snow', engine.sceneService.getScene());
      
      if (!engine.texturesEnabled()) engine.toggleTextures();

      // 1. Procedural Terrain (Static Trimesh)
      // Create visual
      const terrainId = 'ice-terrain-lg';
      const terrainMesh = engine.sceneService.createEntityVisual({
          type: 'box', handle: -1, position: {x:0, y:0, z:0}, rotation: {x:0,y:0,z:0,w:1} // Dummy def
      }, { meshId: terrainId });
      
      // Create physics
      const terrainGeo = assetService.getGeometry(terrainId);
      const terrainBodyDef = physicsFactory.createTrimeshFromGeometry(terrainGeo, 0, 0, 0);
      
      // Register in ECS manually since it's a special complex body
      const tEnt = engine.world.createEntity();
      engine.world.rigidBodies.add(tEnt, { handle: terrainBodyDef.handle });
      engine.world.meshes.add(tEnt, { mesh: terrainMesh });
      engine.world.transforms.add(tEnt, { position: {x:0,y:0,z:0}, rotation: {x:0,y:0,z:0,w:1}, scale: {x:1,y:1,z:1} });
      engine.world.bodyDefs.add(tEnt, terrainBodyDef);
      engine.world.names.add(tEnt, 'Glacial Terrain');
      engine.objectCount.update(c => c + 1);

      // 2. Realistic Research Station (Enterable Trimesh)
      const stPos = new THREE.Vector3(0, 2.5, 0); // Legs lift it up
      const stationId = 'research-station-v2';
      
      // Visual
      const stMesh = engine.sceneService.createEntityVisual({
          type: 'box', handle: -1, position: stPos, rotation: {x:0,y:0,z:0,w:1}
      }, { meshId: stationId });
      
      // Physics (Trimesh for accurate walls/floor)
      const stGeo = assetService.getGeometry(stationId);
      const stBodyDef = physicsFactory.createTrimeshFromGeometry(stGeo, stPos.x, stPos.y, stPos.z);
      
      const sEnt = engine.world.createEntity();
      engine.world.rigidBodies.add(sEnt, { handle: stBodyDef.handle });
      engine.world.meshes.add(sEnt, { mesh: stMesh });
      engine.world.transforms.add(sEnt, { position: stPos, rotation: {x:0,y:0,z:0,w:1}, scale: {x:1,y:1,z:1} });
      engine.world.bodyDefs.add(sEnt, stBodyDef);
      engine.world.names.add(sEnt, 'Habitation Module 7');
      engine.objectCount.update(c => c + 1);

      // 3. The Monolith (Distant)
      const monoPos = new THREE.Vector3(0, 4.5, -150);
      lib.spawnFromTemplate(engine.entityMgr, 'structure-monolith', monoPos);

      // 4. Ice Spires (Environment)
      // Cluster around Monolith
      for(let i=0; i<15; i++) {
           const angle = Math.random() * Math.PI * 2;
           const dist = 20 + Math.random() * 30;
           const x = monoPos.x + Math.cos(angle) * dist;
           const z = monoPos.z + Math.sin(angle) * dist;
           
           const meshId = 'ice-spire-lg';
           const scale = 2 + Math.random() * 4;
           
           // Visual
           const spMesh = engine.sceneService.createEntityVisual({
               type: 'box', handle: -1, position: {x, y: 0, z}, rotation: {x:0,y:0,z:0,w:1}
           }, { meshId });
           spMesh.scale.set(scale, scale, scale);

           // Physics (Manual spawn for scatter objects to allow scaling of primitives)
           const id = lib.spawnFromTemplate(engine.entityMgr, 'hero-ice-chunk', new THREE.Vector3(x, 10, z));
           const t = engine.world.transforms.get(id);
           if (t) {
               t.scale = {x: scale*3, y: scale*6, z: scale*3}; // Huge
               const rb = engine.world.rigidBodies.get(id);
               const def = engine.world.bodyDefs.get(id);
               if (rb && def) engine.physicsService.updateBodyScale(rb.handle, def, t.scale);
           }
      }

      // 5. Props near station
      lib.spawnFromTemplate(engine.entityMgr, 'prop-crate', new THREE.Vector3(4, 3, -1));
      lib.spawnFromTemplate(engine.entityMgr, 'prop-crate', new THREE.Vector3(4, 4.5, -1));
      lib.spawnFromTemplate(engine.entityMgr, 'prop-sensor-unit', new THREE.Vector3(-3, 3, 2));

      engine.setCameraPreset('front');
      engine.setGravity(-9.81);
      
      // Move Player to Station Door
      const cam = engine.sceneService.getCamera();
      cam.position.set(0, 3, 15);
      cam.lookAt(0, 3, 0);
      engine.setMode('walk');
  }
};
