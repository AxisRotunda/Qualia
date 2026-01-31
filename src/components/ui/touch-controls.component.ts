
import { Component, inject, output, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineService } from '../../services/engine.service';
import { MobileTransformToolbarComponent } from './mobile-transform-toolbar.component';
import { MobileContextActionsComponent } from './mobile-context-actions.component';
import { TouchCameraLayerComponent } from './touch/touch-camera-layer.component';
import { TouchObjectLayerComponent } from './touch/touch-object-layer.component';

@Component({
  selector: 'app-touch-controls',
  standalone: true,
  imports: [
    CommonModule, 
    MobileTransformToolbarComponent,
    MobileContextActionsComponent,
    TouchCameraLayerComponent,
    TouchObjectLayerComponent
  ],
  template: `
    <!-- Restore UI Button -->
    @if (!engine.hudVisible()) {
      <button class="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-slate-900/50 text-slate-400 border border-white/10 backdrop-blur flex items-center justify-center active:scale-95 transition-all pointer-events-auto"
              (click)="engine.viewport.toggleHud()"
              (pointerdown)="$event.stopPropagation()"
              aria-label="Show UI">
          <span class="material-symbols-outlined">visibility</span>
      </button>
    }

    <!-- Crosshair / Reticle for Walk/Explore Modes -->
    @if (engine.mode() !== 'edit' && engine.hudVisible()) {
        <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-0 opacity-50">
            <div class="absolute inset-0 border-2 border-white/50 rounded-full"></div>
            <div class="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-white -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
        </div>
    }

    <!-- 
      CONTROLLER LAYERS 
      Note: These layers have specific zones with pointer-events-auto.
      The containers themselves are pointer-events-none.
    -->
    @if (isObjectControlActive()) {
        <app-touch-object-layer 
            [showLabels]="engine.hudVisible()"
            [transformMode]="engine.transformMode()"
        />
    } @else {
        <app-touch-camera-layer 
            [showLabels]="engine.hudVisible()"
            [isEditMode]="engine.mode() === 'edit'"
            [isWalkMode]="engine.mode() === 'walk'"
        />
    }

    <!-- Context Actions Overlay (Always visible if something is selected and HUD is on) -->
    @if (engine.selectedEntity() !== null && engine.hudVisible()) {
       <app-mobile-context-actions 
          [controlMode]="controlMode()"
          (toggleControlMode)="toggleControlMode()"
          (deselect)="deselect()"
          (deleteSelected)="deleteSelected()"
       />
    }

    <!-- TRANSFORM TOOLBAR - VISIBLE IN ALL MODES IF SELECTED -->
    @if (showTransformToolbar()) {
       <app-mobile-transform-toolbar 
          [currentMode]="engine.transformMode()"
          [canUndo]="engine.canUndo()"
          [hasSelection]="engine.selectedEntity() !== null"
          (setMode)="setTransformMode($event)"
          (undo)="engine.ops.undo()"
          (toggleInspector)="toggleInspector.emit()"
       />
    }
  `,
  styles: [`
    :host {
        display: block;
        width: 100%;
        height: 100%;
        pointer-events: none; /* Critical: Host is transparent to clicks */
    }
  `]
})
export class TouchControlsComponent {
  engine = inject(EngineService);
  
  toggleInspector = output<void>();

  // 'camera' = Moving Player/Camera
  // 'object' = Moving Selected Entity
  controlMode = signal<'camera' | 'object'>('camera');

  constructor() {
      effect(() => {
          if (this.engine.selectedEntity() === null) {
              // If selection lost, force back to camera
              this.controlMode.set('camera');
          }
      });
  }

  isObjectControlActive() {
      return this.engine.selectedEntity() !== null && this.controlMode() === 'object';
  }

  showTransformToolbar() {
      // Show tool bar if we have a selection, OR if we are in edit mode (even without selection for Undo etc)
      // If NOT in edit mode (Walk/Fly), only show if selected
      const hasSelection = this.engine.selectedEntity() !== null;
      const isEdit = this.engine.mode() === 'edit';
      const visible = !this.engine.mainMenuVisible() && this.engine.hudVisible();
      
      return visible && (isEdit || hasSelection);
  }

  toggleControlMode() {
      if (this.controlMode() === 'camera') {
          this.controlMode.set('object');
      } else {
          this.controlMode.set('camera');
      }
  }

  setTransformMode(mode: 'translate'|'rotate'|'scale') {
      this.engine.viewport.setTransformMode(mode);
      // Auto-switch to object control mode if we click a tool
      if (this.engine.selectedEntity() !== null) {
          this.controlMode.set('object');
      }
  }

  deleteSelected() {
      const e = this.engine.selectedEntity();
      if (e !== null) this.engine.ops.deleteEntity(e);
  }

  deselect() {
      this.engine.interaction.selectEntity(null);
  }
}
