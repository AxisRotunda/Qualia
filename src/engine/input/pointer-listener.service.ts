
import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { PointerEventData } from '../events/game-events';

export type { PointerEventData } from '../events/game-events';

@Injectable({
    providedIn: 'root'
})
export class PointerListenerService {
    // Semantic Events
    readonly onClick = new Subject<PointerEventData>();
    readonly onRightClick = new Subject<PointerEventData>();
    readonly onLongPress = new Subject<PointerEventData>();

    // State
    readonly isDragging = signal(false);

    // Config
    private readonly CLICK_DIST_THRESHOLD_SQ = 100; // px squared
    private readonly CLICK_TIME_THRESHOLD = 500; // ms
    private readonly LONG_PRESS_DELAY = 600; // ms

    // Internal
    private element: HTMLElement | null = null;
    private downPos = { x: 0, y: 0 };
    private downTime = 0;
    private longPressTimer: any = null;
    private isPotentialLongPress = false;

    bind(element: HTMLElement) {
        this.element = element;
        // Only bind the trigger event initially
        this.element.addEventListener('pointerdown', this.onDown);
        this.element.addEventListener('contextmenu', this.onContextMenu);
    }

    unbind() {
        if (this.element) {
            this.element.removeEventListener('pointerdown', this.onDown);
            this.element.removeEventListener('contextmenu', this.onContextMenu);
        }
        // Ensure cleanup of dynamic listeners
        this.removeWindowListeners();
        this.element = null;
    }

    private addWindowListeners() {
        window.addEventListener('pointermove', this.onMove);
        window.addEventListener('pointerup', this.onUp);
        window.addEventListener('pointercancel', this.onUp);
    }

    private removeWindowListeners() {
        window.removeEventListener('pointermove', this.onMove);
        window.removeEventListener('pointerup', this.onUp);
        window.removeEventListener('pointercancel', this.onUp);
    }

    private onDown = (e: PointerEvent) => {
        if (!this.element) return;

        // Attach tracking listeners only when interaction starts
        this.addWindowListeners();

        this.downPos = { x: e.clientX, y: e.clientY };
        this.downTime = performance.now();
        this.isDragging.set(false);
        this.isPotentialLongPress = true;

        // Start Long Press Timer
        clearTimeout(this.longPressTimer);
        this.longPressTimer = setTimeout(() => {
            if (this.isPotentialLongPress && !this.isDragging()) {
                this.isPotentialLongPress = false;
                this.onLongPress.next({
                    x: e.clientX, y: e.clientY,
                    originalEvent: e, button: e.button
                });
            }
        }, this.LONG_PRESS_DELAY);
    };

    private onMove = (e: PointerEvent) => {
        if (this.isPotentialLongPress) {
            const dx = e.clientX - this.downPos.x;
            const dy = e.clientY - this.downPos.y;
            if (dx * dx + dy * dy > this.CLICK_DIST_THRESHOLD_SQ) {
                this.isPotentialLongPress = false;
                clearTimeout(this.longPressTimer);
                this.isDragging.set(true);
            }
        }
    };

    private onUp = (e: PointerEvent) => {
        clearTimeout(this.longPressTimer);

        // Interaction finished, detach listeners
        this.removeWindowListeners();

        if (this.isDragging()) {
            this.isDragging.set(false);
            return;
        }

        if (this.isPotentialLongPress) {
        // It was a click (short duration, low movement)
            const duration = performance.now() - this.downTime;
            if (duration < this.CLICK_TIME_THRESHOLD) {
                if (e.button === 2) {
                // Right click handled by contextmenu event
                } else {
                    this.onClick.next({
                        x: e.clientX, y: e.clientY,
                        originalEvent: e, button: e.button
                    });
                }
            }
        }
        this.isPotentialLongPress = false;
    };

    private onContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        // Only emit if not dragging
        if (!this.isDragging()) {
            this.onRightClick.next({
                x: e.clientX, y: e.clientY,
                originalEvent: e, button: 2
            });
        }
    };
}
