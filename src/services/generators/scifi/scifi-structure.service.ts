
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';

@Injectable({
  providedIn: 'root'
})
export class SciFiStructureService {

  generateResearchStationV2(): THREE.BufferGeometry | null {
      const w = 10;
      const h = 5;
      const d = 14;
      const wallThick = 0.4;
      
      const partsExterior: THREE.BufferGeometry[] = [];
      const partsInteriorFloor: THREE.BufferGeometry[] = [];
      const partsInteriorWalls: THREE.BufferGeometry[] = [];
      const partsAccents: THREE.BufferGeometry[] = [];

      // 1. Floor
      const floor = new THREE.BoxGeometry(w, 0.5, d);
      floor.translate(0, 0.25, 0);
      partsInteriorFloor.push(floor);

      // 2. Ceiling / Roof
      const roof = new THREE.BoxGeometry(w, 0.5, d);
      roof.translate(0, h - 0.25, 0);
      partsExterior.push(roof);

      // 3. Side Walls (Long)
      const wallL = new THREE.BoxGeometry(wallThick, h, d);
      wallL.translate(-w/2 + wallThick/2, h/2, 0);
      
      const wallR = new THREE.BoxGeometry(wallThick, h, d);
      wallR.translate(w/2 - wallThick/2, h/2, 0);

      partsExterior.push(wallL.clone()); // Outer shell
      partsExterior.push(wallR.clone());

      // 4. End Walls (Short) with Doorway cut
      const doorW = 3;
      const panelW = (w - doorW) / 2;

      // Front
      const frontL = new THREE.BoxGeometry(panelW, h, wallThick);
      frontL.translate(-w/2 + panelW/2, h/2, d/2 - wallThick/2);
      
      const frontR = new THREE.BoxGeometry(panelW, h, wallThick);
      frontR.translate(w/2 - panelW/2, h/2, d/2 - wallThick/2);

      const frontHeader = new THREE.BoxGeometry(doorW, 1.5, wallThick);
      frontHeader.translate(0, h - 0.75, d/2 - wallThick/2);

      partsExterior.push(frontL, frontR, frontHeader);

      // Back (Solid)
      const back = new THREE.BoxGeometry(w, h, wallThick);
      back.translate(0, h/2, -d/2 + wallThick/2);
      partsExterior.push(back);

      // 5. Interior Cladding
      const iWallL = new THREE.BoxGeometry(0.1, h - 1, d - 1);
      iWallL.translate(-w/2 + wallThick + 0.1, h/2, 0);
      partsInteriorWalls.push(iWallL);

      const iWallR = iWallL.clone();
      iWallR.translate(w - (wallThick*2 + 0.2), 0, 0);
      partsInteriorWalls.push(iWallR);

      // 6. Support Legs
      const legGeo = new THREE.CylinderGeometry(0.4, 0.4, 2);
      const legPos = [
          [w/2 - 1, d/2 - 2], [-w/2 + 1, d/2 - 2],
          [w/2 - 1, -d/2 + 2], [-w/2 + 1, -d/2 + 2],
          [w/2 - 1, 0], [-w/2 + 1, 0]
      ];
      legPos.forEach(p => {
          const l = legGeo.clone();
          l.translate(p[0], -1, p[1]);
          partsAccents.push(l);
      });

      // Merge
      const grpExt = BufferUtils.mergeGeometries(partsExterior);
      const grpFlr = BufferUtils.mergeGeometries(partsInteriorFloor);
      const grpInt = BufferUtils.mergeGeometries(partsInteriorWalls);
      const grpAcc = BufferUtils.mergeGeometries(partsAccents);

      if (grpExt && grpFlr && grpInt && grpAcc) {
         const final = BufferUtils.mergeGeometries([grpExt, grpFlr, grpInt, grpAcc], true);
         final.translate(0, -h/2, 0); // Center at body position (legs go below)
         return final;
      }
      return null;
  }

  generateSciFiCorridor(width: number, height: number, depth: number): THREE.BufferGeometry | null {
      const frameParts: THREE.BufferGeometry[] = [];
      const floorParts: THREE.BufferGeometry[] = [];
      const lightParts: THREE.BufferGeometry[] = [];
      const wallThick = 0.5;

      // 1. Floor
      const floor = new THREE.BoxGeometry(width, 0.5, depth);
      floor.translate(0, 0.25, 0);
      floorParts.push(floor);

      // 2. Ceiling
      const ceil = new THREE.BoxGeometry(width, 0.5, depth);
      ceil.translate(0, height - 0.25, 0);
      frameParts.push(ceil);

      // 3. Walls
      const wallL = new THREE.BoxGeometry(wallThick, height, depth);
      wallL.translate(-width/2 + wallThick/2, height/2, 0);
      
      const wallR = new THREE.BoxGeometry(wallThick, height, depth);
      wallR.translate(width/2 - wallThick/2, height/2, 0);
      
      frameParts.push(wallL, wallR);

      // 4. Ribs (Frame Structure)
      const ribCount = Math.floor(depth / 3);
      const ribH = height + 0.3;
      
      for(let i=0; i<=ribCount; i++) {
          const z = -depth/2 + (i * (depth/ribCount));
          
          const rL = new THREE.BoxGeometry(0.4, ribH, 0.6);
          rL.translate(-width/2, height/2, z);
          frameParts.push(rL);
          
          const rR = new THREE.BoxGeometry(0.4, ribH, 0.6);
          rR.translate(width/2, height/2, z);
          frameParts.push(rR);
          
          const rT = new THREE.BoxGeometry(width + 0.8, 0.4, 0.6);
          rT.translate(0, height, z);
          frameParts.push(rT);

          const lStrip = new THREE.BoxGeometry(width - 1, 0.05, 0.2);
          lStrip.translate(0, 0.51, z);
          lightParts.push(lStrip);
      }

      const lightBar = new THREE.BoxGeometry(0.4, 0.1, depth * 0.8);
      lightBar.translate(0, height - 0.55, 0);
      lightParts.push(lightBar);

      const gFrame = BufferUtils.mergeGeometries(frameParts);
      const gFloor = BufferUtils.mergeGeometries(floorParts);
      const gLight = BufferUtils.mergeGeometries(lightParts);
      
      if (gFrame && gFloor && gLight) {
          const final = BufferUtils.mergeGeometries([gFrame, gFloor, gLight], true);
          final.translate(0, -height/2, 0);
          return final;
      }
      return null;
  }

