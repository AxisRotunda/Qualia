
import { SHARED_SHADER_UTILS } from './common.shader';

/**
 * Terrain Shader (Slope-Adaptive)
 * Part of RUN_INDUSTRY (Nature Terrain Generation).
 *
 * Logic:
 * - Uses Planar Mapping (Top-Down) for flat surfaces (Grass/Sand/Snow).
 * - Uses Bi-Planar Mapping (Sides) for steep surfaces (Rock/Cliff).
 * - Blends based on World Normal Y (Slope).
 * - Reduces texture fetches compared to full dual-triplanar (3 fetches vs 6).
 */

export const TERRAIN_PARS = `
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
    uniform sampler2D tSlopeMap; // Rock/Cliff Texture
    uniform float uTerrainScale;
    
    ${SHARED_SHADER_UTILS}
`;

export const TERRAIN_VERTEX = `
    #include <worldpos_vertex>
    vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
    // Ensure normal is world-space for slope detection
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
`;

export const TERRAIN_FRAGMENT = `
    #ifdef USE_MAP
        // 1. Calculate Slope Factor
        // 1.0 = Flat Up, 0.0 = Vertical Wall
        float slope = max(0.0, vWorldNormal.y);
        
        // RUN_INDUSTRY: Hardened blend for distinct stratification (Rock vs Grass/Sand)
        // Sharper transition (0.45-0.65) looks more physical than soft blend
        float blendFactor = smoothstep(0.45, 0.65, slope);
        
        // 2. UV Coordinates
        float scale = uTerrainScale;
        vec2 uvTop = vWorldPosition.xz * scale;
        vec2 uvSideX = vWorldPosition.zy * scale;
        vec2 uvSideZ = vWorldPosition.xy * scale;
        
        // 3. Texture Sampling
        
        // A. Flat Surface (Primary Map - e.g. Grass)
        vec4 colTop = texture2D(map, uvTop);
        
        // B. Slope Surface (Secondary Map - e.g. Rock)
        // We use Bi-Planar mapping for sides to prevent stretching
        vec3 nAbs = abs(vWorldNormal);
        float sideWeight = nAbs.x + nAbs.z;
        // Avoid division by zero
        vec2 sideBlend = vec2(nAbs.x, nAbs.z) / max(sideWeight, 0.001);
        
        vec4 colSideX = texture2D(tSlopeMap, uvSideX);
        vec4 colSideZ = texture2D(tSlopeMap, uvSideZ);
        vec4 colSlope = colSideX * sideBlend.x + colSideZ * sideBlend.y;
        
        // 4. Mix
        vec4 finalCol = mix(colSlope, colTop, blendFactor);
        
        diffuseColor *= finalCol;
    #endif
`;

export const TERRAIN_ROUGHNESS = `
    float roughnessFactor = roughness;
    #ifdef USE_ROUGHNESSMAP
        vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
        roughnessFactor *= texelRoughness.g;
    #endif

    // Terrain Slope-Adaptive Roughness
    float tSlope = max(0.0, vWorldNormal.y);
    float tBlend = smoothstep(0.45, 0.65, tSlope);
    
    // Rock is usually rougher (0.9) than Grass/Snow/Sand
    roughnessFactor = mix(0.9, roughnessFactor, tBlend);
`;
