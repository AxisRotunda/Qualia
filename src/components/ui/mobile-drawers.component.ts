
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../services/ui/layout.service';
import { SceneTreeComponent } from '../scene-tree.component';
import { InspectorComponent } from '../inspector.component';

@Component({
  selector: 'app-mobile-drawers',
  standalone: true,
  imports: [CommonModule, SceneTreeComponent, InspectorComponent],
  template: `
    <!-- Left Drawer (Scene Tree) -->
    @if (layout.leftPanelOpen()) {
      <div class="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm" (click)="layout.toggleLeft()">
        <aside class="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-slate-800 shadow-2xl animate-in slide-in-from-left duration-200" 
               (click)="$event.stopPropagation()">
          <app-scene-tree />
        </aside>
      </div>
    }

    <!-- Right Drawer (Inspector) -->
    @if (layout.rightPanelOpen()) {
      <div class="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm" (click)="layout.toggleRight()">
        <aside class="absolute left-0 right-0 bottom-0 h-[60vh] bg-slate-900 border-t border-slate-700 shadow-2xl rounded-t-2xl animate-in slide-in-from-bottom duration-200 flex flex-col overflow-hidden" 
               (click)="$event.stopPropagation()">
          <!-- Drag Handle -->
          <div class="flex justify-center pt-3 pb-1 shrink-0" (click)="layout.toggleRight()">
              <div class="w-12 h-1.5 bg-slate-700 rounded-full"></div>
          </div>
          <div class="flex-1 min-h-0">
              <app-inspector />
          </div>
        </aside>
      </div>
    }
  `
})
export class MobileDrawersComponent {
  layout = inject(LayoutService);
}
