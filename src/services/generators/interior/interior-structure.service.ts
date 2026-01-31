
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';

@Injectable({
  providedIn: 'root'
})
export class InteriorStructureService {

  generateWallSegment(w: number, h: number, thick: number): THREE.BufferGeometry | null {
      const wallH = h - 0.3; 
      const wall = new THREE.BoxGeometry(w, wallH, thick);
      wall.translate(0, 0.15 + wallH/2, 0);

      const skirting = new THREE.BoxGeometry(w, 0.15, thick + 0.05);
      skirting.translate(0, 0.075, 0);

      const molding = new THREE.BoxGeometry(w, 0.15, thick + 0.1);
      molding.translate(0, h - 0.075, 0);

      const final = BufferUtils.mergeGeometries([wall, skirting, molding], true);
      if (final) final.translate(0, -h/2, 0);
      return final;
  }

  generateStaircase(width: number, height: number, depth: number, steps: number): THREE.BufferGeometry | null {
      const stepHeight = height / steps;
      const stepDepth = depth / steps;
      const stepParts: THREE.BufferGeometry[] = [];
      const structureParts: THREE.BufferGeometry[] = [];

      // Optimization: Create base geometry templates once and clone
      const baseStep = new THREE.BoxGeometry(width, stepHeight * 0.8, stepDepth + 0.05);
      const baseRiser = new THREE.BoxGeometry(width, stepHeight, 0.05);

      // Steps
      for(let i=0; i<steps; i++) {
          const s = baseStep.clone();
          s.translate(0, (i * stepHeight) + (stepHeight*0.4), -(i * stepDepth) - stepDepth/2);
          stepParts.push(s);

          const riser = baseRiser.clone();
          riser.translate(0, (i * stepHeight) + stepHeight/2, -(i * stepDepth));
          structureParts.push(riser);
      }
      
      // Cleanup templates
      baseStep.dispose();
      baseRiser.dispose();

      // Stringers
      const stringerW = 0.2;
      const hyp = Math.sqrt(height*height + depth*depth);
      const angle = Math.atan2(height, depth);
      
      const stringerL = new THREE.BoxGeometry(stringerW, 0.4, hyp + 0.5);
      stringerL.rotateX(angle);
      stringerL.translate(-width/2 + stringerW/2, height/2 - stepHeight, -depth/2);
      structureParts.push(stringerL);
      
      const stringerR = new THREE.BoxGeometry(stringerW, 0.4, hyp + 0.5);
      stringerR.rotateX(angle);
      stringerR.translate(width/2 - stringerW/2, height/2 - stepHeight, -depth/2);
      structureParts.push(stringerR);

      const mergedSteps = BufferUtils.mergeGeometries(stepParts);
      const mergedStruct = BufferUtils.mergeGeometries(structureParts);

      if (mergedSteps && mergedStruct) {
          const final = BufferUtils.mergeGeometries([mergedSteps, mergedStruct], true);
          // Center geometry: Originally starts at (0,0,0) and goes (0..H, 0..-D).
          // We want center at (0, H/2, -D/2).
          final.translate(0, -height/2, depth/2); 
          return final;
      }
      return null;
  }

  generateRailing(length: number): THREE.BufferGeometry | null {
      const railH = 1.0;
      const handrailGeo = new THREE.BoxGeometry(length, 0.1, 0.15);
      handrailGeo.translate(0, railH, 0);

      const balusters: THREE.BufferGeometry[] = [];
      const count = Math.floor(length * 3); 
      const spacing = length / count;
      
      const balusterGeo = new THREE.CylinderGeometry(0.03, 0.03, railH, 8);
      
      for(let i=0; i<=count; i++) {
          const x = -length/2 + (i * spacing);
          const b = balusterGeo.clone();
          b.translate(x, railH/2, 0);
          balusters.push(b);
      }
      
      const postGeo = new THREE.BoxGeometry(0.15, railH + 0.1, 0.15);
      const p1 = postGeo.clone(); p1.translate(-length/2, (railH+0.1)/2, 0);
      const p2 = postGeo.clone(); p2.translate(length/2, (railH+0.1)/2, 0);
      balusters.push(p1, p2);

      const mergedBalusters = BufferUtils.mergeGeometries(balusters);
      
      if (handrailGeo && mergedBalusters) {
          const final = BufferUtils.mergeGeometries([handrailGeo, mergedBalusters], true);
          final.translate(0, -railH/2, 0);
          return final;
      }
      return null;
  }

