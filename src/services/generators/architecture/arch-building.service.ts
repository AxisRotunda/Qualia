
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { Geo } from './architecture.utils';

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
      const groups: GeometryGroups = { frame: [], window: [], detail: [] };
      
      let currentY = 0;
      let currentW = w;
      let currentD = d;
      
      const groundHeight = options.highwayAccess ? 12.0 : 5.0; 
      const bodyHeight = Math.max(totalH - groundHeight, 5);
      const tierHeight = bodyHeight / tiers;

      // 0. Foundation
      const h = 2.0;
      groups.frame.push(
          Geo.box(currentW, h, currentD)
             .mapBox(currentW, h, currentD)
             .translate(0, -h/2, 0)
             .get()
      );

      // 1. Ground Floor
      this.generateLobby(currentW, groundHeight, currentD, groups, tiers, options.highwayAccess);
      currentY += groundHeight;

      // 2. Tiers
      for(let t = 0; t < tiers; t++) {
          this.generateTier(currentW, tierHeight, currentD, currentY, groups);
          currentY += tierHeight;
          
          if (t < tiers - 1) {
              this.generateCornice(currentW, currentD, currentY, groups);
              const taper = (currentW > 10) ? 0.85 : 0.9;
              currentW *= taper;
              currentD *= taper;
          }
      }

      // 3. Roof
      this.generateRoof(currentW, currentD, currentY, groups);

      // 4. Merge
      const merge = (geos: THREE.BufferGeometry[]) => geos.length ? BufferUtils.mergeGeometries(geos) : new THREE.BoxGeometry(0,0,0);
      
      const finalParts = [
          merge(groups.frame),  // 0: Concrete
          merge(groups.window), // 1: Glass
          merge(groups.detail)  // 2: Metal
      ];

      if (finalParts.some(g => g.getAttribute('position').count > 0)) {
          const final = BufferUtils.mergeGeometries(finalParts, true); 
          final.translate(0, -totalH / 2, 0);
          return final;
      }
      return null;
  }

  private generateLobby(w: number, h: number, d: number, groups: GeometryGroups, totalTiers: number, isHighway = false) {
      const colSize = 1.2;
      const glassInset = 0.5;
      const isTall = totalTiers >= 4;
      const colBottomScale = isTall ? 1.5 : 1.0; 

      // Columns
      const corners = [
          [w/2 - colSize/2, d/2 - colSize/2], [-w/2 + colSize/2, d/2 - colSize/2],
          [w/2 - colSize/2, -d/2 + colSize/2], [-w/2 + colSize/2, -d/2 + colSize/2]
      ];

      corners.forEach(([x, z]) => {
          if (isTall) {
              const topR = (colSize / Math.sqrt(2));
              const botR = (colSize * colBottomScale) / Math.sqrt(2);
              groups.frame.push(
                  Geo.cylinder(topR, botR, h, 4).rotateY(Math.PI/4).translate(x, h/2, z).get()
              );
          } else {
              groups.frame.push(
                  Geo.box(colSize, h, colSize).mapBox(colSize, h, colSize).translate(x, h/2, z).get()
              );
          }
      });

      // Glass Core
      const gW = w - (glassInset * 2);
      const gD = d - (glassInset * 2);
      groups.window.push(
          Geo.box(gW, h, gD).mapBox(gW, h, gD, 0.2).translate(0, h/2, 0).get()
      );

      // Entrance
      if (!isHighway) {
          const doorW = 4.0;
          const doorH = 3.5;
          const frameThick = 0.4;
          
          groups.detail.push(
              Geo.box(doorW + frameThick*2, 0.4, 0.6).translate(0, doorH + 0.2, d/2 + 0.1).get(),
              Geo.box(frameThick, doorH, 0.6).translate(-doorW/2 - frameThick/2, doorH/2, d/2 + 0.1).get(),
              Geo.box(frameThick, doorH, 0.6).translate(doorW/2 + frameThick/2, doorH/2, d/2 + 0.1).get()
          );
          
          groups.window.push(
              Geo.box(doorW, doorH, 0.5).translate(0, doorH/2, d/2 - glassInset + 0.2).get()
          );
          
          groups.frame.push(
              Geo.box(doorW + 2.0, 0.2, 2.5).translate(0, doorH + 0.6, d/2 + 2.5/2 - 0.2).get()
          );
      }

      // Highway Connector
      if (isHighway) {
          const bL = 6.0; const bW = w * 0.6;
          groups.frame.push(
              Geo.box(bW, 0.8, bL).translate(0, h - 0.4, -d/2 - bL/2 + 0.5).get()
          );
          
          const strut = Geo.box(0.8, 2.0, 1.5);
          groups.detail.push(
              strut.clone().translate(-bW/2 + 0.4, h - 1.4, -d/2).get(),
              strut.clone().translate(bW/2 - 0.4, h - 1.4, -d/2).get()
          );
      }
  }

  private generateTier(w: number, h: number, d: number, y: number, groups: GeometryGroups) {
      // Core
      groups.window.push(
          Geo.box(w - 0.2, h, d - 0.2).mapBox(w, h, d, 0.5).translate(0, y + h/2, 0).get()
      );

      // Ribs
      const ribCountX = Math.max(2, Math.floor(w / 4));
      const ribCountZ = Math.max(2, Math.floor(d / 4));
      const ribThick = 0.3;
      const ribDepth = 0.4;

      const addRibs = (axis: 'x'|'z', size: number, depthSize: number) => {
          const count = axis === 'x' ? ribCountX : ribCountZ;
          const step = size / count;
          
          // Template rib to clone
          const tThick = axis === 'x' ? ribThick : ribDepth;
          const tDepth = axis === 'x' ? ribDepth : ribThick;
          const ribTemplate = Geo.box(tThick, h, tDepth);

          for(let i=0; i<=count; i++) {
              const pos = -size/2 + (i * step);
              
              const zOffset = depthSize/2;
              if (axis === 'x') {
                  groups.frame.push(ribTemplate.clone().translate(pos, y + h/2, zOffset).get()); // Front
                  groups.frame.push(ribTemplate.clone().translate(pos, y + h/2, -zOffset).get()); // Back
              } else {
                  groups.frame.push(ribTemplate.clone().translate(zOffset, y + h/2, pos).get()); // Right
                  groups.frame.push(ribTemplate.clone().translate(-zOffset, y + h/2, pos).get()); // Left
              }
          }
      };

      addRibs('x', w, d);
      addRibs('z', d, w);

      // Floors
      const floorH = 3.5;
      const floors = Math.floor(h / floorH);
      const slabTemplate = Geo.box(w + 0.1, 0.4, d + 0.1).mapBox(w, 0.4, d);
      
      for(let i = 0; i <= floors; i++) {
          const fy = y + (i * floorH);
          if (fy > y + h) break;
          groups.detail.push(slabTemplate.clone().translate(0, fy, 0).get());
      }
  }

  private generateCornice(w: number, d: number, y: number, groups: GeometryGroups) {
      groups.frame.push(
          Geo.box(w + 0.2, 0.6, d + 0.2).mapBox(w, 0.6, d).translate(0, y - 0.3, 0).get()
      );
  }

  private generateRoof(w: number, d: number, y: number, groups: GeometryGroups) {
      // Penthouse
      const pH = 3.0; const pW = w * 0.6; const pD = d * 0.6;
      groups.detail.push(
          Geo.box(pW, pH, pD).mapBox(pW, pH, pD).translate(0, y + pH/2, 0).get()
      );

      // Parapet
      const h = 1.2; const th = 0.3;
      groups.frame.push(
          Geo.box(w, h, th).translate(0, y + h/2, -d/2 + th/2).get(),
          Geo.box(w, h, th).translate(0, y + h/2, d/2 - th/2).get(),
          Geo.box(th, h, d - th*2).translate(w/2 - th/2, y + h/2, 0).get(),
          Geo.box(th, h, d - th*2).translate(-w/2 + th/2, y + h/2, 0).get()
      );

      // HVAC
      const boxCount = 2 + Math.floor(Math.random() * 2);
      for(let i=0; i<boxCount; i++) {
          const size = 1.0 + Math.random();
          const bx = (Math.random()-0.5) * (w - 2);
          const bz = (Math.random()-0.5) * (d - 2);
          groups.detail.push(
              Geo.box(size, size*0.8, size).translate(bx, y + size*0.4, bz).get()
          );
      }
      
      // Antenna
      groups.detail.push(
          Geo.cylinder(0.1, 0.2, 6.0).translate(0, y + pH + 3.0, 0).get()
      );
  }
}
