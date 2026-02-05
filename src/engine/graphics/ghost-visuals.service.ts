
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { AssetService } from '../../services/asset.service';
import { PrimitiveRegistryService } from './primitive-registry.service';
import { EntityTemplate } from '../../data/entity-types';

@Injectable({
    providedIn: 'root'
})
export class GhostVisualsService {
    private assetService = inject(AssetService);
    private primitiveRegistry = inject(PrimitiveRegistryService);

    // Creates a visual-only representation for placement ghosting
    createGhostFromTemplate(tpl: EntityTemplate): THREE.Object3D {
        let geometry: THREE.BufferGeometry;

        if (tpl.geometry === 'mesh' && tpl.meshId) {
            geometry = this.assetService.getGeometry(tpl.meshId);
        } else {
            const type = (tpl.geometry === 'box' || tpl.geometry === 'cylinder' || tpl.geometry === 'cone') ? tpl.geometry : 'sphere';
            geometry = this.primitiveRegistry.getGhostGeometry(type, tpl.size);
        }

        const mesh = new THREE.Mesh(geometry);

        // Override material for ghost look
        const ghostMat = new THREE.MeshBasicMaterial({
            color: 0x22d3ee, // Cyan
            transparent: true,
            opacity: 0.4,
            wireframe: true,
            depthTest: false, // Always visible
            depthWrite: false
        });

        // Apply ghost material to all potential parts
        if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map(() => ghostMat);
        } else {
            mesh.material = ghostMat;
        }

        return mesh;
    }
}
