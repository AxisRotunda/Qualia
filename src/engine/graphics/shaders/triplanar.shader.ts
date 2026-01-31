
export const TRIPLANAR_VERTEX_HEAD = `
    #include <common>
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
`;

export const TRIPLANAR_VERTEX_MAIN = `
    #include <worldpos_vertex>
    vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
`;

export const TRIPLANAR_FRAGMENT_HEAD = `
    #include <common>
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
    uniform float uTriplanarScale;
`;

export const TRIPLANAR_FRAGMENT_MAP = `
    #ifdef USE_MAP
        // Triplanar Weights
        vec3 absNorm = abs(vWorldNormal);
        absNorm /= (absNorm.x + absNorm.y + absNorm.z);
        
        // UVs
        vec2 uvX = vWorldPosition.yz * uTriplanarScale;
        vec2 uvY = vWorldPosition.xz * uTriplanarScale;
        vec2 uvZ = vWorldPosition.xy * uTriplanarScale;
        
        // Samples
        vec4 texX = texture2D(map, uvX);
        vec4 texY = texture2D(map, uvY);
        vec4 texZ = texture2D(map, uvZ);
        
        // Blend
        vec4 blendedColor = texX * absNorm.x + texY * absNorm.y + texZ * absNorm.z;
        diffuseColor *= blendedColor;
    #endif
`;
