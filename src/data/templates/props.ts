
import * as THREE from 'three';
import { EntityTemplate } from '../entity-types';

export const PROP_TEMPLATES: EntityTemplate[] = [
    { id: 'prop-column-ornate', label: 'Column (Marble)', category: 'prop', icon: 'view_column',
      geometry: 'mesh', meshId: 'gen-column-ornate',
      physicsShape: 'cylinder', size: new THREE.Vector3(1.2, 5, 1.2),
      mass: 0, physicsMaterial: 'rock', friction: 0.5, restitution: 0.1, tags: ['prop', 'static', 'interior', 'destructible'] },

    { id: 'prop-sofa', label: 'Lounge Sofa', category: 'prop', icon: 'chair',
      geometry: 'mesh', meshId: 'gen-sofa-01',
      physicsShape: 'convex-hull', size: new THREE.Vector3(2, 0.8, 1),
      mass: 45, physicsMaterial: 'wood', friction: 0.9, restitution: 0.1, tags: ['prop', 'furniture', 'dynamic', 'destructible'] },

    { id: 'prop-bed', label: 'Modern Bed', category: 'prop', icon: 'bed',
      geometry: 'mesh', meshId: 'gen-bed-modern',
      physicsShape: 'box', size: new THREE.Vector3(1.8, 0.6, 2.2),
      mass: 120, physicsMaterial: 'wood', friction: 0.9, restitution: 0.05, tags: ['prop', 'furniture', 'dynamic', 'heavy'] },

    { id: 'prop-chandelier', label: 'Chandelier', category: 'prop', icon: 'light',
      geometry: 'mesh', meshId: 'gen-chandelier-01',
      physicsShape: 'convex-hull', size: new THREE.Vector3(1.5, 2, 1.5),
      mass: 0, friction: 0.2, restitution: 0.2, tags: ['prop', 'furniture', 'light'] },

    // Agency Props
    { id: 'prop-server-rack', label: 'Server Rack', category: 'prop', icon: 'dns',
      geometry: 'mesh', meshId: 'gen-server-rack',
      physicsShape: 'box', size: new THREE.Vector3(0.8, 2.2, 1.0),
      mass: 150, physicsMaterial: 'metal', friction: 0.6, restitution: 0.05, tags: ['prop', 'tech', 'dynamic', 'destructible'] }, 

    { id: 'prop-desk-agency', label: 'Workstation', category: 'prop', icon: 'desk',
      geometry: 'mesh', meshId: 'gen-desk-agency',
      physicsShape: 'trimesh', size: new THREE.Vector3(1.6, 0.75, 0.8), 
      mass: 60, physicsMaterial: 'wood', friction: 0.7, restitution: 0.1, tags: ['prop', 'furniture', 'dynamic', 'destructible'] },

    { id: 'prop-monitor-triple', label: 'Monitors (3x)', category: 'prop', icon: 'monitor',
      geometry: 'mesh', meshId: 'gen-monitor-cluster',
      physicsShape: 'convex-hull', size: new THREE.Vector3(1.5, 0.5, 0.3),
      mass: 15, physicsMaterial: 'plastic', friction: 0.5, restitution: 0.1, tags: ['prop', 'tech', 'dynamic', 'fragile', 'destructible'] },

    { id: 'prop-file-cabinet', label: 'File Cabinet', category: 'prop', icon: 'folder_open',
      geometry: 'mesh', meshId: 'gen-file-cabinet',
      physicsShape: 'box', size: new THREE.Vector3(0.5, 1.4, 0.6),
      mass: 40, physicsMaterial: 'metal', friction: 0.5, restitution: 0.1, tags: ['prop', 'furniture', 'dynamic', 'destructible'] },

    { id: 'prop-table-map', label: 'War Room Table', category: 'prop', icon: 'table_view',
      geometry: 'mesh', meshId: 'gen-table-map',
      physicsShape: 'box', size: new THREE.Vector3(3.0, 0.9, 2.0),
      mass: 200, physicsMaterial: 'metal', friction: 0.7, restitution: 0.1, tags: ['prop', 'furniture', 'tech', 'dynamic'] },

    { id: 'prop-ceiling-light', label: 'Office Light', category: 'prop', icon: 'wb_incandescent',
      geometry: 'mesh', meshId: 'gen-ceiling-light',
      physicsShape: 'box', size: new THREE.Vector3(2.0, 0.1, 0.4),
      mass: 5, physicsMaterial: 'plastic', friction: 0.5, restitution: 0.1, tags: ['prop', 'light', 'dynamic', 'destructible'] },

    { id: 'prop-elevator-button', label: 'Button', category: 'prop', icon: 'radio_button_checked',
      geometry: 'box', size: new THREE.Vector3(0.1, 0.1, 0.05), color: 0xef4444,
      mass: 0, friction: 0.5, restitution: 0.1, tags: ['prop', 'interactable', 'button'] },

    // Generic Props (Industrial Standard Masses)
    { id: 'prop-crate', label: 'Ind. Crate', category: 'prop', icon: 'package_2',
      geometry: 'mesh', meshId: 'gen-prop-crate-ind',
      physicsShape: 'box', size: new THREE.Vector3(1.5, 1.5, 1.5), 
      mass: 40, physicsMaterial: 'wood', friction: 0.7, restitution: 0.1, tags: ['prop', 'dynamic', 'instanced', 'destructible'] }, 
    
    { id: 'prop-crate-fragile', label: 'Fragile Crate', category: 'prop', icon: 'inventory_2',
      geometry: 'mesh', meshId: 'gen-prop-crate-ind',
      physicsShape: 'box', size: new THREE.Vector3(1.5, 1.5, 1.5), 
      mass: 30, physicsMaterial: 'wood', friction: 0.7, restitution: 0.1, tags: ['prop', 'dynamic', 'fragile', 'destructible'] }, 

    { id: 'prop-container', label: 'ISO Container', category: 'prop', icon: 'inventory',
      geometry: 'mesh', meshId: 'gen-container-iso',
      physicsShape: 'box', size: new THREE.Vector3(2.4, 2.6, 6.0),
      mass: 2500, physicsMaterial: 'metal', friction: 0.8, restitution: 0.05, tags: ['prop', 'dynamic', 'heavy', 'instanced'] },

    { id: 'prop-glass-pane', label: 'Glass Pane', category: 'prop', icon: 'window',
      geometry: 'box', size: new THREE.Vector3(3, 2, 0.1), materialId: 'mat-glass',
      mass: 10, physicsMaterial: 'glass', friction: 0.3, restitution: 0.2, tags: ['prop', 'dynamic', 'fragile', 'destructible'] }, 

    { id: 'prop-barrel', label: 'Steel Barrel', category: 'prop', icon: 'oil_barrel',
      geometry: 'mesh', meshId: 'gen-prop-barrel-ind',
      physicsShape: 'cylinder', size: new THREE.Vector3(0.8, 1.2, 0.8),
      mass: 25, physicsMaterial: 'metal', friction: 0.5, restitution: 0.2, tags: ['prop', 'dynamic', 'instanced', 'destructible'] }, 
      
    { id: 'prop-cinderblock', label: 'Cinderblock', category: 'prop', icon: 'bricks',
      geometry: 'mesh', meshId: 'debris-cinderblock',
      physicsShape: 'box', size: new THREE.Vector3(0.4, 0.2, 0.2), 
      mass: 5, physicsMaterial: 'concrete', friction: 0.95, restitution: 0.05, tags: ['prop', 'dynamic', 'debris', 'instanced'] },

    { id: 'prop-pillar', label: 'Pillar', category: 'prop', icon: 'view_column',
      geometry: 'cylinder', size: new THREE.Vector3(1, 8, 1), materialId: 'mat-concrete',
      mass: 0, physicsMaterial: 'concrete', friction: 0.8, restitution: 0.1, tags: ['prop', 'static', 'instanced', 'destructible'] },

    { id: 'prop-pillar-highway', label: 'Highway Support', category: 'prop', icon: 'vertical_align_center',
      geometry: 'cylinder', size: new THREE.Vector3(2, 18, 2), materialId: 'mat-concrete',
      mass: 0, physicsMaterial: 'concrete', friction: 0.9, restitution: 0.1, tags: ['structure', 'infrastructure', 'instanced', 'destructible'] },
      
    { id: 'prop-glass-block', label: 'Glass Cube', category: 'prop', icon: 'check_box_outline_blank',
      geometry: 'box', size: new THREE.Vector3(2, 2, 2), materialId: 'mat-glass',
      mass: 150, physicsMaterial: 'glass', friction: 0.3, restitution: 0.15, tags: ['prop', 'dynamic', 'destructible'] },

    { id: 'prop-ice-block', label: 'Ice Cube', category: 'prop', icon: 'icecream',
      geometry: 'mesh', meshId: 'gen-ice-block',
      physicsShape: 'box', size: new THREE.Vector3(0.8, 0.8, 0.8), 
      mass: 470, physicsMaterial: 'ice', friction: 0.02, restitution: 0.1, tags: ['prop', 'dynamic', 'ice', 'destructible', 'pushable'] },

    // --- Kinetic Shard Pool (Protocol: RUN_DESTRUCTION) ---
    { id: 'prop-shard-glass', label: 'Glass Shard', category: 'prop', icon: 'fragment_poker',
      geometry: 'box', size: new THREE.Vector3(0.2, 0.2, 0.02), materialId: 'mat-glass',
      mass: 0.5, physicsMaterial: 'glass', friction: 0.2, restitution: 0.4, tags: ['debris', 'dynamic'] },

    { id: 'prop-shard-wood', label: 'Wood Splinter', category: 'prop', icon: 'straight',
      geometry: 'box', size: new THREE.Vector3(0.4, 0.05, 0.05), materialId: 'mat-wood',
      mass: 0.8, physicsMaterial: 'wood', friction: 0.8, restitution: 0.1, tags: ['debris', 'dynamic'] },

    { id: 'prop-shard-metal', label: 'Metal Scrap', category: 'prop', icon: 'hardware',
      geometry: 'box', size: new THREE.Vector3(0.3, 0.3, 0.05), materialId: 'mat-metal',
      mass: 3.5, physicsMaterial: 'metal', friction: 0.4, restitution: 0.2, tags: ['debris', 'dynamic'] },
    // ---------------------------------------------------

    { id: 'structure-monolith', label: 'Alien Monolith', category: 'prop', icon: 'ad_units',
      geometry: 'box', size: new THREE.Vector3(4, 9, 1), materialId: 'mat-void',
      mass: 100000, friction: 0.1, restitution: 0, tags: ['prop', 'hero', 'static'] },

    { id: 'prop-sensor-unit', label: 'Sensor Unit', category: 'prop', icon: 'settings_input_antenna',
      geometry: 'cone', size: new THREE.Vector3(0.5, 1.2, 0.5), color: 0xe2e8f0,
      mass: 15, physicsMaterial: 'titanium', friction: 0.5, restitution: 0.2, tags: ['prop', 'dynamic', 'instanced'] },

    // Weapons (Visual)
    { id: 'weapon-blaster', label: 'Pulse Rifle', category: 'prop', icon: 'boltz',
      geometry: 'mesh', meshId: 'gen-weapon-blaster',
      physicsShape: 'box', size: new THREE.Vector3(0.2, 0.4, 0.8),
      mass: 5, physicsMaterial: 'plastic', friction: 0.5, restitution: 0.1, tags: ['prop', 'dynamic', 'weapon'] },

    { id: 'weapon-hammer', label: 'Breacher Hammer', category: 'prop', icon: 'hammer',
      geometry: 'mesh', meshId: 'gen-weapon-hammer',
      physicsShape: 'box', size: new THREE.Vector3(0.4, 1.2, 0.4),
      mass: 15, physicsMaterial: 'metal', friction: 0.5, restitution: 0.1, tags: ['prop', 'dynamic', 'weapon'] },

    // Projectiles
    { id: 'projectile-plasma', label: 'Plasma Bolt', category: 'shape', icon: 'circle',
      geometry: 'sphere', size: new THREE.Vector3(0.08, 0.08, 0.08), materialId: 'mat-glow-blue',
      mass: 0.01, physicsMaterial: 'lead', friction: 0.0, restitution: 0.0, tags: ['projectile', 'dynamic', 'ccd'] },
];
