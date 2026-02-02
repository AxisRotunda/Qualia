
import { SHARED_SHADER_UTILS } from './common.shader';

export const BUILDING_WINDOW_HEADER = `
    varying vec2 vWindowUv; 
    uniform float uTime;
    uniform float uSunElevation;
    
    ${SHARED_SHADER_UTILS}
`;

export const BUILDING_WINDOW_VERTEX = `
    // Pass standard UV to varying for window logic
    #ifdef USE_UV
        vWindowUv = uv;
    #else
        vWindowUv = vec2(0.0);
    #endif
`;

export const BUILDING_WINDOW_FRAGMENT = `
    #include <emissivemap_fragment>
    
    #ifdef USE_UV
        // 1. Calculate discrete window cell based on UV
        float density = 8.0;
        vec2 windowCell = floor(vWindowUv * density);
        vec2 cellFract = fract(vWindowUv * density);
        
        // 2. Generate activity state using shared hash
        float timeStep = floor(uTime * 0.05); 
        float seed = hash21(windowCell + timeStep);
        
        // 3. Modulate Emissive Intensity based on Sun Elevation
        float eveningBoost = smoothstep(0.4, -0.2, uSunElevation);
        float activityThreshold = mix(0.92, 0.25, eveningBoost); 
        
        // 4. Interior Depth Approximation (Hard Realism)
        float edgeMask = smoothstep(0.0, 0.15, cellFract.x) * smoothstep(1.0, 0.85, cellFract.x) *
                        smoothstep(0.0, 0.15, cellFract.y) * smoothstep(1.0, 0.85, cellFract.y);
        
        // Activity Mask
        float mask = step(activityThreshold, seed); 
        
        // Subtle Pulse
        float pulse = 0.9 + 0.1 * sin(uTime * (0.5 + seed * 2.0));
        
        // Final composite emissive
        totalEmissiveRadiance *= mask * pulse * edgeMask;
        
        // Day-time subtle reflection boost
        #ifndef USE_EMISSIVE
            float dayMask = 1.0 - step(0.5, eveningBoost);
            diffuseColor.rgb += vec3(0.02) * (1.0 - edgeMask) * dayMask;
        #endif
    #endif
`;
