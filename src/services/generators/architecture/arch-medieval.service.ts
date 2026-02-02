
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { Geo } from './architecture.utils';

@Injectable({
  providedIn: 'root'
})
export class ArchMedievalService {

  generateTower(radius: number, height: number): THREE.BufferGeometry | null {
      const parts: THREE.BufferGeometry[] = [];
      const segs = 24;

      // 1. Main Cylindrical Body
      parts.push(
          Geo.cylinder(radius * 0.9, radius, height, segs)
             .mapCylinder(radius, height, 0.4)
             .toNonIndexed()
             .translate(0, height/2, 0)
             .get()
      );

      // 2. Flared Top (Battlement Base)
      const topH = 1.2;
      parts.push(
          Geo.cylinder(radius * 1.15, radius * 0.9, topH, segs)
             .toNonIndexed()
             .translate(0, height + topH/2, 0)
             .get()
      );

      // 3. Merlons (Crenellations)
      const merlonCount = 12;
      const merlonW = (Math.PI * 2 * radius * 1.15) / (merlonCount * 2);
      const merlonH = 0.8;
      const merlonD = 0.4;
      
      const merlonTemplate = Geo.box(merlonW, merlonH, merlonD).toNonIndexed();
      
      for(let i=0; i<merlonCount; i++) {
          const angle = (i / merlonCount) * Math.PI * 2;
          const x = Math.cos(angle) * (radius * 1.15);
          const z = Math.sin(angle) * (radius * 1.15);
          
          parts.push(
              merlonTemplate.clone()
                  .rotateY(-angle)
                  .translate(x, height + topH + merlonH/2, z)
                  .get()
          );
      }

      return BufferUtils.mergeGeometries(parts, true);
  }

  generateCurtainWall(length: number, height: number, thickness: number): THREE.BufferGeometry | null {
      const parts: THREE.BufferGeometry[] = [];

      // 1. Main Wall Block
      parts.push(
          Geo.box(thickness, height, length)
             .mapBox(thickness, height, length, 0.5)
             .toNonIndexed()
             .translate(0, height/2, 0)
             .get()
      );

      // 2. Battlements Path
      const merlonCount = Math.floor(length / 2);
      const merlonW = 0.8;
      const merlonH = 0.8;
      const merlonD = thickness * 1.1;
      
      const merlonTemplate = Geo.box(merlonD, merlonH, merlonW).toNonIndexed();
      
      for(let i=0; i<merlonCount; i++) {
          const z = -length/2 + (i * 2.0) + 1.0;
          parts.push(
              merlonTemplate.clone()
                  .translate(0, height + merlonH/2, z)
                  .get()
          );
      }

      return BufferUtils.mergeGeometries(parts, true);
  }
}
