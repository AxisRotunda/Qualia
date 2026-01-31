
import * as THREE from 'three';
import { 
    WATER_VERTEX_HEAD, 
    WATER_VERTEX_MAIN, 
    WATER_FRAGMENT_HEAD, 
    WATER_FRAGMENT_COLOR, 
    WATER_FRAGMENT_ROUGHNESS 
} from '../shaders/water.shader';

export function createWaterMaterial(normalMap: THREE.Texture): THREE.MeshPhysicalMaterial {
    const water = new THREE.MeshPhysicalMaterial({
        color: 0x001e0f, // Deep ocean green/blue
        roughness: 0.1, 
        metalness: 0.1, 
        transmission: 0.95, 
        thickness: 2.0, 
        ior: 1.33,
        reflectivity: 1.0, 
        clearcoat: 1.0, 
        clearcoatRoughness: 0.1,
        attenuationColor: new THREE.Color(0x004455), 
        attenuationDistance: 8.0, 
        side: THREE.DoubleSide
    });
    
    water.normalMap = normalMap;
    water.normalScale.set(0.5, 0.5); // Stronger micro-details
    (water as any).userData['mapId'] = 'tex-water-normal';
    water.userData['time'] = { value: 0 };
    
    water.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = water.userData['time'];
        
        shader.vertexShader = WATER_VERTEX_HEAD + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', WATER_VERTEX_MAIN);

        shader.fragmentShader = WATER_FRAGMENT_HEAD + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', WATER_FRAGMENT_COLOR);
        shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', WATER_FRAGMENT_ROUGHNESS);
    };

    return water;
}
