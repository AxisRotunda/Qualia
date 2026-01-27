
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { EngineService } from './engine.service';
import { SceneService } from './scene.service';
import { Entity } from '../engine/core';

export interface EntityTemplate {
  id: string;
  label: string;
  geometry: 'box' | 'cylinder' | 'sphere';
  size: THREE.Vector3; // For cylinder: x=radiusTop, y=height
  materialId?: string;
  color?: number; // Fallback
  mass: number;
  friction: number;
  restitution: number;
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class EntityLibraryService {
  
  readonly templates: EntityTemplate[] = [
    // Buildings
    { id: 'building-small', label: 'Small Building', geometry: 'box',
      size: new THREE.Vector3(4, 6, 4), materialId: 'mat-concrete',
      mass: 0, friction: 0.6, restitution: 0.1, tags: ['building'] },
    
    { id: 'building-tall', label: 'Tower', geometry: 'box',
      size: new THREE.Vector3(6, 20, 6), materialId: 'mat-metal',
      mass: 0, friction: 0.6, restitution: 0.1, tags: ['building'] },
      
    { id: 'building-wide', label: 'Warehouse', geometry: 'box',
      size: new THREE.Vector3(15, 5, 10), materialId: 'mat-concrete',
      mass: 0, friction: 0.6, restitution: 0.1, tags: ['building'] },

    // Structures
    { id: 'structure-ramp', label: 'Ramp', geometry: 'box',
      size: new THREE.Vector3(10, 0.5, 20), materialId: 'mat-metal',
      mass: 0, friction: 0.1, restitution: 0, tags: ['structure'] },

    // Terrain
    { id: 'terrain-road', label: 'Road Segment', geometry: 'box',
      size: new THREE.Vector3(20, 0.2, 8), materialId: 'mat-road',
      mass: 0, friction: 0.8, restitution: 0.05, tags: ['terrain'] },
    
    { id: 'terrain-platform', label: 'Platform', geometry: 'box',
      size: new THREE.Vector3(10, 0.5, 10), materialId: 'mat-metal',
      mass: 0, friction: 0.7, restitution: 0.2, tags: ['terrain'] },
      
    // Ice Terrain - Low friction
    { id: 'terrain-ice', label: 'Ice Patch', geometry: 'box',
      size: new THREE.Vector3(20, 0.5, 20), materialId: 'mat-ice',
      mass: 0, friction: 0.05, restitution: 0.1, tags: ['terrain', 'ice'] },

    // Props
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

    // Forest Props - High friction to "settle"
    { id: 'prop-tree', label: 'Tree', geometry: 'cylinder',
      size: new THREE.Vector3(0.8, 8, 0.8), materialId: 'mat-forest',
      mass: 0, friction: 1.0, restitution: 0.0, tags: ['prop', 'static', 'forest'] },

    { id: 'prop-log', label: 'Log', geometry: 'cylinder',
      size: new THREE.Vector3(0.6, 4, 0.6), materialId: 'mat-wood',
      mass: 15, friction: 0.9, restitution: 0.05, tags: ['prop', 'dynamic', 'forest'] },

    // Ice Props - Very slippery
    { id: 'prop-ice-block', label: 'Ice Cube', geometry: 'box',
      size: new THREE.Vector3(2, 2, 2), materialId: 'mat-ice',
      mass: 10, friction: 0.02, restitution: 0.3, tags: ['prop', 'dynamic', 'ice'] }
  ];

  validateTemplates(sceneService: SceneService) {
    const texturableMaterials = ['mat-road', 'mat-ground', 'mat-forest'];
    
    this.templates.forEach(tpl => {
      // 1. Material Existence
      if (tpl.materialId && !sceneService.hasMaterial(tpl.materialId)) {
        console.warn(`[Validation Warning] Template '${tpl.id}' references missing material '${tpl.materialId}'`);
      }
      
      // 2. Geometry Support
      if (!['box', 'sphere', 'cylinder'].includes(tpl.geometry)) {
         console.error(`[Validation Error] Template '${tpl.id}' uses unsupported geometry '${tpl.geometry}'`);
      }

      // 3. Texture Semantic Validation
      // Ensure small props don't accidentally use heavy terrain textures if we ever assign them
      if (tpl.materialId && texturableMaterials.includes(tpl.materialId)) {
          const isTerrain = tpl.tags.includes('terrain');
          const isLarge = tpl.size.x > 5 || tpl.size.z > 5;
          if (!isTerrain && !isLarge) {
              console.warn(`[Validation Warning] Template '${tpl.id}' uses texture-heavy material '${tpl.materialId}' but is not a terrain/large object.`);
          }
      }
    });
  }

  spawnFromTemplate(engine: EngineService, templateId: string, position: THREE.Vector3, rotation?: THREE.Quaternion): Entity {
    const tpl = this.templates.find(t => t.id === templateId);
    if (!tpl) throw new Error(`Template ${templateId} not found`);

    let bodyDef;
    if (tpl.geometry === 'box') {
      bodyDef = engine.physicsService.createBox(position.x, position.y, position.z, tpl.size.x, tpl.size.y, tpl.size.z, tpl.mass);
    } else if (tpl.geometry === 'cylinder') {
      bodyDef = engine.physicsService.createCylinder(position.x, position.y, position.z, tpl.size.y, tpl.size.x, tpl.mass);
    } else {
       bodyDef = engine.physicsService.createSphere(position.x, position.y, position.z, tpl.size.x, tpl.mass);
    }

    if (rotation) {
        // Apply rotation to physics body
        engine.physicsService.updateBodyTransform(bodyDef.handle, bodyDef.position, {x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w});
        // Update bodyDef rotation for consistency (though bodyDef is mostly for creation record)
        bodyDef.rotation = {x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w};
    }

    engine.physicsService.updateBodyMaterial(bodyDef.handle, { friction: tpl.friction, restitution: tpl.restitution });

    const mesh = engine.sceneService.createMesh(bodyDef, { color: tpl.color, materialId: tpl.materialId });
    // Mesh rotation will be synced by engine loop or set here
    mesh.quaternion.copy(rotation || new THREE.Quaternion());
    
    const entity = engine.world.createEntity();
    engine.world.rigidBodies.add(entity, { handle: bodyDef.handle });
    engine.world.meshes.add(entity, { mesh });
    engine.world.transforms.add(entity, {
      position: { x: position.x, y: position.y, z: position.z },
      rotation: { x: mesh.quaternion.x, y: mesh.quaternion.y, z: mesh.quaternion.z, w: mesh.quaternion.w },
      scale: { x: 1, y: 1, z: 1 }
    });
    engine.world.bodyDefs.add(entity, bodyDef);
    engine.world.physicsProps.add(entity, { friction: tpl.friction, restitution: tpl.restitution });
    engine.world.names.add(entity, tpl.label);
    engine.world.templateIds.add(entity, tpl.id);

    engine.objectCount.update(c => c + 1);

    return entity;
  }
}
