
import * as THREE from 'three';
import {
    WATER_VERTEX_HEAD,
    WATER_VERTEX_MAIN,
    WATER_FRAGMENT_HEAD,
    WATER_FRAGMENT_COLOR,
    WATER_FRAGMENT_ROUGHNESS
} from '../shaders/water.shader';

/**
 * createWaterMaterial: Optimized PBR Fluid definition.
 * Part of RUN_MAT protocol.
 */
export function createWaterMaterial(normalMap: THREE.Texture): THREE.MeshPhysicalMaterial {
    const water = new THREE.MeshPhysicalMaterial({
        color: 0x001e0f, // Base deep emerald
        roughness: 0.1,
        metalness: 0.05,
        transmission: 0.96,
        thickness: 2.5,
        ior: 1.333,      // Real-world water IOR
        reflectivity: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        attenuationColor: new THREE.Color(0x004455),
        attenuationDistance: 12.0,
        side: THREE.DoubleSide,
        transparent: true
    });

    water.normalMap = normalMap;
    water.normalScale.set(0.6, 0.6);
    (water as any).userData.mapId = 'tex-water-normal';
    water.userData.time = { value: 0 };
    water.userData.sunDir = { value: new THREE.Vector3(0, 1, 0) };

    water.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = water.userData.time;
        shader.uniforms.uSunDir = water.userData.sunDir;

        // Inject Custom Attributes
        shader.vertexShader = WATER_VERTEX_HEAD + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', WATER_VERTEX_MAIN);

        shader.fragmentShader = WATER_FRAGMENT_HEAD + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', WATER_FRAGMENT_COLOR);
        shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', WATER_FRAGMENT_ROUGHNESS);
    };

    return water;
}
