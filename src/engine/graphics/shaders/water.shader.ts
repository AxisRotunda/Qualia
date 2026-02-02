
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
`;

export const WATER_VERTEX_HEAD = `
    uniform float uTime;
    varying float vWaveHeight;
    varying vec3 vWaterWorldPos;
    varying vec3 vWaterNormal;
    
    ${WATER_CONSTANTS}

    // Returns Height (Y) and derivatives (d/dx, d/dz) for Analytical Normals
    vec3 getWave(vec3 p) {
        float time = uTime;
        float y = 0.0;
        float ddx = 0.0;
        float ddz = 0.0;

        // Wave 1: Sine Swell
        float phase1 = dot(p.xz, W1_DIR) * W1_FREQ + time * W1_SPEED;
        float sin1 = sin(phase1);
        float cos1 = cos(phase1);
        
        y += sin1 * W1_AMP;
        ddx += W1_DIR.x * W1_FREQ * W1_AMP * cos1;
        ddz += W1_DIR.y * W1_FREQ * W1_AMP * cos1;
        
        // Wave 2: Sharper Chop (Cubed Sine)
        float phase2 = dot(p.xz, W2_DIR) * W2_FREQ + time * W2_SPEED;
        float sin2 = sin(phase2);
        float cos2 = cos(phase2);
        float sharp2 = sin2 * sin2 * sin2; 
        
        y += sharp2 * W2_AMP;
        // Derivative of sin^3: 3 * sin^2 * cos
        float d2 = 3.0 * sin2 * sin2 * cos2 * W2_AMP * W2_FREQ;
        ddx += W2_DIR.x * d2;
        ddz += W2_DIR.y * d2;
        
        return vec3(y, ddx, ddz);
    }
`;

export const WATER_VERTEX_MAIN = `
    vec3 transformed = vec3( position );

    // RUN_INDUSTRY: Compute in Absolute World Space for Physics parity
    // Renamed local variable to avoid collision with global injections or Three.js chunks
    vec4 wPosRaw = modelMatrix * vec4(position, 1.0);
    
    // 1. Calculate Displacement & Partials
    vec3 waveData = getWave(wPosRaw.xyz);
    float h = waveData.x;
    
    // Displacement along Local Normal (Standard assumption for planes)
    transformed += normal * h;
    
    // 2. Analytical Normal Synthesis
    // N = normalize(-dh/dx, 1.0, -dh/dz)
    vec3 worldNorm = normalize(vec3(-waveData.y, 1.0, -waveData.z));
    
    // Pass to varying for lighting stage
    vWaterNormal = worldNorm; 
    vNormal = normalize(mat3(viewMatrix) * worldNorm);
    
    vWaveHeight = h;
    vWaterWorldPos = wPosRaw.xyz;
`;

export const WATER_FRAGMENT_HEAD = `
    uniform float uTime;
    // uSunDir provided by global HEIGHT_FOG_PARS injection
    varying float vWaveHeight;
    varying vec3 vWaterWorldPos;
    varying vec3 vWaterNormal;
    
    ${WATER_CONSTANTS}
`;

export const WATER_FRAGMENT_COLOR = `
    #include <color_fragment>
    
    // 1. Multi-Octave Color Synthesis
    // Deep water scattering logic
    vec3 deepColor = vec3(0.005, 0.04, 0.08); // Near Black Blue
    vec3 midColor = vec3(0.0, 0.15, 0.2);   // Teal
    vec3 crestColor = vec3(0.2, 0.5, 0.6); // Surface Blue
    
    float depthT = clamp(vWaveHeight / W1_AMP, -1.0, 1.0) * 0.5 + 0.5;
    vec3 baseWaterColor = mix(deepColor, midColor, depthT);
    baseWaterColor = mix(baseWaterColor, crestColor, smoothstep(0.6, 1.0, depthT));

    // 2. Subsurface Scatter Approximation (Fresnel)
    vec3 viewDir = normalize(cameraPosition - vWaterWorldPos);
    float fresnel = pow(1.0 - max(dot(vWaterNormal, viewDir), 0.0), 4.0);
    
    // 3. Highlight Motivation
    float sunHighlight = pow(max(dot(vWaterNormal, uSunDir), 0.0), 32.0);
    
    diffuseColor.rgb = mix(baseWaterColor, vec3(1.0), fresnel * 0.4 + sunHighlight * 0.8);
    
    // 4. Foam Logic (Crests only)
    float foam = smoothstep(0.8, 1.1, vWaveHeight / W1_AMP);
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.9, 0.95, 1.0), foam * 0.6);
`;

export const WATER_FRAGMENT_ROUGHNESS = `
    #include <roughnessmap_fragment>
    
    // Industry Standard: Foam is rougher than smooth water
    float foamMask = smoothstep(0.8, 1.1, vWaveHeight / W1_AMP);
    roughnessFactor = mix(0.02, 0.6, foamMask);
`;
