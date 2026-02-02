import { Injectable, signal } from '@angular/core';
import { NullShield } from '../../engine/utils/string.utils';

@Injectable({
  providedIn: 'root'
})
export class A11yService {
  private announcement = signal('');
  readonly currentAnnouncement = this.announcement.asReadonly();

  /**
   * Triggers a screen reader announcement.
   * @param message The text to speak.
   * @param priority 'polite' (default) or 'assertive'.
   */
  announce(message: string | null | undefined, priority: 'polite' | 'assertive' = 'polite') {
    const safeMsg = NullShield.trim(message);
    if (!safeMsg) return;

    // Briefly clear to ensure double announcements of the same string trigger
    this.announcement.set('');
    setTimeout(() => {
        this.announcement.set(safeMsg);
    }, 50);
  }
}