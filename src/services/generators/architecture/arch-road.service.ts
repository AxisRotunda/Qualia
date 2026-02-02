import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { Geo } from './architecture.utils';

@Injectable({
  providedIn: 'root'
})
export class ArchRoadService {

  generateRoad(w: number, length: number): THREE.BufferGeometry | null {
      const roadW = w * 0.6, walkW = (w-roadW)/2, curbW = 0.25, curbH = 0.15;
      const roadGeo = Geo.box(roadW, 0.1, length, 4, 1, 1).toNonIndexed();
      roadGeo.mapVertices(v => v.y -= 0.05 * (v.x/(roadW/2))**2).mapBox(roadW, 0.1, length, 0.2).computeVertexNormals().gradientY(0xaaaaaa, 0xdddddd, -0.1, 0.1); 
      
      const curbL = Geo.box(curbW, curbH, length).mapBox(curbW, curbH, length, 0.2).toNonIndexed().translate(-roadW/2-curbW/2, (curbH-0.1)/2, 0).get();
      const curbR = Geo.box(curbW, curbH, length).mapBox(curbW, curbH, length, 0.2).toNonIndexed().translate(roadW/2+curbW/2, (curbH-0.1)/2, 0).get();
      const mergedCurbs = BufferUtils.mergeGeometries([curbL, curbR]);
      if (mergedCurbs) new Geo(mergedCurbs).setColors(0xcccccc); 

      const walkL = Geo.box(walkW-curbW, 0.15, length).mapBox(walkW-curbW, 0.15, length, 0.2).toNonIndexed().translate(-roadW/2-curbW-(walkW-curbW)/2, 0.025, 0).get();
      const walkR = Geo.box(walkW-curbW, 0.15, length).mapBox(walkW-curbW, 0.15, length, 0.2).toNonIndexed().translate(roadW/2+curbW+(walkW-curbW)/2, 0.025, 0).get();
      const mergedWalks = BufferUtils.mergeGeometries([walkL, walkR]);
      if (mergedWalks) new Geo(mergedWalks).setColors(0xbbbbbb);

      const parts = [roadGeo.get(), mergedCurbs!, mergedWalks!];
      parts.forEach(p => new Geo(p).ensureColor().ensureTangents());

      return BufferUtils.mergeGeometries(parts, true);
  }

  generateHighway(width: number, length: number): THREE.BufferGeometry | null {
      const bed = Geo.box(width, 0.5, length, 4, 1, 1).toNonIndexed();
      bed.mapVertices(v => { if(v.y>0) v.y -= 0.1*(v.x/(width/2))**2; }).mapBox(width,0.5,length,0.2).computeVertexNormals().setColors(0x888888);
      
      const partsConcrete: THREE.BufferGeometry[] = [];
      partsConcrete.push(Geo.box(0.6, 0.8, length).mapBox(0.6, 0.8, length, 0.5).toNonIndexed().translate(0, 0.15, 0).get());
      const section = Geo.box(0.4, 1.2, 5.95).mapBox(0.4, 1.2, 6.0, 0.5).toNonIndexed();
      for(let i=0; i<Math.floor(length/6); i++) {
          const z = -length/2 + i*6 + 3;
          partsConcrete.push(section.clone().translate(-width/2+0.2, 0.35, z).get(), section.clone().translate(width/2-0.2, 0.35, z).get());
      }
      const concrete = BufferUtils.mergeGeometries(partsConcrete);
      if (concrete) new Geo(concrete).gradientY(0x666666, 0xffffff, -5, 2);

      const combined = [bed.get(), concrete!];
      combined.forEach(p => new Geo(p).ensureColor().ensureTangents());
      return BufferUtils.mergeGeometries(combined, true);
  }

  generateIntersection(width: number): THREE.BufferGeometry | null {
      const center = Geo.box(width, 0.1, width).mapBox(width, 0.1, width, 0.2).toNonIndexed().setColors(0xaaaaaa).get();
      const partsCurb: THREE.BufferGeometry[] = [], partsWalk: THREE.BufferGeometry[] = [];
      const cw = (width * 0.4)/2;
      const addC = (sx: number, sz: number) => {
          const x = sx*(width/2-cw/2), z = sz*(width/2-cw/2);
          partsWalk.push(Geo.box(cw, 0.15, cw).mapBox(cw, 0.15, cw, 0.2).toNonIndexed().translate(x, 0.025, z).get());
      };
      addC(-1,-1); addC(1,-1); addC(-1,1); addC(1,1);
      const walk = BufferUtils.mergeGeometries(partsWalk);
      if (walk) new Geo(walk).setColors(0xbbbbbb);
      
      const combined = [center, walk!];
      combined.forEach(p => new Geo(p).ensureColor().ensureTangents());
      return BufferUtils.mergeGeometries(combined, true);
  }

  generateRamp(width: number, length: number, height: number): THREE.BufferGeometry | null {
      const slope = (v: THREE.Vector3) => { const t = Math.max(0,Math.min(1,(v.z+length/2)/length)); v.y += (t*t*(3-2*t))*height; };
      const ramp = Geo.box(width, 0.5, length, 1, 1, 20).toNonIndexed();
      ramp.mapVertices(slope).mapPlanar(0.15).computeVertexNormals().translate(0, 0.25, 0).setColors(0x999999);
      
      const wall = Geo.box(0.8, height+2, length, 1, 1, 20).toNonIndexed();
      wall.mapVertices(v => { const t = Math.max(0,Math.min(1,(v.z+length/2)/length)); const ry = (t*t*(3-2*t))*height; v.y = v.y > 0 ? ry+0.25 : -2.0; }).mapBox(0.8, height, length, 0.5).computeVertexNormals().translate(0,0.25,0);
      const walls = BufferUtils.mergeGeometries([wall.clone().translate(-width/2+0.4, 0, 0).get(), wall.clone().translate(width/2-0.4, 0, 0).get()]);
      if (walls) new Geo(walls).gradientY(0x666666, 0xffffff, -2, height);

      const combined = [ramp.get(), walls!];
      combined.forEach(p => new Geo(p).ensureColor().ensureTangents());
      return BufferUtils.mergeGeometries(combined, true);
  }

  generateRoundabout(radius: number, width: number): THREE.BufferGeometry | null {
      const ring = new THREE.Shape(); ring.absarc(0,0,radius,0,Math.PI*2,false);
      const hole = new THREE.Path(); hole.absarc(0,0,radius-width,0,Math.PI*2,true); ring.holes.push(hole);
      const road = new Geo(new THREE.ExtrudeGeometry(ring,{depth:0.1,bevelEnabled:false,curveSegments:32})).rotateX(Math.PI/2).mapPlanar(0.15).toNonIndexed().setColors(0xaaaaaa).get();
      const island = Geo.cylinder(radius-width-0.3, radius-width-0.3, 0.5, 32).toNonIndexed().mapPlanar(0.2).translate(0, 0.25, 0).setColors(0x55aa55).get();
      
      const combined = [road, island];
      combined.forEach(p => new Geo(p).ensureColor().ensureTangents());
      return BufferUtils.mergeGeometries(combined, true);
  }
}