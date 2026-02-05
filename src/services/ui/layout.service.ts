
import { Injectable, signal, effect, inject, DestroyRef } from '@angular/core';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
    providedIn: 'root'
})
export class LayoutService {
    private destroyRef = inject(DestroyRef);

    // Layout State
    readonly leftPanelOpen = signal(false);
    readonly rightPanelOpen = signal(false);
    readonly spawnMenuVisible = signal(false);
    readonly launcherOpen = signal(false);

    readonly isMobile = signal(window.innerWidth < 1024);
    readonly isTouch = signal(window.matchMedia('(pointer: coarse)').matches);

    // A11Y State
    private motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    readonly reducedMotion = signal(this.motionQuery.matches);

    constructor() {
    // Standardized Listener via RxJS for memory safety
        fromEvent(window, 'resize')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.isMobile.set(window.innerWidth < 1024);
            });

        // A11Y Change Listener
        this.motionQuery.addEventListener('change', (e) => {
            this.reducedMotion.set(e.matches);
        });

        effect(() => {
        // Responsivity Protocol: Auto-close sidebars on mobile transition
            if (this.isMobile()) {
                this.leftPanelOpen.set(false);
                this.rightPanelOpen.set(false);
            }
        });
    }

    toggleLeft() { this.leftPanelOpen.update(v => !v); }
    toggleRight() { this.rightPanelOpen.update(v => !v); }
    toggleLauncher() { this.launcherOpen.update(v => !v); }

    setLeft(v: boolean) { this.leftPanelOpen.set(v); }
    setRight(v: boolean) { this.rightPanelOpen.set(v); }
    setLauncher(v: boolean) { this.launcherOpen.set(v); }

    openSpawnMenu() { this.spawnMenuVisible.set(true); }
    closeSpawnMenu() { this.spawnMenuVisible.set(false); }

    closeAllPanels() {
        this.leftPanelOpen.set(false);
        this.rightPanelOpen.set(false);
        this.spawnMenuVisible.set(false);
        this.launcherOpen.set(false);
    }
}
