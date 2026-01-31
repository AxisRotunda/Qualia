
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';

export const AGENCY_SCENE: ScenePreset = {
  id: 'agency', 
  label: 'Bureau 42 Analysis', 
  description: 'Top-secret government observation room. Classified access only.', 
  theme: 'city', 
  previewColor: 'from-emerald-900 to-slate-900',
  load: (ctx, engine) => {
      ctx.atmosphere('night')
         .weather('clear')
         .light({
            dirIntensity: 0.1, 
            ambientIntensity: 0.3, 
            dirColor: '#1e293b' 
         })
         .gravity(-9.81);
      
      if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

      const roomW = 32;
      const roomD = 44;
      const roomH = 6;

      const wallTemplate = 'structure-wall-interior';
      const rot90 = new THREE.Euler(0, Math.PI/2, 0);

      // Floor & Ceiling
      for(let x = -roomW/2; x < roomW/2; x+=4) {
          for(let z = -roomD/2; z < roomD/2; z+=4) {
              ctx.spawn('structure-floor-linoleum', x + 2, 0, z + 2, { alignToBottom: true });
              ctx.spawn('structure-ceiling', x + 2, roomH - 0.1, z + 2);
          }
      }

      // Walls
      for(let z = -roomD/2; z < roomD/2; z+=4) {
          ctx.spawn(wallTemplate, -roomW/2, 0, z + 2, { alignToBottom: true, rotation: rot90 });
          ctx.spawn(wallTemplate, roomW/2, 0, z + 2, { alignToBottom: true, rotation: rot90 });
      }
      for(let x = -roomW/2; x < roomW/2; x+=4) {
          ctx.spawn(wallTemplate, x + 2, 0, -roomD/2, { alignToBottom: true });
          if (Math.abs(x) > 4) {
             ctx.spawn('structure-glass-partition', x + 2, 0, roomD/2, { alignToBottom: true });
          }
      }

      // Datacenter
      const serverZStart = -roomD/2 + 2;
      const serverRows = 3;
      const rowSpacing = 3.5;
      
      for(let r=0; r<serverRows; r++) {
          const z = serverZStart + (r * rowSpacing);
          for(let x = -12; x < -2; x += 1.0) {
              ctx.spawn('prop-server-rack', x, 0, z, { alignToBottom: true });
          }
          for(let x = 2; x < 12; x += 1.0) {
              ctx.spawn('prop-server-rack', x, 0, z, { alignToBottom: true });
          }
      }
      
      const serverLight = new THREE.PointLight(0x0ea5e9, 1.5, 15);
      serverLight.position.set(0, 4, serverZStart + 4);
      engine.sceneService.getScene().add(serverLight);

      // Command Center
      const platZ = 2;
      const p1 = ctx.spawn('structure-floor-linoleum', 0, 0, platZ, { alignToBottom: true });
      const pt = engine.world.transforms.get(p1);
      if(pt) { 
          pt.scale = {x: 3, y: 2, z: 2.5}; 
          pt.position.y = 0.2;
          const rb = engine.world.rigidBodies.get(p1);
          const def = engine.world.bodyDefs.get(p1);
          if (rb && def) {
              engine.physicsService.shapes.updateBodyScale(rb.handle, def, pt.scale);
              engine.physicsService.world.updateBodyTransform(rb.handle, pt.position);
          }
      }
      
      ctx.spawn('prop-table-map', 0, 0.4, platZ, { alignToBottom: true });
      
      const holoGeo = new THREE.ConeGeometry(1.4, 1.5, 32, 1, true);
      const holoMat = engine.materialService.getMaterial('mat-glow-blue').clone();
      holoMat.opacity = 0.15; holoMat.transparent = true; holoMat.side = THREE.DoubleSide;
      const holoMesh = new THREE.Mesh(holoGeo, holoMat);
      holoMesh.position.set(0, 0.4 + 1.7, platZ);
      engine.sceneService.getScene().add(holoMesh);

      const mapLight = new THREE.SpotLight(0x38bdf8, 5.0, 25, 0.5, 0.5, 1);
      mapLight.position.set(0, 5.5, platZ);
      mapLight.target.position.set(0,0,platZ);
      engine.sceneService.getScene().add(mapLight);
      engine.sceneService.getScene().add(mapLight.target);

      // Meeting Room
      const glassX = 10;
      const glassZ = 12;
      const glassW = 8;
      const glassD = 8;
      
      ctx.spawn('structure-glass-partition', glassX - glassW/2, 0, glassZ, { alignToBottom: true, rotation: rot90 });
      ctx.spawn('structure-glass-partition', glassX, 0, glassZ - glassD/2, { alignToBottom: true });
      
      const mt = ctx.spawn('prop-table-map', glassX + 2, 0, glassZ + 2, { alignToBottom: true });
      engine.ops.setEntityName(mt, 'Secure Terminal');

      // Workstations
      const createDesk = (x: number, z: number, angle: number) => {
          const rot = new THREE.Euler(0, angle, 0);
          ctx.spawn('prop-desk-agency', x, 0, z, { alignToBottom: true, rotation: rot });
          
          const monitorOffset = new THREE.Vector3(0, 0.75, 0.3).applyEuler(rot);
          ctx.spawn('prop-monitor-triple', x + monitorOffset.x, monitorOffset.y, z + monitorOffset.z, { alignToBottom: true, rotation: rot });
      };

      createDesk(-10, -2, 0.5);
      createDesk(10, -2, -0.5);
      createDesk(-10, 6, 1.0);
      createDesk(10, 6, -1.0);

      engine.input.setMode('walk');
      const cam = engine.sceneService.getCamera();
      cam.position.set(0, 1.7, 18);
      cam.lookAt(0, 1.7, 0);
  }
};
