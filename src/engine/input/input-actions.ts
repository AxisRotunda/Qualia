
/**
 * InputAction: Semantic definitions for user intent.
 * Part of RUN_REF / RUN_INDUSTRY Phase 81.0.
 * Enhanced Phase 90.0: Desktop control scheme expansion
 */
export enum InputAction {
    // Movement Actions
    MOVE_FORWARD = 'MOVE_FORWARD',
    MOVE_BACK = 'MOVE_BACK',
    MOVE_LEFT = 'MOVE_LEFT',
    MOVE_RIGHT = 'MOVE_RIGHT',
    JUMP = 'JUMP',
    RUN = 'RUN',
    CROUCH = 'CROUCH',
    DASH = 'DASH',
    
    // Combat Actions
    FIRE = 'FIRE',
    AIM = 'AIM',
    RELOAD = 'RELOAD',
    MELEE = 'MELEE',
    Q_CYCLE = 'Q_CYCLE',
    
    // Camera & View
    ASCEND = 'ASCEND',
    DESCEND = 'DESCEND',
    V_MODE = 'V_MODE',
    I_FOCUS = 'I_FOCUS',
    TOGGLE_HUD = 'TOGGLE_HUD',
    SCREENSHOT = 'SCREENSHOT',
    
    // Desktop-Specific Actions
    MOUSE_WHEEL_ZOOM = 'MOUSE_WHEEL_ZOOM',
    MOUSE_MIDDLE_PAN = 'MOUSE_MIDDLE_PAN',
    ALT_ROTATE = 'ALT_ROTATE',
    CTRL_MULTI_SELECT = 'CTRL_MULTI_SELECT',
    SHIFT_RANGE_SELECT = 'SHIFT_RANGE_SELECT',
    PRECISION_MODE = 'PRECISION_MODE', // Slow, precise movement
    
    // Menu & UI
    TOGGLE_MENU = 'TOGGLE_MENU',
    TOGGLE_INSPECTOR = 'TOGGLE_INSPECTOR',
    UNDO = 'UNDO',
    REDO = 'REDO',
    DELETE = 'DELETE',
    DUPLICATE = 'DUPLICATE',
    
    // Transform Modes
    TRANSLATE_MODE = 'TRANSLATE_MODE',
    ROTATE_MODE = 'ROTATE_MODE',
    SCALE_MODE = 'SCALE_MODE',
    
    // Quick Actions
    QUICK_SAVE = 'QUICK_SAVE',
    QUICK_LOAD = 'QUICK_LOAD',
    SPAWN_ENTITY = 'SPAWN_ENTITY',
    
    // Physics
    TOGGLE_PHYSICS = 'TOGGLE_PHYSICS',
    TOGGLE_PAUSE = 'TOGGLE_PAUSE',
    RESET_POSITION = 'RESET_POSITION'
}

export type InputBindingMap = Record<InputAction, string[]>;

export const DEFAULT_INPUT_MAP: InputBindingMap = {
    // Movement
    [InputAction.MOVE_FORWARD]: ['KeyW', 'ArrowUp'],
    [InputAction.MOVE_BACK]:    ['KeyS', 'ArrowDown'],
    [InputAction.MOVE_LEFT]:    ['KeyA', 'ArrowLeft'],
    [InputAction.MOVE_RIGHT]:   ['KeyD', 'ArrowRight'],
    [InputAction.JUMP]:         ['Space'],
    [InputAction.RUN]:          ['ShiftLeft', 'ShiftRight'],
    [InputAction.CROUCH]:       ['ControlLeft', 'KeyC'],
    [InputAction.DASH]:         ['AltLeft', 'AltRight'],
    
    // Combat
    [InputAction.FIRE]:         ['Mouse0'], 
    [InputAction.AIM]:          ['Mouse2'], 
    [InputAction.RELOAD]:       ['KeyR'],
    [InputAction.MELEE]:        ['KeyF'],
    [InputAction.Q_CYCLE]:      ['KeyQ'],
    
    // Camera
    [InputAction.ASCEND]:       ['KeyE'],
    [InputAction.DESCEND]:      ['KeyQ'],
    [InputAction.V_MODE]:       ['KeyV'],
    [InputAction.I_FOCUS]:      ['KeyF'],
    [InputAction.TOGGLE_HUD]:   ['KeyH'],
    [InputAction.SCREENSHOT]:   ['PrintScreen'],
    
    // Desktop Specific
    [InputAction.MOUSE_WHEEL_ZOOM]:   ['MouseWheel'],
    [InputAction.MOUSE_MIDDLE_PAN]:   ['Mouse1'], // Middle mouse
    [InputAction.ALT_ROTATE]:         ['Alt+Mouse0'],
    [InputAction.CTRL_MULTI_SELECT]:  ['Ctrl+Mouse0'],
    [InputAction.SHIFT_RANGE_SELECT]: ['Shift+Mouse0'],
    [InputAction.PRECISION_MODE]:     ['Alt'],
    
    // Menu & UI
    [InputAction.TOGGLE_MENU]:      ['Escape'],
    [InputAction.TOGGLE_INSPECTOR]: ['KeyI'],
    [InputAction.UNDO]:             ['Ctrl+KeyZ'],
    [InputAction.REDO]:             ['Ctrl+Shift+KeyZ', 'Ctrl+KeyY'],
    [InputAction.DELETE]:           ['Delete', 'Backspace'],
    [InputAction.DUPLICATE]:        ['Ctrl+KeyD'],
    
    // Transform
    [InputAction.TRANSLATE_MODE]:   ['KeyW'],
    [InputAction.ROTATE_MODE]:      ['KeyE'],
    [InputAction.SCALE_MODE]:       ['KeyR'],
    
    // Quick Actions
    [InputAction.QUICK_SAVE]:   ['Ctrl+KeyS'],
    [InputAction.QUICK_LOAD]:   ['Ctrl+KeyL'],
    [InputAction.SPAWN_ENTITY]: ['KeyN'],
    
    // Physics
    [InputAction.TOGGLE_PHYSICS]: ['KeyP'],
    [InputAction.TOGGLE_PAUSE]:   ['Space'],
    [InputAction.RESET_POSITION]: ['KeyR']
};

