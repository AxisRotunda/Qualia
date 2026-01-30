
import { EngineService } from '../services/engine.service';
import { MenuAction } from '../services/keyboard.service';

export function createMenuConfig(engine: EngineService): MenuAction[] {
  return [
    {
      id: 'file', label: 'File', execute: () => {},
      children: [
        { id: 'new', label: 'New Empty', shortcut: 'Ctrl+N', execute: () => engine.reset() },
        { id: 'qsave', label: 'Quick Save', shortcut: 'Ctrl+S', execute: () => engine.quickSave() },
        { id: 'qload', label: 'Quick Load', shortcut: 'Ctrl+L', execute: () => engine.quickLoad() },
        { id: 'main-menu', label: 'Exit to Main Menu', execute: () => engine.mainMenuVisible.set(true) },
      ]
    },
    {
      id: 'edit', label: 'Edit', execute: () => {},
      children: [
        { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', isDisabled: () => !engine.canUndo(), execute: () => engine.undo() },
        { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Shift+Z', isDisabled: () => !engine.canRedo(), execute: () => engine.redo() },
        { id: 'duplicate', label: 'Duplicate', shortcut: 'Ctrl+D', isDisabled: () => engine.selectedEntity() === null, execute: () => { const e = engine.selectedEntity(); if (e !== null) engine.duplicateEntity(e); } },
        { id: 'delete', label: 'Delete', shortcut: 'Delete', isDisabled: () => engine.selectedEntity() === null, execute: () => { const e = engine.selectedEntity(); if (e !== null) engine.deleteEntity(e); } }
      ]
    },
    {
      id: 'simulation', label: 'Simulation', execute: () => {},
      children: [
        { id: 'sim-play',  label: 'Play',  shortcut: 'Space', isDisabled: () => !engine.isPaused(), execute: () => engine.setPaused(false) },
        { id: 'sim-pause', label: 'Pause', shortcut: 'Space', isDisabled: () => engine.isPaused(), execute: () => engine.setPaused(true) },
        { id: 'sim-grav-moon', label: 'Gravity: Moon', execute: () => engine.setGravity(-1.62) },
        { id: 'sim-grav-earth', label: 'Gravity: Earth', execute: () => engine.setGravity(-9.81) },
        { id: 'sim-grav-zero', label: 'Gravity: Zero', execute: () => engine.setGravity(0) },
      ]
    },
    {
      id: 'view', label: 'View', execute: () => {},
      children: [
        { id: 'view-ui', label: 'Toggle UI / HUD', shortcut: 'H', execute: () => engine.toggleHud() },
        { id: 'view-textures', label: 'Toggle Textures', execute: () => engine.toggleTextures() },
        { id: 'view-debug', label: 'Toggle Debug Overlay', execute: () => engine.setDebugOverlayVisible(!engine.showDebugOverlay()) },
        { id: 'camera-focus', label: 'Focus Selection', shortcut: 'F', execute: () => engine.focusSelectedEntity() },
        { id: 'camera-top', label: 'Top View', execute: () => engine.setCameraPreset('top') },
        { id: 'camera-front', label: 'Front View', execute: () => engine.setCameraPreset('front') }
      ]
    }
  ];
}
