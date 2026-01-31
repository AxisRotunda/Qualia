
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { createInlineWorker } from '../../../engine/utils/worker.utils';
import { TERRAIN_WORKER_SCRIPT } from '../../../engine/workers/terrain-worker.const';

@Injectable({
  providedIn: 'root'
})
export class NatureTerrainService {
  
  generateHeightDataAsync(
      width: number, depth: number, 
      segmentsW: number, segmentsD: number, 
      offsetX: number, offsetZ: number,
      lod: number = 1,
      terrainType: 'standard' | 'dunes' = 'standard'
  ): Promise<{ heights: Float32Array, normals: Float32Array }> {
      
      return new Promise((resolve, reject) => {
          const worker = createInlineWorker(TERRAIN_WORKER_SCRIPT);

          worker.onmessage = (e) => {
              resolve({ heights: e.data.heights, normals: e.data.normals });
              worker.terminate();
          };

          worker.onerror = (err) => {
              reject(err);
              worker.terminate();
          };

          worker.postMessage({ width, depth, segmentsW, segmentsD, offsetX, offsetZ, lod, terrainType });
      });
  }

  createTerrainGeometry(
      width: number, depth: number, 
      segmentsW: number, segmentsD: number, 
      heights: Float32Array, normals: Float32Array
  ): THREE.BufferGeometry {
      const geo = new THREE.PlaneGeometry(width, depth, segmentsW, segmentsD);
      geo.rotateX(-Math.PI / 2);
      
      const pos = geo.getAttribute('position');
      for(let i=0; i<pos.count; i++) {
          pos.setY(i, heights[i]);
      }

      geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
      
      // Tangents required for advanced materials (like normal maps)
      if (geo.hasAttribute('uv')) geo.computeTangents();
      
      return geo;
  }

  // Legacy sync method for AssetService contract (Fallback)
  generateIceTerrain(size = 128): THREE.BufferGeometry {
      const segments = 128; 
      const geo = new THREE.PlaneGeometry(size, size, segments, segments);
      geo.rotateX(-Math.PI / 2);
      
      const pos = geo.getAttribute('position');
      const v = new THREE.Vector3();
      for(let i=0; i<pos.count; i++) {
          v.fromBufferAttribute(pos, i);
          const n = Math.sin(v.x * 0.1) * Math.cos(v.z * 0.1) * 2.0;
          pos.setY(i, n);
      }
      geo.computeVertexNormals();
      
      return geo; 
  }
}
