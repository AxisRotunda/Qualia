
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Entity } from '../schema';

export interface EntityCreatedEvent {
  entity: Entity;
  isStatic: boolean;
  tags: string[];
}

@Injectable({ providedIn: 'root' })
export class EntityLifecycleService {
  public readonly onEntityCreated = new Subject<EntityCreatedEvent>();
  public readonly onEntityDestroyed = new Subject<Entity>();
  public readonly onWorldReset = new Subject<void>();
}
