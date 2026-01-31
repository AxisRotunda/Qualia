
import { Component, input, output, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { Transform } from '../../engine/core';

@Component({
  selector: 'app-transform-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="select-none">
       <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center justify-between">
          <span>Transform</span>
          <span class="text-[9px] text-cyan-900 bg-cyan-500/10 px-1 rounded border border-cyan-500/20">LOCAL</span>
       </h3>
       
       @if (data(); as t) {
          <div class="flex flex-col gap-2">
             
             <!-- Position -->
             <div class="control-row">
                <label class="row-label">Position</label>
                <div class="input-group">
                   <div class="input-wrapper">
                      <span class="axis-label text-rose-500">X</span>
                      <input type="number" step="0.1" [value]="round(t.position.x)" 
                             (change)="emitPos('x', $any($event.target).value)" 
                             class="param-input">
                   </div>
                   <div class="input-wrapper">
                      <span class="axis-label text-emerald-500">Y</span>
                      <input type="number" step="0.1" [value]="round(t.position.y)" 
                             (change)="emitPos('y', $any($event.target).value)" 
                             class="param-input">
                   </div>
                   <div class="input-wrapper">
                      <span class="axis-label text-blue-500">Z</span>
                      <input type="number" step="0.1" [value]="round(t.position.z)" 
                             (change)="emitPos('z', $any($event.target).value)" 
                             class="param-input">
                   </div>
                </div>
             </div>

             <!-- Rotation (Euler) -->
             <div class="control-row">
                <label class="row-label">Rotation</label>
                <div class="input-group">
                   <div class="input-wrapper">
                      <span class="axis-label text-rose-500">X</span>
                      <input type="number" step="15" [value]="euler().x" 
                             (change)="emitRot('x', $any($event.target).value)" 
                             class="param-input">
                   </div>
                   <div class="input-wrapper">
                      <span class="axis-label text-emerald-500">Y</span>
                      <input type="number" step="15" [value]="euler().y" 
                             (change)="emitRot('y', $any($event.target).value)" 
                             class="param-input">
                   </div>
                   <div class="input-wrapper">
                      <span class="axis-label text-blue-500">Z</span>
                      <input type="number" step="15" [value]="euler().z" 
                             (change)="emitRot('z', $any($event.target).value)" 
                             class="param-input">
                   </div>
                </div>
             </div>

             <!-- Scale -->
             <div class="control-row">
                <label class="row-label">Scale</label>
                <div class="input-group">
                   <div class="input-wrapper">
                      <span class="axis-label text-rose-500">X</span>
                      <input type="number" step="0.1" min="0.1" [value]="round(t.scale.x)" 
                             (change)="emitScale('x', $any($event.target).value)" 
                             class="param-input">
                   </div>
                   <div class="input-wrapper">
                      <span class="axis-label text-emerald-500">Y</span>
                      <input type="number" step="0.1" min="0.1" [value]="round(t.scale.y)" 
                             (change)="emitScale('y', $any($event.target).value)" 
                             class="param-input">
                   </div>
                   <div class="input-wrapper">
                      <span class="axis-label text-blue-500">Z</span>
                      <input type="number" step="0.1" min="0.1" [value]="round(t.scale.z)" 
                             (change)="emitScale('z', $any($event.target).value)" 
                             class="param-input">
                   </div>
                </div>
             </div>

          </div>
       }
    </section>
  `,
  styles: [`
    .control-row { @apply flex flex-col gap-1; }
    .row-label { @apply text-[9px] text-slate-500 font-bold uppercase tracking-wider; }
    .input-group { @apply grid grid-cols-3 gap-1; }
    .input-wrapper { @apply relative flex items-center; }
    .axis-label { @apply absolute left-1.5 text-[9px] font-bold opacity-80 pointer-events-none; }
    .param-input { 
      @apply w-full bg-slate-900 border border-slate-800 rounded py-1 pl-4 pr-1 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500/50 focus:text-white transition-colors;
      -moz-appearance: textfield; 
    }
    .param-input::-webkit-outer-spin-button, .param-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  `]
})
export class TransformPanelComponent {
  data = input<Transform | null>(null);
  
  updatePos = output<{x:number, y:number, z:number}>();
  updateRot = output<{x:number, y:number, z:number, w:number}>();
  updateScale = output<{x:number, y:number, z:number}>();

  // Derived state for display
  euler = computed(() => {
      const t = this.data();
      if (!t) return { x: 0, y: 0, z: 0 };
      
      const q = new THREE.Quaternion(t.rotation.x, t.rotation.y, t.rotation.z, t.rotation.w);
      const e = new THREE.Euler().setFromQuaternion(q, 'XYZ');
      
      return {
          x: this.round(e.x * THREE.MathUtils.RAD2DEG),
          y: this.round(e.y * THREE.MathUtils.RAD2DEG),
          z: this.round(e.z * THREE.MathUtils.RAD2DEG)
      };
  });

  round(val: number): number {
      return Math.round(val * 100) / 100;
  }

  emitPos(axis: 'x'|'y'|'z', valStr: string) {
      const t = this.data();
      if (!t) return;
      
      const val = parseFloat(valStr);
      const newPos = { ...t.position, [axis]: val };
      this.updatePos.emit(newPos);
  }

  emitScale(axis: 'x'|'y'|'z', valStr: string) {
      const t = this.data();
      if (!t) return;
      
      const val = parseFloat(valStr);
      if (val <= 0.001) return; // Prevent zero scale issues
      const newScale = { ...t.scale, [axis]: val };
      this.updateScale.emit(newScale);
  }

  emitRot(axis: 'x'|'y'|'z', valStr: string) {
      const t = this.data();
      if (!t) return;
      
      // Get current Euler
      const current = this.euler();
      const newEulerDeg = { ...current, [axis]: parseFloat(valStr) };
      
      const e = new THREE.Euler(
          newEulerDeg.x * THREE.MathUtils.DEG2RAD, 
          newEulerDeg.y * THREE.MathUtils.DEG2RAD, 
          newEulerDeg.z * THREE.MathUtils.DEG2RAD, 
          'XYZ'
      );
      const q = new THREE.Quaternion().setFromEuler(e);
      
      this.updateRot.emit({ x: q.x, y: q.y, z: q.z, w: q.w });
  }
}
