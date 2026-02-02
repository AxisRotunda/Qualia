
import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameInputService } from '../../../services/game-input.service';
import { WeaponService } from '../../../engine/features/combat/weapon.service';

@Component({
  selector: 'app-touch-action-cluster',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="absolute bottom-0 right-0 w-72 h-72 pointer-events-none z-[60] touch-none select-none">
       
       <!-- 1. PRIMARY: FIRE -->
       <div class="absolute bottom-10 right-10 w-24 h-24 pointer-events-none">
           <div class="absolute inset-0 rounded-full border border-rose-500/10 animate-spin-slow"></div>
           <button class="absolute inset-1 rounded-full border-2 border-rose-500/30 bg-rose-950/40 backdrop-blur-xl text-rose-100 shadow-[0_0_40px_rgba(244,63,94,0.15)] flex items-center justify-center pointer-events-auto transition-all active:scale-90 active:bg-rose-600 active:border-white/5 active:shadow-[0_0_60px_rgba(244,63,94,0.4)] touch-none group overflow-hidden"
                   (pointerdown)="onFire($event, true)" 
                   (pointerup)="onFire($event, false)" 
                   (pointercancel)="onFire($event, false)"
                   (pointerleave)="onFire($event, false)"
                   aria-label="Attack">
              <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(255,255,255,0.05)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
              <span class="material-symbols-outlined text-[44px] drop-shadow-md group-active:scale-125 transition-transform">filter_center_focus</span>
           </button>
       </div>

       <!-- 2. SECONDARY: JUMP -->
       <button class="absolute bottom-36 right-12 w-16 h-16 rounded-full border border-cyan-500/20 bg-cyan-950/40 backdrop-blur-lg text-cyan-200 shadow-xl flex items-center justify-center pointer-events-auto transition-all active:scale-90 active:bg-cyan-500 active:text-white active:border-white/5 touch-none group"
               (pointerdown)="onJump($event, true)" 
               (pointerup)="onJump($event, false)" 
               (pointercancel)="onJump($event, false)"
               (pointerleave)="onJump($event, false)"
               aria-label="Jump">
          <span class="material-symbols-outlined text-[32px] group-active:-translate-y-1 transition-transform">keyboard_double_arrow_up</span>
       </button>

       <!-- 3. TERTIARY: CYCLE -->
       <button class="absolute bottom-12 right-36 w-16 h-16 rounded-full border border-slate-600/20 bg-slate-900/40 backdrop-blur-lg text-slate-300 shadow-xl flex items-center justify-center pointer-events-auto transition-all active:scale-90 active:bg-slate-700 active:text-white active:border-white/5 touch-none group"
               (pointerdown)="onCycleWeapon($event)"
               aria-label="Cycle Weapon">
          <span class="material-symbols-outlined text-[28px] group-active:rotate-180 transition-transform duration-300">{{ weaponIcon() }}</span>
          <div class="absolute -top-1 -right-1 w-6 h-6 bg-slate-950 rounded-full flex items-center justify-center border border-white/10 shadow-lg">
              <span class="material-symbols-outlined text-[12px] text-cyan-400">sync</span>
          </div>
       </button>

       <!-- 4. SPRINT -->
       <button class="absolute bottom-32 right-32 w-14 h-14 rounded-full border-2 flex items-center justify-center pointer-events-auto transition-all active:scale-90 backdrop-blur-md shadow-lg touch-none"
               [class.border-amber-500_50]="running()"
               [class.bg-amber-900_60]="running()"
               [class.text-amber-400]="running()"
               [class.shadow-amber]="running()"
               [class.border-slate-600_30]="!running()"
               [class.bg-slate-900_60]="!running()"
               [class.text-slate-500]="!running()"
               (pointerdown)="toggleRun($event)"
               aria-label="Toggle Sprint">
          <span class="material-symbols-outlined text-[24px]">directions_run</span>
       </button>

       <!-- 5. CROUCH [NEW] -->
       <button class="absolute bottom-4 right-32 w-14 h-14 rounded-full border-2 flex items-center justify-center pointer-events-auto transition-all active:scale-90 backdrop-blur-md shadow-lg touch-none"
               [class.border-cyan-500_50]="crouching()"
               [class.bg-cyan-900_60]="crouching()"
               [class.text-cyan-400]="crouching()"
               [class.border-slate-600_30]="!crouching()"
               [class.bg-slate-900_60]="!crouching()"
               [class.text-slate-500]="!crouching()"
               (pointerdown)="toggleCrouch($event)"
               aria-label="Toggle Crouch">
          <span class="material-symbols-outlined text-[24px]">{{ crouching() ? 'keyboard_arrow_down' : 'man' }}</span>
       </button>

    </div>
  `,
  styles: [`
    :host {
        display: block;
        pointer-events: none;
    }
    .animate-spin-slow { animation: spin 12s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .border-amber-500_50 { border-color: rgba(245, 158, 11, 0.5); }
    .bg-amber-900_60 { background-color: rgba(120, 53, 15, 0.6); }
    .shadow-amber { box-shadow: 0 0 15px rgba(245, 158, 11, 0.3); }
    .border-cyan-500_50 { border-color: rgba(6, 182, 212, 0.5); }
    .bg-cyan-900_60 { background-color: rgba(8, 51, 68, 0.6); }
    .border-slate-600_30 { border-color: rgba(71, 85, 105, 0.3); }
    .bg-slate-900_60 { background-color: rgba(15, 23, 42, 0.6); }
  `]
})
export class TouchActionClusterComponent {
  private input = inject(GameInputService);
  private weaponService = inject(WeaponService);

  running = signal(false);
  crouching = signal(false);

  weaponIcon = computed(() => {
      switch(this.weaponService.equipped()) {
          case 'blaster': return 'boltz';
          case 'hammer': return 'hammer';
          case 'fist': return 'sports_mma';
          case 'pistol': return 'pistol';
          default: return 'help';
      }
  });

  onJump(e: Event, state: boolean) {
      this.stopProp(e);
      if (state) this.input.vibrate(10); 
      this.input.setVirtualJump(state);
  }

  onFire(e: Event, state: boolean) {
      this.stopProp(e);
      if (state) this.input.vibrate(15); 
      this.input.setVirtualFire(state);
  }

  toggleRun(e: Event) {
      this.stopProp(e);
      this.running.update(v => !v);
      this.input.vibrate(10);
      this.input.setVirtualRun(this.running());
  }

  toggleCrouch(e: Event) {
      this.stopProp(e);
      this.crouching.update(v => !v);
      this.input.vibrate(10);
      this.input.setVirtualCrouch(this.crouching());
  }

  onCycleWeapon(e: Event) {
      this.stopProp(e);
      this.input.vibrate(15);
      this.weaponService.cycle();
  }

  private stopProp(e: Event) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
  }
}
