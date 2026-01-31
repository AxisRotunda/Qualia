
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';

export const WATER_SCENE: ScenePreset = {
  id: 'water-platform', 
  label: 'Oceanic Platform', 
  description: 'A floating platform surrounded by infinite ocean. Demonstrates water physics.', 
  theme: 'city', 
  previewColor: 'from-blue-500 to-cyan-700',
  load: (ctx, engine) => {
      ctx.atmosphere('clear')
         .weather('clear')
         .light({
            dirIntensity: 1.5, 
            ambientIntensity: 0.4,
            dirColor: '#ffffff'
         })
         .time(16.5)
         .gravity(-9.81);
      
      if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

      // Water Plane
      const waterMeshId = 'terrain-water-lg';
      const waterMesh = engine.visualsFactory.createMesh({
          type: 'box', handle: -1, position: {x:0, y:0, z:0}, rotation: {x:0,y:0,z:0,w:1}
      }, { meshId: waterMeshId });
      
      if (waterMesh instanceof THREE.Mesh) engine.sceneGraph.addEntity(waterMesh);
      
      const waterEnt = engine.world.createEntity();
      engine.world.meshes.add(waterEnt, { mesh: waterMesh as THREE.Mesh });
      engine.world.transforms.add(waterEnt, { position: {x:0,y:-0.5,z:0}, rotation: {x:0,y:0,z:0,w:1}, scale: {x:1,y:1,z:1} });
      engine.world.names.add(waterEnt, 'Ocean Surface');
      
      // Platform
      const platId = ctx.spawn('terrain-platform', 0, 1, 0, { alignToBottom: true, scale: 1 });
      const pt = engine.world.transforms.get(platId);
      if (pt) {
          pt.scale.x = 2; pt.scale.z = 2; 
          const rb = engine.world.rigidBodies.get(platId);
          const def = engine.world.bodyDefs.get(platId);
          if(rb && def) engine.physicsService.shapes.updateBodyScale(rb.handle, def, pt.scale);
      }

      // Floating Debris
      for(let i=0; i<15; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 12 + Math.random() * 20;
          const x = Math.cos(angle) * dist;
          const z = Math.sin(angle) * dist;
          ctx.spawn('prop-barrel', x, 5 + Math.random()*5, z);
      }
      
      for(let i=0; i<10; i++) {
          const x = (Math.random()-0.5) * 40;
          const z = (Math.random()-0.5) * 40;
          if (Math.abs(x) < 12 && Math.abs(z) < 12) continue;
          ctx.spawn('prop-crate', x, 8, z);
      }

      ctx.spawn('structure-monolith', 0, 1.5, -25, { alignToBottom: true });

      engine.input.setMode('walk');
      const cam = engine.sceneService.getCamera();
      cam.position.set(0, 3, 15);
      cam.lookAt(0, 3, 0);
  },
  
  onUpdate: (dt, totalTime, engine) => {
      const timeSec = totalTime / 1000;
      const dtSec = dt / 1000;
      const matService = engine.materialService;
      if (matService) {
          const waterMat = matService.getMaterial('mat-water') as THREE.MeshPhysicalMaterial;
          if (waterMat.userData && waterMat.userData['time']) {
              waterMat.userData['time'].value = timeSec;
          }
      }
      // Apply buoyancy via exposed system access on engine (EngineService is still Facade for subsystems)
      engine.sys.buoyancy.update(0.0, timeSec, dtSec); 
  }
};
