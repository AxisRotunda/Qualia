
import { Injectable } from '@angular/core';
import { MaterialService } from '../../services/material.service';
import { ENTITY_TEMPLATES } from '../../data/entity-templates';
import { EntityTemplate, EntityCategory } from '../../data/entity-types';

// Export options for consumers
export type { SpawnOptions } from '../../services/factories/template-factory.service';

@Injectable({
  providedIn: 'root'
})
export class EntityLibraryService {
  private templateMap = new Map<string, EntityTemplate>();
  private categoryMap = new Map<EntityCategory, EntityTemplate[]>();
  
  // Expose as array for legacy components
  readonly allTemplates: EntityTemplate[] = ENTITY_TEMPLATES;

  constructor() {
      ENTITY_TEMPLATES.forEach(t => {
          // 1. Primary Lookup Map
          this.templateMap.set(t.id, t);
          
          // 2. Category Maps
          let catList = this.categoryMap.get(t.category);
          if (!catList) {
              catList = [];
              this.categoryMap.set(t.category, catList);
          }
          catList.push(t);
      });
  }

  getTemplate(id: string): EntityTemplate | undefined {
      return this.templateMap.get(id);
  }

  getTemplatesByCategory(category: EntityCategory): EntityTemplate[] {
      return this.categoryMap.get(category) || [];
  }

  /**
   * Diagnostic routine to ensure data integrity.
   */
  validateTemplates(matService: MaterialService) {
    this.allTemplates.forEach(tpl => {
      if (tpl.materialId && !matService.hasMaterial(tpl.materialId)) {
        console.warn(`[Validation] Template '${tpl.id}' references missing material '${tpl.materialId}'`);
      }
      
      if (tpl.geometry === 'mesh' && !tpl.meshId) {
        console.error(`[Validation] Template '${tpl.id}' is mesh-type but missing meshId`);
      }
    });
  }
}
