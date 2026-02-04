
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { EntityCreatedEvent, EntityDestroyedEvent } from '../events/game-events';

export type { EntityCreatedEvent, EntityDestroyedEvent } from '../events/game-events';

@Injectable({ providedIn: 'root' })
export class EntityLifecycleService {
  public readonly onEntityCreated = new Subject<EntityCreatedEvent>();
  public readonly onEntityDestroyed = new Subject<EntityDestroyedEvent>();
  public readonly onWorldReset = new Subject<void>();
}
