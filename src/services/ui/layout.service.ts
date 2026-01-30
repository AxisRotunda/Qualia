
import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  // Layout State
  readonly leftPanelOpen = signal(true);
  readonly rightPanelOpen = signal(true);
  readonly spawnMenuVisible = signal(false);
  readonly isMobile = signal(window.innerWidth < 1024);

  constructor() {
    // Auto-responsive handler
    window.addEventListener('resize', () => {
      this.isMobile.set(window.innerWidth < 1024);
    });

    effect(() => {
        if (this.isMobile()) {
            this.leftPanelOpen.set(false);
            this.rightPanelOpen.set(false);
        }
    });
  }

  toggleLeft() { this.leftPanelOpen.update(v => !v); }
  toggleRight() { this.rightPanelOpen.update(v => !v); }
  
  setLeft(v: boolean) { this.leftPanelOpen.set(v); }
  setRight(v: boolean) { this.rightPanelOpen.set(v); }
  
  openSpawnMenu() { this.spawnMenuVisible.set(true); }
  closeSpawnMenu() { this.spawnMenuVisible.set(false); }

  closeAllPanels() {
      this.leftPanelOpen.set(false);
      this.rightPanelOpen.set(false);
      this.spawnMenuVisible.set(false);
  }
}
