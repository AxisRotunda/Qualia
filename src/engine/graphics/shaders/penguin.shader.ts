
import { SHARED_SHADER_UTILS } from './common.shader';

export const PENGUIN_HEADER = `
    uniform float uTime;
    varying float vWaddle;
    varying vec3 vViewPositionRaw; // For Rim Light
    varying vec3 vNormalRaw;       // For Rim Light
    ${SHARED_SHADER_UTILS}
`;

export const PENGUIN_VERTEX = `
    #include <begin_vertex>
    
    // 1. Phase & Timing
    vec3 wPos = (modelMatrix * vec4(position, 1.0)).xyz;
    float phase = hash21(wPos.xz * 0.1) * 6.28;
    
    float speed = 8.0;
    float t = uTime * speed + phase;
    
    // 2. Waddle Mechanics (Side-to-Side)
    float leanAmount = 0.15;
    float angle = sin(t) * leanAmount;
    
    float c = cos(angle);
    float s = sin(angle);
    
    float nx = transformed.x * c - transformed.y * s;
    float ny = transformed.x * s + transformed.y * c;
    
    transformed.x = nx;
    transformed.y = ny;
    
    // 3. Hop & Volume Conservation (Squash & Stretch)
    // "Industry Standard": Conservation of Volume dictates that if Y stretches, XZ must shrink.
    float hopBase = abs(cos(t)); // 0..1
    float hop = hopBase * 0.08;
    
    // Stretch factor: Max stretch at peak of jump (hopBase ~ 0), Max squash at impact (hopBase ~ 1)
    // Invert phase for impact: Impact is when cos(t) is near 1 or -1 (peak of abs)
    
    float impact = smoothstep(0.8, 1.0, hopBase); // 1.0 only at exact ground contact
    float air = smoothstep(0.0, 0.2, 1.0 - hopBase); // 1.0 only at peak air
    
    float stretchY = 1.0 + (air * 0.15) - (impact * 0.1);
    float squashXZ = 1.0 / sqrt(stretchY); // Volume conservation approx
    
    transformed.y *= stretchY;
    transformed.x *= squashXZ;
    transformed.z *= squashXZ;
    
    // Apply Vertical Translation
    transformed.y += hop;
    
    // 4. Momentum Lean (Forward tilt)
    transformed.z += sin(t) * 0.05 * transformed.y;
    
    vWaddle = angle;
    
    // Pass data for Fragment Shader
    vViewPositionRaw = (modelViewMatrix * vec4(transformed, 1.0)).xyz;
    vNormalRaw = normalize(normalMatrix * normal);
`;

export const PENGUIN_FRAGMENT_MAP = `
    #include <map_fragment>
    
    // --- Industry Standard: Velvet/Fuzz Shader ---
    // Simulates micro-fibers (feathers/down) via Rim Lighting + Noise
    
    // 1. Fresnel Rim
    vec3 viewDir = normalize(-vViewPositionRaw);
    float NdotV = dot(normalize(vNormalRaw), viewDir);
    float rim = 1.0 - max(NdotV, 0.0);
    rim = pow(rim, 3.0); // Sharpen rim
    
    // 2. Micro-Noise (Break up the rim to look like fur/feathers)
    // Using simple UV noise if available, or screen space if UVs are bad. 
    float noise = ign(gl_FragCoord.xy * 0.5); // Screen space grain for fuzz
    
    // 3. Fuzz Color (Soft White/Blue)
    vec3 fuzzColor = vec3(0.9, 0.95, 1.0);
    float fuzzStrength = rim * 0.8 * (0.8 + 0.2 * noise);
    
    // Additive blend the fuzz onto the diffuse color
    diffuseColor.rgb += fuzzColor * fuzzStrength;
`;

export const PENGUIN_FRAGMENT_ROUGH = `
    #include <roughnessmap_fragment>
    
    // 4. Roughness Boost (Feathers are rarely glossy)
    // roughnessFactor is defined in the roughnessmap_fragment chunk
    roughnessFactor = max(roughnessFactor, 0.85);
`;
