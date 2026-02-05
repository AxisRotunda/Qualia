
import * as THREE from 'three';
import { EntityTemplate } from '../entity-types';

export const SHAPE_TEMPLATES: EntityTemplate[] = [
    { id: 'util-roof-cap', label: 'Roof Cap (Utility)', category: 'shape', icon: 'crop_square',
        geometry: 'box', size: new THREE.Vector3(1, 0.2, 1), materialId: 'mat-tech-dark',
        mass: 0, friction: 0.5, restitution: 0, tags: ['utility'] },

    { id: 'shape-cone', label: 'Traffic Cone', category: 'shape', icon: 'change_history',
        geometry: 'cone', size: new THREE.Vector3(0.5, 1, 0.5), color: 0xf97316,
        mass: 5, friction: 0.5, restitution: 0.2, tags: ['prop', 'dynamic']
    },
    { id: 'shape-sphere-lg', label: 'Large Sphere', category: 'shape', icon: 'circle',
        geometry: 'sphere', size: new THREE.Vector3(2, 2, 2), materialId: 'mat-metal',
        mass: 50, friction: 0.3, restitution: 0.9, tags: ['prop', 'dynamic']
    },
    { id: 'shape-neon-cube', label: 'Neon Block', category: 'shape', icon: 'stop',
        geometry: 'box', size: new THREE.Vector3(1, 1, 1), color: 0x06b6d4,
        mass: 10, friction: 0.5, restitution: 0.5, tags: ['prop', 'dynamic']
    }
];
