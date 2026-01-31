
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';

export const DESERT_SCENE: ScenePreset = {
  id: 'desert', 
  label: 'Oasis Mirage', 
  description: 'Sweltering sand dunes surrounding a hidden spring.', 
  theme: 'city', 
  previewColor: 'from-orange-400 to-amber-200',
  load: async (ctx, engine) => {
      ctx.atmosphere('desert')
         .weather('clear')
         .time(15.5) 
         .light({
             dirIntensity: 3.5, 
             ambientIntensity: 0.4, 
             dirColor: '#fff7e6' 
         })
         .gravity(-9.81)
         .cameraPreset('side');

      if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

      // 1. Generate Dunes (Async via Manager)
      await ctx.terrain({
          id: 'Dune',
          type: 'dunes',
          chunkSize: 120,
          center: { x: 0, z: 0 },
          materialId: 'mat-sand',
          physicsMaterial: 'sandstone',
          resolution: 64
      });

      // 2. Water (Oasis)
      const waterMesh = engine.visualsFactory.createMesh({
          type: 'box', handle: -1, position: {x:0, y:-2.8, z:0}, rotation: {x:0,y:0,z:0,w:1}
      }, { meshId: 'oasis-water' });
      
      if (waterMesh instanceof THREE.Mesh) {
          if (Array.isArray(waterMesh.material)) {
          } else {
             const wm = waterMesh.material as THREE.MeshPhysicalMaterial;
             wm.roughness = 0.05;
             wm.color.setHex(0x004433); 
          }
          engine.sceneGraph.addEntity(waterMesh);
      }

      // 3. Vegetation (Palms)
      const vegetationCount = 24;
      for(let i=0; i<vegetationCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 26 + Math.random() * 12; 
          const x = Math.cos(angle) * dist;
          const z = Math.sin(angle) * dist;
          
          const scale = 0.9 + Math.random() * 0.6;
          const rotX = (Math.random() - 0.5) * 0.2;
          const rotZ = (Math.random() - 0.5) * 0.2;
          const rot = new THREE.Euler(rotX, Math.random() * Math.PI * 2, rotZ);
          
          ctx.spawn('hero-palm', x, -1.5, z, { alignToBottom: true, scale, rotation: rot });
      }

      // 4. Rocks
      for(let i=0; i<12; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 35 + Math.random() * 25;
          const x = Math.cos(angle) * dist;
          const z = Math.sin(angle) * dist;
          
          const scale = 1.5 + Math.random() * 2.5;
          const rot = new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
          
          const id = ctx.spawn('rock-sandstone', x, 8, z); 
          const t = engine.world.transforms.get(id);
          if (t) {
              t.scale = {x: scale, y: scale, z: scale};
              const rb = engine.world.rigidBodies.get(id);
              const def = engine.world.bodyDefs.get(id);
              if (rb && def) {
                  engine.physicsService.shapes.updateBodyScale(rb.handle, def, t.scale);
                  engine.physicsService.world.updateBodyTransform(rb.handle, t.position, {x:0,y:0,z:0,w:1}); 
                  engine.physicsService.materials.updateBodyMaterial(rb.handle, { friction: 0.9, restitution: 0.05 });
              }
          }
      }

      engine.input.setMode('walk');
      const cam = engine.sceneService.getCamera();
      cam.position.set(30, 4, 30);
      cam.lookAt(0, 0, 0);
  },
  
  onUpdate: (dt, totalTime, engine) => {
      const timeSec = totalTime / 1000;
      const dtSec = dt / 1000;
      const matService = engine.materialService;
      const waterMat = matService.getMaterial('mat-water') as THREE.MeshPhysicalMaterial;
      if (waterMat && waterMat.userData && waterMat.userData['time']) {
          waterMat.userData['time'].value = timeSec * 0.5;
      }
      engine.sys.buoyancy.update(-2.5, timeSec, dtSec);
  }
};
