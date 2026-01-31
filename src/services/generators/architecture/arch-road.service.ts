
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';

@Injectable({
  providedIn: 'root'
})
export class ArchRoadService {

  generateRoad(w: number, length: number): THREE.BufferGeometry | null {
      const roadW = w * 0.6; // 60% road
      const walkW = (w - roadW) / 2;
      const curbW = 0.25;
      const curbH = 0.15;
      
      const roadGeo = new THREE.BoxGeometry(roadW, 0.1, length);
      roadGeo.translate(0, 0, 0); 
      
      const curbL = new THREE.BoxGeometry(curbW, curbH, length);
      curbL.translate(-roadW/2 - curbW/2, (curbH - 0.1)/2, 0);
      
      const curbR = new THREE.BoxGeometry(curbW, curbH, length);
      curbR.translate(roadW/2 + curbW/2, (curbH - 0.1)/2, 0);

      const mergedCurbs = BufferUtils.mergeGeometries([curbL, curbR]);

      const sidewalkH = 0.15;
      const walkL = new THREE.BoxGeometry(walkW - curbW, sidewalkH, length);
      walkL.translate(-roadW/2 - curbW - (walkW - curbW)/2, (sidewalkH - 0.1)/2, 0);

      const walkR = new THREE.BoxGeometry(walkW - curbW, sidewalkH, length);
      walkR.translate(roadW/2 + curbW + (walkW - curbW)/2, (sidewalkH - 0.1)/2, 0);

      const mergedWalks = BufferUtils.mergeGeometries([walkL, walkR]);

      if (mergedCurbs && mergedWalks) {
          const final = BufferUtils.mergeGeometries([roadGeo, mergedCurbs, mergedWalks], true);
          return final;
      }
      return null;
  }

  generateHighway(width: number, length: number): THREE.BufferGeometry | null {
      const partsAsphalt: THREE.BufferGeometry[] = [];
      const partsConcrete: THREE.BufferGeometry[] = [];

      // Road Bed
      const road = new THREE.BoxGeometry(width, 0.5, length);
      partsAsphalt.push(road);

      // Jersey Barriers
      const barrierW = 0.4;
      const barrierH = 1.2;
      
      const bLeft = new THREE.BoxGeometry(barrierW, barrierH, length);
      bLeft.translate(-width/2 + barrierW/2, barrierH/2 - 0.25, 0);
      partsConcrete.push(bLeft);

      const bRight = new THREE.BoxGeometry(barrierW, barrierH, length);
      bRight.translate(width/2 - barrierW/2, barrierH/2 - 0.25, 0);
      partsConcrete.push(bRight);

      // Underside Beams
      const beamCount = Math.floor(length / 10) + 1;
      for(let i=0; i<beamCount; i++) {
          const z = -length/2 + i * 10;
          const beam = new THREE.BoxGeometry(width - 1, 0.8, 2);
          beam.translate(0, -0.6, z);
          partsConcrete.push(beam);
      }

      // Structural Piers (Pillars) - Reaching down 12 units
      // T-Shape Pier for realism
      const pierStem = new THREE.BoxGeometry(4, 12, 4);
      pierStem.translate(0, -6.5, 0); 
      partsConcrete.push(pierStem);
      
      // Pier Cap
      const pierCap = new THREE.BoxGeometry(width - 2, 1.5, 5);
      pierCap.translate(0, -1.25, 0); // Directly under beams
      // Taper the cap bottom
      const capPos = pierCap.getAttribute('position');
      for(let i=0; i<capPos.count; i++) {
          if (capPos.getY(i) < -1.5) { // Bottom vertices
              const x = capPos.getX(i);
              capPos.setX(i, x * 0.6); // Taper in
          }
      }
      pierCap.computeVertexNormals();
      partsConcrete.push(pierCap);

      const mergedAsphalt = BufferUtils.mergeGeometries(partsAsphalt);
      const mergedConcrete = BufferUtils.mergeGeometries(partsConcrete);

      if (mergedAsphalt && mergedConcrete) {
          return BufferUtils.mergeGeometries([mergedAsphalt, mergedConcrete], true);
      }
      return null;
  }

