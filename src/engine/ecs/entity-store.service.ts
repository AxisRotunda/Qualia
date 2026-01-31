
import { Injectable, signal } from '@angular/core';
import { World, Entity } from '../core';

@Injectable({
  providedIn: 'root'
})
export class EntityStoreService {
  public readonly world = new World();
  public readonly objectCount = signal(0);
  public readonly selectedEntity = signal<Entity | null>(null);

  reset() {
    this.selectedEntity.set(null);
    this.world.clear();
    this.objectCount.set(0);
  }
}
