
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenePreset } from '../../data/scene-definitions';

@Component({
  selector: 'app-menu-worlds-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto animate-in slide-in-from-right-4 duration-300">
      <header class="mb-6 flex justify-between items-end">
        <div>
          <h2 class="text-2xl font-bold text-white">Select World</h2>
          <p class="text-slate-400 text-sm">Choose a starting template or scenario.</p>
        </div>
        <span class="text-xs font-mono text-slate-500">{{ scenes().length }} PRESETS</span>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        @for (s of scenes(); track s.id) {
          <button (click)="loadScene.emit(s.id)" 
                  class="group relative h-48 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 text-left transition-all hover:scale-[1.02] hover:shadow-xl hover:border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500">
            
            <!-- Visual Preview (Abstract) -->
            <div class="absolute inset-0 bg-gradient-to-br opacity-40 group-hover:opacity-60 transition-opacity"
                 [ngClass]="s.previewColor"></div>
            
            <!-- Noise Texture Overlay -->
            <div class="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            <div class="absolute inset-0 p-5 flex flex-col z-10">
              <div class="flex justify-between items-start">
                <span class="material-symbols-outlined text-white/80 bg-black/20 p-2 rounded-lg backdrop-blur-sm">
                  {{ getSceneIcon(s.theme) }}
                </span>
                @if (s.theme === 'space') {
                  <span class="text-[10px] bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                    ZERO-G
                  </span>
                }
              </div>

              <div class="mt-auto">
                <h3 class="text-lg font-bold text-white shadow-black drop-shadow-md">{{ s.label }}</h3>
                <p class="text-xs text-white/70 line-clamp-2 mt-1">{{ s.description }}</p>
              </div>
            </div>
          </button>
        }
      </div>
    </div>
  `
})
export class MenuWorldsTabComponent {
  scenes = input.required<ScenePreset[]>();
  loadScene = output<string>();

  getSceneIcon(theme: string) {
    switch(theme) {
        case 'city': return 'location_city';
        case 'forest': return 'forest';
        case 'ice': return 'ac_unit';
        case 'space': return 'public';
        default: return 'landscape';
    }
  }
}
