
import * as THREE from 'three';
import { createWaterMaterial } from './water-material.factory';
import { BUILDING_WINDOW_HEADER, BUILDING_WINDOW_VERTEX, BUILDING_WINDOW_FRAGMENT } from '../shaders/building.shader';
import { ROBOT_ANIM_HEADER, ROBOT_ANIM_VERTEX, ROBOT_ANIM_FRAGMENT } from '../shaders/robot.shader';
import { PENGUIN_HEADER, PENGUIN_VERTEX, PENGUIN_FRAGMENT_MAP, PENGUIN_FRAGMENT_ROUGH } from '../shaders/penguin.shader';
import { 
    TRIPLANAR_VERTEX_HEAD, 
    TRIPLANAR_VERTEX_MAIN, 
    TRIPLANAR_FRAGMENT_HEAD, 
    TRIPLANAR_FRAGMENT_MAP 
} from '../shaders/triplanar.shader';
import { 
    TERRAIN_PARS, 
    TERRAIN_VERTEX, 
    TERRAIN_FRAGMENT,
    TERRAIN_ROUGHNESS
} from '../shaders/terrain.shader';
import { HEIGHT_FOG_PARS, HEIGHT_FOG_VERTEX, HEIGHT_FOG_FRAGMENT } from '../shaders/atmosphere.shader';
import { DETAIL_NORMAL_PARS, DETAIL_NORMAL_VERTEX, DETAIL_NORMAL_FRAGMENT } from '../shaders/detail.shader';
import { NATURE_WIND_HEADER, NATURE_WIND_VERTEX } from '../shaders/nature.shader';

/**
 * Global Shader Injection Wrapper
 * Implements centralized volumetric fog and detail normal logic.
 */
function applyGlobalInjections(shader: THREE.Shader, heightFogUniforms: Record<string, THREE.IUniform>, detailNormal: THREE.Texture | null, isAnisotropic = false) {
    Object.assign(shader.uniforms, heightFogUniforms);
    
    if (detailNormal) {
        shader.uniforms['tDetailNormal'] = { value: detailNormal };
    }

    // RUN_FIX: Propagate defines to BOTH stages. 
    // Three.js internal chunks (like uv_pars) rely on these to declare varyings like vUv.
    const defines = isAnisotropic ? '#define USE_ANISOTROPY\n' : '';

    // Prepend parameters
    shader.vertexShader = defines + HEIGHT_FOG_PARS + DETAIL_NORMAL_PARS + shader.vertexShader;
    shader.fragmentShader = defines + HEIGHT_FOG_PARS + DETAIL_NORMAL_PARS + shader.fragmentShader;

    // Standard Hook Overrides
    shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n' + HEIGHT_FOG_VERTEX + DETAIL_NORMAL_VERTEX);
    shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n' + DETAIL_NORMAL_FRAGMENT);
    shader.fragmentShader = shader.fragmentShader.replace('#include <fog_fragment>', HEIGHT_FOG_FRAGMENT);
}

