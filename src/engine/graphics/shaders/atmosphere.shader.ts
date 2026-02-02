
/**
 * Volumetric Height-Fog Shaders
 * Implements exponential density falloff based on world Y position.
 * Part of RUN_VOLUMETRICS protocol.
 * Version 2.1: Added Mie Scattering for directional depth cues.
 */

export const HEIGHT_FOG_PARS = `
    varying float vWorldY;
    uniform float uFogHeight;
    uniform float uFogFalloff;
    uniform vec3 uFogColor;
    uniform float uFogScattering;
    uniform vec3 uSunDir;
`;

export const HEIGHT_FOG_VERTEX = `
    // worldPosition is provided by the #include <worldpos_vertex> chunk
    vWorldY = worldPosition.y;
`;

export const HEIGHT_FOG_FRAGMENT = `
    #ifdef USE_FOG
        float fogFactor = 0.0;
        
        #ifdef FOG_EXP2
            fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
        #else
            fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
        #endif

        // 1. Altitude Density: density = exp(-(vWorldY - base) * falloff)
        // High altitude = less fog. Low altitude = thick fog.
        float vDensity = clamp(exp(-(vWorldY - uFogHeight) * uFogFalloff), 0.0, 1.0);
        
        // 2. Scattering Factor (Depth Perception)
        // Bleeds light into the fog based on viewer-subject distance and sun alignment.
        float depthBleed = 1.0 - exp(-vFogDepth * 0.015);
        
        // Mie Scattering Approximation
        // Simulates the glow around the sun source in the atmosphere
        // vViewDir is provided by DETAIL_NORMAL_PARS injection in custom-material.registry
        float sunDot = max(dot(vViewDir, uSunDir), 0.0);
        float mie = pow(sunDot, 16.0) * uFogScattering * 2.0; 
        
        // Combine distance, height, and scattering
        float combinedFog = fogFactor * vDensity;
        
        // Light Scattering correction: brighten fog based on density + direction
        vec3 scatteringColor = uFogColor + (vec3(1.0) * mie);
        vec3 finalFogColor = mix(uFogColor, scatteringColor, depthBleed * 0.5);
        
        // Re-mix using modulated factor
        gl_FragColor.rgb = mix(gl_FragColor.rgb, finalFogColor, combinedFog);
    #endif
`;
