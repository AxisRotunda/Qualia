
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PhysicsRegistryService {
  private handleToEntity = new Map<number, number>();

  register(handle: number, entityId: number) {
    this.handleToEntity.set(handle, entityId);
  }

  unregister(handle: number) {
    this.handleToEntity.delete(handle);
  }

  getEntityId(handle: number): number | undefined {
    return this.handleToEntity.get(handle);
  }

  clear() {
    this.handleToEntity.clear();
  }
}
