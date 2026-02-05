# Desktop Controls Implementation

> **Scope**: Input System Enhancement  
> **Source**: `src/engine/input/`, `src/components/ui/control-scheme.component.ts`  
> **Audience**: Developers implementing desktop control schemes  
> **Version**: Phase 90.0

## Overview

This document describes the enhanced desktop control implementation for Qualia3D, introducing advanced input mapping, control profiles, and a comprehensive UI for control scheme customization.

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Input System Architecture                 │
├─────────────────────────────────────────────────────────────┤
│  UI Layer                                                    │
│  └── ControlSchemeComponent                                  │
│      ├── Profile Management                                  │
│      ├── Category-based Display                              │
│      └── Real-time Binding Editor                            │
├─────────────────────────────────────────────────────────────┤
│  Service Layer                                               │
│  ├── InputMapperService                                      │
│  │   ├── Modifier Key Tracking                               │
│  │   ├── Profile Management                                  │
│  │   └── Dynamic Action Resolution                           │
│  ├── GameInputService (Existing)                             │
│  └── InputManagerService (Existing)                          │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                  │
│  ├── InputAction Enum (Expanded)                             │
│  ├── DEFAULT_INPUT_MAP                                       │
│  ├── INPUT_CATEGORIES                                        │
│  └── INPUT_DESCRIPTIONS                                      │
└─────────────────────────────────────────────────────────────┘
```

## InputAction Expansion

### New Action Categories

| Category | Actions | Description |
|----------|---------|-------------|
| **Movement** | DASH | Quick dodge/dash movement |
| **Combat** | RELOAD, MELEE | Additional combat actions |
| **Camera** | TOGGLE_HUD, SCREENSHOT | View control enhancements |
| **Desktop** | MOUSE_WHEEL_ZOOM, MOUSE_MIDDLE_PAN, ALT_ROTATE, CTRL_MULTI_SELECT, PRECISION_MODE | Desktop-specific interactions |
| **UI** | TOGGLE_INSPECTOR, UNDO, REDO, DUPLICATE | Editor workflow shortcuts |
| **Transform** | TRANSLATE_MODE, ROTATE_MODE, SCALE_MODE | Quick tool switching |
| **System** | QUICK_SAVE, QUICK_LOAD, SPAWN_ENTITY | Workflow automation |

### Modifier Key Support

The system now supports complex modifier combinations:

```typescript
// Example: Ctrl+Shift+Click for range selection
CTRL_MULTI_SELECT: ['Ctrl+Mouse0']
SHIFT_RANGE_SELECT: ['Shift+Mouse0']
UNDO: ['Ctrl+KeyZ']
REDO: ['Ctrl+Shift+KeyZ', 'Ctrl+KeyY']
```

## InputMapperService Features

### Profile Management
- Multiple control profiles per user
- Profile creation, deletion, and switching
- Import/export functionality (JSON format)
- Base profile inheritance

### Modifier Key Tracking
Real-time tracking of Ctrl, Alt, Shift states for desktop environments:
- Automatic detection of modifier combinations
- Support for complex key chords
- Context-sensitive action resolution

### Action Resolution Optimizations
- Pre-computed lookup tables for O(1) action resolution
- Support for multiple bindings per action
- Dynamic binding updates without service restart

## ControlSchemeComponent UI

### Features
1. **Profile Selector**: Dropdown to switch between saved profiles
2. **Category Tabs**: Organized display (Movement, Combat, Camera, etc.)
3. **Binding Display**: Visual representation of current bindings
4. **Real-time Editing**: Click-to-edit with key capture
5. **Import/Export**: JSON-based profile sharing

### Usage Example
```typescript
// In a component template
<app-control-scheme></app-control-scheme>

// Or programmatically
openControlScheme() {
  this.layout.openControlSchemePanel();
}
```

## Integration Guide

### Step 1: Import the Input Module
```typescript
import { InputMapperService, InputAction } from '../engine/input';
```

### Step 2: Inject and Use
```typescript
export class YourComponent {
  private inputMapper = inject(InputMapperService);
  
  checkForDash() {
    // Check action with modifier requirements
    return this.inputMapper.isActionActive(InputAction.DASH);
  }
  
  checkForPrecisionMode() {
    // Check if Alt is held for precision movement
    return this.inputMapper.isModifierCombo({ alt: true });
  }
}
```

### Step 3: Add Desktop-Specific Handlers
```typescript
// In your controller service
update(dt: number) {
  // Handle zoom
  if (this.inputMapper.isActionActive(InputAction.MOUSE_WHEEL_ZOOM)) {
    this.handleZoom();
  }
  
  // Handle multi-select
  if (this.inputMapper.isActionActive(InputAction.CTRL_MULTI_SELECT)) {
    this.enableMultiSelectMode();
  }
}
```

## Performance Considerations

### Optimizations Implemented
1. **Lookup Tables**: O(1) action resolution via pre-computed maps
2. **Modifier State Caching**: No repeated DOM queries
3. **Lazy Profile Loading**: Profiles loaded on-demand
4. **Event Delegation**: Single listener for modifier keys

### Memory Management
- Profile maps use WeakMap for automatic cleanup
- Binding arrays are immutable (copied on modification)
- Lookup tables rebuilt only on profile switch

## Accessibility

### Features
- **Alternative Bindings**: Multiple keys per action (e.g., Arrow keys + WASD)
- **Profile Switching**: Quick switching for different accessibility needs
- **Visual Feedback**: Clear binding display with recognizable icons
- **Keyboard Navigation**: Full keyboard access to the control scheme UI

### Recommended Profiles
1. **Default**: Standard WASD + mouse controls
2. **Accessible**: Arrow keys + simplified bindings
3. **Left-Handed**: IJKL movement keys
4. **One-Handed**: Compact binding set for single-hand use

## Future Enhancements

### Planned Features
1. **Gesture Recognition**: Trackpad gestures for macOS
2. **Macro System**: Record and playback input sequences
3. **Contextual Bindings**: Different bindings per mode/tool
4. **Haptic Feedback**: Vibration patterns for different actions
5. **Voice Commands**: Optional voice-activated shortcuts

### Extension Points
```typescript
// Custom action registration
InputMapperService.registerCustomAction('CUSTOM_ACTION', ['KeyX']);

// Custom modifier support
InputMapperService.registerModifier('Meta', (event) => event.metaKey);
```

## Migration Guide

### From Previous Implementation
1. Replace `GameInputService.isActionActive()` calls with `InputMapperService.isActionActive()` for modifier support
2. Update any hardcoded key checks to use InputAction enum
3. Add ControlSchemeComponent to settings/menu for user customization

### Breaking Changes
- None: All changes are additive
- Existing GameInputService functionality preserved
- Backward compatible with existing input handling

## Testing Checklist

- [ ] All new InputActions trigger correctly
- [ ] Modifier combinations work (Ctrl+Click, Alt+Drag, etc.)
- [ ] Profile creation and switching functions properly
- [ ] Import/export produces valid JSON
- [ ] UI displays correctly on different screen sizes
- [ ] Mobile devices gracefully degrade (no modifier UI)
- [ ] Performance remains within budget (< 2ms per frame)

## References

- [Input System Architecture](./input-system.md)
- [Control Schemes](./control-schemes.md)
- [UI Architecture](./ui-architecture.md)