
import * as THREE from 'three';
import { EntityTemplate } from '../entity-types';

export const NATURE_TEMPLATES: EntityTemplate[] = [
    { id: 'hero-tree', label: 'Oak Tree', category: 'nature', icon: 'forest',
      geometry: 'mesh', meshId: 'tree-01', 
      physicsShape: 'capsule', size: new THREE.Vector3(0.4, 4, 0), 
      mass: 0, friction: 1.0, restitution: 0.0, tags: ['forest', 'hero'] 
    },
    { id: 'hero-rock', label: 'Granite Rock', category: 'nature', icon: 'landscape',
      geometry: 'mesh', meshId: 'rock-01', 
      physicsShape: 'convex-hull', size: new THREE.Vector3(1.2, 0, 0),
      mass: 3000, friction: 0.9, restitution: 0.05, tags: ['prop', 'hero'] // ~2500kg/m3
    },
    { id: 'hero-ice-chunk', label: 'Ice Spire', category: 'nature', icon: 'filter_hdr',
      geometry: 'mesh', meshId: 'ice-01', 
      physicsShape: 'convex-hull', size: new THREE.Vector3(0.8, 2, 0),
      mass: 900, friction: 0.03, restitution: 0.1, tags: ['prop', 'hero'] // ~900kg/m3
    },
    { id: 'prop-log', label: 'Fallen Log', category: 'nature', icon: 'nature',
      geometry: 'mesh', meshId: 'log-01',
      physicsShape: 'capsule', size: new THREE.Vector3(0.3, 3, 0),
      mass: 150, friction: 0.9, restitution: 0.1, tags: ['prop', 'forest']
    },
    { id: 'structure-elevator-shaft', label: 'Deep Shaft', category: 'terrain', icon: 'vertical_align_bottom',
      geometry: 'mesh', meshId: 'gen-elevator-shaft',
      physicsShape: 'trimesh', size: new THREE.Vector3(14, 400, 14),
      mass: 0, friction: 0.5, restitution: 0, tags: ['structure', 'elevator', 'terrain'] },
    
    // Terrain
    { id: 'terrain-road', label: 'Asphalt 15x15', category: 'terrain', icon: 'add_road',
      geometry: 'mesh', meshId: 'gen-road-straight',
      physicsShape: 'box', size: new THREE.Vector3(15, 0.4, 15), 
      mass: 0, friction: 0.9, restitution: 0.05, tags: ['terrain'] },
    
    { id: 'terrain-platform', label: 'Platform', category: 'terrain', icon: 'layers',
      geometry: 'box', size: new THREE.Vector3(10, 0.5, 10), materialId: 'mat-metal',
      mass: 0, friction: 0.7, restitution: 0.2, tags: ['terrain'] },
      
    { id: 'terrain-ice', label: 'Ice Patch', category: 'terrain', icon: 'ac_unit',
      geometry: 'box', size: new THREE.Vector3(20, 0.5, 20), materialId: 'mat-ice',
      mass: 0, friction: 0.05, restitution: 0.1, tags: ['terrain', 'ice'] },
];
