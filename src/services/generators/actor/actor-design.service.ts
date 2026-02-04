import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { Geo } from '../architecture/architecture.utils';

@Injectable({
  providedIn: 'root'
})
export class ActorDesignService {

  generateRobotActor(): THREE.BufferGeometry | null {
      const partsBody: THREE.BufferGeometry[] = [];
      const partsDarkMetal: THREE.BufferGeometry[] = []; 
      const partsEmissive: THREE.BufferGeometry[] = [];

      partsBody.push(Geo.box(0.45, 0.5, 0.3).mapBox(0.45, 0.5, 0.3).translate(0, 1.25, 0.05).toNonIndexed().get());
      partsDarkMetal.push(
          Geo.cylinder(0.12, 0.15, 0.4, 8).toNonIndexed().translate(0, 0.95, 0).get(),
          Geo.box(0.35, 0.5, 0.2).mapBox(0.35, 0.5, 0.2).translate(0, 1.3, -0.2).toNonIndexed().get()
      );
      
      [-0.1, 0.1].forEach(dx => partsDarkMetal.push(Geo.cylinder(0.05, 0.08, 0.3, 8).toNonIndexed().rotateX(0.2).translate(dx, 1.1, -0.25).get()));
      partsBody.push(Geo.dodecahedron(0.18, 0).translate(0, 1.65, 0.05).toNonIndexed().get());
      partsDarkMetal.push(Geo.cylinder(0.08, 0.1, 0.2, 8).toNonIndexed().translate(0, 1.55, 0.02).get());
      partsEmissive.push(Geo.box(0.22, 0.06, 0.1).translate(0, 1.65, 0.15).toNonIndexed().get());

      const addLimb = (type: 'arm' | 'leg', side: number) => {
          if (type === 'arm') {
              partsBody.push(Geo.box(0.2, 0.2, 0.25).toNonIndexed().translate(side * 0.35, 1.4, 0).get());
              partsDarkMetal.push(Geo.cylinder(0.05, 0.05, 0.35, 8).toNonIndexed().rotateZ(-side * 0.2).translate(side * 0.32, 1.2, 0).get());
              partsBody.push(Geo.cylinder(0.06, 0.08, 0.4, 8).toNonIndexed().rotateZ(side * 0.1).translate(side * 0.35, 0.9, 0.05).get());
          } else {
              partsDarkMetal.push(Geo.cylinder(0.07, 0.07, 0.45, 8).toNonIndexed().translate(side * 0.15, 0.65, 0).get());
              partsBody.push(Geo.box(0.15, 0.5, 0.2).toNonIndexed().translate(side * 0.15, 0.25, 0).get());
              partsDarkMetal.push(Geo.box(0.16, 0.1, 0.28).toNonIndexed().translate(side * 0.15, 0.05, 0.05).get());
          }
      };
      addLimb('arm', -1); addLimb('arm', 1); addLimb('leg', -1); addLimb('leg', 1);

      return this.safeMergeGroups([partsBody, partsDarkMetal, partsEmissive]);
  }

