/**
 * [T2] Configuration Barrel Export
 * > **ID**: CONFIG_INDEX_V1.0
 * > **Role**: Centralized configuration exports for clean imports
 * > **Tier**: T2 (Configuration)
 */

// Asset Configuration
export * from './asset-registry';
export * from './asset-types';
export * from './asset.config';

// Environment & Atmosphere
export * from './atmosphere.config';
export * from './water.config';

// Rendering & Materials
export * from './material.config';
export * from './texture.config';
export * from './post-process.config';

// Physics
export * from './physics-material.config';

// UI
export * from './menu.config';
