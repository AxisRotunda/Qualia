
import { Injectable } from '@angular/core';
import { MaterialService } from './material.service';
import { ENTITY_TEMPLATES } from '../data/entity-templates';
import { EntityTemplate } from '../data/entity-types';

// Export options for consumers (Re-exporting from factory for compatibility)
export { SpawnOptions } from './factories/template-factory.service';

@Injectable({
  providedIn: 'root'
})
export class EntityLibraryService {
  readonly templates: EntityTemplate[] = ENTITY_TEMPLATES;

  getTemplate(id: string): EntityTemplate | undefined {
      return this.templates.find(t => t.id === id);
  }

  validateTemplates(matService: MaterialService) {
    this.templates.forEach(tpl => {
      if (tpl.materialId && !matService.hasMaterial(tpl.materialId)) {
        console.warn(`[Validation Warning] Template '${tpl.id}' references missing material '${tpl.materialId}'`);
      }
    });
  }
}
