
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';

export const AGENCY_SCENE: ScenePreset = {
  id: 'agency', 
  label: 'Bureau 42 Analysis', 
  description: 'Top-secret government observation room. Classified access only.', 
  theme: 'city', 
  previewColor: 'from-emerald-900 to-slate-900',
  load: (engine, lib) => {
      // 1. Setup Environment
      engine.sceneService.setAtmosphere('night'); 
      engine.particleService.setWeather('clear', engine.sceneService.getScene());
      
      // Cold, clinical agency lighting
      engine.setLightSettings({
          dirIntensity: 0.1, 
          ambientIntensity: 0.3, 
          dirColor: '#1e293b' 
      });
      
      if (!engine.texturesEnabled()) engine.toggleTextures();

      const roomW = 32;
      const roomD = 44;
      const roomH = 6;

      // 2. Main Shell
      const wallTemplate = 'structure-wall-interior';
      const rot90 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI/2, 0));

      // Floor & Ceiling
      // Floor height 0.2. Center Y=0.1.
      for(let x = -roomW/2; x < roomW/2; x+=4) {
          for(let z = -roomD/2; z < roomD/2; z+=4) {
              lib.spawnFromTemplate(engine.entityMgr, 'structure-floor-linoleum', new THREE.Vector3(x + 2, 0.1, z + 2));
              lib.spawnFromTemplate(engine.entityMgr, 'structure-ceiling', new THREE.Vector3(x + 2, roomH - 0.1, z + 2));
          }
      }

      // Walls (Height 5m, center Y=2.5)
      for(let z = -roomD/2; z < roomD/2; z+=4) {
          lib.spawnFromTemplate(engine.entityMgr, wallTemplate, new THREE.Vector3(-roomW/2, 2.5, z + 2), rot90);
          lib.spawnFromTemplate(engine.entityMgr, wallTemplate, new THREE.Vector3(roomW/2, 2.5, z + 2), rot90);
      }
      for(let x = -roomW/2; x < roomW/2; x+=4) {
          lib.spawnFromTemplate(engine.entityMgr, wallTemplate, new THREE.Vector3(x + 2, 2.5, -roomD/2));
          if (Math.abs(x) > 4) { // Door gap
             // Glass Partition
             lib.spawnFromTemplate(engine.entityMgr, 'structure-glass-partition', new THREE.Vector3(x + 2, 2.5, roomD/2));
          }
      }

      // 3. Zone A: The Datacenter (Back)
      const serverZStart = -roomD/2 + 2;
      const serverRows = 3;
      const rowSpacing = 3.5;
      
      // Server Rack H=2.2. Center Y=1.1.
      for(let r=0; r<serverRows; r++) {
          const z = serverZStart + (r * rowSpacing);
          // Left Bank
          for(let x = -12; x < -2; x += 1.0) {
              lib.spawnFromTemplate(engine.entityMgr, 'prop-server-rack', new THREE.Vector3(x, 1.1, z));
          }
          // Right Bank
          for(let x = 2; x < 12; x += 1.0) {
              lib.spawnFromTemplate(engine.entityMgr, 'prop-server-rack', new THREE.Vector3(x, 1.1, z));
          }
      }
      
      const serverLight = new THREE.PointLight(0x0ea5e9, 1.5, 15);
      serverLight.position.set(0, 4, serverZStart + 4);
      engine.sceneService.getScene().add(serverLight);

      // 4. Zone B: Command Center (Middle)
      const platW = 12;
      const platD = 10;
      const platH = 0.4;
      const platZ = 2;
      
      // Platform Y=0.2 (0.4 height centered)
      const p1 = lib.spawnFromTemplate(engine.entityMgr, 'structure-floor-linoleum', new THREE.Vector3(0, 0.2, platZ));
      const pt = engine.world.transforms.get(p1);
      if(pt) { pt.scale = {x: 3, y: 2, z: 2.5}; engine.physicsService.updateBodyScale(engine.world.rigidBodies.get(p1)!.handle, engine.world.bodyDefs.get(p1)!, pt.scale); }
      
      // War Table H=0.9. Center Y=0.45.
      // Sits on platH=0.4.
      // Total Y = 0.4 + 0.45 = 0.85.
      lib.spawnFromTemplate(engine.entityMgr, 'prop-table-map', new THREE.Vector3(0, 0.85, platZ));
      
      // Hologram
      const holoGeo = new THREE.ConeGeometry(1.4, 1.5, 32, 1, true);
      const holoMat = engine.sceneService['materialService'].getMaterial('mat-glow-blue').clone();
      holoMat.opacity = 0.15; holoMat.transparent = true; holoMat.side = THREE.DoubleSide;
      const holoMesh = new THREE.Mesh(holoGeo, holoMat);
      holoMesh.position.set(0, platH + 1.7, platZ);
      engine.sceneService.getScene().add(holoMesh);

      const mapLight = new THREE.SpotLight(0x38bdf8, 5.0, 25, 0.5, 0.5, 1);
      mapLight.position.set(0, 5.5, platZ);
      mapLight.target.position.set(0,0,platZ);
      engine.sceneService.getScene().add(mapLight);
      engine.sceneService.getScene().add(mapLight.target);

      // 5. Zone C: Meeting Room (Glass Cage - Front Right)
      const glassX = 10;
      const glassZ = 12;
      const glassW = 8;
      const glassD = 8;
      
      // Walls H=5. Center Y=2.5.
      lib.spawnFromTemplate(engine.entityMgr, 'structure-glass-partition', new THREE.Vector3(glassX - glassW/2, 2.5, glassZ), rot90); // Left wall
      lib.spawnFromTemplate(engine.entityMgr, 'structure-glass-partition', new THREE.Vector3(glassX, 2.5, glassZ - glassD/2)); // Back wall
      
      // Meeting Table H=0.9. Y=0.45.
      const mt = lib.spawnFromTemplate(engine.entityMgr, 'prop-table-map', new THREE.Vector3(glassX + 2, 0.45, glassZ + 2));
      engine.setEntityName(mt, 'Secure Terminal');

      // 6. Workstations (Perimeter)
      // Desk H=0.75. Y=0.375.
      // Monitors H=0.5. Desk H=0.75. Sits on desk.
      // Monitor Center Y = 0.75 + (0.5/2) = 1.0.
      const createDesk = (x: number, z: number, angle: number) => {
          const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, angle, 0));
          lib.spawnFromTemplate(engine.entityMgr, 'prop-desk-agency', new THREE.Vector3(x, 0.375, z), rot);
          const monitorOffset = new THREE.Vector3(0, 1.0, 0.3).applyQuaternion(rot);
          lib.spawnFromTemplate(engine.entityMgr, 'prop-monitor-triple', new THREE.Vector3(x, 0, z).add(monitorOffset), rot);
      };

      createDesk(-10, -2, 0.5);
      createDesk(10, -2, -0.5);
      createDesk(-10, 6, 1.0);
      createDesk(10, 6, -1.0);

      // Player Start
      engine.setGravity(-9.81);
      engine.setMode('walk');
      const cam = engine.sceneService.getCamera();
      cam.position.set(0, 1.7, 18);
      cam.lookAt(0, 1.7, 0);
  }
};
