
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SceneLoadEvent } from '../events/game-events';

/**
 * SceneLifecycleService: Central authority for world state transitions.
 * Part of RUN_EVENTS protocol.
 */
@Injectable({
    providedIn: 'root'
})
export class SceneLifecycleService {
    // Emitted before world reset starts
    public readonly beforeUnload = new Subject<void>();

    // Emitted when current world data is purged
    public readonly onWorldCleared = new Subject<void>();

    // Emitted when a new scene load begins
    public readonly onLoadStart = new Subject<SceneLoadEvent>();

    // Emitted when scene logic is finished and simulation resumes
    public readonly onLoadComplete = new Subject<SceneLoadEvent>();

    // Recovery hook for fatal load failures
    public readonly onEmergencyPurge = new Subject<string>();
}
