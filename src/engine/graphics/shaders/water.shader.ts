
import { WATER_CONFIG } from '../../../config/water.config';

const c = WATER_CONFIG;
const float = (n: number) => Number.isInteger(n) ? `${n}.0` : `${n}`;

export const WATER_CONSTANTS = `
    const float W1_FREQ = ${float(c.w1.freq)};
    const float W1_AMP = ${float(c.w1.amp)};
    const float W1_SPEED = ${float(c.w1.speed)};
    const vec2 W1_DIR = vec2(${float(c.w1.dirX)}, ${float(c.w1.dirZ)});

    const float W2_FREQ = ${float(c.w2.freq)};
    const float W2_AMP = ${float(c.w2.amp)};
    const float W2_SPEED = ${float(c.w2.speed)};
    const vec2 W2_DIR = vec2(${float(c.w2.dirX)}, ${float(c.w2.dirZ)});

    const float W3_FREQ = ${float(c.w3.freq)};
    const float W3_AMP = ${float(c.w3.amp)};
    const float W3_SPEED = ${float(c.w3.speed)};
    const vec2 W3_DIR = vec2(${float(c.w3.dirX)}, ${float(c.w3.dirZ)});
`;

export const WATER_VERTEX_HEAD = `
    uniform float uTime;
    varying float vWaveHeight;
    
    ${WATER_CONSTANTS}

    float getWaveHeight(vec3 p) {
        float time = uTime * 1.0;
        float y = 0.0;
        
        // Wave 1: Rolling Swell (Sine)
        y += sin(dot(p.xz, W1_DIR) * W1_FREQ + time * W1_SPEED) * W1_AMP;
        
        // Wave 2: Choppy Peak (Sharpened Sine)
        float w2 = sin(dot(p.xz, W2_DIR) * W2_FREQ + time * W2_SPEED);
        // Peak sharpening: 1 - (1-sin)^k approximation via power or multiplication
        // Using cubic power for cheap peak sharpening
        y += (w2 * w2 * w2) * W2_AMP;
        
        // Wave 3: Surface Noise (Cosine)
        y += cos(dot(p.xz, W3_DIR) * W3_FREQ + time * W3_SPEED) * W3_AMP;
        
        return y;
    }
`;

export const WATER_VERTEX_MAIN = `
    #include <begin_vertex>
    
    // Sample Height
    float waveY = getWaveHeight(position);
    transformed.y += waveY;
    vWaveHeight = waveY;
    
    // Analytical Normal Recalculation (Finite Difference Approximation)
    float offset = 0.1;
    vec3 p1 = position + vec3(offset, 0.0, 0.0); p1.y += getWaveHeight(p1);
    vec3 p2 = position + vec3(0.0, 0.0, offset); p2.y += getWaveHeight(p2);
    
    // Current Transformed Position
    vec3 p0 = transformed;
    
    // Tangent Vectors
    vec3 vA = normalize(p1 - p0);
    vec3 vB = normalize(p2 - p0);
    
    // New Normal
    vec3 N = normalize(cross(vB, vA));
    objectNormal = N;
`;

export const WATER_FRAGMENT_HEAD = `
    uniform float uTime;
    varying float vWaveHeight;
`;

export const WATER_FRAGMENT_COLOR = `
    #include <color_fragment>
    
    // Simple Foam at peaks (threshold based on wave height)
    float foam = smoothstep(0.8, 1.4, vWaveHeight);
    vec3 foamColor = vec3(0.95);
    
    // Deep water darkening in troughs
    float depth = smoothstep(-1.0, 1.0, vWaveHeight);
    vec3 deepColor = diffuseColor.rgb * 0.4; // Darker deeps
    
    vec3 waterColor = mix(deepColor, diffuseColor.rgb, depth);
    diffuseColor.rgb = mix(waterColor, foamColor, foam * 0.6);
`;

export const WATER_FRAGMENT_ROUGHNESS = `
    #include <roughnessmap_fragment>
    
    float foam_r = smoothstep(0.8, 1.4, vWaveHeight);
    
    // Rougher foam, smoother water
    roughnessFactor = mix(roughnessFactor, 0.6, foam_r);
`;
