# Layout Topology
> **Scope**: Screen Space partitioning, Z-Index Stratification, Responsive Breakpoints.
> **Source**: `src/components/main-layout.component.ts`, `src/services/ui/layout.service.ts`

## 1. Z-Index Stratification
The application uses a strict layer system to manage pointer events and visibility.

| Layer | Z-Index | Components | Interaction |
|-------|---------|------------|-------------|
| **Root** | `0` | `Canvas` (Three.js) | Raycasting (World) |
| **HUD Base** | `10` | `SceneTree`, `Inspector` (Desktop Sidebar) | Click/Scroll |
| **Touch Layer** | `20` | `VirtualJoystick`, `TouchControls` | Multi-touch (Capture Background) |
| **HUD Chrome** | `40` | `StatusBar`, `Toolbar`, `MenuBar` | Click (Priority over Touch) |
| **Context** | `50` | `ContextMenu`, `SpawnMenu`, `Debug` | Blocking |
| **System** | `100` | `MainMenu`, `LoadingScreen` | Full Capture |

## 2. Desktop Layout (> 1024px)
**Grid Definition**: Flex Column (Header) -> Flex Row (Body) -> Flex Column (Footer).

```text
[Header: MenuBar + Toolbar (h-auto)]
--------------------------------------------------
|      |                                  |      |
| Tree |           Viewport               | Insp |
| (w64)|           (flex-1)               | (w80)|
|      |                                  |      |
--------------------------------------------------
[Footer: StatusBar (h-auto)]
```

*   **Tree/Inspector**: Permanent sidebars. `bg-slate-950/95`.
*   **Viewport**: Resizes dynamically. `EngineService.resize()` called on transition.

## 3. Mobile Layout (< 1024px)
**Grid Definition**: Full Screen Viewport. Panels are Off-Canvas.

```text
[Viewport (Absolute Full)]
   + [Touch Layer (Z=20)] -> Joysticks
   + [HUD Layer (Z=40)]
       + [Context Actions]
       + [Toolbar (Floating Pill)]
---------------------------
[Drawers (Overlay Z=40+)]
   + [Left Drawer (Slide In)]
   + [Right Drawer (Slide Up)]
```

*   **Responsive Trigger**: `LayoutService` listens to `window:resize`. Sets `isMobile` signal.
*   **UI hiding**: `Toolbar` transforms into specific mobile-optimized floating buttons. `MenuBar` collapses into Hamburger.

## 4. Viewport Coordinate System
*   **Canvas**: `w-full h-full block`.
*   **Pointer Events**:
    *   **Desktop**: `Canvas` has `pointer-events: auto`.
    *   **Mobile**: 
        *   `TouchControls` layer (Z=20) covers canvas. 
        *   Joysticks capture pointer.
        *   Taps pass through to `InteractionService`.
        *   `HUD` layer (Z=40) is `pointer-events: none` container, but children are `auto`.

## 5. Overlay behaviors
*   **Spawn Menu**: Bottom-sheet on Mobile, Centered Modal on Desktop.
*   **Main Menu**: Full screen backdrop blur. Pauses rendering loop logic (but loop continues).
*   **Context Menu**: Absolute positioning based on `(x, y)` screen coordinates from `InteractionService`.