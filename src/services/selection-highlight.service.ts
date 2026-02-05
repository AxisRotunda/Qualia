
import { Injectable, effect, inject } from '@angular/core';
import { EngineService } from './engine.service';
import { SelectionManagerService } from '../engine/graphics/selection-manager.service';

@Injectable({
    providedIn: 'root'
})
export class SelectionHighlightService {
    private engine = inject(EngineService);
    private selectionManager = inject(SelectionManagerService);

    constructor() {
        effect(() => {
            const entity = this.engine.selectedEntity();
            if (entity !== null) {
                // Safe check if mesh still exists (might have been deleted)
                const meshRef = this.engine.world.meshes.get(entity);
                this.selectionManager.setSelection(meshRef ? meshRef.mesh : null);
            } else {
                this.selectionManager.setSelection(null);
            }
        });
    }
}
