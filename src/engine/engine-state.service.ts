
import { Injectable, signal } from '@angular/core';
import { CameraViewPreset } from '../engine/controllers/camera-control.service';
import { WeatherType } from '../services/particle.service';

export interface DebugState {
    paused: boolean;
    bodyCount: number;
    singleUpdate: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class EngineStateService {
  // Performance & Time
  readonly fps = signal(0);
  readonly physicsTime = signal(0);
  readonly renderTime = signal(0);
  
  // System State
  readonly loading = signal(true);
  readonly isPaused = signal(false);
  readonly mainMenuVisible = signal(true);
  
  // UI State
  readonly hudVisible = signal(true);
  
  // World Settings
  readonly gravityY = signal(-9.81);
  readonly wireframe = signal(false);
  readonly texturesEnabled = signal(false);
  readonly showPhysicsDebug = signal(false);
  
  // Environment State
  readonly timeOfDay = signal(12); // 0-24
  readonly weather = signal<WeatherType>('clear');
  readonly atmosphere = signal('clear');
  
  // Interaction Modes
  readonly transformMode = signal<'translate' | 'rotate' | 'scale'>('translate');
  readonly mode = signal<'edit' | 'explore' | 'walk'>('edit');
  readonly currentSceneId = signal<string | null>(null);
  
  // History
  readonly canUndo = signal(false);
  readonly canRedo = signal(false);
  
  // Debug
  readonly showDebugOverlay = signal(true);
  readonly debugInfo = signal<DebugState>({ paused: false, bodyCount: 0, singleUpdate: null });
}
