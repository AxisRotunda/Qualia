
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private geometries = new Map<string, THREE.BufferGeometry>();

  constructor() {
    this.initGeometries();
  }

  getGeometry(id: string): THREE.BufferGeometry {
    return this.geometries.get(id) || new THREE.BoxGeometry(1,1,1);
  }

  private initGeometries() {
    this.generateTree('tree-01');
    this.generateRock('rock-01');
    this.generateIceChunk('ice-01');
  }

  private generateTree(id: string) {
    // 1. Trunk (Cylinder) - Convert to non-indexed to ensure attribute compatibility
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

    // Merge Foliage
    const foliageGeo = BufferUtils.mergeGeometries([leaves1, leaves2], false);

    if (!foliageGeo) {
        console.warn('AssetService: Failed to generate foliage geometry');
        return;
    }

    // Apply Groups for Multi-Material Support
    // Group 0: Trunk (Material Index 0)
    // Group 1: Foliage (Material Index 1)
    
    // We need to know vertex counts to set groups correctly after merge
    const trunkVertCount = trunkGeo.getAttribute('position').count;
    const foliageVertCount = foliageGeo.getAttribute('position').count;

    const finalGeo = BufferUtils.mergeGeometries([trunkGeo, foliageGeo], false);
    
    if (finalGeo) {
        finalGeo.clearGroups();
        finalGeo.addGroup(0, trunkVertCount, 0); // Trunk -> Mat 0
        finalGeo.addGroup(trunkVertCount, foliageVertCount, 1); // Foliage -> Mat 1
        
        this.geometries.set(id, finalGeo);
    } else {
        console.warn('AssetService: Failed to generate tree geometry');
    }
  }

  private generateRock(id: string) {
    // Rocks look better flat shaded (non-indexed) for low poly style
    let geo: THREE.BufferGeometry = new THREE.DodecahedronGeometry(1, 0);
    geo = geo.toNonIndexed();
    
    const posAttribute = geo.getAttribute('position');
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < posAttribute.count; i++) {
        vertex.fromBufferAttribute(posAttribute, i);
        // Perturb
        vertex.x += (Math.random() - 0.5) * 0.3;
        vertex.y += (Math.random() - 0.5) * 0.3;
        vertex.z += (Math.random() - 0.5) * 0.3;
        posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geo.computeVertexNormals();
    this.geometries.set(id, geo);
  }

  private generateIceChunk(id: string) {
    let geo: THREE.BufferGeometry = new THREE.ConeGeometry(1, 2, 4);
    geo = geo.toNonIndexed();
    geo.translate(0, 1, 0);
    
    const posAttribute = geo.getAttribute('position');
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < posAttribute.count; i++) {
        vertex.fromBufferAttribute(posAttribute, i);
        if (vertex.y < 0.1) continue; // Keep base flat
        vertex.x += (Math.random() - 0.5) * 0.5;
        vertex.z += (Math.random() - 0.5) * 0.5;
        posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geo.computeVertexNormals();
    this.geometries.set(id, geo);
  }
}
