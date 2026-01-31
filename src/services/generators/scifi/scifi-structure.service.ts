
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { Geo } from '../architecture/architecture.utils';

@Injectable({
  providedIn: 'root'
})
export class SciFiStructureService {

  generateResearchStationV2(): THREE.BufferGeometry | null {
      const w = 10; const h = 5; const d = 14; const wallThick = 0.4;
      
      const partsExterior: THREE.BufferGeometry[] = [];
      const partsInteriorFloor: THREE.BufferGeometry[] = [];
      const partsInteriorWalls: THREE.BufferGeometry[] = [];
      const partsAccents: THREE.BufferGeometry[] = [];

      // 1. Structure
      partsInteriorFloor.push(
          Geo.box(w, 0.5, d).toNonIndexed().translate(0, 0.25, 0).get()
      );
      partsExterior.push(
          Geo.box(w, 0.5, d).toNonIndexed().translate(0, h - 0.25, 0).get(),
          Geo.box(wallThick, h, d).toNonIndexed().translate(-w/2 + wallThick/2, h/2, 0).get(),
          Geo.box(wallThick, h, d).toNonIndexed().translate(w/2 - wallThick/2, h/2, 0).get(),
          Geo.box(w, h, wallThick).toNonIndexed().translate(0, h/2, -d/2 + wallThick/2).get() // Back
      );

      // 2. Front (Doorway)
      const doorW = 3; const panelW = (w - doorW) / 2;
      partsExterior.push(
          Geo.box(panelW, h, wallThick).toNonIndexed().translate(-w/2 + panelW/2, h/2, d/2 - wallThick/2).get(),
          Geo.box(panelW, h, wallThick).toNonIndexed().translate(w/2 - panelW/2, h/2, d/2 - wallThick/2).get(),
          Geo.box(doorW, 1.5, wallThick).toNonIndexed().translate(0, h - 0.75, d/2 - wallThick/2).get()
      );

      // 3. Interior Cladding
      partsInteriorWalls.push(
          Geo.box(0.1, h - 1, d - 1).toNonIndexed().translate(-w/2 + wallThick + 0.1, h/2, 0).get(),
          Geo.box(0.1, h - 1, d - 1).toNonIndexed().translate(w/2 - wallThick - 0.1, h/2, 0).get()
      );

      // 4. Legs
      const legGeo = Geo.cylinder(0.4, 0.4, 2).toNonIndexed();
      const legPos = [[w/2-1, d/2-2], [-w/2+1, d/2-2], [w/2-1, -d/2+2], [-w/2+1, -d/2+2], [w/2-1, 0], [-w/2+1, 0]];
      
      legPos.forEach(p => {
          partsAccents.push(legGeo.clone().translate(p[0], -1, p[1]).get());
      });

      const merge = (arr: any[]) => arr.length ? BufferUtils.mergeGeometries(arr) : new THREE.BoxGeometry(0,0,0);
      
      const final = BufferUtils.mergeGeometries([
          merge(partsExterior), 
          merge(partsInteriorFloor), 
          merge(partsInteriorWalls), 
          merge(partsAccents)
      ], true);

      if (final) final.translate(0, -h/2, 0); 
      return final;
  }

  generateSciFiCorridor(width: number, height: number, depth: number): THREE.BufferGeometry | null {
      const parts = { frame: [] as any[], floor: [] as any[], light: [] as any[], pipe: [] as any[], vent: [] as any[] };
      const wallThick = 0.5;

      // Main Shell
      parts.floor.push(Geo.box(width, 0.5, depth).toNonIndexed().translate(0, 0.25, 0).get());
      parts.frame.push(Geo.box(width, 0.5, depth).toNonIndexed().translate(0, height - 0.25, 0).get());
      parts.frame.push(
          Geo.box(wallThick, height, depth).toNonIndexed().translate(-width/2 + wallThick/2, height/2, 0).get(),
          Geo.box(wallThick, height, depth).toNonIndexed().translate(width/2 - wallThick/2, height/2, 0).get()
      );

      // Ribs
      const ribCount = Math.floor(depth / 3);
      const ribTemplateSide = Geo.box(0.4, height + 0.3, 0.6).toNonIndexed();
      const ribTemplateTop = Geo.box(width + 0.8, 0.4, 0.6).toNonIndexed();
      const lightStrip = Geo.box(width - 1, 0.05, 0.2).toNonIndexed();
      const ventTemplate = Geo.box(0.1, 1.5, 1.5).toNonIndexed();

      for(let i=0; i<=ribCount; i++) {
          const z = -depth/2 + (i * (depth/ribCount));
          
          parts.frame.push(
              ribTemplateSide.clone().translate(-width/2, height/2, z).get(),
              ribTemplateSide.clone().translate(width/2, height/2, z).get(),
              ribTemplateTop.clone().translate(0, height, z).get()
          );
          
          parts.light.push(lightStrip.clone().translate(0, 0.51, z).get());
          
          if (i < ribCount) {
              const ventZ = z + (depth/ribCount) * 0.5;
              parts.vent.push(
                  ventTemplate.clone().translate(-width/2 + wallThick + 0.05, height/2, ventZ).get(),
                  ventTemplate.clone().translate(width/2 - wallThick - 0.05, height/2, ventZ).get()
              );
          }
      }

      // Pipes
      const pipeGeo = Geo.cylinder(0.2, 0.2, depth).toNonIndexed().rotateX(Math.PI/2);
      parts.pipe.push(
          pipeGeo.clone().translate(-width/2 + 1.0, height - 1.0, 0).get(),
          pipeGeo.clone().translate(width/2 - 1.0, height - 1.0, 0).get()
      );

      parts.light.push(Geo.box(0.4, 0.1, depth * 0.8).toNonIndexed().translate(0, height - 0.55, 0).get());

      const validParts = [parts.frame, parts.floor, parts.light, parts.pipe, parts.vent]
          .map(arr => arr.length ? BufferUtils.mergeGeometries(arr) : null)
          .filter(g => g !== null) as THREE.BufferGeometry[];

      if (validParts.length >= 2) {
          const final = BufferUtils.mergeGeometries(validParts, true);
          if (final) final.translate(0, -height/2, 0);
          return final;
      }
      return null;
  }

