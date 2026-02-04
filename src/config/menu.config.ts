
import { EngineService } from '../services/engine.service';
import { MenuAction } from '../services/keyboard.service';

/**
 * createMenuConfig: Generates the system-wide menu structure.
 * Refactored Phase 80.0: Uses hardened EngineService facade.
 */
export function createMenuConfig(engine: EngineService): MenuAction[] {
  return [
    {
      id: 'file', label: 'File', execute: () => {},
      children: [
        { id: 'new', label: 'New Empty', shortcut: 'Ctrl+N', execute: () => engine.level.reset() },
        { id: 'qsave', label: 'Quick Save', shortcut: 'Ctrl+S', execute: () => engine.level.quickSave() },
        { id: 'qload', label: 'Quick Load', shortcut: 'Ctrl+L', execute: () => engine.level.quickLoad(engine) },
        { id: 'main-menu', label: 'Exit to Main Menu', execute: () => engine.setMainMenuVisible(true) },
      ]
    },
    {
      id: 'edit', label: 'Edit', execute: () => {},
      children: [
        { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', isDisabled: () => !engine.canUndo(), execute: () => { /* TODO: implement undo */ } },
        { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Shift+Z', isDisabled: () => !engine.canRedo(), execute: () => { /* TODO: implement redo */ } },
        { id: 'duplicate', label: 'Duplicate', shortcut: 'Ctrl+D', isDisabled: () => engine.selectedEntity() === null, execute: () => { const e = engine.selectedEntity(); if (e !== null) engine.ops.duplicateEntity(e); } },
        { id: 'delete', label: 'Delete', shortcut: 'Delete', isDisabled: () => engine.selectedEntity() === null, execute: () => { const e = engine.selectedEntity(); if (e !== null) engine.ops.deleteEntity(e); } }
      ]
    },
    {
      id: 'actions', label: 'Actions', execute: () => {},
      children: [
          { 
              id: 'cycle-weapon', 
              label: 'Cycle Weapon', 
              shortcut: 'Q', 
              isDisabled: () => engine.mode() !== 'walk', 
              execute: () => engine.combat.cycle()
          }
      ]
    },
    {
      id: 'simulation', label: 'Simulation', execute: () => {},
      children: [
        { id: 'sim-play',  label: 'Play',  shortcut: 'Space', isDisabled: () => !engine.isPaused(), execute: () => engine.sim.setPaused(false) },
        { id: 'sim-pause', label: 'Pause', shortcut: 'Space', isDisabled: () => engine.isPaused(), execute: () => engine.sim.setPaused(true) },
        { id: 'sim-grav-moon', label: 'Gravity: Moon', execute: () => engine.sim.setGravity(-1.62) },
        { id: 'sim-grav-earth', label: 'Gravity: Earth', execute: () => engine.sim.setGravity(-9.81) },
        { id: 'sim-grav-zero', label: 'Gravity: Zero', execute: () => engine.sim.setGravity(0) },
      ]
    },
    {
      id: 'view', label: 'View', execute: () => {},
      children: [
        { id: 'view-ui', label: 'Toggle UI / HUD', shortcut: 'H', execute: () => engine.viewport.toggleHud() },
        { id: 'view-textures', label: 'Toggle Textures', execute: () => engine.viewport.toggleTextures() },
        { id: 'view-mode', label: 'FP/TP Toggle', shortcut: 'V', execute: () => engine.viewport.toggleViewMode() },
        { id: 'view-debug', label: 'Toggle Debug Overlay', execute: () => engine.viewport.setDebugOverlayVisible(!engine.showDebugOverlay()) },
        { id: 'camera-focus', label: 'Focus Selection', shortcut: 'F', execute: () => engine.input.focusSelectedEntity() },
        { id: 'camera-top', label: 'Top View', execute: () => engine.input.setCameraPreset('top') },
        { id: 'camera-front', label: 'Front View', execute: () => engine.input.setCameraPreset('front') }
      ]
    }
  ];
}
