
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { AssetService } from '../../services/asset.service';

export const WATER_SCENE: ScenePreset = {
  id: 'water-platform', 
  label: 'Oceanic Platform', 
  description: 'A floating platform surrounded by infinite ocean. Demonstrates water physics.', 
  theme: 'city', 
  previewColor: 'from-blue-500 to-cyan-700',
  load: (engine, lib) => {
      // 1. Setup Environment
      engine.sceneService.setAtmosphere('clear'); 
      engine.particleService.setWeather('clear', engine.sceneService.getScene());
      
      // Sunny ocean lighting
      engine.setLightSettings({
          dirIntensity: 1.2, 
          ambientIntensity: 0.5,
          dirColor: '#ffffff'
      });
      
      if (!engine.texturesEnabled()) engine.toggleTextures();

      // Access services needed
      const assetService = engine.sceneService['visualsFactory']['assetService'] as AssetService;
      
      // 2. Water Plane (Visual only, physics handled via buoyancy loop)
      const waterMeshId = 'terrain-water-lg';
      const waterMesh = engine.sceneService.createEntityVisual({
          type: 'box', handle: -1, position: {x:0, y:0, z:0}, rotation: {x:0,y:0,z:0,w:1}
      }, { meshId: waterMeshId });
      
      // Ensure water is static in ECS for reference, but no collider (physics raycast handles it or global math)
      const waterEnt = engine.world.createEntity();
      engine.world.meshes.add(waterEnt, { mesh: waterMesh });
      engine.world.transforms.add(waterEnt, { position: {x:0,y:-0.5,z:0}, rotation: {x:0,y:0,z:0,w:1}, scale: {x:1,y:1,z:1} });
      engine.world.names.add(waterEnt, 'Ocean Surface');
      
      // 3. Central Platform (Static)
      // Height 0.5. Center Y = 1 + 0.25 = 1.25.
      const platId = lib.spawnFromTemplate(engine.entityMgr, 'terrain-platform', new THREE.Vector3(0, 1.25, 0));
      const pt = engine.world.transforms.get(platId);
      if (pt) {
          pt.scale = {x: 2, y: 1, z: 2};
          const rb = engine.world.rigidBodies.get(platId);
          const def = engine.world.bodyDefs.get(platId);
          if(rb && def) engine.physicsService.updateBodyScale(rb.handle, def, pt.scale);
      }

      // 4. Floating Debris
      for(let i=0; i<15; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 12 + Math.random() * 20;
          const x = Math.cos(angle) * dist;
          const z = Math.sin(angle) * dist;
          
          // Drop from height to see splash/bob
          lib.spawnFromTemplate(engine.entityMgr, 'prop-barrel', new THREE.Vector3(x, 5 + Math.random()*5, z));
      }
      
      for(let i=0; i<10; i++) {
          const x = (Math.random()-0.5) * 40;
          const z = (Math.random()-0.5) * 40;
          if (Math.abs(x) < 12 && Math.abs(z) < 12) continue;
          
          lib.spawnFromTemplate(engine.entityMgr, 'prop-crate', new THREE.Vector3(x, 8, z));
      }

      // 5. Hero Object
      // Monolith height 9. Center Y = 5 + 4.5 = 9.5.
      lib.spawnFromTemplate(engine.entityMgr, 'structure-monolith', new THREE.Vector3(0, 9.5, -25));

      engine.setGravity(-9.81);
      engine.setMode('walk');
      const cam = engine.sceneService.getCamera();
      cam.position.set(0, 3, 15);
      cam.lookAt(0, 3, 0);
  },
  
  onUpdate: (dt, totalTime, engine) => {
      // 1. Sync Time
      // Convert to seconds for shader/math
      const timeSec = totalTime / 1000;

      // 2. Animate Water Material
      const matService = engine.materialService;
      if (matService) {
          const waterMat = matService.getMaterial('mat-water') as THREE.MeshPhysicalMaterial;
          if (waterMat.userData && waterMat.userData['time']) {
              waterMat.userData['time'].value = timeSec;
          }
      }

      // 3. Apply Realistic Buoyancy
      // We pass the same time to physics so it calculates the same wave height
      engine.applyBuoyancy(-0.2, timeSec); 
  }
};
