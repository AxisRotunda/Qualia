
import { Injectable, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { createInlineWorker } from '../../../engine/utils/worker.utils';
import { TERRAIN_WORKER_SCRIPT } from '../../../engine/workers/terrain-worker.const';

export interface TerrainResponse {
    heights: Float32Array;
    normals: Float32Array;
    gridW: number;
    gridD: number;
    error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NatureTerrainService implements OnDestroy {
  // Pool of workers for parallel processing
  private workers: Worker[] = [];
  private readonly MAX_WORKERS = Math.min(4, Math.max(2, (navigator.hardwareConcurrency || 4) - 1));
  private workerPointer = 0;
  
  private pendingRequests = new Map<number, { resolve: (data: TerrainResponse) => void, reject: (err: any) => void }>();
  private nextId = 0;

  private initPool() {
      if (this.workers.length > 0) return;
      
      for (let i = 0; i < this.MAX_WORKERS; i++) {
          const worker = createInlineWorker(TERRAIN_WORKER_SCRIPT);
          worker.onmessage = (e) => this.handleMessage(e);
          worker.onerror = (err) => this.handleError(err, worker);
          this.workers.push(worker);
      }
      console.log(`[NatureTerrain] Worker Pool Initialized: ${this.MAX_WORKERS} threads.`);
  }

  private handleMessage(e: MessageEvent) {
      const { id, heights, normals, gridW, gridD, error } = e.data;
      const request = this.pendingRequests.get(id);
      if (request) {
          if (error) request.reject(new Error(error));
          else request.resolve({ heights, normals, gridW, gridD });
          this.pendingRequests.delete(id);
      }
  }

  private handleError(err: ErrorEvent, worker: Worker) {
      console.error('[NatureTerrain] Worker Internal Fault:', err);
      // Remove failed worker and replace it
      const idx = this.workers.indexOf(worker);
      if (idx !== -1) {
          worker.terminate();
          const newWorker = createInlineWorker(TERRAIN_WORKER_SCRIPT);
          newWorker.onmessage = (e) => this.handleMessage(e);
          newWorker.onerror = (ev) => this.handleError(ev, newWorker);
          this.workers[idx] = newWorker;
      }
  }

  /**
   * Forces initialization of all workers in the pool.
   * Called during Engine Bootstrap.
   */
  warmup() {
      this.initPool();
  }
  
  generateHeightDataAsync(
      width: number, depth: number, 
      segmentsW: number, segmentsD: number, 
      offsetX: number, offsetZ: number,
      lod: number = 1,
      terrainType: 'standard' | 'dunes' | 'islands' = 'standard'
  ): Promise<TerrainResponse> {
      this.initPool();
      
      return new Promise((resolve, reject) => {
          const id = this.nextId++;
          this.pendingRequests.set(id, { resolve, reject });
          
          // Round-robin worker selection
          const worker = this.workers[this.workerPointer];
          this.workerPointer = (this.workerPointer + 1) % this.workers.length;
          
          worker.postMessage({ id, width, depth, segmentsW, segmentsD, offsetX, offsetZ, lod, terrainType });
      });
  }

  /**
   * Populates an existing geometry with new data (Recycling).
   */
  updateTerrainGeometry(
      geo: THREE.BufferGeometry,
      heights: Float32Array, 
      normals: Float32Array
  ) {
      const pos = geo.getAttribute('position');
      if (pos.count !== heights.length) {
          console.warn('[NatureTerrain] Buffer size mismatch during update.');
          return;
      }
      
      // Update buffers in place
      for(let i = 0; i < pos.count; i++) {
          pos.setY(i, heights[i]);
      }
      
      geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
      pos.needsUpdate = true;
      
      if (geo.hasAttribute('tangent')) {
          geo.computeTangents();
      }
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
      geo.computeTangents();
      return geo;
  }

  ngOnDestroy() {
      this.workers.forEach(w => w.terminate());
      this.workers = [];
      this.pendingRequests.clear();
  }
}
