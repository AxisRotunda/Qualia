/**
 * [T2] Physics System Barrel Export
 * > **ID**: PHYSICS_INDEX_V1.0
 * > **Role**: Centralized physics service exports
 * > **Tier**: T2 (Engine Subsystem)
 * 
 * @ SAFETY: All numeric inputs to physics must pass Number.isFinite()
 * @ SAFETY: Heightfield/Trimesh dimensions must be Math.floor() integers
 */

// Core Physics Services
export * from './world.service';
export * from './physics-step.service';
export * from './physics-interaction.service';
export * from './physics-materials.service';
export * from './physics-registry.service';

// Shape Factory
export * from './shapes.factory';

// Note: Subdirectories (logic/, optimization/) expose their own exports