export function registerCustomMaterials(
    registry: Map<string, THREE.Material | THREE.Material[]>, 
    getTexture: (id: string) => THREE.Texture | null,
    heightFogUniforms: Record<string, THREE.IUniform>
) {
    const microNormal = getTexture('tex-micro-normal');
    // RUN_INDUSTRY: Load dedicated rock texture for terrain blending
    const rockTexture = getTexture('tex-rock'); 

    // 1. Bio-Wind Group
    const natureIds = ['mat-leaf', 'mat-palm-leaf', 'mat-pine-leaf'];
    natureIds.forEach(id => {
        const mat = registry.get(id) as THREE.MeshStandardMaterial;
        if (mat) {
            // foliage is usually double sided
            mat.side = THREE.DoubleSide; 
            
            mat.onBeforeCompile = (shader) => {
                shader.uniforms.uTime = { value: 0 };
                mat.userData['time'] = shader.uniforms.uTime;
                
                applyGlobalInjections(shader, heightFogUniforms, microNormal);
                
                shader.vertexShader = NATURE_WIND_HEADER + shader.vertexShader;
                shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', NATURE_WIND_VERTEX);
                
                // --- Industry Standard: Volumetric Normal Smoothing ---
                // Hack: Blend vertex normal with "Up" vector to simulate light scattering through volume
                // This prevents leaves from looking like harsh flat planes
                const SPHERIZED_NORMAL_LOGIC = `
                    #include <beginnormal_vertex>
                    // Blend normal 50% towards Up (0,1,0) for softer canopy lighting
                    objectNormal = normalize(mix(objectNormal, vec3(0.0, 1.0, 0.0), 0.5));
                `;
                shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', SPHERIZED_NORMAL_LOGIC);
            };
        }
    });

    // 2. Terrain Adaptive Group (Slope Blending)
    // Applies to natural terrain materials that need rock cliffs
    const terrainIds = ['mat-sand', 'mat-snow', 'mat-forest', 'mat-rock'];
    terrainIds.forEach(id => {
        const mat = registry.get(id) as THREE.MeshStandardMaterial;
        if (mat) {
            mat.onBeforeCompile = (shader) => {
                shader.uniforms.uTerrainScale = { value: 0.15 };
                shader.uniforms.tSlopeMap = { value: rockTexture };
                
                applyGlobalInjections(shader, heightFogUniforms, microNormal);
                
                // Inject Adaptive Terrain Logic
                shader.vertexShader = TERRAIN_PARS + shader.vertexShader;
                shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', TERRAIN_VERTEX);
                
                shader.fragmentShader = TERRAIN_PARS + shader.fragmentShader;
                shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', TERRAIN_FRAGMENT);
                shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', TERRAIN_ROUGHNESS);
            };
        }
    });

    // 3. Simple Triplanar Group (Man-made / Uniform)
    const simpleTriplanarIds = ['mat-concrete', 'mat-asphalt'];
    simpleTriplanarIds.forEach(id => {
        const mat = registry.get(id) as THREE.MeshStandardMaterial;
        if (mat) {
            mat.onBeforeCompile = (shader) => {
                shader.uniforms.uTriplanarScale = { value: 0.2 };
                applyGlobalInjections(shader, heightFogUniforms, microNormal);
                shader.vertexShader = TRIPLANAR_VERTEX_HEAD + shader.vertexShader;
                shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', TRIPLANAR_VERTEX_MAIN);
                shader.fragmentShader = TRIPLANAR_FRAGMENT_HEAD + shader.fragmentShader;
                shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', TRIPLANAR_FRAGMENT_MAP);
            };
        }
    });

    // 4. Robot Composite Material
    const robotMat = registry.get('mat-robot') as THREE.MeshPhysicalMaterial;
    if (robotMat) {
        robotMat.onBeforeCompile = (shader) => {
            shader.uniforms.uRobotTime = { value: 0 };
            shader.uniforms.uRobotMode = { value: 0 };
            shader.uniforms.uRobotSpeed = { value: 0 };
            robotMat.userData['uRobotTime'] = shader.uniforms.uRobotTime;
            applyGlobalInjections(shader, heightFogUniforms, microNormal, true);
            shader.vertexShader = ROBOT_ANIM_HEADER + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', ROBOT_ANIM_VERTEX);
            shader.fragmentShader = ROBOT_ANIM_HEADER + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', ROBOT_ANIM_FRAGMENT);
        };
    }

    // 5. Penguin Fauna (Waddle Animation + Fuzz)
    const penguinIds = ['mat-penguin-body', 'mat-penguin-belly', 'mat-penguin-feet'];
    penguinIds.forEach(id => {
        const mat = registry.get(id) as THREE.MeshStandardMaterial;
        if (mat) {
            mat.onBeforeCompile = (shader) => {
                shader.uniforms.uTime = { value: 0 };
                mat.userData['time'] = shader.uniforms.uTime; // Hook for MaterialAnimationSystem
                applyGlobalInjections(shader, heightFogUniforms, microNormal);
                
                // HEADER must be in BOTH Vertex and Fragment for declare varyings/uniforms
                shader.vertexShader = PENGUIN_HEADER + shader.vertexShader;
                shader.fragmentShader = PENGUIN_HEADER + shader.fragmentShader;
                
                shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', PENGUIN_VERTEX);
                shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', PENGUIN_FRAGMENT_MAP);
                shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', PENGUIN_FRAGMENT_ROUGH);
            };
        }
    });

    // 6. Urban Window Group
    const cityWindowMat = registry.get('mat-city-window') as THREE.MeshStandardMaterial;
    if (cityWindowMat) {
        cityWindowMat.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = { value: 0 };
            shader.uniforms.uSunElevation = { value: 1.0 };
            cityWindowMat.userData['time'] = cityWindowMat.userData['time'] || shader.uniforms.uTime;
            cityWindowMat.userData['sunElevation'] = shader.uniforms.uSunElevation;
            applyGlobalInjections(shader, heightFogUniforms, microNormal);
            shader.vertexShader = BUILDING_WINDOW_HEADER + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' + BUILDING_WINDOW_VERTEX);
            shader.fragmentShader = BUILDING_WINDOW_HEADER + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', BUILDING_WINDOW_FRAGMENT);
        };
    }

    // 7. Water & Hazardous Fluids
    const normalMap = getTexture('tex-water-normal');
    if (normalMap) {
        const waterMat = createWaterMaterial(normalMap);
        
        // Link shared sun vector for highlights
        waterMat.userData['sunDir'] = heightFogUniforms['uSunDir'];
        
        // Finalize onBeforeCompile to include global fog logic
        const baseOnBeforeCompile = waterMat.onBeforeCompile;
        waterMat.onBeforeCompile = (shader) => {
            baseOnBeforeCompile(shader);
            applyGlobalInjections(shader, heightFogUniforms, null);
        };

        registry.set('mat-water', waterMat);
        
        const acidMat = waterMat.clone();
        acidMat.color.setHex(0x1a2c0f);
        // Ensure clone also utilizes the injected atmospheric logic
        acidMat.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = waterMat.userData['time'];
            applyGlobalInjections(shader, heightFogUniforms, null); 
        };
        registry.set('mat-acid', acidMat);
    }
}
