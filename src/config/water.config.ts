
/**
 * WATER_CONFIG: Global harmonic wave parameters.
 * Part of RUN_INDUSTRY protocol.
 */
export const WATER_CONFIG = {
    // Wave 1: Large Base Swell (Oceanic Roll)
    w1: { freq: 0.05, amp: 1.5, speed: 0.8, dirX: 0.7, dirZ: 0.3 },

    // Wave 2: Medium Surface Chop (Wind-driven)
    w2: { freq: 0.18, amp: 0.35, speed: 1.4, dirX: -0.4, dirZ: 0.8 },

    // Wave 3: High-Frequency Detail (Managed by Normal Map in Shader)
    w3: { freq: 0.6, amp: 0.08, speed: 2.2, dirX: 1.0, dirZ: 0.0 }
};
