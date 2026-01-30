
import * as THREE from 'three';

export function createWaterMaterial(normalMap: THREE.Texture): THREE.MeshPhysicalMaterial {
    const water = new THREE.MeshPhysicalMaterial({
        color: 0x004466, 
        roughness: 0.15, 
        metalness: 0.1, 
        transmission: 0.9, 
        thickness: 1.5, 
        ior: 1.33,
        reflectivity: 1.0, 
        clearcoat: 1.0, 
        clearcoatRoughness: 0.1,
        attenuationColor: new THREE.Color(0x006688), 
        attenuationDistance: 5.0, 
        side: THREE.DoubleSide
    });
    
    water.normalMap = normalMap;
    water.normalScale.set(0.2, 0.2); 
    (water as any).userData['mapId'] = 'tex-water-normal';
    water.userData['time'] = { value: 0 };
    
    water.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = water.userData['time'];
        shader.vertexShader = `
            uniform float uTime;
            varying float vWaveHeight;
            float getWaveHeight(vec3 p) {
                float time = uTime * 1.0;
                float y = 0.0;
                y += sin(p.x * 0.05 + time * 0.5) * sin(p.z * 0.04 + time * 0.6) * 1.0;
                y += sin(p.x * 0.2 + time * 1.2) * 0.25;
                y += cos(p.z * 0.15 + time * 1.1) * 0.25;
                return y;
            }
        ` + shader.vertexShader;
        
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
            #include <begin_vertex>
            float waveY = getWaveHeight(position);
            transformed.y += waveY;
            vWaveHeight = waveY;
            float offset = 0.1;
            vec3 p1 = position + vec3(offset, 0.0, 0.0); p1.y += getWaveHeight(p1);
            vec3 p2 = position + vec3(0.0, 0.0, offset); p2.y += getWaveHeight(p2);
            vec3 vA = normalize(p1 - transformed);
            vec3 vB = normalize(p2 - transformed);
            vec3 N = normalize(cross(vB, vA));
            objectNormal = N;
        `);
        shader.fragmentShader = `uniform float uTime;\nvarying float vWaveHeight;\n` + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
            #include <color_fragment>
            float foam = smoothstep(0.8, 1.3, vWaveHeight);
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.95), foam * 0.6);
        `);
    };

    return water;
}
