
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';

interface GeometryGroups {
    frame: THREE.BufferGeometry[];
    window: THREE.BufferGeometry[];
    detail: THREE.BufferGeometry[];
}

export interface BuildingOptions {
    highwayAccess?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ArchBuildingService {

  generateBuilding(w: number, totalH: number, d: number, tiers: number, options: BuildingOptions = {}): THREE.BufferGeometry | null {
      const groups: GeometryGroups = {
          frame: [],
          window: [],
          detail: []
      };
      
      let currentY = 0;
      let currentW = w;
      let currentD = d;
      
      // Architectural proportions
      const groundHeight = options.highwayAccess ? 12.0 : 5.0; // Higher lobby for highway buildings to reach deck
      const bodyHeight = Math.max(totalH - groundHeight, 5);
      const tierHeight = bodyHeight / tiers;

      // 1. Ground Floor (Lobby)
      this.generateLobby(currentW, groundHeight, currentD, groups, options.highwayAccess);
      currentY += groundHeight;

      // 2. Body Tiers with Exoskeleton
      for(let t = 0; t < tiers; t++) {
          this.generateTier(currentW, tierHeight, currentD, currentY, groups);
          
          currentY += tierHeight;
          
          // Taper for next tier
          if (t < tiers - 1) {
              this.generateCornice(currentW, currentD, currentY, groups);
              // Precision Taper: Reduce by fixed margin rather than percentage to keep grid alignment
              // If W > 10, reduce by 2m on each side (4m total)
              const taper = (currentW > 10) ? 0.85 : 0.9;
              currentW *= taper;
              currentD *= taper;
          }
      }

      // 3. Mechanical Penthouse / Roof
      this.generateRoof(currentW, currentD, currentY, groups);

      // 4. Merge & Group
      const mergedFrame = groups.frame.length ? BufferUtils.mergeGeometries(groups.frame) : null;
      const mergedWindow = groups.window.length ? BufferUtils.mergeGeometries(groups.window) : null;
      const mergedDetail = groups.detail.length ? BufferUtils.mergeGeometries(groups.detail) : null;

      const finalParts: THREE.BufferGeometry[] = [];
      
      // Group 0: Frame (Concrete/Metal)
      if (mergedFrame) finalParts.push(mergedFrame);
      else finalParts.push(new THREE.BoxGeometry(0,0,0)); 

      // Group 1: Window (Glass)
      if (mergedWindow) finalParts.push(mergedWindow);
      else finalParts.push(new THREE.BoxGeometry(0,0,0));

      // Group 2: Detail (Metal/Dark)
      if (mergedDetail) finalParts.push(mergedDetail);
      else finalParts.push(new THREE.BoxGeometry(0,0,0));

      if (finalParts.length > 0) {
          // 0 -> mat-concrete, 1 -> mat-window, 2 -> mat-dark-metal
          const final = BufferUtils.mergeGeometries(finalParts, true); 
          
          // Align bottom to y=0 (Physics Box usually centered at y=H/2)
          // Adjust translation based on total height generated
          final.translate(0, -totalH / 2, 0);
          return final;
      }
      
      return null;
  }

  private generateLobby(w: number, h: number, d: number, groups: GeometryGroups, isHighway = false) {
      const colSize = 1.2;
      const glassInset = 0.5;

      // Heavy Structural Columns
      const corners = [
          [w/2 - colSize/2, d/2 - colSize/2],
          [-w/2 + colSize/2, d/2 - colSize/2],
          [w/2 - colSize/2, -d/2 + colSize/2],
          [-w/2 + colSize/2, -d/2 + colSize/2]
      ];

      corners.forEach(([x, z]) => {
          const col = new THREE.BoxGeometry(colSize, h, colSize);
          this.scaleUVs(col, colSize, h, colSize);
          col.translate(x, h/2, z);
          groups.frame.push(col);
      });

      // Recessed Glass Core
      const gW = w - (glassInset * 2);
      const gD = d - (glassInset * 2);
      const glass = new THREE.BoxGeometry(gW, h, gD);
      this.scaleUVs(glass, gW, h, gD, 0.2); 
      glass.translate(0, h/2, 0);
      groups.window.push(glass);

      // Entrance Canopy (Front)
      const canD = 2.5;
      const canW = w * 0.5;
      const canopy = new THREE.BoxGeometry(canW, 0.4, canD);
      canopy.translate(0, 4.0, d/2 + canD/2 - 0.2); // Standard height entrance
      groups.detail.push(canopy);

      // Highway Connector (Back)
      if (isHighway) {
          // Ramp / Bridge extending from back at height 12 (approx top of lobby)
          const bridgeL = 6.0; // Reach out to highway
          const bridgeW = w * 0.6;
          const bridgeGeo = new THREE.BoxGeometry(bridgeW, 0.8, bridgeL);
          // Position at top of lobby, extending backward (-Z)
          bridgeGeo.translate(0, h - 0.4, -d/2 - bridgeL/2 + 0.5);
          groups.frame.push(bridgeGeo);

          // Support Struts for Bridge
          const strutGeo = new THREE.BoxGeometry(0.8, 2.0, 1.5);
          const s1 = strutGeo.clone(); s1.translate(-bridgeW/2 + 0.4, h - 1.4, -d/2);
          const s2 = strutGeo.clone(); s2.translate(bridgeW/2 - 0.4, h - 1.4, -d/2);
          groups.detail.push(s1, s2);
      }
  }

  private generateTier(w: number, h: number, d: number, y: number, groups: GeometryGroups) {
      const floorH = 3.5;
      const floors = Math.floor(h / floorH);
      
      // Central Glass Core
      const core = new THREE.BoxGeometry(w - 0.2, h, d - 0.2);
      this.scaleUVs(core, w, h, d, 0.5);
      core.translate(0, y + h/2, 0);
      groups.window.push(core);

      // Exoskeleton / Structural Grid
      // Vertical Ribs
      const ribCountX = Math.max(2, Math.floor(w / 4));
      const ribCountZ = Math.max(2, Math.floor(d / 4));
      const ribThick = 0.3;
      const ribDepth = 0.4; // Protrusion

      // Function to add ribs along a face
      const addRibs = (axis: 'x'|'z', size: number, depthSize: number) => {
          const count = axis === 'x' ? ribCountX : ribCountZ;
          const step = size / count;
          
          for(let i=0; i<=count; i++) {
              const pos = -size/2 + (i * step);
              
              // Front/Back or Left/Right
              const r1 = new THREE.BoxGeometry(axis === 'x' ? ribThick : ribDepth, h, axis === 'x' ? ribDepth : ribThick);
              if (axis === 'x') r1.translate(pos, y + h/2, depthSize/2); // Front
              else r1.translate(depthSize/2, y + h/2, pos); // Right
              groups.frame.push(r1);

              const r2 = r1.clone();
              if (axis === 'x') r2.translate(0, 0, -depthSize); // Back
              else r2.translate(-depthSize, 0, 0); // Left
              groups.frame.push(r2);
          }
      };

      addRibs('x', w, d);
      addRibs('z', d, w);

      // Horizontal Spandrels (Floor Slabs)
      for(let i = 0; i <= floors; i++) {
          const fy = y + (i * floorH);
          if (fy > y + h) break;
          
          const slab = new THREE.BoxGeometry(w + 0.1, 0.4, d + 0.1); // Slightly wider than core
          this.scaleUVs(slab, w, 0.4, d);
          slab.translate(0, fy, 0);
          groups.detail.push(slab);
      }
  }

  private generateCornice(w: number, d: number, y: number, groups: GeometryGroups) {
      const h = 0.6;
      const corn = new THREE.BoxGeometry(w + 0.2, h, d + 0.2);
      this.scaleUVs(corn, w, h, d);
      corn.translate(0, y - h/2, 0); 
      groups.frame.push(corn);
  }

  private generateRoof(w: number, d: number, y: number, groups: GeometryGroups) {
      // Mechanical Penthouse (Recessed block)
      const pH = 3.0;
      const pW = w * 0.6;
      const pD = d * 0.6;
      
      const mech = new THREE.BoxGeometry(pW, pH, pD);
      this.scaleUVs(mech, pW, pH, pD);
      mech.translate(0, y + pH/2, 0);
      groups.detail.push(mech); // Use dark metal detail material

      // Parapet Wall
      const wallH = 1.2;
      const wallThick = 0.3;
      
      const wallN = new THREE.BoxGeometry(w, wallH, wallThick);
      wallN.translate(0, y + wallH/2, -d/2 + wallThick/2);
      
      const wallS = new THREE.BoxGeometry(w, wallH, wallThick);
      wallS.translate(0, y + wallH/2, d/2 - wallThick/2);
      
      const wallE = new THREE.BoxGeometry(wallThick, wallH, d - wallThick*2);
      wallE.translate(w/2 - wallThick/2, y + wallH/2, 0);
      
      const wallW = new THREE.BoxGeometry(wallThick, wallH, d - wallThick*2);
      wallW.translate(-w/2 + wallThick/2, y + wallH/2, 0);

      groups.frame.push(wallN, wallS, wallE, wallW);

      // HVAC Units
      const boxCount = 2 + Math.floor(Math.random() * 2);
      for(let i=0; i<boxCount; i++) {
          const size = 1.0 + Math.random();
          const box = new THREE.BoxGeometry(size, size*0.8, size);
          
          const bx = (Math.random()-0.5) * (w - 2);
          const bz = (Math.random()-0.5) * (d - 2);
          
          box.translate(bx, y + size*0.4, bz);
          groups.detail.push(box);
      }
      
      // Antenna Array
      const antH = 6.0;
      const ant = new THREE.CylinderGeometry(0.1, 0.2, antH);
      ant.translate(0, y + pH + antH/2, 0);
      groups.detail.push(ant);
  }

  private scaleUVs(geo: THREE.BoxGeometry, w: number, h: number, d: number, factor = 0.5) {
      const uvs = geo.getAttribute('uv');
      if (!uvs) return;

      const scaleFace = (faceIdx: number, uScale: number, vScale: number) => {
          const offset = faceIdx * 4;
          for (let i = 0; i < 4; i++) {
              const idx = offset + i;
              const u = uvs.getX(idx);
              const v = uvs.getY(idx);
              uvs.setXY(idx, u * uScale * factor, v * vScale * factor);
          }
      };

      scaleFace(0, d, h); // Right
      scaleFace(1, d, h); // Left
      scaleFace(2, w, d); // Top
      scaleFace(3, w, d); // Bottom
      scaleFace(4, w, h); // Front
      scaleFace(5, w, h); // Back
      
      uvs.needsUpdate = true;
  }
}
