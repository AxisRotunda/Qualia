
import { SHARED_SHADER_UTILS } from './common.shader';

export const NATURE_WIND_HEADER = `
    uniform float uTime;
    varying float vWindFactor;
    ${SHARED_SHADER_UTILS}
`;

export const NATURE_WIND_VERTEX = `
    #include <begin_vertex>
    
    // --- Industry Standard: Phase-Offset Wind ---
    // De-synchronize sway based on world position
    vec3 worldRoot = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    // Use low-frequency spatial hash for stable phase
    float phase = hash21(floor(worldRoot.xz * 0.5)); 

    // Weight displacement by height (local Y) to anchor roots
    float weight = max(0.0, position.y * 0.15);
    
    // Multi-frequency wind synthesis
    float t = uTime + phase * 10.0;
    
    // 1. Main Sway (Trunk Bending)
    float swayX = sin(t * 1.0) * 0.05 * weight;
    float swayZ = cos(t * 0.8) * 0.05 * weight;
    
    // 2. Micro Flutter (Leaf Turbulence)
    float flutter = sin(t * 4.0 + position.x * 2.0 + position.y * 2.0) * 0.015 * weight;

    transformed.x += swayX + flutter;
    transformed.z += swayZ + flutter;
    transformed.y += flutter * 0.5; // Slight vertical bob
    
    vWindFactor = weight;
`;
