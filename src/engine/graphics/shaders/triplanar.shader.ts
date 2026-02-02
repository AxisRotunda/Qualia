
export const TRIPLANAR_VERTEX_HEAD = `
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
`;

export const TRIPLANAR_VERTEX_MAIN = `
    #include <worldpos_vertex>
    vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
`;

export const TRIPLANAR_FRAGMENT_HEAD = `
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
    uniform float uTriplanarScale;
`;

export const TRIPLANAR_FRAGMENT_MAP = `
    #ifdef USE_MAP
        // Triplanar Weights (sharpened)
        vec3 blending = abs(vWorldNormal);
        blending = normalize(max(blending, 0.00001));
        float b = (blending.x + blending.y + blending.z);
        blending /= vec3(b);

        // Scale factor
        float scale = uTriplanarScale;
        
        // UVs
        vec2 uvX = vWorldPosition.zy * scale;
        vec2 uvY = vWorldPosition.xz * scale;
        vec2 uvZ = vWorldPosition.xy * scale;
        
        // Samples
        vec4 texX = texture2D(map, uvX);
        vec4 texY = texture2D(map, uvY);
        vec4 texZ = texture2D(map, uvZ);
        
        // Final Blended Color
        diffuseColor *= (texX * blending.x + texY * blending.y + texZ * blending.z);
    #endif
`;
