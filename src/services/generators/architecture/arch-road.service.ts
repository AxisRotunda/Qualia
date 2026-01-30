
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
}
