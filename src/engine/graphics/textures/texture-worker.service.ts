
import { Injectable } from '@angular/core';
import { createInlineWorker } from '../../utils/worker.utils';
import { TEXTURE_WORKER_SCRIPT } from '../../workers/texture-worker.const';

@Injectable({
  providedIn: 'root'
})
export class TextureWorkerService {
  private worker: Worker | null = null;
  private pendingRequests = new Map<number, (data: ImageBitmap) => void>();
  private nextId = 0;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    this.worker = createInlineWorker(TEXTURE_WORKER_SCRIPT);
    
    this.worker.onmessage = (e) => {
      const { id, bitmap } = e.data;
      const resolve = this.pendingRequests.get(id);
      if (resolve) {
        resolve(bitmap);
        this.pendingRequests.delete(id);
      }
    };
  }

  generate(type: string, params: any): Promise<ImageBitmap> {
    if (!this.worker) this.initWorker();
    
    return new Promise((resolve) => {
      const id = this.nextId++;
      this.pendingRequests.set(id, resolve);
      this.worker!.postMessage({ id, type, params });
    });
  }
}
