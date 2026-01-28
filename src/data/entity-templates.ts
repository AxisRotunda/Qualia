
import * as THREE from 'three';

export interface EntityTemplate {
  id: string;
  label: string;
  geometry: 'box' | 'cylinder' | 'sphere' | 'mesh';
  meshId?: string;
  physicsShape?: 'box' | 'cylinder' | 'capsule' | 'sphere'; 
  size: THREE.Vector3;
  materialId?: string;
  color?: number;
  mass: number;
  friction: number;
  restitution: number;
  tags: string[];
}

export const ENTITY_TEMPLATES: EntityTemplate[] = [
    { id: 'building-small', label: 'Small Building', geometry: 'box',
      size: new THREE.Vector3(4, 6, 4), materialId: 'mat-concrete',
      mass: 0, friction: 0.6, restitution: 0.1, tags: ['building'] },
    
    { id: 'building-tall', label: 'Tower', geometry: 'box',
      size: new THREE.Vector3(6, 20, 6), materialId: 'mat-metal',
      mass: 0, friction: 0.6, restitution: 0.1, tags: ['building'] },
      
    { id: 'building-wide', label: 'Warehouse', geometry: 'box',
      size: new THREE.Vector3(15, 5, 10), materialId: 'mat-concrete',
      mass: 0, friction: 0.6, restitution: 0.1, tags: ['building'] },

    { id: 'structure-ramp', label: 'Ramp', geometry: 'box',
      size: new THREE.Vector3(10, 0.5, 20), materialId: 'mat-metal',
      mass: 0, friction: 0.1, restitution: 0, tags: ['structure'] },

    { id: 'terrain-road', label: 'Road Segment', geometry: 'box',
      size: new THREE.Vector3(20, 0.2, 8), materialId: 'mat-road',
      mass: 0, friction: 0.8, restitution: 0.05, tags: ['terrain'] },
    
    { id: 'terrain-platform', label: 'Platform', geometry: 'box',
      size: new THREE.Vector3(10, 0.5, 10), materialId: 'mat-metal',
      mass: 0, friction: 0.7, restitution: 0.2, tags: ['terrain'] },
      
    { id: 'terrain-ice', label: 'Ice Patch', geometry: 'box',
      size: new THREE.Vector3(20, 0.5, 20), materialId: 'mat-ice',
      mass: 0, friction: 0.05, restitution: 0.1, tags: ['terrain', 'ice'] },

    { id: 'prop-crate', label: 'Crate', geometry: 'box',
      size: new THREE.Vector3(1.5, 1.5, 1.5), materialId: 'mat-wood',
      mass: 30, friction: 0.6, restitution: 0.1, tags: ['prop', 'dynamic'] },
    
    { id: 'prop-barrel', label: 'Barrel', geometry: 'cylinder',
      size: new THREE.Vector3(0.8, 1.8, 0.8), materialId: 'mat-hazard',
      mass: 20, friction: 0.4, restitution: 0.3, tags: ['prop', 'dynamic'] },
      
    { id: 'prop-pillar', label: 'Pillar', geometry: 'cylinder',
      size: new THREE.Vector3(1, 8, 1), materialId: 'mat-concrete',
      mass: 0, friction: 0.5, restitution: 0.1, tags: ['prop', 'static'] },
      
    { id: 'prop-glass-block', label: 'Glass Cube', geometry: 'box',
      size: new THREE.Vector3(2, 2, 2), materialId: 'mat-glass',
      mass: 10, friction: 0.2, restitution: 0.4, tags: ['prop', 'dynamic'] },

    // Legacy Props
    { id: 'prop-tree', label: 'Tree (Primitive)', geometry: 'cylinder',
      size: new THREE.Vector3(0.8, 8, 0.8), materialId: 'mat-forest',
      mass: 0, friction: 1.0, restitution: 0.0, tags: ['prop', 'static', 'forest'] },

    { id: 'prop-ice-block', label: 'Ice Cube', geometry: 'box',
      size: new THREE.Vector3(2, 2, 2), materialId: 'mat-ice',
      mass: 10, friction: 0.02, restitution: 0.3, tags: ['prop', 'dynamic', 'ice'] },

    // Procedural "Hero" Assets
    { id: 'hero-tree', label: 'Oak Tree', geometry: 'mesh', meshId: 'tree-01', 
      physicsShape: 'capsule', size: new THREE.Vector3(0.4, 4, 0), // Radius, Height
      mass: 0, friction: 1.0, restitution: 0.0, tags: ['forest', 'hero'] 
    },
    { id: 'hero-rock', label: 'Granite Rock', geometry: 'mesh', meshId: 'rock-01', 
      physicsShape: 'sphere', size: new THREE.Vector3(1.2, 0, 0),
      mass: 500, friction: 0.8, restitution: 0.1, tags: ['prop', 'hero'] 
    },
    { id: 'hero-ice-chunk', label: 'Ice Spire', geometry: 'mesh', meshId: 'ice-01', 
      physicsShape: 'cylinder', size: new THREE.Vector3(0.8, 2, 0),
      mass: 100, friction: 0.05, restitution: 0.1, tags: ['prop', 'hero'] 
    },
    { id: 'prop-log', label: 'Fallen Log', geometry: 'mesh', meshId: 'log-01',
      physicsShape: 'cylinder', size: new THREE.Vector3(0.3, 3, 0),
      mass: 40, friction: 0.8, restitution: 0.1, tags: ['prop', 'forest']
    }
];
