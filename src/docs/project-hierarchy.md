# Qualia 3D Project Hierarchy

## Root Level
- `.gitignore` - Git ignore rules
- `.prettierrc` - Prettier code formatting configuration
- `angular.json` - Angular CLI configuration
- `index.html` - Main HTML entry point
- `index.tsx` - TypeScript entry point
- `LICENSE` - Project license
- `metadata.json` - Project metadata
- `package-lock.json` - NPM dependency lock file
- `package.json` - Project dependencies and scripts
- `README.md` - Project documentation
- `tsconfig.json` - TypeScript configuration

## Scripts Directory
- `git-automation.js` - Git automation scripts
- `git-sync.cjs` - Git synchronization
- `mcp-setup-universal.js` - MCP setup script
- `mcp-setup.cjs` - MCP setup configuration
- `mcp-setup.js` - MCP setup implementation
- `utils/`
  - `path-resolver.js` - Path resolution utilities

## Source Code (src/)

### Main Application
- `app.component.ts` - Main application component

### Engine Systems (engine/)
- `bootstrap.service.ts` - Engine bootstrap service
- `core.ts` - Core engine functionality
- `engine-state.service.ts` - Engine state management
- `entity-manager.service.ts` - Entity management
- `input-manager.service.ts` - Input handling
- `interaction.service.ts` - Interaction system
- `persistence.service.ts` - Data persistence
- `schema.ts` - Data schema definitions
- `subsystems.service.ts` - Subsystem management
- `system.ts` - Base system implementation
- `controllers/` - Controller implementations
- `ecs/` - Entity Component System
- `events/` - Event system
- `features/` - Feature implementations
- `graphics/` - Graphics rendering
- `input/` - Input processing
- `interaction/` - Interaction logic
- `level/` - Level management
- `logic/` - Game logic
- `physics/` - Physics integration
- `runtime/` - Runtime systems
- `systems/` - System implementations
- `utils/` - Utility functions
- `workers/` - Web workers

### Physics Integration (physics/)
- `physics-interaction.service.ts` - Physics interactions
- `physics-materials.service.ts` - Physics materials
- `physics-registry.service.ts` - Physics registry
- `physics-step.service.ts` - Physics stepping
- `shapes.factory.ts` - Shape factory
- `world.service.ts` - Physics world
- `logic/` - Physics logic
- `optimization/` - Physics optimization

### Scene Management (scene/)
- `scene-visuals.service.ts` - Scene visuals

### Application Services (services/)
- `asset.service.ts` - Asset management
- `camera-control.service.ts` - Camera control
- `character-controller.service.ts` - Character control
- `character-physics.service.ts` - Character physics
- `debug.service.ts` - Debug utilities
- `engine.service.ts` - Engine service
- `entity-library.service.ts` - Entity library
- `environment.service.ts` - Environment management
- `factories/` - Service factories

### UI Components (components/)
- `debug-overlay.component.ts` - Debug overlay
- `inspector.component.ts` - Inspector panel
- `main-layout.component.ts` - Main layout
- `main-menu.component.ts` - Main menu
- `scene-tree.component.ts` - Scene tree
- `spawn-menu.component.ts` - Spawn menu
- `status-bar.component.ts` - Status bar
- `toolbar.component.ts` - Toolbar
- `ui-panel.component.ts` - UI panel
- `inspector/` - Inspector components
- `menu/` - Menu components
- `ui/` - UI components

### Configuration (config/)
- `asset-registry.ts` - Asset registry
- `asset-types.ts` - Asset types
- `asset.config.ts` - Asset configuration
- `atmosphere.config.ts` - Atmosphere configuration
- `material.config.ts` - Material configuration
- `menu.config.ts` - Menu configuration
- `physics-material.config.ts` - Physics material configuration
- `post-process.config.ts` - Post-processing configuration
- `texture.config.ts` - Texture configuration
- `water.config.ts` - Water configuration
- `assets/` - Asset definitions

### Data Definitions (data/)
- `entity-templates.ts` - Entity templates
- `entity-types.ts` - Entity types
- `scene-definitions.ts` - Scene definitions
- `scene-types.ts` - Scene types
- `templates/` - Data templates

