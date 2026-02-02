
import { SHARED_SHADER_UTILS } from './common.shader';

export const ROBOT_ANIM_HEADER = `
    uniform float uRobotTime;
    uniform float uRobotMode; // 0: Idle, 1: Walk, 2: Run
    uniform float uRobotSpeed;
    varying float vLocalY;
    varying float vLocalX;

    ${SHARED_SHADER_UTILS}
`;

export const ROBOT_ANIM_VERTEX = `
    #include <begin_vertex>
    
    // Identify parts by local coords
    vLocalY = position.y;
    vLocalX = position.x;
    
    float part = 0.0; 
    if (position.y < 0.9) part = 1.0; // Legs
    
    float cycle = uRobotTime * uRobotSpeed * 10.0;
    float phase = position.x > 0.0 ? 0.0 : 3.14159; // Alternate sides
    
    if (uRobotMode > 0.5) {
        if (part == 1.0) {
            float rawSine = sin(cycle + phase);
            float stepHeight = max(0.0, rawSine);
            
            // Sharpen the lift curve using common easing approximation
            float lift = pow(stepHeight, 2.0) * 0.3 * uRobotSpeed;
            
            // Forward stride (Cosine)
            float stride = cos(cycle + phase) * 0.4 * uRobotSpeed;
            
            transformed.y += lift;
            transformed.z += stride;
            
            // Foot tilt (Toe drag logic refined)
            if (position.y < 0.2) {
                float tilt = smoothstep(0.0, 0.4, lift) * 0.15;
                transformed.z -= tilt;
                transformed.y -= tilt * 0.5;
            }
        }
        
        // Torso Bob
        if (position.y >= 0.9) {
            float bob = abs(sin(cycle)) * 0.05 * uRobotSpeed;
            transformed.y -= bob;
            // Lean forward based on speed
            transformed.z += (position.y * 0.1) * uRobotSpeed;
        }
    } else {
        // Idle (Breathing effect)
        float breathe = sin(uRobotTime * 1.5);
        transformed.y += breathe * 0.005;
        if (position.x > 0.3 || position.x < -0.3) {
             transformed.z += sin(uRobotTime + position.x) * 0.01;
        }
    }
`;

export const ROBOT_ANIM_FRAGMENT = `
    #include <emissivemap_fragment>
    
    // Visor Mask using local coordinates for stability
    float visorMask = step(1.6, vLocalY) * step(vLocalY, 1.75) * step(abs(vLocalX), 0.2);
    
    float pulse = 0.8 + 0.2 * sin(uRobotTime * 4.0);
    // Use screen-space noise for digital scanline feel
    float scan = step(0.5, sin(gl_FragCoord.y * 0.5 + uRobotTime * 10.0));
    float effect = pulse * (0.8 + 0.2 * scan);
    
    totalEmissiveRadiance *= mix(1.0, effect, visorMask);
`;
