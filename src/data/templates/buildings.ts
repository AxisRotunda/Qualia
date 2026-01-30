
import * as THREE from 'three';
import { EntityTemplate } from '../entity-types';

// Buildings are now Heavy Dynamic objects with Locked Rotation.
// This allows them to fall (gravity), slide/push (collisions), but not tip over.
const BUILDING_MASS = 50000; 

export const BUILDING_TEMPLATES: EntityTemplate[] = [
    { id: 'building-small', label: 'Commercial Block', category: 'building', icon: 'location_city',
      geometry: 'mesh', meshId: 'gen-building-small', 
      physicsShape: 'box', size: new THREE.Vector3(5, 8, 5), 
      mass: BUILDING_MASS, lockRotation: true, friction: 0.8, restitution: 0.0, tags: ['building'] },
    
    { id: 'building-tall', label: 'Office Tower', category: 'building', icon: 'business',
      geometry: 'mesh', meshId: 'gen-building-tall',
      physicsShape: 'box', size: new THREE.Vector3(6, 25, 6),
      mass: BUILDING_MASS * 2, lockRotation: true, friction: 0.8, restitution: 0.0, tags: ['building'] },
      
    { id: 'building-wide', label: 'Warehouse', category: 'building', icon: 'store',
      geometry: 'mesh', meshId: 'gen-building-wide',
      physicsShape: 'box', size: new THREE.Vector3(15, 6, 12),
      mass: BUILDING_MASS, lockRotation: true, friction: 0.8, restitution: 0.0, tags: ['building'] },

    { id: 'building-skyscraper', label: 'Skyscraper', category: 'building', icon: 'domain',
      geometry: 'mesh', meshId: 'gen-building-skyscraper',
      physicsShape: 'box', size: new THREE.Vector3(8, 45, 8),
      mass: BUILDING_MASS * 3, lockRotation: true, friction: 0.8, restitution: 0.0, tags: ['building'] },

    { id: 'structure-ramp', label: 'Ramp', category: 'building', icon: 'signal_cellular_0_bar',
      geometry: 'box', size: new THREE.Vector3(10, 0.5, 20), materialId: 'mat-metal',
      mass: 2000, lockRotation: true, friction: 0.5, restitution: 0, tags: ['structure'] },

    { id: 'structure-research-station', label: 'Outpost Alpha', category: 'building', icon: 'science',
      geometry: 'mesh', meshId: 'research-station-01',
      physicsShape: 'trimesh', size: new THREE.Vector3(6, 5, 4), 
      mass: 0, friction: 0.5, restitution: 0.1, tags: ['building'] }, // Trimesh must be static
      
    // Interior Structures (Walls etc generally remain static or use trimesh)
    { id: 'structure-wall-interior', label: 'Grand Wall (4m)', category: 'building', icon: 'wall',
      geometry: 'mesh', meshId: 'gen-wall-seg-4m',
      physicsShape: 'box', size: new THREE.Vector3(4, 5, 0.4),
      mass: 500, lockRotation: true, friction: 0.5, restitution: 0, tags: ['structure', 'interior'] },

    { id: 'structure-glass-partition', label: 'Glass Partition', category: 'building', icon: 'window',
      geometry: 'mesh', meshId: 'gen-glass-partition',
      physicsShape: 'trimesh', size: new THREE.Vector3(4, 5, 0.15),
      mass: 0, friction: 0.2, restitution: 0.1, tags: ['structure', 'interior', 'glass'] },

    { id: 'structure-floor-marble', label: 'Marble Slab', category: 'building', icon: 'grid_view',
      geometry: 'box', size: new THREE.Vector3(4, 0.2, 4), materialId: 'mat-marble',
      mass: 0, friction: 0.4, restitution: 0.0, tags: ['structure', 'interior'] }, // Floor usually static
      
    { id: 'structure-staircase', label: 'Marble Stairs', category: 'building', icon: 'stairs',
      geometry: 'mesh', meshId: 'gen-staircase-4m',
      physicsShape: 'trimesh', size: new THREE.Vector3(4, 2.5, 8),
      mass: 0, friction: 0.6, restitution: 0.0, tags: ['structure', 'interior'] },

    { id: 'structure-railing', label: 'Ornate Railing', category: 'building', icon: 'fence',
      geometry: 'mesh', meshId: 'gen-railing-4m',
      physicsShape: 'trimesh', size: new THREE.Vector3(4, 1.0, 0.15),
      mass: 0, friction: 0.2, restitution: 0.0, tags: ['structure', 'interior'] },

    { id: 'structure-ceiling', label: 'Coffered Ceiling', category: 'building', icon: 'grid_goldenratio',
      geometry: 'mesh', meshId: 'gen-ceiling-panel',
      physicsShape: 'box', size: new THREE.Vector3(4, 0.2, 4),
      mass: 0, friction: 0.5, restitution: 0.0, tags: ['structure', 'interior'] },

    { id: 'structure-floor-linoleum', label: 'Linoleum Floor', category: 'building', icon: 'grid_view',
      geometry: 'box', size: new THREE.Vector3(4, 0.2, 4), materialId: 'mat-linoleum',
      mass: 0, friction: 0.6, restitution: 0.1, tags: ['structure', 'interior'] },

    // Elevator Assets
    { id: 'structure-elevator-cabin', label: 'Elevator Cabin', category: 'building', icon: 'elevator',
      geometry: 'mesh', meshId: 'gen-elevator-cabin',
      physicsShape: 'trimesh', size: new THREE.Vector3(4, 3, 4),
      mass: 0, friction: 0.5, restitution: 0, tags: ['structure', 'elevator', 'static'] },

    // Sci-Fi Structure
    { id: 'scifi-corridor', label: 'Ship Corridor', category: 'building', icon: 'view_agenda',
      geometry: 'mesh', meshId: 'gen-scifi-corridor',
      physicsShape: 'trimesh', size: new THREE.Vector3(6, 5, 12),
      mass: 0, friction: 0.5, restitution: 0, tags: ['structure', 'scifi'] },

    { id: 'scifi-hub', label: 'Envoy Bridge', category: 'building', icon: 'hub',
      geometry: 'mesh', meshId: 'gen-scifi-hub',
      physicsShape: 'trimesh', size: new THREE.Vector3(18, 8, 18),
      mass: 0, friction: 0.5, restitution: 0, tags: ['structure', 'scifi'] },
];
