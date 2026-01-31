
import { Component, inject } from '@angular/core';
import { EngineService } from '../../services/engine.service';
import { LayoutService } from '../../services/ui/layout.service';
import { MenuBarComponent } from '../menu/menu-bar.component';
import { ToolbarComponent } from '../toolbar.component';
import { StatusBarComponent } from '../status-bar.component';
import { DebugOverlayComponent } from '../debug-overlay.component';
import { SceneTreeComponent } from '../scene-tree.component';
import { InspectorComponent } from '../inspector.component';
import { MobileDrawersComponent } from './mobile-drawers.component';

@Component({
  selector: 'app-game-hud',
  standalone: true,
  imports: [
    MenuBarComponent,
    ToolbarComponent,
    StatusBarComponent,
    DebugOverlayComponent,
    SceneTreeComponent,
    InspectorComponent,
    MobileDrawersComponent
  ],
  template: `
    @if (engine.hudVisible()) {
      <!-- Header Area -->
      <app-menu-bar />
      <app-toolbar />

      <!-- Main Layout Panels (Absolute positioning relative to this container in flex flow) -->
      <div class="flex flex-1 overflow-hidden relative pointer-events-none">
        
        <!-- Desktop Left Panel -->
        @if (layout.leftPanelOpen() && !layout.isMobile()) {
          <aside class="flex flex-col w-64 bg-slate-950/95 border-r border-slate-800 z-10 pointer-events-auto h-full" aria-label="Outliner">
            <app-scene-tree />
          </aside>
        }

        <!-- Middle Spacer (Pass-through to Canvas below) -->
        <div class="flex-1 relative">
           <app-debug-overlay />
        </div>

        <!-- Desktop Right Panel -->
        @if (layout.rightPanelOpen() && !layout.isMobile()) {
          <aside class="flex flex-col w-80 bg-slate-950/95 border-l border-slate-800 z-10 pointer-events-auto h-full" aria-label="Inspector">
            <app-inspector />
          </aside>
        }

        <!-- Mobile Drawers (Overlay) -->
        @if (layout.isMobile()) {
          <!-- 
             CRITICAL FIX: This wrapper MUST be pointer-events-none.
             If it is auto, it creates a full-screen invisible shield over the touch controls (Z20).
             The drawers inside handle their own pointer-events-auto when open.
          -->
          <div class="absolute inset-0 pointer-events-none">
             <app-mobile-drawers />
          </div>
        }
      </div>

      <!-- Bottom Bar -->
      <app-status-bar />
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      pointer-events: none; /* Let clicks pass through empty areas to canvas */
    }
    app-menu-bar, app-toolbar, app-status-bar {
      pointer-events: auto;
    }
  `]
})
export class GameHudComponent {
  engine = inject(EngineService);
  layout = inject(LayoutService);
}
