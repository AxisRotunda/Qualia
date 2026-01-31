
import * as THREE from 'three';
import { createWaterMaterial } from './water-material.factory';

export function registerCustomMaterials(
    registry: Map<string, THREE.Material | THREE.Material[]>, 
    getTexture: (id: string) => THREE.Texture | null
) {
    // Ice & Snow - Physical
    registry.set('mat-ice', new THREE.MeshPhysicalMaterial({
        color: 0xa5bfd1,
        roughness: 0.15,
        metalness: 0.1,
        transmission: 0.4,
        thickness: 2.0,
        ior: 1.31,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    }));

    // Water (Using Factory)
    const normalMap = getTexture('tex-water-normal');
    if (normalMap) {
        const waterMat = createWaterMaterial(normalMap);
        registry.set('mat-water', waterMat);
    }

    // Glass Alias
    const glass = registry.get('mat-glass') as THREE.MeshPhysicalMaterial;
    if (glass) registry.set('mat-window', glass.clone());

    // Interior Special
    const marble = registry.get('mat-marble');
    if (marble) (marble as any).userData['mapId'] = 'tex-marble';

    const woodPolish = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.3, metalness: 0.1 });
    woodPolish.userData['mapId'] = 'tex-wood-dark';
    registry.set('mat-wood-polish', woodPolish);

    // Screens (Emissive Target)
    const mScreen = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x22c55e, emissiveIntensity: 2.0, roughness: 0.2 });
    mScreen.userData['mapId'] = 'tex-screen-matrix';
    mScreen.userData['textureTarget'] = 'emissive';
    registry.set('mat-screen-matrix', mScreen);

    const mapScreen = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x38bdf8, emissiveIntensity: 2.0, roughness: 0.2 });
    mapScreen.userData['mapId'] = 'tex-screen-map';
    mapScreen.userData['textureTarget'] = 'emissive';
    registry.set('mat-screen-map', mapScreen);

    const srvFace = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4, metalness: 0.8, emissive: 0xffffff, emissiveIntensity: 1.0 });
    srvFace.userData['mapId'] = 'tex-server-rack';
    srvFace.userData['textureTarget'] = 'emissive';
    registry.set('mat-server-face', srvFace);

    // Sci-Fi Details (Hard Realism)
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.4, metalness: 0.8 });
    pipeMat.userData['mapId'] = 'tex-metal-scratched';
    pipeMat.userData['normalMapId'] = 'tex-metal-normal';
    registry.set('mat-scifi-pipe', pipeMat);

    const ventMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.7, metalness: 0.5 });
    ventMat.userData['mapId'] = 'tex-vent';
    registry.set('mat-scifi-vent', ventMat);

    // Optimization: Removed Triplanar mapping injection.
}