  generateOrnateColumn(height: number): THREE.BufferGeometry | null {
      const parts: THREE.BufferGeometry[] = [];

      const baseH = height * 0.1;
      const base = new THREE.BoxGeometry(0.8, baseH, 0.8);
      base.translate(0, baseH/2, 0);
      parts.push(base);

      const shaftH = height * 0.8;
      const shaft = new THREE.CylinderGeometry(0.3, 0.35, shaftH, 16);
      shaft.translate(0, baseH + shaftH/2, 0);
      parts.push(shaft);

      const capH = height * 0.1;
      const capitalCore = new THREE.CylinderGeometry(0.5, 0.3, capH, 8);
      capitalCore.translate(0, height - capH/2, 0);
      parts.push(capitalCore);
      
      const abacus = new THREE.BoxGeometry(0.9, 0.1, 0.9);
      abacus.translate(0, height - 0.05, 0);
      parts.push(abacus);

      const final = BufferUtils.mergeGeometries(parts);
      if (final) final.translate(0, -height/2, 0);
      return final;
  }

  generateCeilingPanel(size: number): THREE.BufferGeometry | null {
      const frameThick = size * 0.1;
      const frameH = 0.2;
      
      const parts: THREE.BufferGeometry[] = [];
      const frameN = new THREE.BoxGeometry(size, frameH, frameThick);
      frameN.translate(0, 0, -size/2 + frameThick/2);
      
      const frameS = new THREE.BoxGeometry(size, frameH, frameThick);
      frameS.translate(0, 0, size/2 - frameThick/2);

      const frameE = new THREE.BoxGeometry(frameThick, frameH, size - frameThick*2);
      frameE.translate(size/2 - frameThick/2, 0, 0);

      const frameW = new THREE.BoxGeometry(frameThick, frameH, size - frameThick*2);
      frameW.translate(-size/2 + frameThick/2, 0, 0);

      const back = new THREE.BoxGeometry(size + 0.02, 0.05, size + 0.02);
      back.translate(0, frameH/2 + 0.025, 0);

      const center = new THREE.BoxGeometry(size*0.2, 0.1, size*0.2);
      
      parts.push(frameN, frameS, frameE, frameW, back, center);
      
      const final = BufferUtils.mergeGeometries(parts);
      // Already centered around Y=0 basically (thin panel)
      return final;
  }

  generateGlassPartition(w: number, h: number): THREE.BufferGeometry | null {
      const frameThick = 0.1;
      const frameDepth = 0.15;
      const glassThick = 0.02;

      const frameParts: THREE.BufferGeometry[] = [];
      const top = new THREE.BoxGeometry(w, frameThick, frameDepth);
      top.translate(0, h - frameThick/2, 0);
      
      const bottom = new THREE.BoxGeometry(w, frameThick, frameDepth);
      bottom.translate(0, frameThick/2, 0);

      const left = new THREE.BoxGeometry(frameThick, h, frameDepth);
      left.translate(-w/2 + frameThick/2, h/2, 0);

      const right = new THREE.BoxGeometry(frameThick, h, frameDepth);
      right.translate(w/2 - frameThick/2, h/2, 0);

      frameParts.push(top, bottom, left, right);
      
      const mergedFrame = BufferUtils.mergeGeometries(frameParts);
      
      const glass = new THREE.BoxGeometry(w - frameThick*2, h - frameThick*2, glassThick);
      glass.translate(0, h/2, 0);

      if (mergedFrame) {
          const final = BufferUtils.mergeGeometries([mergedFrame, glass], true);
          final.translate(0, -h/2, 0);
          return final;
      }
      return null;
  }
}
