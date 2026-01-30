
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';

@Injectable({
  providedIn: 'root'
})
export class InteriorFurnishingsService {

  generateSofa(): THREE.BufferGeometry | null {
      const seatW = 2.0;
      const seatD = 0.8;
      const seatH = 0.45;
      const backH = 0.5;
      const armW = 0.3;
      const totalH = 0.8; // Approx total height

      const fabricParts: THREE.BufferGeometry[] = [];
      const woodParts: THREE.BufferGeometry[] = [];

      const seat = new THREE.BoxGeometry(seatW, 0.25, seatD);
      seat.translate(0, seatH - 0.125, 0);
      fabricParts.push(seat);

      const back = new THREE.BoxGeometry(seatW, backH, 0.2);
      back.translate(0, seatH + backH/2, -seatD/2 + 0.1);
      fabricParts.push(back);

      const armL = new THREE.BoxGeometry(armW, backH*0.8, seatD);
      armL.translate(-seatW/2 + armW/2, seatH + (backH*0.8)/2 - 0.1, 0);
      fabricParts.push(armL);
      
      const armR = new THREE.BoxGeometry(armW, backH*0.8, seatD);
      armR.translate(seatW/2 - armW/2, seatH + (backH*0.8)/2 - 0.1, 0);
      fabricParts.push(armR);

      const legGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.2);
      const legPos = [
          [-seatW/2 + 0.1, seatD/2 - 0.1], [seatW/2 - 0.1, seatD/2 - 0.1],
          [-seatW/2 + 0.1, -seatD/2 + 0.1], [seatW/2 - 0.1, -seatD/2 + 0.1]
      ];
      legPos.forEach(p => {
          const l = legGeo.clone();
          l.translate(p[0], 0.1, p[1]);
          woodParts.push(l);
      });

      const mergedFabric = BufferUtils.mergeGeometries(fabricParts);
      const mergedWood = BufferUtils.mergeGeometries(woodParts);

      let final: THREE.BufferGeometry | null = null;
      if (mergedFabric && mergedWood) {
          final = BufferUtils.mergeGeometries([mergedFabric, mergedWood], true);
      }
      