// Control scheme categories for UI organization
export const INPUT_CATEGORIES = {
    MOVEMENT: [InputAction.MOVE_FORWARD, InputAction.MOVE_BACK, InputAction.MOVE_LEFT, InputAction.MOVE_RIGHT, InputAction.JUMP, InputAction.RUN, InputAction.CROUCH, InputAction.DASH],
    COMBAT: [InputAction.FIRE, InputAction.AIM, InputAction.RELOAD, InputAction.MELEE, InputAction.Q_CYCLE],
    CAMERA: [InputAction.ASCEND, InputAction.DESCEND, InputAction.V_MODE, InputAction.I_FOCUS, InputAction.TOGGLE_HUD],
    DESKTOP: [InputAction.MOUSE_WHEEL_ZOOM, InputAction.MOUSE_MIDDLE_PAN, InputAction.ALT_ROTATE, InputAction.CTRL_MULTI_SELECT, InputAction.PRECISION_MODE],
    UI: [InputAction.TOGGLE_MENU, InputAction.TOGGLE_INSPECTOR, InputAction.UNDO, InputAction.REDO, InputAction.DELETE],
    TRANSFORM: [InputAction.TRANSLATE_MODE, InputAction.ROTATE_MODE, InputAction.SCALE_MODE],
    SYSTEM: [InputAction.QUICK_SAVE, InputAction.QUICK_LOAD, InputAction.TOGGLE_PHYSICS, InputAction.TOGGLE_PAUSE]
} as const;

// Descriptions for UI display
export const INPUT_DESCRIPTIONS: Record<InputAction, string> = {
    [InputAction.MOVE_FORWARD]: 'Move Forward',
    [InputAction.MOVE_BACK]: 'Move Backward',
    [InputAction.MOVE_LEFT]: 'Strafe Left',
    [InputAction.MOVE_RIGHT]: 'Strafe Right',
    [InputAction.JUMP]: 'Jump',
    [InputAction.RUN]: 'Sprint/Run',
    [InputAction.CROUCH]: 'Crouch',
    [InputAction.DASH]: 'Dash/Dodge',
    [InputAction.FIRE]: 'Fire Weapon',
    [InputAction.AIM]: 'Aim Down Sights',
    [InputAction.RELOAD]: 'Reload Weapon',
    [InputAction.MELEE]: 'Melee Attack',
    [InputAction.Q_CYCLE]: 'Cycle Weapon',
    [InputAction.ASCEND]: 'Ascend/Fly Up',
    [InputAction.DESCEND]: 'Descend/Fly Down',
    [InputAction.V_MODE]: 'Toggle View Mode',
    [InputAction.I_FOCUS]: 'Focus on Selection',
    [InputAction.TOGGLE_HUD]: 'Toggle HUD Visibility',
    [InputAction.SCREENSHOT]: 'Take Screenshot',
    [InputAction.MOUSE_WHEEL_ZOOM]: 'Zoom Camera',
    [InputAction.MOUSE_MIDDLE_PAN]: 'Pan Camera',
    [InputAction.ALT_ROTATE]: 'Rotate View (Alt+Drag)',
    [InputAction.CTRL_MULTI_SELECT]: 'Multi-Select (Ctrl+Click)',
    [InputAction.SHIFT_RANGE_SELECT]: 'Range Select (Shift+Click)',
    [InputAction.PRECISION_MODE]: 'Precision Movement',
    [InputAction.TOGGLE_MENU]: 'Toggle Main Menu',
    [InputAction.TOGGLE_INSPECTOR]: 'Toggle Inspector Panel',
    [InputAction.UNDO]: 'Undo Last Action',
    [InputAction.REDO]: 'Redo Last Action',
    [InputAction.DELETE]: 'Delete Selection',
    [InputAction.DUPLICATE]: 'Duplicate Selection',
    [InputAction.TRANSLATE_MODE]: 'Translate Tool',
    [InputAction.ROTATE_MODE]: 'Rotate Tool',
    [InputAction.SCALE_MODE]: 'Scale Tool',
    [InputAction.QUICK_SAVE]: 'Quick Save',
    [InputAction.QUICK_LOAD]: 'Quick Load',
    [InputAction.SPAWN_ENTITY]: 'Open Spawn Menu',
    [InputAction.TOGGLE_PHYSICS]: 'Toggle Physics Debug',
    [InputAction.TOGGLE_PAUSE]: 'Pause/Resume Simulation',
    [InputAction.RESET_POSITION]: 'Reset Player Position'
};
