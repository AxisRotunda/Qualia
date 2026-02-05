
import { Component, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { EngineService } from '../../../services/engine.service';

@Component({
    selector: 'app-world-fx-tab',
    standalone: true,
    imports: [CommonModule, DecimalPipe],
    template: `
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div class="flex items-center justify-between bg-cyan-950/20 p-3 rounded-lg border border-cyan-500/20">
            <label class="section-title text-cyan-400">Cinematic Pipeline</label>
            <button (click)="engine.viewport.togglePostProcessing()"
                    class="px-3 py-1 rounded text-[10px] font-bold border transition-all"
                    [class.active-fx]="engine.state.postProcessingEnabled()"
                    [class.inactive-fx]="!engine.state.postProcessingEnabled()">
                 {{ engine.state.postProcessingEnabled() ? 'ACTIVE' : 'OFFLINE' }}
            </button>
        </div>

        <div class="space-y-5" [class.opacity-30]="!engine.state.postProcessingEnabled()" [class.pointer-events-none]="!engine.state.postProcessingEnabled()">
            <div class="space-y-3">
                <div class="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Bloom Strength</span>
                    <span class="font-mono text-cyan-400">{{ engine.state.bloomStrength() | number:'1.2-2' }}</span>
                </div>
                <input type="range" min="0" max="3" step="0.05"
                       [value]="engine.state.bloomStrength()" (input)="updateBloomS($event)"
                       class="modern-range accent-cyan-500">
            </div>

            <div class="space-y-3">
                <div class="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Bloom Threshold</span>
                    <span class="font-mono text-cyan-400">{{ engine.state.bloomThreshold() | number:'1.2-2' }}</span>
                </div>
                <input type="range" min="0" max="2" step="0.05"
                       [value]="engine.state.bloomThreshold()" (input)="updateBloomT($event)"
                       class="modern-range accent-cyan-500">
            </div>

            <div class="space-y-3">
                <div class="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Film Grain</span>
                    <span class="font-mono text-cyan-400">{{ engine.state.grainIntensity() | number:'1.3-3' }}</span>
                </div>
                <input type="range" min="0" max="0.1" step="0.001"
                       [value]="engine.state.grainIntensity()" (input)="updateGrain($event)"
                       class="modern-range accent-cyan-500">
            </div>

            <div class="space-y-3">
                <div class="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Lens Distortion</span>
                    <span class="font-mono text-cyan-400">{{ engine.state.aberrationIntensity() | number:'1.1-1' }}</span>
                </div>
                <input type="range" min="0" max="10" step="0.1"
                       [value]="engine.state.aberrationIntensity()" (input)="updateAberration($event)"
                       class="modern-range accent-cyan-500">
            </div>

            <div class="space-y-3">
                <div class="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Vignette</span>
                    <span class="font-mono text-cyan-400">{{ engine.state.vignetteIntensity() | number:'1.2-2' }}</span>
                </div>
                <input type="range" min="0" max="2" step="0.05"
                       [value]="engine.state.vignetteIntensity()" (input)="updateVignette($event)"
                       class="modern-range accent-cyan-500">
            </div>
        </div>
    </div>
  `,
    styles: [`
    .section-title { @apply text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]; }
    .modern-range { @apply w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer border border-white/5 relative; }
    .modern-range::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; background: white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5); margin-top: -6px; border: 2px solid #1e293b; }
    .active-fx { @apply bg-cyan-600 border-cyan-400 text-white; }
    .inactive-fx { @apply bg-slate-800 border-slate-600 text-slate-400; }
  `]
})
export class WorldFxTabComponent {
    engine = inject(EngineService);

    updateBloomS(e: Event) {
        const val = parseFloat((e.target as HTMLInputElement).value);
        this.engine.state.setBloomStrength(val);
    }
    updateBloomT(e: Event) {
        const val = parseFloat((e.target as HTMLInputElement).value);
        this.engine.state.setBloomThreshold(val);
    }
    updateGrain(e: Event) {
        const val = parseFloat((e.target as HTMLInputElement).value);
        this.engine.state.setGrainIntensity(val);
    }
    updateVignette(e: Event) {
        const val = parseFloat((e.target as HTMLInputElement).value);
        this.engine.state.setVignetteIntensity(val);
    }
    updateAberration(e: Event) {
        const val = parseFloat((e.target as HTMLInputElement).value);
        this.engine.state.setAberrationIntensity(val);
    }
}