### Documentation (docs/)
- `agent-workflow.md` - Agent workflow documentation
- `CLINE_CONFIGURATION.md` - CLINE configuration
- `combat-system.md` - Combat system documentation
- `content-pipeline.md` - Content pipeline
- `control-schemes.md` - Control schemes
- `ecs-architecture.md` - ECS architecture
- `graphics-pipeline.md` - Graphics pipeline
- `input-system.md` - Input system
- `interaction-model.md` - Interaction model
- `kernel.md` - Kernel documentation (T0 Root)
- `knowledge-graph.md` - ’ Migrated to `core/knowledge-graph.md`
- `layout-topology.md` - Layout topology
- `math-algorithms.md` - Math algorithms
- `memory-stream.md` - Memory stream
- `meta-commentary.md` - Meta commentary
- `meta-heuristics.md` - Meta heuristics
- `mobile-strategy.md` - Mobile strategy
- `optimization-report.md` - Optimization report
- `perf-protocol.md` - Performance protocol
- `persistence-schema.md` - Persistence schema
- `physics-integration.md` - Physics integration
- `project-hierarchy.md` - Project hierarchy (this file)
- `protocol-accessibility.md` - Accessibility protocol
- `protocol-actor.md` - Actor protocol
- `protocol-ai.md` - AI protocol
- `protocol-animation.md` - Animation protocol
- `protocol-architecture.md` - Architecture protocol
- `protocol-asset-polish.md` - Asset polish protocol
- `protocol-audio.md` - Audio protocol
- `protocol-biome.md` - Biome protocol
- `protocol-chronos.md` - Chronos protocol
- `protocol-cinematic.md` - Cinematic protocol
- `protocol-composer.md` - Composer protocol
- `protocol-constructor.md` - Constructor protocol
- `protocol-content.md` - Content protocol
- `protocol-debug.md` - Debug protocol
- `protocol-destruction.md` - Destruction protocol
- `protocol-director.md` - Director protocol
- `protocol-dynamics.md` - Dynamics protocol
- `protocol-economy.md` - Economy protocol
- `protocol-event.md` - Event protocol
- `protocol-fauna.md` - Fauna protocol
- `protocol-flora.md` - Flora protocol
- `protocol-geometry.md` - Geometry protocol
- `protocol-grammar.md` - Grammar protocol
- `protocol-i18n.md` - Internationalization protocol
- `protocol-industry.md` - Industry protocol
- `protocol-input.md` - Input protocol
- `protocol-interaction.md` - Interaction protocol
- `protocol-kinematics.md` - Kinematics protocol
- `protocol-knowledge.md` - Knowledge protocol
- `protocol-lifecycle.md` - Lifecycle protocol
- `protocol-lighting.md` - Lighting protocol
- `protocol-material.md` - Material protocol
- `protocol-narrative.md` - Narrative protocol
- `protocol-nature.md` - Nature protocol
- `protocol-network.md` - Network protocol
- `protocol-neural.md` - Neural protocol
- `protocol-optimize.md` - Optimization protocol
- `protocol-persistence.md` - Persistence protocol
- `protocol-post-process.md` - Post-process protocol
- `protocol-profile.md` - Profile protocol
- `protocol-project.md` - Project protocol
- `protocol-refactor.md` - Refactor protocol
- `protocol-render.md` - Render protocol
- `protocol-repair.md` - Repair protocol
- `protocol-scene-optimizer.md` - Scene optimizer protocol
- `protocol-schema.md` - Schema protocol
- `protocol-security.md` - Security protocol
- `protocol-shader.md` - Shader protocol
- `protocol-state.md` - State protocol
- `protocol-stress.md` - Stress protocol
- `protocol-systemic.md` - Systemic protocol
- `protocol-terrain.md` - Terrain protocol
- `protocol-test.md` - Test protocol
- `protocol-texture.md` - Texture protocol
- `protocol-thread.md` - Thread protocol
- `protocol-tooling.md` - Tooling protocol
- `protocol-ui.md` - UI protocol
- `protocol-vfx.md` - VFX protocol
- `protocol-volumetrics.md` - Volumetrics protocol
- `refactoring-state.md` - ’ Migrated to `history/refactoring-state.md`
- `REPAIR_LOG_WASM_STABILITY.md` - WASM stability repair log
- `repair-log-inverted-inputs.md` - Inverted inputs repair log
- `repair-log-null-trim.md` - Null trim repair log
- `repair-log-static-noise.md` - Static noise repair log
- `repair-log-water-systems.md` - Water systems repair log
- `runtime-architecture.md` - Runtime architecture
- `scene-logic.md` - Scene logic
- `state-topology.md` - State topology
- `systems.md` - Systems documentation
- `ui-architecture.md` - UI architecture
- `architecture/` - Architecture documentation
- `core/` - Core documentation
- `history/` - History documentation
- `kernel/` - Kernel documentation
- `protocols/` - Protocol documentation

### Content Assets (content/)
- `algorithms/` - Algorithm implementations
- `scenes/` - Scene definitions

### Engine API Documentation
- `engine-api.md` - Engine API reference