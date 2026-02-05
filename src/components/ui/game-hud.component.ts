
import { Component, inject, computed } from '@angular/core';
import { EngineService } from '../../services/engine.service';
import { LayoutService } from '../../services/ui/layout.service';
import { MenuBarComponent } from '../menu/menu-bar.component';
import { ToolbarComponent } from '../toolbar.component';
import { StatusBarComponent } from '../status-bar.component';
import { DebugOverlayComponent } from '../debug-overlay.component';
import { SceneTreeComponent } from '../scene-tree.component';
import { InspectorComponent } from '../inspector.component';
import { MobileDrawersComponent } from './mobile-drawers.component';
import { WeaponStatusComponent } from './hud/weapon-status.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-game-hud',
    standalone: true,
    imports: [
        CommonModule,
        MenuBarComponent,
        ToolbarComponent,
        StatusBarComponent,
        DebugOverlayComponent,
        SceneTreeComponent,
        InspectorComponent,
        MobileDrawersComponent,
        WeaponStatusComponent
    ],
    template: `
    @if (engine.hudVisible()) {
      <app-menu-bar />
      <app-toolbar />

      <div class="flex flex-1 overflow-hidden relative pointer-events-none">

        @if (layout.leftPanelOpen() && !layout.isMobile()) {
          <aside class="flex flex-col w-64 bg-slate-950/95 border-r border-slate-800 z-10 pointer-events-auto h-full">
            <app-scene-tree />
          </aside>
        }

        <div class="flex-1 relative flex flex-col items-center justify-center">

           <!-- INDUSTRY: Tactical Reticle Layer -->
           @if (isTacticalMode()) {
               <div class="relative transition-all duration-150 ease-out"
                    [style.transform]="'scale(' + reticleScale() + ')'"
                    [class.text-rose-500]="targetAcquired()"
                    [class.text-cyan-400]="!targetAcquired()">

                  <!-- Center Calibration Dot -->
                  <div class="w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white] opacity-80"></div>

                  <!-- Hit Marker Layer -->
                  @if (engine.state.hitMarkerActive()) {
                      <div class="absolute inset-[-12px] animate-in zoom-in-150 duration-75 text-cyan-300">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                              <path d="M4 4L20 20M20 4L4 20" />
                          </svg>
                      </div>
                  }

                  <!-- Dynamic Brackets (Movement Spread) -->
                  <div class="absolute inset-[-18px] transition-all duration-300">
                      <div class="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-current rounded-tl-sm shadow-[0_0_10px_currentColor]"></div>
                      <div class="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-current rounded-tr-sm shadow-[0_0_10px_currentColor]"></div>
                      <div class="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-current rounded-bl-sm shadow-[0_0_10px_currentColor]"></div>
                      <div class="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-current rounded-br-sm shadow-[0_0_10px_currentColor]"></div>
                  </div>

                  @if (engine.state.isAiming()) {
                      <div class="absolute inset-[-6px] border border-white/20 rounded-full animate-ping pointer-events-none opacity-40"></div>
                  }
               </div>

               @if (engine.state.acquiredTarget(); as target) {
                  <div class="absolute translate-y-16 animate-in slide-in-from-top-2 duration-300 pointer-events-none">
                     <div class="flex flex-col items-center">
                        <div class="h-px w-24 bg-gradient-to-r from-transparent via-rose-500 to-transparent mb-1"></div>
                        <span class="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] drop-shadow-lg">
                           ACQUISITION: {{ target.name }}
                        </span>
                        <span class="text-[8px] font-mono text-white/60 tracking-wider">
                           RANGE: {{ target.distance.toFixed(1) }}m | SIG_LOCK: ACTIVE
                        </span>
                     </div>
                  </div>
               }
           }

           <div class="flex-1 w-full flex items-end justify-center pb-4 relative">
               <app-debug-overlay />

               @if (!layout.isMobile() && engine.mode() === 'walk') {
                   <div class="absolute bottom-6 right-6 animate-in slide-in-from-right-4 fade-in duration-500">
                       <app-weapon-status />
                   </div>
               }
           </div>

           @if (layout.isMobile() && engine.mode() === 'walk') {
               <div class="absolute top-4 left-2 z-50 animate-in slide-in-from-left-4 fade-in duration-500">
                   <app-weapon-status class="scale-90 origin-top-left opacity-90" />
               </div>
           }
        </div>

        @if (layout.rightPanelOpen() && !layout.isMobile()) {
          <aside class="flex flex-col w-80 bg-slate-950/95 border-l border-slate-800 z-10 pointer-events-auto h-full">
            <app-inspector />
          </aside>
        }

        @if (layout.isMobile()) {
          <div class="absolute inset-0 pointer-events-none">
             <app-mobile-drawers />
          </div>
        }
      </div>

      <app-status-bar />
    }
  `,
    styles: [`
    :host { display: flex; flex-direction: column; height: 100%; width: 100%; pointer-events: none; }
    app-menu-bar, app-toolbar, app-status-bar { pointer-events: auto; }
  `]
})
export class GameHudComponent {
    engine = inject(EngineService);
    layout = inject(LayoutService);

    isTacticalMode = computed(() => this.engine.mode() === 'walk' || this.engine.mode() === 'explore');
    targetAcquired = computed(() => this.engine.state.acquiredTarget() !== null);

    // RUN_INDUSTRY: Dynamic Spread based on Velocity and Action State
    reticleScale = computed(() => {
        let scale = 1.0;

        // Speed spread (maxes at 1.8x at full sprint)
        const speed = this.engine.state.playerSpeed();
        scale += Math.min(speed / 12.0, 0.8);

        if (this.engine.state.isAiming()) {
            scale *= 0.6; // Tighten
        } else if (this.engine.input.getFire()) {
            scale *= 1.3; // Bloom
        }

        return scale;
    });
}