  generateIntersection(width: number): THREE.BufferGeometry | null {
      // 4-Way Intersection with rounded sidewalk corners
      const roadW = width * 0.6;
      const walkW = (width - roadW) / 2;
      
      const partsRoad: THREE.BufferGeometry[] = [];
      const partsCurb: THREE.BufferGeometry[] = [];
      const partsWalk: THREE.BufferGeometry[] = [];

      // Central Road Patch
      const center = new THREE.BoxGeometry(width, 0.1, width);
      partsRoad.push(center);

      // Corner Sidewalks
      const cornerSize = walkW;
      const curbThick = 0.25;
      const curbH = 0.15;
      const walkH = 0.15;

      const addCorner = (xDir: number, zDir: number) => {
          const x = xDir * (width/2 - cornerSize/2);
          const z = zDir * (width/2 - cornerSize/2);
          
          // Sidewalk Block
          const walk = new THREE.BoxGeometry(cornerSize, walkH, cornerSize);
          walk.translate(x, (walkH-0.1)/2, z);
          partsWalk.push(walk);

          // Curbs (Inner edges facing road)
          // X-facing curb
          const cx = new THREE.BoxGeometry(curbThick, curbH, cornerSize);
          cx.translate(x - (xDir * (cornerSize/2 - curbThick/2)), (curbH-0.1)/2, z);
          partsCurb.push(cx);

          // Z-facing curb
          const cz = new THREE.BoxGeometry(cornerSize, curbH, curbThick);
          cz.translate(x, (curbH-0.1)/2, z - (zDir * (cornerSize/2 - curbThick/2)));
          partsCurb.push(cz);
      };

      addCorner(-1, -1);
      addCorner(1, -1);
      addCorner(-1, 1);
      addCorner(1, 1);

      const mergedRoad = BufferUtils.mergeGeometries(partsRoad);
      const mergedCurb = BufferUtils.mergeGeometries(partsCurb);
      const mergedWalk = BufferUtils.mergeGeometries(partsWalk);

      if (mergedRoad && mergedCurb && mergedWalk) {
          return BufferUtils.mergeGeometries([mergedRoad, mergedCurb, mergedWalk], true);
      }
      return null;
  }

