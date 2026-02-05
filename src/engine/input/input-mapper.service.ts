import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { InputAction, DEFAULT_INPUT_MAP, InputBindingMap } from './input-actions';
import { GameInputService } from '../../services/game-input.service';
import { LayoutService } from '../../services/ui/layout.service';

/**
 * InputMapperService: Advanced input mapping with modifier key support.
 * Implements intelligent control scheme detection and dynamic mapping.
 */
@Injectable({
  providedIn: 'root'
})
export class InputMapperService {
  private gameInput = inject(GameInputService);
  private layout = inject(LayoutService);

  // Current control profile
  currentProfile = signal<string>('default');
  
  // Custom input maps per profile
  private profileMaps = new Map<string, InputBindingMap>();
  
  // Modifier key states
  private modifierState = {
    ctrl: false,
    alt: false,
    shift: false
  };

  // Active action states with modifier combinations
  private actionStates = new Map<string, boolean>();

  // Performance optimization: Pre-computed action lookup
  private actionLookup = new Map<string, InputAction>();

  constructor() {
    // Initialize default profile
    this.profileMaps.set('default', { ...DEFAULT_INPUT_MAP });
    
    // Build action lookup table
    this.buildActionLookup();
    
    // Start modifier key tracking
    this.initModifierTracking();
  }

  /**
   * Initialize modifier key tracking for desktop
   */
  private initModifierTracking() {
    if (this.layout.isMobile()) return;

    window.addEventListener('keydown', (e) => {
      this.updateModifierState(e, true);
    });

    window.addEventListener('keyup', (e) => {
      this.updateModifierState(e, false);
    });
  }

  private updateModifierState(event: KeyboardEvent, pressed: boolean) {
    switch (event.key) {
      case 'Control':
      case 'ControlLeft':
      case 'ControlRight':
        this.modifierState.ctrl = pressed;
        break;
      case 'Alt':
      case 'AltLeft':
      case 'AltRight':
        this.modifierState.alt = pressed;
        break;
      case 'Shift':
      case 'ShiftLeft':
      case 'ShiftRight':
        this.modifierState.shift = pressed;
        break;
    }
  }

  /**
   * Build fast lookup table for action resolution
   */
  private buildActionLookup() {
    const currentMap = this.getCurrentMap();
    
    Object.entries(currentMap).forEach(([action, bindings]) => {
      bindings.forEach(binding => {
        this.actionLookup.set(binding, action as InputAction);
      });
    });
  }

  /**
   * Get current input map based on active profile
   */
  getCurrentMap(): InputBindingMap {
    return this.profileMaps.get(this.currentProfile()) || DEFAULT_INPUT_MAP;
  }

  /**
   * Switch to a different control profile
   */
  setProfile(profileName: string) {
    if (this.profileMaps.has(profileName)) {
      this.currentProfile.set(profileName);
      this.buildActionLookup();
    }
  }

  /**
   * Create a new custom profile
   */
  createProfile(profileName: string, baseMap?: InputBindingMap): boolean {
    if (this.profileMaps.has(profileName)) return false;
    
    this.profileMaps.set(profileName, baseMap ? { ...baseMap } : this.getCurrentMap());
    return true;
  }

  /**
   * Check if an action is active with optional modifier requirements
   */
  isActionActive(action: InputAction, modifiers?: { ctrl?: boolean; alt?: boolean; shift?: boolean }): boolean {
    // Check base action
    const baseActive = this.gameInput.isActionActive(action);
    
    if (!baseActive) return false;
    
    // Check modifier requirements if specified
    if (modifiers) {
      if (modifiers.ctrl !== undefined && modifiers.ctrl !== this.modifierState.ctrl) return false;
      if (modifiers.alt !== undefined && modifiers.alt !== this.modifierState.alt) return false;
      if (modifiers.shift !== undefined && modifiers.shift !== this.modifierState.shift) return false;
    }
    
    return true;
  }

  /**
   * Get action with modifier prefix (e.g., "Ctrl+Click")
   */
  getModifierKeyPrefix(): string {
    const parts: string[] = [];
    if (this.modifierState.ctrl) parts.push('Ctrl');
    if (this.modifierState.alt) parts.push('Alt');
    if (this.modifierState.shift) parts.push('Shift');
    return parts.join('+');
  }

  /**
   * Check for specific modifier combinations
   */
  isModifierCombo(combo: { ctrl?: boolean; alt?: boolean; shift?: boolean }): boolean {
    return (
      (combo.ctrl === undefined || combo.ctrl === this.modifierState.ctrl) &&
      (combo.alt === undefined || combo.alt === this.modifierState.alt) &&
      (combo.shift === undefined || combo.shift === this.modifierState.shift)
    );
  }

  /**
   * Update a binding for an action
   */
  updateBinding(action: InputAction, bindings: string[], profile?: string): boolean {
    const targetProfile = profile || this.currentProfile();
    const map = this.profileMaps.get(targetProfile);
    
    if (!map) return false;
    
    map[action] = [...bindings];
    this.buildActionLookup();
    return true;
  }

  /**
   * Reset to default bindings
   */
  resetToDefault(profile?: string): boolean {
    const targetProfile = profile || this.currentProfile();
    
    if (targetProfile === 'default') {
      Object.keys(DEFAULT_INPUT_MAP).forEach(key => {
        (DEFAULT_INPUT_MAP as any)[key] = [...(DEFAULT_INPUT_MAP as any)[key]];
      });
    } else {
      this.profileMaps.set(targetProfile, { ...DEFAULT_INPUT_MAP });
    }
    
    this.buildActionLookup();
    return true;
  }

  /**
   * Export profile as JSON
   */
  exportProfile(profileName: string): string | null {
    const map = this.profileMaps.get(profileName);
    if (!map) return null;
    
    return JSON.stringify({
      profile: profileName,
      bindings: map,
      timestamp: Date.now()
    }, null, 2);
  }

  /**
   * Import profile from JSON
   */
  importProfile(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (!data.profile || !data.bindings) return false;
      
      this.profileMaps.set(data.profile, data.bindings);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all available profiles
   */
  getAvailableProfiles(): string[] {
    return Array.from(this.profileMaps.keys());
  }
}