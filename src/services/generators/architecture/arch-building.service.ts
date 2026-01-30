
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';

@Injectable({
  providedIn: 'root'
})
export class ArchBuildingService {

  generateBuilding(w: number, totalH: number, d: number, tiers: number): THREE.BufferGeometry | null {
      const frameGeos: THREE.BufferGeometry[] = [];
      const windowGeos: THREE.BufferGeometry[] = [];
      const detailGeos: THREE.BufferGeometry[] = [];
      
      let currentY = 0;
      let currentW = w;
      let currentD = d;
      const tierHeight = totalH / tiers;

      for(let t = 0; t < tiers; t++) {
          const isTop = t === tiers - 1;
          const h = tierHeight; 
          const tierCenterY = currentY + h/2;

          const floorHeight = 3.5;
          const floors = Math.floor(h / floorHeight);
          
          for(let f=0; f<=floors; f++) {
             const slabY = currentY + (f * floorHeight);
             if (slabY >= currentY + h) break;
             const slab = new THREE.BoxGeometry(currentW + 0.2, 0.4, currentD + 0.2);
             slab.translate(0, slabY, 0);
             frameGeos.push(slab);
          }
          
          const colSize = 0.6;
          const colInset = 0.15;
          for(let dx of [-1, 1]) {
             for(let dz of [-1, 1]) {
                 const col = new THREE.BoxGeometry(colSize, h, colSize);
                 col.translate(dx * (currentW/2 - colInset), tierCenterY, dz * (currentD/2 - colInset));
                 frameGeos.push(col);
             }
          }

          const coreGlass = new THREE.BoxGeometry(currentW - 0.2, h, currentD - 0.2);
          coreGlass.translate(0, tierCenterY, 0);
          windowGeos.push(coreGlass);

          if (isTop) {
             const pHeight = 0.8;
             const pThick = 0.2;
             
             const wallN = new THREE.BoxGeometry(currentW, pHeight, pThick);
             wallN.translate(0, currentY + h + pHeight/2, -currentD/2 + pThick/2);
             
             const wallS = new THREE.BoxGeometry(currentW, pHeight, pThick);
             wallS.translate(0, currentY + h + pHeight/2, currentD/2 - pThick/2);

             const wallE = new THREE.BoxGeometry(pThick, pHeight, currentD - pThick*2);
             wallE.translate(currentW/2 - pThick/2, currentY + h + pHeight/2, 0);

             const wallW = new THREE.BoxGeometry(pThick, pHeight, currentD - pThick*2);
             wallW.translate(-currentW/2 + pThick/2, currentY + h + pHeight/2, 0);

             frameGeos.push(wallN, wallS, wallE, wallW);

             const antH = 3;
             const antenna = new THREE.CylinderGeometry(0.1, 0.15, antH);
             antenna.translate(0, currentY + h + antH/2, 0);
             detailGeos.push(antenna);
              
             const ac = new THREE.BoxGeometry(2, 1.5, 2);
             ac.translate(1, currentY + h + 0.75, 1);
             detailGeos.push(ac);
          }

          currentY += h;
          currentW *= 0.85;
          currentD *= 0.85;
      }

      const mergedFrame = BufferUtils.mergeGeometries(frameGeos);
      const mergedWindow = BufferUtils.mergeGeometries(windowGeos);
      const mergedDetail = BufferUtils.mergeGeometries(detailGeos);

      if (mergedFrame && mergedWindow) {
          const parts = [mergedFrame, mergedWindow];
          if (mergedDetail) parts.push(mergedDetail);
          const final = BufferUtils.mergeGeometries(parts, true); 
          // Center vertically
          final.translate(0, -totalH / 2, 0);
          return final;
      }
      return null;
  }
}
