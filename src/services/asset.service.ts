
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { MaterialService } from './material.service';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private materialService = inject(MaterialService);
  private geometries = new Map<string, THREE.BufferGeometry>();

  constructor() {
    this.initGeometries();
  }

  getGeometry(id: string): THREE.BufferGeometry {
    return this.geometries.get(id) || new THREE.BoxGeometry(1,1,1);
  }

  getMesh(assetId: string): THREE.Mesh {
      const geo = this.getGeometry(assetId);
      let mat: THREE.Material | THREE.Material[];

      // Asset-specific material logic
      if (assetId === 'tree-01') {
          mat = [
              this.materialService.getMaterial('mat-bark') as THREE.Material,
              this.materialService.getMaterial('mat-leaf') as THREE.Material
          ];
      } else if (assetId.includes('rock')) {
          mat = this.materialService.getMaterial('mat-rock') as THREE.Material;
      } else if (assetId.includes('ice')) {
          mat = this.materialService.getMaterial('mat-ice') as THREE.Material;
      } else if (assetId.includes('log')) {
          mat = this.materialService.getMaterial('mat-bark') as THREE.Material;
      } else {
          mat = this.materialService.getMaterial('mat-default') as THREE.Material;
      }

      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
  }

  private initGeometries() {
    this.generateTree('tree-01');
    this.generateRock('rock-01');
    this.generateIceChunk('ice-01');
    this.generateLog('log-01');
  }

  private generateTree(id: string) {
    // 1. Trunk (Cylinder)
    let trunkGeo: THREE.BufferGeometry = new THREE.CylinderGeometry(0.2, 0.4, 1.5, 8);
    trunkGeo = trunkGeo.toNonIndexed();
    trunkGeo.translate(0, 0.75, 0); // Pivot at base
    
    // 2. Foliage (Low Poly Icosahedrons)
    let leaves1: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1.0, 0);
    leaves1 = leaves1.toNonIndexed();
    leaves1.translate(0, 2.0, 0);
    
    let leaves2: THREE.BufferGeometry = new THREE.IcosahedronGeometry(0.8, 0);
    leaves2 = leaves2.toNonIndexed();
    leaves2.translate(0, 2.8, 0);
    leaves2.rotateY(Math.PI / 4);

    const foliageGeo = BufferUtils.mergeGeometries([leaves1, leaves2], false);

    if (!foliageGeo) return;

    // Group 0: Trunk (Mat 0), Group 1: Foliage (Mat 1)
    const trunkVertCount = trunkGeo.getAttribute('position').count;
    const foliageVertCount = foliageGeo.getAttribute('position').count;

    const finalGeo = BufferUtils.mergeGeometries([trunkGeo, foliageGeo], false);
    
    if (finalGeo) {
        finalGeo.clearGroups();
        finalGeo.addGroup(0, trunkVertCount, 0); 
        finalGeo.addGroup(trunkVertCount, foliageVertCount, 1);
        this.geometries.set(id, finalGeo);
    }
  }

  private generateRock(id: string) {
    let geo: THREE.BufferGeometry = new THREE.DodecahedronGeometry(1, 0);
    geo = geo.toNonIndexed();
    
    const posAttribute = geo.getAttribute('position');
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < posAttribute.count; i++) {
        vertex.fromBufferAttribute(posAttribute, i);
        vertex.x += (Math.random() - 0.5) * 0.3;
        vertex.y += (Math.random() - 0.5) * 0.3;
        vertex.z += (Math.random() - 0.5) * 0.3;
        posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geo.computeVertexNormals();
    this.geometries.set(id, geo);
  }

  private generateIceChunk(id: string) {
    let geo: THREE.BufferGeometry = new THREE.ConeGeometry(0.8, 2, 5);
    geo = geo.toNonIndexed();
    geo.translate(0, 1, 0);
    
    const posAttribute = geo.getAttribute('position');
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < posAttribute.count; i++) {
        vertex.fromBufferAttribute(posAttribute, i);
        if (vertex.y < 0.1) continue; 
        vertex.x += (Math.random() - 0.5) * 0.4;
        vertex.z += (Math.random() - 0.5) * 0.4;
        posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geo.computeVertexNormals();
    this.geometries.set(id, geo);
  }

  private generateLog(id: string) {
      // A fallen log, oriented along Z for physics capsule alignment (usually Y, but let's make it standard cylinder Y and rotate instance)
      let geo: THREE.BufferGeometry = new THREE.CylinderGeometry(0.3, 0.35, 3, 7);
      geo = geo.toNonIndexed();
      // Add some noise to make it look organic
      const posAttribute = geo.getAttribute('position');
      const vertex = new THREE.Vector3();
      for (let i = 0; i < posAttribute.count; i++) {
          vertex.fromBufferAttribute(posAttribute, i);
          if (Math.abs(vertex.y) < 1.4) { // Don't mess up the caps too much for collision visuals
            vertex.x += (Math.random() - 0.5) * 0.1;
            vertex.z += (Math.random() - 0.5) * 0.1;
          }
          posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }
      geo.computeVertexNormals();
      this.geometries.set(id, geo);
  }
}
