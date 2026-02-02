import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { Geo } from '../architecture/architecture.utils';

@Injectable({
  providedIn: 'root'
})
export class InteriorStructureService {

  generateWallSegment(w: number, h: number, thick: number): THREE.BufferGeometry | null {
      const wallH = h - 0.3;
      const parts = [
          Geo.box(w, 0.15, thick + 0.04).translate(0, 0.075, 0).toNonIndexed().get(),
          Geo.box(w, wallH, thick).mapBox(w, wallH, thick, 0.5).translate(0, 0.15 + wallH/2, 0).toNonIndexed().get(),
          Geo.box(w, 0.15, thick + 0.06).translate(0, h - 0.075, 0).toNonIndexed().get()
      ];
      parts.forEach(p => new Geo(p).ensureTangents());
      const final = BufferUtils.mergeGeometries(parts, true);
      if (final) final.translate(0, -h/2, 0);
      return final;
  }

  generateDoorway(w: number, h: number, thick: number): THREE.BufferGeometry | null {
      const doorH = 2.2, doorW = 1.2, sideW = (w-doorW)/2, headH = h-doorH;
      const wall = BufferUtils.mergeGeometries([
          Geo.box(sideW, h, thick).mapBox(sideW, h, thick).translate(-w/2 + sideW/2, h/2, 0).toNonIndexed().get(),
          Geo.box(sideW, h, thick).mapBox(sideW, h, thick).translate(w/2 - sideW/2, h/2, 0).toNonIndexed().get(),
          Geo.box(doorW, headH, thick).mapBox(doorW, headH, thick).translate(0, h - headH/2, 0).toNonIndexed().get()
      ]);
      const frame = BufferUtils.mergeGeometries([
          Geo.box(0.05, doorH, thick+0.04).translate(-doorW/2+0.025, doorH/2, 0).toNonIndexed().get(),
          Geo.box(0.05, doorH, thick+0.04).translate(doorW/2-0.025, doorH/2, 0).toNonIndexed().get(),
          Geo.box(doorW, 0.05, thick+0.04).translate(0, doorH-0.025, 0).toNonIndexed().get()
      ]);
      const combined = [wall!, frame!];
      combined.forEach(p => new Geo(p).ensureTangents());
      const final = BufferUtils.mergeGeometries(combined, true);
      final.translate(0, -h/2, 0);
      return final;
  }

  generateWindowWall(w: number, h: number, thick: number): THREE.BufferGeometry | null {
      const sillH = 0.8, windowH = h-sillH;
      const frame = BufferUtils.mergeGeometries([
          Geo.box(w, sillH, thick).mapBox(w, sillH, thick).translate(0, sillH/2, 0).toNonIndexed().get(),
          Geo.box(w, 0.1, thick).translate(0, h-0.05, 0).toNonIndexed().get(),
          Geo.box(0.1, windowH, thick).translate(-w/2+0.05, sillH+windowH/2, 0).toNonIndexed().get(),
          Geo.box(0.1, windowH, thick).translate(w/2-0.05, sillH+windowH/2, 0).toNonIndexed().get()
      ]);
      const glass = Geo.box(w-0.1, windowH-0.1, 0.02).translate(0, sillH+windowH/2, 0).toNonIndexed().get();
      const combined = [frame!, glass];
      combined.forEach(p => new Geo(p).ensureTangents());
      const final = BufferUtils.mergeGeometries(combined, true);
      final.translate(0, -h/2, 0);
      return final;
  }

  generateStaircase(width: number, height: number, depth: number, steps: number): THREE.BufferGeometry | null {
      const sh = height/steps, sd = depth/steps, sParts: THREE.BufferGeometry[] = [], rParts: THREE.BufferGeometry[] = [];
      const tStep = Geo.box(width, sh*0.8, sd+0.05).toNonIndexed();
      const tRiser = Geo.box(width, sh, 0.05).toNonIndexed();
      for(let i=0; i<steps; i++) {
          sParts.push(tStep.clone().translate(0, i*sh+sh*0.4, -i*sd-sd/2).get());
          rParts.push(tRiser.clone().translate(0, i*sh+sh/2, -i*sd).get());
      }
      const final = BufferUtils.mergeGeometries([BufferUtils.mergeGeometries(sParts)!, BufferUtils.mergeGeometries(rParts)!], true);
      final.translate(0, -height/2, depth/2);
      return final;
  }

  generateRailing(length: number): THREE.BufferGeometry | null {
      const h = 1.0, parts = [Geo.box(length, 0.1, 0.15).translate(0, h, 0).toNonIndexed().get()];
      const count = Math.floor(length*3), post = Geo.cylinder(0.04, 0.04, h).toNonIndexed();
      for(let i=0; i<=count; i++) parts.push(post.clone().translate(-length/2+(i*(length/count)), h/2, 0).get());
      const final = BufferUtils.mergeGeometries(parts, true);
      final.translate(0, -h/2, 0);
      return final;
  }

  generateOrnateColumn(height: number): THREE.BufferGeometry | null {
      const parts = [
          Geo.box(0.8, height*0.1, 0.8).translate(0, height*0.05, 0).toNonIndexed().get(),
          Geo.cylinder(0.3, 0.35, height*0.8, 16).translate(0, height*0.5, 0).toNonIndexed().get(),
          Geo.box(0.9, 0.1, 0.9).translate(0, height-0.05, 0).toNonIndexed().get()
      ];
      const final = BufferUtils.mergeGeometries(parts, false);
      final.translate(0, -height/2, 0);
      return final;
  }

  generateCeilingPanel(size: number): THREE.BufferGeometry | null {
      const ft = size*0.1, fh = 0.2, parts = [];
      const tb = Geo.box(size, fh, ft).toNonIndexed();
      parts.push(tb.clone().translate(0,0,-size/2+ft/2).get(), tb.clone().translate(0,0,size/2-ft/2).get());
      parts.push(Geo.box(size, 0.05, size).translate(0, fh/2+0.025, 0).toNonIndexed().get());
      return BufferUtils.mergeGeometries(parts, true);
  }

  generateGlassPartition(w: number, h: number): THREE.BufferGeometry | null {
      const ft = 0.1, fd = 0.15;
      const horiz = Geo.box(w, ft, fd).toNonIndexed();
      const vert = Geo.box(ft, h, fd).toNonIndexed();
      const frame = BufferUtils.mergeGeometries([horiz.clone().translate(0,h-ft/2,0).get(), horiz.clone().translate(0,ft/2,0).get(), vert.clone().translate(-w/2+ft/2,h/2,0).get(), vert.clone().translate(w/2-ft/2,h/2,0).get()]);
      const glass = Geo.box(w-ft*2, h-ft*2, 0.02).translate(0, h/2, 0).toNonIndexed().get();
      const combined = [frame!, glass];
      combined.forEach(p => new Geo(p).ensureTangents());
      const final = BufferUtils.mergeGeometries(combined, true);
      final.translate(0, -h/2, 0);
      return final;
  }
}