  generateSciFiHub(width: number, height: number, depth: number): THREE.BufferGeometry | null {
      const parts = { frame: [] as any[], floor: [] as any[], light: [] as any[], vent: [] as any[] };
      const radius = width / 2;
      const segmentAngle = (Math.PI * 2) / 6;
      
      const floorShape = new THREE.Shape();
      for (let i = 0; i < 6; i++) {
          const x = Math.cos(i * segmentAngle) * radius;
          const z = Math.sin(i * segmentAngle) * radius;
          if (i === 0) floorShape.moveTo(x, z); else floorShape.lineTo(x, z);
      }
      
      // Use raw THREE for Extrude (special case)
      const floorGeo = new THREE.ExtrudeGeometry(floorShape, { depth: 0.5, bevelEnabled: false });
      floorGeo.rotateX(Math.PI / 2);
      
      parts.floor.push(new Geo(floorGeo).toNonIndexed().translate(0, 0.5, 0).get());
      parts.frame.push(new Geo(floorGeo.clone()).toNonIndexed().translate(0, height - 1.0, 0).get());

      // Pillars
      const pillar = Geo.cylinder(0.5, 0.8, height).toNonIndexed();
      const band = Geo.cylinder(0.55, 0.85, 0.2).toNonIndexed();

      for (let i = 0; i < 6; i++) {
          const x = Math.cos(i * segmentAngle) * (radius - 0.5);
          const z = Math.sin(i * segmentAngle) * (radius - 0.5);
          parts.frame.push(pillar.clone().translate(x, height/2, z).get());
          parts.light.push(band.clone().translate(x, height * 0.8, z).get());
      }
      
      // Vents
      const vent = Geo.box(2, 2, 0.5).toNonIndexed();
      for(let i=0; i<3; i++) {
          const angle = (i * 2 * segmentAngle) + segmentAngle/2;
          const dist = radius * 0.8;
          const x = Math.cos(angle) * dist;
          const z = Math.sin(angle) * dist;
          parts.vent.push(
              vent.clone().rotateY(-angle + Math.PI/2).translate(x, height/2, z).get()
          );
      }
      
      parts.frame.push(Geo.cylinder(1.5, 1.0, 1.0, 8).toNonIndexed().translate(0, 0.5, 0).get());
      parts.light.push(Geo.cylinder(1.5, 1.5, 0.1, 16).toNonIndexed().translate(0, 1.0, 0).get());

      const validParts = [parts.frame, parts.floor, parts.light, parts.vent]
          .map(arr => arr.length ? BufferUtils.mergeGeometries(arr) : null)
          .filter(g => g !== null) as THREE.BufferGeometry[];

      if (validParts.length > 0) {
          const final = BufferUtils.mergeGeometries(validParts, true);
          if (final) final.translate(0, -height/2, 0);
          return final;
      }
      return null;
  }

  generateElevatorCabin(): THREE.BufferGeometry | null {
      const w = 4; const d = 4; const h = 3;
      const parts = { frame: [] as any[], glass: [] as any[], floor: [] as any[], panel: [] as any[] };

      parts.floor.push(Geo.box(w, 0.2, d).toNonIndexed().translate(0, 0.1, 0).get());
      parts.frame.push(Geo.box(w, 0.2, d).toNonIndexed().translate(0, h - 0.1, 0).get());

      const pillar = Geo.box(0.3, h, 0.3).toNonIndexed();
      [[-1,-1], [1,-1], [-1,1], [1,1]].forEach(([sx, sz]) => {
          parts.frame.push(
              pillar.clone().translate(sx * (w/2 - 0.15), h/2, sz * (d/2 - 0.15)).get()
          );
      });

      const glassThick = 0.05;
      const sideG = Geo.box(glassThick, h - 0.4, d - 0.6).toNonIndexed();
      parts.glass.push(
          sideG.clone().translate(-w/2 + glassThick/2, h/2, 0).get(),
          sideG.clone().translate(w/2 - glassThick/2, h/2, 0).get()
      );
      
      parts.glass.push(
          Geo.box(w - 0.6, h - 0.4, glassThick).toNonIndexed().translate(0, h/2, -d/2 + glassThick/2).get()
      );

      parts.frame.push(Geo.box(0.6, 1.2, 0.4).toNonIndexed().translate(1.2, 0.6, 1.5).get());
      parts.panel.push(
          Geo.box(0.5, 0.4, 0.1).toNonIndexed().rotateX(-Math.PI/4).translate(1.2, 1.3, 1.5).get()
      );

      const validParts = [parts.frame, parts.glass, parts.floor, parts.panel]
          .map(arr => arr.length ? BufferUtils.mergeGeometries(arr) : null)
          .filter(g => g !== null) as THREE.BufferGeometry[];

      if (validParts.length > 0) {
          const final = BufferUtils.mergeGeometries(validParts, true);
          if (final) final.translate(0, -h/2, 0);
          return final;
      }
      return null;
  }
}
