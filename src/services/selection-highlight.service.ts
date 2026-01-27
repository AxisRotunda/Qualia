
import { Injectable, effect, inject } from '@angular/core';
import { EngineService } from './engine.service';
import { SceneService } from './scene.service';

@Injectable({
  providedIn: 'root'
})
export class SelectionHighlightService {
  private engine = inject(EngineService);
  private scene = inject(SceneService);

  constructor() {
    effect(() => {
      const entity = this.engine.selectedEntity();
      if (entity !== null) {
        // Safe check if mesh still exists (might have been deleted)
        const meshRef = this.engine.world.meshes.get(entity);
        this.scene.setSelection(meshRef ? meshRef.mesh : null);
      } else {
        this.scene.setSelection(null);
      }
    });
  }
}
