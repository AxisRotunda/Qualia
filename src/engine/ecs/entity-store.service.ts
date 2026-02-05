
import { Injectable, signal } from '@angular/core';
import { World, Entity } from '../core';

@Injectable({
    providedIn: 'root'
})
export class EntityStoreService {
    public readonly world = new World();
    public readonly objectCount = signal(0);
    public readonly selectedEntity = signal<Entity | null>(null);

    // Industry Standard: Hierarchy Flags
    public readonly locked = new Set<Entity>();
    public readonly hidden = new Set<Entity>();

    reset() {
        this.selectedEntity.set(null);
        this.locked.clear();
        this.hidden.clear();
        this.world.clear();
        this.objectCount.set(0);
    }
}
