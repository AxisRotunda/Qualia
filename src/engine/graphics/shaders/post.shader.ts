
/**
 * Composite Cinematic Shader
 * Combines Vignette, Film Grain, and Chromatic Aberration in a single pass.
 * Branchless implementation for RUN_SHADER protocol.
 * Optimized for RUN_OPT: Precision-safe noise distribution.
 * V2.0: Added Submersion Refraction and Tinting.
 */
export const COMPOSITE_POST_SHADER = {
    uniforms: {
        'tDiffuse': { value: null },
        'uTime': { value: 0 },
        'uVignetteIntensity': { value: 0.8 },
        'uGrainIntensity': { value: 0.04 },
        'uAberrationIntensity': { value: 2.0 },
        'uUnderwater': { value: 0.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        precision highp float;
        
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform float uVignetteIntensity;
        uniform float uGrainIntensity;
        uniform float uAberrationIntensity;
        uniform float uUnderwater;
        varying vec2 vUv;

        // --- Interleaved Gradient Noise ---
        float interleavedGradientNoise(vec2 uv) {
            vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);
            return fract(magic.z * fract(dot(uv, magic.xy)));
        }

        void main() {
            // 0. Underwater Refraction (Industry Standard)
            // Apply slight sine distortion to UVs before sampling
            vec2 uv = vUv + vec2(
                sin(uTime * 2.5 + vUv.y * 12.0),
                cos(uTime * 2.0 + vUv.x * 12.0)
            ) * 0.004 * uUnderwater;

            // 1. Chromatic Aberration
            vec2 dist = uv - 0.5;
            vec2 offset = dist * uAberrationIntensity * 0.002; 
            
            float r = texture2D(tDiffuse, uv - offset).r; 
            float g = texture2D(tDiffuse, uv).g;
            float b = texture2D(tDiffuse, uv + offset).b; 
            
            vec4 texel = vec4(r, g, b, 1.0);
            
            // 2. Vignette
            float len = length(dist);
            float vignette = smoothstep(0.8, 0.4, len * uVignetteIntensity);
            texel.rgb *= vignette;

            // 3. Submersion Tinting
            // Mix with deep water teal/cyan
            vec3 submergedColor = vec3(0.0, 0.22, 0.28);
            texel.rgb = mix(texel.rgb, submergedColor * vignette, 0.4 * uUnderwater);

            // 4. Film Grain
            float timeOffset = fract(uTime * 0.1); 
            float noise = interleavedGradientNoise(gl_FragCoord.xy + timeOffset * 1337.0);
            texel.rgb += (noise - 0.5) * uGrainIntensity;

            gl_FragColor = texel;
        }
    `
};