      // Center vertically (Pivot at Center of Mass approx)
      if (final) final.translate(0, -totalH/2, 0);
      return final;
  }

  generateChandelier(): THREE.BufferGeometry | null {
      const metalParts: THREE.BufferGeometry[] = [];
      const crystalParts: THREE.BufferGeometry[] = [];

      const rodLen = 4.0;
      const rod = new THREE.CylinderGeometry(0.05, 0.05, rodLen);
      rod.translate(0, rodLen/2, 0); 
      metalParts.push(rod);

      const ring1 = new THREE.TorusGeometry(0.8, 0.04, 8, 16);
      ring1.rotateX(Math.PI/2);
      ring1.translate(0, 0, 0);
      metalParts.push(ring1);

      const crystalGeo = new THREE.ConeGeometry(0.05, 0.2, 4);
      for(let i=0; i<16; i++) {
          const angle = (i/16) * Math.PI * 2;
          const c = crystalGeo.clone();
          c.rotateX(Math.PI);
          c.translate(Math.cos(angle)*0.8, -0.1, Math.sin(angle)*0.8);
          crystalParts.push(c);
      }
      
      const ring2 = new THREE.TorusGeometry(0.4, 0.04, 8, 16);
      ring2.rotateX(Math.PI/2);
      ring2.translate(0, -0.3, 0);
      metalParts.push(ring2);
      
      for(let i=0; i<8; i++) {
          const angle = (i/8) * Math.PI * 2;
          const c = crystalGeo.clone();
          c.rotateX(Math.PI);
          c.translate(Math.cos(angle)*0.4, -0.4, Math.sin(angle)*0.4);
          crystalParts.push(c);
      }

      const mergedMetal = BufferUtils.mergeGeometries(metalParts);
      const mergedCrystal = BufferUtils.mergeGeometries(crystalParts);
      
      let final: THREE.BufferGeometry | null = null;
      if(mergedMetal && mergedCrystal) {
          final = BufferUtils.mergeGeometries([mergedMetal, mergedCrystal], true);
      }
      
      // Center vertically. Total height approx 4.5. Center at 2.25
      if (final) final.translate(0, -2.25, 0);
      return final;
  }

  generateServerRack(): THREE.BufferGeometry | null {
      const w = 0.8;
      const h = 2.2;
      const d = 1.0;

      const cabinet = new THREE.BoxGeometry(w, h, d);
      cabinet.translate(0, h/2, 0);

      const face = new THREE.PlaneGeometry(w - 0.1, h - 0.2);
      face.translate(0, h/2, d/2 + 0.01);

      const final = BufferUtils.mergeGeometries([cabinet, face], true);
      if (final) final.translate(0, -h/2, 0);
      return final;
  }

  generateDesk(): THREE.BufferGeometry | null {
      const w = 1.6;
      const h = 0.75;
      const d = 0.8;
      
      const top = new THREE.BoxGeometry(w, 0.05, d);
      top.translate(0, h, 0);

      const legs: THREE.BufferGeometry[] = [];
      const legGeo = new THREE.BoxGeometry(0.05, h, 0.05);
      
      [-w/2 + 0.1, w/2 - 0.1].forEach(x => {
          [-d/2 + 0.1, d/2 - 0.1].forEach(z => {
              const l = legGeo.clone();
              l.translate(x, h/2, z);
              legs.push(l);
          });
      });
      
      const panel = new THREE.BoxGeometry(w - 0.2, h/2, 0.02);
      panel.translate(0, h * 0.75, d/2 - 0.2); 
      legs.push(panel);

      const mergedLegs = BufferUtils.mergeGeometries(legs);
      const final = BufferUtils.mergeGeometries([top, mergedLegs], true);
      
      if (final) final.translate(0, -h/2, 0);
      return final;
  }

  generateMonitorCluster(): THREE.BufferGeometry | null {
      const plasticParts: THREE.BufferGeometry[] = [];
      const screenParts: THREE.BufferGeometry[] = [];

      const cFrame = new THREE.BoxGeometry(0.6, 0.35, 0.05);
      cFrame.translate(0, 1.2, 0);
      plasticParts.push(cFrame);
      
      const cScreen = new THREE.PlaneGeometry(0.55, 0.3);
      cScreen.translate(0, 1.2, 0.03);
      screenParts.push(cScreen);

      const lFrame = cFrame.clone();
      lFrame.rotateY(Math.PI / 6);
      lFrame.translate(-0.55, 0, 0.15);
      plasticParts.push(lFrame);

      const lScreen = cScreen.clone();
      lScreen.rotateY(Math.PI / 6);
      lScreen.translate(-0.55, 0, 0.15);
      screenParts.push(lScreen);

      const rFrame = cFrame.clone();
      rFrame.rotateY(-Math.PI / 6);
      rFrame.translate(0.55, 0, 0.15);
      plasticParts.push(rFrame);

      const rScreen = cScreen.clone();
      rScreen.rotateY(-Math.PI / 6);
      rScreen.translate(0.55, 0, 0.15);
      screenParts.push(rScreen);

      const pole = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
      pole.translate(0, 0.95, 0);
      const base = new THREE.CylinderGeometry(0.15, 0.15, 0.02);
      base.translate(0, 0.75, 0);
      plasticParts.push(pole, base);

      const final = BufferUtils.mergeGeometries([BufferUtils.mergeGeometries(plasticParts), BufferUtils.mergeGeometries(screenParts)], true);
      // Total height approx 1.4 from base 0.75. Center ~ 1.1?
      // Actually we want origin at bottom of base (0.75) for easy placement on desk.
      // But standard is center.
      // Let's normalize to have (0,0,0) at the geometric center of the monitors approx.
      // Or 0 at bottom.
      // Consistency Rule: Center of Mesh = Center of Physics Box.
      // Physics Box for monitors is size(1.5, 0.5, 0.3).
      // So visual should be centered there.
      // Monitors are at y=1.2.
      if (final) final.translate(0, -1.2, 0);
      return final;
  }

  generateFileCabinet(): THREE.BufferGeometry | null {
      const w = 0.5;
      const h = 1.4;
      const d = 0.6;
      
      const body = new THREE.BoxGeometry(w, h, d);
      body.translate(0, h/2, 0);
      
      const handles: THREE.BufferGeometry[] = [];
      const handleGeo = new THREE.BoxGeometry(0.15, 0.02, 0.04);
      
      for(let i=0; i<4; i++) {
          const y = (h/4) * i + (h/8);
          const hand = handleGeo.clone();
          hand.translate(0, y, d/2 + 0.02);
          handles.push(hand);
          
          const line = new THREE.BoxGeometry(w-0.05, 0.01, 0.01);
          line.translate(0, (h/4)*(i+1), d/2);
          handles.push(line);
      }
      
      const final = BufferUtils.mergeGeometries([body, BufferUtils.mergeGeometries(handles)], true);
      if (final) final.translate(0, -h/2, 0);
      return final;
  }

  generateMapTable(): THREE.BufferGeometry | null {
      const w = 3.0;
      const h = 0.9;
      const d = 2.0;

      const body = new THREE.BoxGeometry(w, h, d);
      body.translate(0, h/2, 0);

      const screen = new THREE.BoxGeometry(w - 0.2, 0.05, d - 0.2);
      screen.translate(0, h + 0.01, 0);

      const final = BufferUtils.mergeGeometries([body, screen], true);
      if (final) final.translate(0, -h/2, 0);
      return final;
  }

  generateCeilingLight(): THREE.BufferGeometry | null {
      const w = 2.0;
      const d = 0.4;
      const h = 0.1;
      
      const frame = new THREE.BoxGeometry(w, h, d);
      const light = new THREE.BoxGeometry(w - 0.1, 0.05, d - 0.1);
      light.translate(0, -0.05, 0);

      const final = BufferUtils.mergeGeometries([frame, light], true);
      // Already centered on Y=0 basically
      return final;
  }
}
