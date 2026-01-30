
import * as THREE from 'three';
import { EntityTemplate } from '../entity-types';

export const PROP_TEMPLATES: EntityTemplate[] = [
    { id: 'prop-column-ornate', label: 'Column (Marble)', category: 'prop', icon: 'view_column',
      geometry: 'mesh', meshId: 'gen-column-ornate',
      physicsShape: 'cylinder', size: new THREE.Vector3(1.2, 5, 1.2),
      mass: 0, friction: 0.5, restitution: 0.1, tags: ['prop', 'static', 'interior'] },

    { id: 'prop-sofa', label: 'Lounge Sofa', category: 'prop', icon: 'chair',
      geometry: 'mesh', meshId: 'gen-sofa-01',
      physicsShape: 'convex-hull', size: new THREE.Vector3(2, 0.8, 1),
      mass: 85, friction: 0.9, restitution: 0.1, tags: ['prop', 'furniture'] },

    { id: 'prop-chandelier', label: 'Chandelier', category: 'prop', icon: 'light',
      geometry: 'mesh', meshId: 'gen-chandelier-01',
      physicsShape: 'convex-hull', size: new THREE.Vector3(1.5, 2, 1.5),
      mass: 0, friction: 0.2, restitution: 0.2, tags: ['prop', 'furniture', 'light'] },

    // Agency Props
    { id: 'prop-server-rack', label: 'Server Rack', category: 'prop', icon: 'dns',
      geometry: 'mesh', meshId: 'gen-server-rack',
      physicsShape: 'box', size: new THREE.Vector3(0.8, 2.2, 1.0),
      mass: 350, friction: 0.6, restitution: 0.05, tags: ['prop', 'tech'] }, // Heavy electronics

    { id: 'prop-desk-agency', label: 'Workstation', category: 'prop', icon: 'desk',
      geometry: 'mesh', meshId: 'gen-desk-agency',
      physicsShape: 'trimesh', size: new THREE.Vector3(1.6, 0.75, 0.8), // Trimesh for leg gap
      mass: 60, friction: 0.7, restitution: 0.1, tags: ['prop', 'furniture'] },

    { id: 'prop-monitor-triple', label: 'Monitors (3x)', category: 'prop', icon: 'monitor',
      geometry: 'mesh', meshId: 'gen-monitor-cluster',
      physicsShape: 'convex-hull', size: new THREE.Vector3(1.5, 0.5, 0.3),
      mass: 15, friction: 0.5, restitution: 0.1, tags: ['prop', 'tech'] },

    { id: 'prop-file-cabinet', label: 'File Cabinet', category: 'prop', icon: 'folder_open',
      geometry: 'mesh', meshId: 'gen-file-cabinet',
      physicsShape: 'box', size: new THREE.Vector3(0.5, 1.4, 0.6),
      mass: 80, friction: 0.5, restitution: 0.1, tags: ['prop', 'furniture'] },

    { id: 'prop-table-map', label: 'War Room Table', category: 'prop', icon: 'table_view',
      geometry: 'mesh', meshId: 'gen-table-map',
      physicsShape: 'box', size: new THREE.Vector3(3.0, 0.9, 2.0),
      mass: 400, friction: 0.7, restitution: 0.1, tags: ['prop', 'furniture', 'tech'] },

    { id: 'prop-ceiling-light', label: 'Office Light', category: 'prop', icon: 'wb_incandescent',
      geometry: 'mesh', meshId: 'gen-ceiling-light',
      physicsShape: 'box', size: new THREE.Vector3(2.0, 0.1, 0.4),
      mass: 5, friction: 0.5, restitution: 0.1, tags: ['prop', 'light'] },

    { id: 'prop-elevator-button', label: 'Button', category: 'prop', icon: 'radio_button_checked',
      geometry: 'box', size: new THREE.Vector3(0.1, 0.1, 0.05), color: 0xef4444,
      mass: 0, friction: 0.5, restitution: 0.1, tags: ['prop', 'interactable', 'button'] },

    // Generic Props
    { id: 'prop-crate', label: 'Crate', category: 'prop', icon: 'package_2',
      geometry: 'box', size: new THREE.Vector3(1.5, 1.5, 1.5), materialId: 'mat-wood',
      mass: 150, friction: 0.7, restitution: 0.1, tags: ['prop', 'dynamic'] }, // ~1.5m3 wood/content
    
    { id: 'prop-barrel', label: 'Barrel', category: 'prop', icon: 'oil_barrel',
      geometry: 'cylinder', size: new THREE.Vector3(0.8, 1.8, 0.8), materialId: 'mat-hazard',
      mass: 120, friction: 0.4, restitution: 0.2, tags: ['prop', 'dynamic'] }, // Filled liquid
      
    { id: 'prop-pillar', label: 'Pillar', category: 'prop', icon: 'view_column',
      geometry: 'cylinder', size: new THREE.Vector3(1, 8, 1), materialId: 'mat-concrete',
      mass: 0, friction: 0.8, restitution: 0.1, tags: ['prop', 'static'] },
      
    { id: 'prop-glass-block', label: 'Glass Cube', category: 'prop', icon: 'check_box_outline_blank',
      geometry: 'box', size: new THREE.Vector3(2, 2, 2), materialId: 'mat-glass',
      mass: 100, friction: 0.3, restitution: 0.4, tags: ['prop', 'dynamic'] }, // Heavy glass/acrylic

    { id: 'prop-ice-block', label: 'Ice Cube', category: 'prop', icon: 'icecream',
      geometry: 'box', size: new THREE.Vector3(2, 2, 2), materialId: 'mat-ice',
      mass: 500, friction: 0.02, restitution: 0.1, tags: ['prop', 'dynamic', 'ice'] }, // Dense ice (very heavy, low friction)

    { id: 'structure-monolith', label: 'Alien Monolith', category: 'prop', icon: 'ad_units',
      geometry: 'box', size: new THREE.Vector3(4, 9, 1), materialId: 'mat-void',
      mass: 10000, friction: 0.1, restitution: 0, tags: ['prop', 'hero', 'static'] },

    { id: 'prop-sensor-unit', label: 'Sensor Unit', category: 'prop', icon: 'settings_input_antenna',
      geometry: 'cone', size: new THREE.Vector3(0.5, 1.2, 0.5), color: 0xe2e8f0,
      mass: 25, friction: 0.5, restitution: 0.2, tags: ['prop', 'dynamic'] },
];