  generatePenguin(): THREE.BufferGeometry | null {
      const partsBlack: THREE.BufferGeometry[] = [];
      const partsWhite: THREE.BufferGeometry[] = [];
      const partsOrange: THREE.BufferGeometry[] = [];
      const partsEyes: THREE.BufferGeometry[] = [];

      const bodyH = 0.5, bodyR = 0.25;
      partsBlack.push(Geo.cylinder(bodyR, bodyR, bodyH, 12).toNonIndexed().translate(0, 0.3, 0).get());
      partsBlack.push(Geo.sphere(bodyR, 12, 8).toNonIndexed().translate(0, 0.3 + bodyH/2, 0).get());
      partsBlack.push(Geo.sphere(bodyR, 12, 8).toNonIndexed().translate(0, 0.3 - bodyH/2, 0).get());
      partsWhite.push(Geo.cylinder(bodyR*0.8, bodyR*0.9, bodyH*0.85, 12).toNonIndexed().scale(1, 1, 0.6).translate(0, 0.3, 0.12).get());
      partsBlack.push(Geo.sphere(0.18, 12, 12).toNonIndexed().translate(0, 0.75, 0).get());
      partsWhite.push(Geo.sphere(0.14, 12, 12).toNonIndexed().scale(1, 1, 0.5).translate(0, 0.75, 0.11).get());
      partsEyes.push(Geo.sphere(0.02, 8, 8).toNonIndexed().translate(-0.06, 0.78, 0.16).get(), Geo.sphere(0.02, 8, 8).toNonIndexed().translate(0.06, 0.78, 0.16).get());
      partsOrange.push(Geo.cone(0.06, 0.15, 8).toNonIndexed().rotateX(Math.PI/2).translate(0, 0.73, 0.22).get());
      
      [[-1, 0.28, 0.45], [1, 0.28, 0.45]].forEach(([s, x, y]) => {
          partsBlack.push(Geo.box(0.05, 0.35, 0.12).toNonIndexed().mapVertices(v => v.y += Math.pow(v.x*2,2)*0.1).rotateZ(s*-0.25).translate(s*x, y, 0).get());
      });
      [[-1, 0.12], [1, 0.12]].forEach(([s, x]) => {
          partsOrange.push(Geo.cylinder(0.08, 0.02, 0.15, 3).toNonIndexed().scale(1, 0.3, 1.5).rotateX(Math.PI/2).translate(s*x, 0.02, 0.1).get());
      });

      return this.safeMergeGroups([partsBlack, partsWhite, partsOrange, partsEyes], -0.4);
  }

  generateIceGolem(): THREE.BufferGeometry | null {
      const parts: THREE.BufferGeometry[] = [];
      
      // Main body - irregular ice block
      parts.push(Geo.box(1.2, 1.8, 0.9).mapBox(1.2, 1.8, 0.9).translate(0, 0.9, 0).get());
      
      // Head
      parts.push(Geo.box(0.8, 0.7, 0.8).mapBox(0.8, 0.7, 0.8).translate(0, 2.0, 0).get());
      
      // Arms
      parts.push(Geo.box(0.4, 1.2, 0.4).mapBox(0.4, 1.2, 0.4).translate(-0.9, 1.0, 0).get());
      parts.push(Geo.box(0.4, 1.2, 0.4).mapBox(0.4, 1.2, 0.4).translate(0.9, 1.0, 0).get());
      
      // Legs
      parts.push(Geo.box(0.5, 0.8, 0.5).mapBox(0.5, 0.8, 0.5).translate(-0.35, 0.4, 0).get());
      parts.push(Geo.box(0.5, 0.8, 0.5).mapBox(0.5, 0.8, 0.5).translate(0.35, 0.4, 0).get());
      
      // Crystal spikes on back
      parts.push(Geo.cone(0.15, 0.6, 6).toNonIndexed().rotateX(-0.3).translate(0, 1.6, -0.5).get());
      parts.push(Geo.cone(0.12, 0.5, 6).toNonIndexed().rotateX(-0.4).translate(-0.3, 1.4, -0.45).get());
      parts.push(Geo.cone(0.12, 0.5, 6).toNonIndexed().rotateX(-0.4).translate(0.3, 1.4, -0.45).get());
      
      const merged = BufferUtils.mergeGeometries(parts.filter(p => p.getAttribute('position').count > 0));
      if (merged) {
          merged.computeVertexNormals();
          merged.translate(0, -0.9, 0);
      }
      return merged;
  }

  private safeMergeGroups(groups: THREE.BufferGeometry[][], pivotY: number = -0.9): THREE.BufferGeometry | null {
      const mergedParts = groups.map(g => {
          const filtered = g.filter(item => item && item.getAttribute('position').count > 0);
          return filtered.length ? BufferUtils.mergeGeometries(filtered) : new THREE.BoxGeometry(0,0,0);
      });

      const hasColor = mergedParts.some(p => p.getAttribute('color'));
      const hasTangents = mergedParts.some(p => p.getAttribute('tangent'));

      mergedParts.forEach(p => {
          const g = new Geo(p);
          if (hasColor) g.ensureColor();
          if (hasTangents) g.ensureTangents();
      });

      const final = BufferUtils.mergeGeometries(mergedParts, true);
      if (final) {
          final.translate(0, pivotY, 0);
          final.computeVertexNormals();
      }
      return final;
  }
}
