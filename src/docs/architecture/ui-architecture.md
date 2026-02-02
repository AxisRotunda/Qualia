# UI Architecture
> **Scope**: View Layer, Component Patterns, Styling System, State Reflection.
> **Source**: `src/components/`, `src/services/ui/layout.service.ts`
> **Audience**: Frontend Engineers / AI UI Generators.

## 1. Design Philosophy: "Scientific Dashboard"
The UI is designed to feel like a high-precision instrument ("Hard Realism").
*   **Visual Language**: Glassmorphism (`backdrop-blur-xl`), Thin Borders (`1px`), High Contrast.
*   **Typography**: Monospace numbers (`font-mono`), Uppercase Headers (`tracking-widest`).
*   **Palette**: Slate-950 (Base), Cyan-500 (Accent/Active), Rose-500 (Destructive/Error), Emerald-500 (Success/Safe).
*   **Decor**: Minimalist tech accents (corner markers, scanlines, gradient borders).

## 2. Data Flow Protocol
**Strict Unidirectional Flow**:
1.  **Read**: Components inject `EngineService` and read `Signal<T>`.
2.  **Compute**: Components use `computed()` to derive local view state (e.g., filtering lists).
3.  **Write**: Components emit `output()` events or call `EngineService` methods.
4.  **Prohibition**: Components MUST NOT write to `EngineState` signals directly.

## 3. Component Categories

### 3.1 Layout Containers
*   **Role**: Structuring screen space, handling slots.
*   **Examples**: `MainLayoutComponent`, `UiPanelComponent`.
*   **Meta**: Use `ng-content` projection. `UiPanelComponent` handles common "Tech" styling.

### 3.2 Smart Widgets
*   **Role**: Binding specific game state to DOM.
*   **Examples**: `InspectorComponent`, `SceneTreeComponent`, `StatusBarComponent`.
*   **Meta**: Heavy dependency on `EngineService`.

### 3.3 Dumb Primitives
*   **Role**: Reusable UI elements without domain knowledge.
*   **Examples**: `VirtualJoystickComponent`, `ContextMenuComponent`, `MenuDropdownComponent`.
*   **Meta**: Pure Inputs/Outputs. No `EngineService` injection.

### 3.4 Overlays
*   **Role**: Modal or Full-screen interruptions.
*   **Examples**: `MainMenuComponent`, `SpawnMenuComponent`, `MobileDrawersComponent`.
*   **Meta**: High Z-Index. Often managed by `LayoutService` visibility signals.

## 4. Styling Heuristics (Tailwind)
*   **Glass Panels**: `bg-slate-950/90 backdrop-blur-md border border-slate-800`.
*   **Active States**: `text-cyan-400 bg-cyan-950/30 border-cyan-500/50`.
*   **Interactive**: `hover:bg-slate-800 active:scale-95 transition-all`.
*   **Touch Targets**: Minimum `44px` or `w-10 h-10` on interactive elements for mobile.
*   **Scrollbars**: Custom webkit styling required for `::-webkit-scrollbar` (width 4px, slate-700 thumb).

## 5. Change Detection Strategy
*   **Global**: `provideZonelessChangeDetection()`.
*   **Trigger**: UI updates **only** when Signals change.
*   **Performance**: 
    *   Avoid getters in templates `{{ getVal() }}`.
    *   Use Signal reads `{{ val() }}`.
    *   Use `OnPush` semantics (Implicit in Zoneless).

## 6. Critical UI Services
*   **`LayoutService`**: Manages panel visibility (`leftPanelOpen`, `rightPanelOpen`) and Responsive State (`isMobile`).
*   **`SelectionHighlightService`**: *Visual bridge*. Watches `selectedEntity` signal and updates the 3D BoxHelper in the scene.