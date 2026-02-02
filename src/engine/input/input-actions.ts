
/**
 * InputAction: Semantic definitions for user intent.
 * Part of RUN_REF / RUN_INDUSTRY Phase 81.0.
 */
export enum InputAction {
    MOVE_FORWARD = 'MOVE_FORWARD',
    MOVE_BACK = 'MOVE_BACK',
    MOVE_LEFT = 'MOVE_LEFT',
    MOVE_RIGHT = 'MOVE_RIGHT',
    JUMP = 'JUMP',
    RUN = 'RUN',
    CROUCH = 'CROUCH', // [NEW]
    FIRE = 'FIRE',
    AIM = 'AIM',
    ASCEND = 'ASCEND',
    DESCEND = 'DESCEND',
    V_MODE = 'V_MODE',   // View Toggle
    I_FOCUS = 'I_FOCUS', // Focus Selected
    Q_CYCLE = 'Q_CYCLE'  // Weapon Cycle
}

export type InputBindingMap = Record<InputAction, string[]>;

export const DEFAULT_INPUT_MAP: InputBindingMap = {
    [InputAction.MOVE_FORWARD]: ['KeyW', 'ArrowUp'],
    [InputAction.MOVE_BACK]:    ['KeyS', 'ArrowDown'],
    [InputAction.MOVE_LEFT]:    ['KeyA', 'ArrowLeft'],
    [InputAction.MOVE_RIGHT]:   ['KeyD', 'ArrowRight'],
    [InputAction.JUMP]:         ['Space'],
    [InputAction.RUN]:          ['ShiftLeft', 'ShiftRight'],
    [InputAction.CROUCH]:       ['ControlLeft', 'KeyC'],
    [InputAction.FIRE]:         ['Mouse0'], 
    [InputAction.AIM]:          ['Mouse2'], 
    [InputAction.ASCEND]:       ['KeyE', 'Space'],
    [InputAction.DESCEND]:      ['KeyQ', 'ShiftLeft'],
    [InputAction.V_MODE]:       ['KeyV'],
    [InputAction.I_FOCUS]:      ['KeyF'],
    [InputAction.Q_CYCLE]:      ['KeyQ']
};
