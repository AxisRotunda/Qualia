
import * as THREE from 'three';
import { EntityTemplate } from '../entity-types';

export const NATURE_TEMPLATES: EntityTemplate[] = [
    { id: 'hero-tree', label: 'Oak Tree', category: 'nature', icon: 'forest',
      geometry: 'mesh', meshId: 'tree-01', 
      physicsShape: 'capsule', size: new THREE.Vector3(0.4, 4, 0.4), 
      mass: 0, friction: 1.0, restitution: 0.0, tags: ['forest', 'hero'] 
    },
    { id: 'hero-pine', label: 'Pine Tree', category: 'nature', icon: 'nature_people',
      geometry: 'mesh', meshId: 'hero-pine',
      physicsShape: 'capsule', size: new THREE.Vector3(0.3, 5, 0.3),
      mass: 0, friction: 0.9, restitution: 0.0, tags: ['forest', 'pine', 'instanced']
    },
    { id: 'hero-palm', label: 'Palm Tree', category: 'nature', icon: 'forest',
      geometry: 'mesh', meshId: 'hero-palm', 
      physicsShape: 'capsule', size: new THREE.Vector3(0.8, 6, 0.8), 
      mass: 0, friction: 0.8, restitution: 0.1, tags: ['nature', 'tree'] 
    },
    { id: 'bush-tundra', label: 'Tundra Bush', category: 'nature', icon: 'grass',
      geometry: 'mesh', meshId: 'bush-tundra',
      physicsShape: 'sphere', size: new THREE.Vector3(1.2, 0.8, 1.2),
      mass: 0, friction: 0.9, restitution: 0.0, tags: ['nature', 'bush', 'instanced']
    },
    { id: 'bush-fern', label: 'Fern', category: 'nature', icon: 'yard',
      geometry: 'mesh', meshId: 'bush-fern',
      physicsShape: 'sphere', size: new THREE.Vector3(1.2, 0.6, 1.2),
      mass: 0, friction: 0.9, restitution: 0.0, tags: ['nature', 'bush', 'instanced']
    },
    { id: 'ice-spike-cluster', label: 'Ice Spikes', category: 'nature', icon: 'filter_hdr',
      geometry: 'mesh', meshId: 'ice-spike-cluster',
      physicsShape: 'cone', size: new THREE.Vector3(1.0, 1.2, 1.0),
      mass: 0, physicsMaterial: 'ice', friction: 0.1, restitution: 0.05, tags: ['prop', 'ice', 'instanced']
    },
    { id: 'ice-golem', label: 'Ice Golem', category: 'nature', icon: 'smart_toy',
      geometry: 'mesh', meshId: 'ice-golem',
      physicsShape: 'capsule', size: new THREE.Vector3(1.5, 2.5, 1.5),
      mass: 800, physicsMaterial: 'ice', friction: 0.3, restitution: 0.0, tags: ['actor', 'ice', 'heavy', 'destructible']
    },
    { id: 'fauna-penguin', label: 'Penguin', category: 'nature', icon: 'cruelty_free',
      geometry: 'mesh', meshId: 'actor-penguin',
      physicsShape: 'capsule', size: new THREE.Vector3(0.5, 0.8, 0.5),
      mass: 35, physicsMaterial: 'wood', friction: 0.5, restitution: 0.0, tags: ['actor', 'animal', 'mobile', 'soft', 'pushable']
    },
    { id: 'hero-rock', label: 'Granite Rock', category: 'nature', icon: 'landscape',
      geometry: 'mesh', meshId: 'rock-01', 
      physicsShape: 'convex-hull', size: new THREE.Vector3(1.2, 1.2, 1.2),
      mass: -1, physicsMaterial: 'rock', friction: 0.9, restitution: 0.05, tags: ['prop', 'hero'] 
    },
    { id: 'rock-sandstone', label: 'Sandstone Rock', category: 'nature', icon: 'landscape',
      geometry: 'mesh', meshId: 'rock-sandstone',
      physicsShape: 'convex-hull', size: new THREE.Vector3(1.5, 1.5, 1.5),
      mass: -1, physicsMaterial: 'sandstone', friction: 1.0, restitution: 0.01, tags: ['prop', 'rock']
    },
    { id: 'hero-ice-chunk', label: 'Ice Shard', category: 'nature', icon: 'filter_hdr',
      geometry: 'mesh', meshId: 'ice-01', 
      physicsShape: 'convex-hull', size: new THREE.Vector3(0.8, 2, 0.8),
      mass: -1, physicsMaterial: 'ice', friction: 0.02, restitution: 0.05, tags: ['prop', 'hero'] 
    },
    { id: 'hero-ice-spire', label: 'Glacial Spire', category: 'nature', icon: 'filter_hdr',
      geometry: 'mesh', meshId: 'ice-spire-lg',
      physicsShape: 'cylinder', size: new THREE.Vector3(6, 25, 6),
      mass: -1, physicsMaterial: 'ice', friction: 0.1, restitution: 0.05, tags: ['prop', 'hero', 'ice']
    },
    { id: 'prop-log', label: 'Fallen Log', category: 'nature', icon: 'nature',
      geometry: 'mesh', meshId: 'log-01',
      physicsShape: 'capsule', size: new THREE.Vector3(0.3, 3, 0.3),
      mass: -1, physicsMaterial: 'wood', friction: 0.7, restitution: 0.1, tags: ['prop', 'forest']
    },
    { id: 'structure-elevator-shaft', label: 'Deep Shaft', category: 'terrain', icon: 'vertical_align_bottom',
      geometry: 'mesh', meshId: 'gen-elevator-shaft',
      physicsShape: 'trimesh', size: new THREE.Vector3(14, 400, 14),
      mass: 0, physicsMaterial: 'concrete', friction: 0.9, restitution: 0, tags: ['structure', 'elevator', 'terrain'] },
    
    // Terrain
    { id: 'terrain-road', label: 'Asphalt 15x15', category: 'terrain', icon: 'add_road',
      geometry: 'mesh', meshId: 'gen-road-straight',
      physicsShape: 'box', size: new THREE.Vector3(15, 0.4, 15), 
      mass: 0, physicsMaterial: 'concrete', friction: 0.9, restitution: 0.05, tags: ['terrain', 'instanced'] },
    
    { id: 'terrain-highway', label: 'Highway Seg', category: 'terrain', icon: 'directions_car',
      geometry: 'mesh', meshId: 'gen-road-highway',
      physicsShape: 'trimesh', size: new THREE.Vector3(12, 1.5, 30),
      mass: 0, physicsMaterial: 'concrete', friction: 0.9, restitution: 0.05, tags: ['terrain', 'infrastructure', 'instanced'] },

    { id: 'terrain-intersection', label: 'Intersection 4-Way', category: 'terrain', icon: 'hub',
      geometry: 'mesh', meshId: 'gen-road-intersection',
      physicsShape: 'trimesh', size: new THREE.Vector3(15, 0.3, 15),
      mass: 0, physicsMaterial: 'concrete', friction: 0.9, restitution: 0.05, tags: ['terrain', 'infrastructure', 'instanced'] },

    { id: 'terrain-ramp', label: 'Highway Ramp', category: 'terrain', icon: 'trending_up',
      geometry: 'mesh', meshId: 'gen-road-ramp',
      physicsShape: 'trimesh', size: new THREE.Vector3(12, 8, 30),
      mass: 0, physicsMaterial: 'concrete', friction: 0.9, restitution: 0.05, tags: ['terrain', 'infrastructure', 'instanced'] },

    { id: 'terrain-roundabout', label: 'Roundabout', category: 'terrain', icon: 'refresh',
      geometry: 'mesh', meshId: 'gen-road-roundabout',
      physicsShape: 'trimesh', size: new THREE.Vector3(24, 0.3, 24),
      mass: 0, physicsMaterial: 'concrete', friction: 0.9, restitution: 0.05, tags: ['terrain', 'infrastructure', 'instanced'] },
    
    { id: 'terrain-platform', label: 'Platform', category: 'terrain', icon: 'layers',
      geometry: 'mesh', meshId: 'gen-platform',
      physicsShape: 'box', size: new THREE.Vector3(10, 0.5, 10), 
      mass: 0, physicsMaterial: 'metal', friction: 0.7, restitution: 0.2, tags: ['terrain', 'instanced'] },
      
    { id: 'terrain-ice', label: 'Ice Patch', category: 'terrain', icon: 'ac_unit',
      geometry: 'box', size: new THREE.Vector3(20, 0.5, 20), materialId: 'mat-ice',
      mass: 0, physicsMaterial: 'ice', friction: 0.02, restitution: 0.05, tags: ['terrain', 'ice'] },

    { id: 'terrain-soil', label: 'Forest Floor', category: 'terrain', icon: 'grass',
      geometry: 'mesh', meshId: 'terrain-soil-lg',
      physicsShape: 'box', size: new THREE.Vector3(200, 0.5, 200),
      mass: 0, physicsMaterial: 'default', friction: 0.8, restitution: 0.1, tags: ['terrain', 'soil'] },
      
    // Water
    { id: 'terrain-water-lg', label: 'Water (Small)', category: 'terrain', icon: 'water_drop',
      geometry: 'mesh', meshId: 'terrain-water-lg',
      physicsShape: 'box', size: new THREE.Vector3(500, 1, 500), 
      mass: 0, friction: 0.1, restitution: 0.0, tags: ['terrain', 'water'] },
      
    { id: 'terrain-water-ocean', label: 'Ocean Plane', category: 'terrain', icon: 'water',
      geometry: 'mesh', meshId: 'terrain-water-ocean',
      physicsShape: 'box', size: new THREE.Vector3(1200, 1, 1200), 
      mass: 0, friction: 0.1, restitution: 0.0, tags: ['terrain', 'water'] },
];