  generateRamp(width: number, length: number, height: number): THREE.BufferGeometry | null {
      const partsAsphalt: THREE.BufferGeometry[] = [];
      const partsConcrete: THREE.BufferGeometry[] = [];

      // Sloped Road Bed
      const rampGeo = new THREE.BoxGeometry(width, 0.5, length, 1, 1, 1);
      const pos = rampGeo.getAttribute('position');
      
      // Slant geometry: shear Z to Y
      // Z goes from -length/2 (bottom) to length/2 (top)
      for(let i=0; i<pos.count; i++) {
          const y = pos.getY(i);
          const z = pos.getZ(i); 
          
          // Normalize Z factor 0..1
          const factor = (z + length/2) / length;
          const shearY = factor * height;
          
          pos.setY(i, y + shearY);
      }
      rampGeo.computeVertexNormals();
      partsAsphalt.push(rampGeo);

      // Structural Walls (Left & Right) - Full length triangles
      const wallThick = 0.8;
      
      const mkWall = (offsetX: number) => {
          // A box that we collapse into a triangle
          const w = new THREE.BoxGeometry(wallThick, height, length, 1, 1, 1);
          const wPos = w.getAttribute('position');
          for(let i=0; i<wPos.count; i++) {
              const y = wPos.getY(i);
              const z = wPos.getZ(i);
              const factor = (z + length/2) / length; // 0 at bottom z, 1 at top z
              
              // Map Top vertices to slope, Bottom vertices stay flat at base relative
              // Original box is centered at Y=0, range -H/2 to H/2.
              // We want bottom to be at Y= -H_RAMP_START? 
              // Wait, we need the bottom of the wall to be at y=0 relative to the ramp root.
              
              // Easier: Just manipulate vertices of a box representing max bounds
              // Top Y vertices -> match slope
              // Bottom Y vertices -> 0
              
              const isTop = y > 0;
              if (isTop) {
                  wPos.setY(i, factor * height - 0.25); // Slightly below road
              } else {
                  wPos.setY(i, 0); // Flat bottom
              }
          }
          w.computeVertexNormals();
          // Shift so bottom aligns with y=0 roughly (current math puts bottom at 0)
          w.translate(offsetX, 0, 0); 
          return w;
      }

      partsConcrete.push(mkWall(-width/2 + wallThick/2));
      partsConcrete.push(mkWall(width/2 - wallThick/2));

      // Barriers (Sloped)
      const barrierW = 0.4;
      const barrierH = 1.2;
      
      const mkBarrier = (offsetX: number) => {
          const b = new THREE.BoxGeometry(barrierW, barrierH, length, 1, 1, 1);
          const bPos = b.getAttribute('position');
          for(let i=0; i<bPos.count; i++) {
              const y = bPos.getY(i);
              const z = bPos.getZ(i);
              const factor = (z + length/2) / length;
              bPos.setY(i, y + factor * height);
          }
          b.computeVertexNormals();
          b.translate(offsetX, 0.35, 0); 
          return b;
      };

      partsConcrete.push(mkBarrier(-width/2 + barrierW/2));
      partsConcrete.push(mkBarrier(width/2 - barrierW/2));

      const ma = BufferUtils.mergeGeometries(partsAsphalt);
      const mc = BufferUtils.mergeGeometries(partsConcrete);
      
      if (ma && mc) return BufferUtils.mergeGeometries([ma, mc], true);
      return null;
  }

  generateRoundabout(radius: number, width: number): THREE.BufferGeometry | null {
      const partsRoad: THREE.BufferGeometry[] = [];
      const partsCurb: THREE.BufferGeometry[] = [];
      const partsIsland: THREE.BufferGeometry[] = [];

      const segments = 32;
      const innerR = radius - width;
      
      // Ring Road
      const ringShape = new THREE.Shape();
      ringShape.absarc(0, 0, radius, 0, Math.PI * 2, false);
      const holePath = new THREE.Path();
      holePath.absarc(0, 0, innerR, 0, Math.PI * 2, true);
      ringShape.holes.push(holePath);

      // Extrude creates Non-Indexed geometry
      const roadGeo = new THREE.ExtrudeGeometry(ringShape, { depth: 0.1, bevelEnabled: false, curveSegments: segments });
      roadGeo.rotateX(Math.PI / 2);
      partsRoad.push(roadGeo);

      // Inner Curb
      const curbThick = 0.3;
      const curbShape = new THREE.Shape();
      curbShape.absarc(0, 0, innerR, 0, Math.PI * 2, false);
      const curbHole = new THREE.Path();
      curbHole.absarc(0, 0, innerR - curbThick, 0, Math.PI * 2, true);
      curbShape.holes.push(curbHole);
      
      const curbGeo = new THREE.ExtrudeGeometry(curbShape, { depth: 0.25, bevelEnabled: false, curveSegments: segments });
      curbGeo.rotateX(Math.PI / 2);
      partsCurb.push(curbGeo);

      // Central Island
      const islandGeo = new THREE.CylinderGeometry(innerR - curbThick, innerR - curbThick, 0.5, segments);
      islandGeo.translate(0, 0.25, 0);
      partsIsland.push(islandGeo.toNonIndexed());

      const mr = BufferUtils.mergeGeometries(partsRoad);
      const mc = BufferUtils.mergeGeometries(partsCurb);
      const mi = BufferUtils.mergeGeometries(partsIsland);

      if (mr && mc && mi) {
          return BufferUtils.mergeGeometries([mr, mc, mi], true);
      }
      return null;
  }
}
