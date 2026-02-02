
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeaponService } from '../../../engine/features/combat/weapon.service';
import { COMBAT_CONFIG } from '../../../engine/features/combat/combat.config';

@Component({
  selector: 'app-weapon-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-3 bg-slate-950/80 backdrop-blur-xl border border-white/10 pr-5 pl-1.5 py-1.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] select-none pointer-events-auto group transition-all hover:border-cyan-500/30">
       
       <!-- Tactical Weapon Hex -->
       <div class="w-11 h-11 rounded-full flex items-center justify-center border-2 border-white/5 relative overflow-hidden transition-all group-hover:scale-105"
            [ngClass]="colorClass()">
          <!-- Moving Scanline -->
          <div class="absolute inset-0 bg-white/5 animate-[scan_3s_linear_infinite] pointer-events-none"></div>
          <span class="material-symbols-outlined text-[24px] text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] z-10">{{ icon() }}</span>
       </div>

       <!-- Data Core -->
       <div class="flex flex-col min-w-[120px]">
          <div class="flex justify-between items-baseline mb-0.5">
             <span class="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Main_Armament</span>
             <span class="text-[8px] font-mono text-cyan-500/80 tabular-nums">{{ energy() | number:'1.0-0' }}%</span>
          </div>
          <span class="text-[11px] font-black text-white font-sans tracking-widest mb-1.5 uppercase drop-shadow-sm">{{ label() }}</span>
          
          <!-- Segmented Energy Bar (Industry Style) -->
          <div class="flex gap-0.5 h-1.5 w-full">
              @for (seg of [1,2,3,4,5,6,7,8,9,10]; track seg) {
                  <div class="flex-1 rounded-[1px] transition-all duration-300"
                       [class.bg-cyan-500]="energy() >= (seg * 10)"
                       [class.shadow-[0_0_8px_cyan]]="energy() >= (seg * 10) && energy() > 20"
                       [class.bg-rose-500]="energy() < 20 && energy() >= (seg * 10)"
                       [class.shadow-[0_0_8px_rose]]="energy() < 20 && energy() >= (seg * 10)"
                       [class.bg-slate-800]="energy() < (seg * 10)"></div>
              }
          </div>
       </div>

       <!-- Telemetry Cluster -->
       <div class="h-8 w-px bg-white/5 mx-1"></div>
       <div class="flex flex-col justify-center gap-1 opacity-60">
          <div class="flex items-center gap-1.5">
             <div class="w-1 h-1 rounded-full transition-colors" [class.bg-emerald-500]="energy() > 10" [class.bg-rose-500]="energy() <= 10"></div>
             <div class="w-2.5 h-[1px] bg-slate-700"></div>
          </div>
          <div class="flex items-center gap-1.5">
             <div class="w-1 h-1 rounded-full bg-slate-600"></div>
             <div class="w-4 h-[1px] bg-slate-700"></div>
          </div>
       </div>
    </div>
  `,
  styles: [`
    @keyframes scan { from { transform: translateY(-100%); } to { transform: translateY(100%); } }
    .shadow-amber { box-shadow: 0 0 15px rgba(251, 191, 36, 0.4); }
  `]
})
export class WeaponStatusComponent {
  weaponService = inject(WeaponService);
  energy = this.weaponService.energy;

  currentDef = computed(() => {
      return COMBAT_CONFIG.WEAPONS[this.weaponService.equipped()];
  });

  label = computed(() => this.currentDef().label);
  
  icon = computed(() => {
      switch(this.currentDef().id) {
          case 'blaster': return 'boltz';
          case 'hammer': return 'hammer';
          case 'fist': return 'sports_mma';
          default: return 'help';
      }
  });

  colorClass = computed(() => {
      const id = this.currentDef().id;
      if (id === 'blaster') return 'bg-cyan-600/40 shadow-[inset_0_0_15px_rgba(6,182,212,0.2)]';
      if (id === 'hammer') return 'bg-orange-600/40 shadow-[inset_0_0_15px_rgba(234,88,12,0.2)]';
      return 'bg-slate-600/40 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)]';
  });
}
