
/**
 * Micro-Detail Shader Chunks
 * Injected into the standard PBR pipeline for high-frequency surface detail.
 * Part of RUN_REF Phase 61.4 / RUN_INDUSTRY.
 */

export const DETAIL_NORMAL_PARS = `
    varying vec2 vDetailUv;
    varying vec3 vViewDir;
    varying float vCamDist;
    uniform sampler2D tDetailNormal;
`;

export const DETAIL_NORMAL_VERTEX = `
    // Detail UV is based on world coordinates or scaled UVs
    #ifdef USE_UV
        vDetailUv = uv * 32.0; // Higher frequency tiling for micro-surface tooth
    #else
        vDetailUv = vec2(0.0);
    #endif
    
    // worldPosition is provided by the #include <worldpos_vertex> chunk
    // Utilising .xyz directly to ensure type parity with cameraPosition (vec3)
    vViewDir = normalize( cameraPosition - worldPosition.xyz );
    vCamDist = distance( cameraPosition, worldPosition.xyz );
`;

export const DETAIL_NORMAL_FRAGMENT = `
    #ifdef USE_NORMALMAP
        // 1. Micro-Detail Normal (Surface Tooth)
        // Fades out linearly to prevent shimmering at distances > 20m
        float distMask = smoothstep(20.0, 2.0, vCamDist);
        
        #ifdef USE_UV
            if (distMask > 0.01) {
                // Sample Mipmapped Normal Texture
                vec3 microNormal = texture2D(tDetailNormal, vDetailUv).rgb * 2.0 - 1.0;
                
                // Perturb geometry normal (Industry standard additive blend)
                normal = normalize(normal + microNormal * 0.15 * distMask);
                
                // 2. Micro-Roughness Variation (Preserved for texture)
                roughnessFactor = clamp(roughnessFactor + (microNormal.r - 0.5) * 0.08 * distMask, 0.04, 1.0);
                
                // 3. Anisotropy Approximation (Brushed Metal)
                #ifdef USE_ANISOTROPY
                    vec3 tangential = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
                    float anisotropicEdge = abs(dot(vViewDir, tangential));
                    roughnessFactor += anisotropicEdge * 0.1 * distMask;
                #endif
            }
        #endif
    #endif
`;

export const CARBON_FIBER_FRAGMENT = `
    // Procedural carbon fiber weave pattern
    float weaveScale = 45.0; 
    vec2 weaveUv = vDetailUv * weaveScale; 
    
    vec2 id = floor(weaveUv);
    float pattern = mod(id.x + id.y, 2.0);
    
    float shade = mix(0.7, 1.3, pattern);
    
    diffuseColor.rgb *= shade;
    roughnessFactor = mix(0.1, 0.4, pattern);
    
    #ifdef USE_CLEARCOAT
        clearcoatRoughnessFactor = 0.02;
        clearcoatFactor = 1.0;
    #endif
`;
