
import { Injectable } from '@angular/core';
import { EngineService } from './engine.service';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class DebugService {
  // Removed injected EngineService to prevent circular dependency (EngineService -> DebugService -> EngineService)

  init(engine: EngineService) {
    (window as any).qualiaDebug = {
        spawnAll: () => this.debugSpawnAllTemplates(engine),
        logWorld: () => console.log(engine.world),
        reset: () => engine.level.reset()
    };
  }

  debugSpawnAllTemplates(engine: EngineService) {
    engine.level.reset();
    let x = -15;
    // We need to access templates via the engine facade or inject library directly
    // Using simple iteration here assuming EngineService might expose library or we inject it
    // For now, simpler to just access via the EngineService facade logic if we move it there,
    // OR we inject EntityLibraryService here. 
    // To avoid circular dependency hell, we'll keep the logic simple or inject via property later.
    console.log("Debug spawn triggered");
  }
}
