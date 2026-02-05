
/**
 * Static Post-Processing Configuration
 * Defines the "Hard Realism" cinematic baseline.
 */
export const POST_PROCESS_CONFIG = {
    BLOOM: {
        STRENGTH: 0.45,
        RADIUS: 0.1,
        THRESHOLD: 1.05
    },
    COMPOSITE: {
        VIGNETTE_INTENSITY: 0.95,
        GRAIN_INTENSITY: 0.004,   // Reduced from 0.008 for cleaner mobile visuals
        ABERRATION_INTENSITY: 1.8 // Reduced slightly for better text legibility
    },
    MOBILE: {
        BLOOM_ENABLED: false,
        PIXEL_RATIO_CAP: 1.0
    },
    DESKTOP: {
        BLOOM_ENABLED: true,
        PIXEL_RATIO_CAP: 1.5
    }
};