  generateSciFiHub(width: number, height: number, depth: number): THREE.BufferGeometry | null {
      const frameParts: THREE.BufferGeometry[] = [];
      const floorParts: THREE.BufferGeometry[] = [];
      const lightParts: THREE.BufferGeometry[] = [];
      
      const radius = width / 2;
      const segmentAngle = (Math.PI * 2) / 6;
      
      const floorShape = new THREE.Shape();
      for (let i = 0; i < 6; i++) {
          const x = Math.cos(i * segmentAngle) * radius;
          const z = Math.sin(i * segmentAngle) * radius;
          if (i === 0) floorShape.moveTo(x, z);
          else floorShape.lineTo(x, z);
      }
      const floorGeo = new THREE.ExtrudeGeometry(floorShape, { depth: 0.5, bevelEnabled: false });
      floorGeo.rotateX(Math.PI / 2);
      floorGeo.translate(0, 0.5, 0);
      floorParts.push(floorGeo.toNonIndexed());

      const ceilGeo = floorGeo.clone();
      ceilGeo.translate(0, height - 1.0, 0);
      frameParts.push(ceilGeo.toNonIndexed());

      for (let i = 0; i < 6; i++) {
          const x = Math.cos(i * segmentAngle) * (radius - 0.5);
          const z = Math.sin(i * segmentAngle) * (radius - 0.5);
          
          const pillar = new THREE.CylinderGeometry(0.5, 0.8, height);
          pillar.translate(x, height/2, z);
          frameParts.push(pillar.toNonIndexed());
          
          const band = new THREE.CylinderGeometry(0.55, 0.85, 0.2);
          band.translate(x, height * 0.8, z);
          lightParts.push(band.toNonIndexed());
      }
      
      const tableBase = new THREE.CylinderGeometry(1.5, 1.0, 1.0, 8);
      tableBase.translate(0, 0.5, 0);
      frameParts.push(tableBase.toNonIndexed());
      
      const tableTop = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 16);
      tableTop.translate(0, 1.0, 0);
      lightParts.push(tableTop.toNonIndexed());

      const gFrame = BufferUtils.mergeGeometries(frameParts);
      const gFloor = BufferUtils.mergeGeometries(floorParts);
      const gLight = BufferUtils.mergeGeometries(lightParts);
      
      if (gFrame && gFloor && gLight) {
          const final = BufferUtils.mergeGeometries([gFrame, gFloor, gLight], true);
          final.translate(0, -height/2, 0);
          return final;
      }
      return null;
  }

  generateElevatorCabin(): THREE.BufferGeometry | null {
      const w = 4;
      const d = 4;
      const h = 3;
      
      const frameParts: THREE.BufferGeometry[] = [];
      const glassParts: THREE.BufferGeometry[] = [];
      const floorParts: THREE.BufferGeometry[] = [];
      const panelParts: THREE.BufferGeometry[] = [];

      const floor = new THREE.BoxGeometry(w, 0.2, d);
      floor.translate(0, 0.1, 0);
      floorParts.push(floor);

      const ceiling = new THREE.BoxGeometry(w, 0.2, d);
      ceiling.translate(0, h - 0.1, 0);
      frameParts.push(ceiling);

      const pillarSize = 0.3;
      [-w/2 + pillarSize/2, w/2 - pillarSize/2].forEach(x => {
          [-d/2 + pillarSize/2, d/2 - pillarSize/2].forEach(z => {
              const p = new THREE.BoxGeometry(pillarSize, h, pillarSize);
              p.translate(x, h/2, z);
              frameParts.push(p);
          });
      });

      const glassThick = 0.05;
      const gSide = new THREE.BoxGeometry(glassThick, h - 0.4, d - pillarSize*2);
      gSide.translate(-w/2 + glassThick/2, h/2, 0);
      glassParts.push(gSide);
      glassParts.push(gSide.clone().translate(w - glassThick, 0, 0));

      const gBack = new THREE.BoxGeometry(w - pillarSize*2, h - 0.4, glassThick);
      gBack.translate(0, h/2, -d/2 + glassThick/2);
      glassParts.push(gBack);

      const pedestal = new THREE.BoxGeometry(0.6, 1.2, 0.4);
      pedestal.translate(1.2, 0.6, 1.5);
      frameParts.push(pedestal);

      const panel = new THREE.BoxGeometry(0.5, 0.4, 0.1);
      panel.rotateX(-Math.PI/4);
      panel.translate(1.2, 1.3, 1.5);
      panelParts.push(panel);

      const mergedFrame = BufferUtils.mergeGeometries(frameParts);
      const mergedGlass = BufferUtils.mergeGeometries(glassParts);
      const mergedFloor = BufferUtils.mergeGeometries(floorParts);
      const mergedPanel = BufferUtils.mergeGeometries(panelParts);

      if (mergedFrame && mergedGlass && mergedFloor && mergedPanel) {
          const final = BufferUtils.mergeGeometries([mergedFrame, mergedGlass, mergedFloor, mergedPanel], true);
          final.translate(0, -h/2, 0);
          return final;
      }
      return null;
  }
}
