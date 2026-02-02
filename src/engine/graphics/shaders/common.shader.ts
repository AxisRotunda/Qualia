/**
 * Standardized GLSL Utilities
 * Part of RUN_REF Phase 63.0.
 * Focus: Precision-safe noise and deterministic hashing.
 */

export const SHARED_SHADER_UTILS = `
    // --- Interleaved Gradient Noise (IGN) ---
    // Ideal for screen-space dithering or stabilized surface grain on mobile GPUs.
    float ign(vec2 uv) {
        vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);
        return fract(magic.z * fract(dot(uv, magic.xy)));
    }

    // --- Standard 2D Hash ---
    float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
    }

    // --- Quintic Easing ---
    float quintic(float t) {
        return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    }
`;
