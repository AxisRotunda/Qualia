
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { EngineService } from './engine.service';
import { Entity } from '../engine/core';

export interface EntityTemplate {
  id: string;
  label: string;
  geometry: 'box' | 'cylinder' | 'sphere';
  size: THREE.Vector3; // For cylinder: x=radiusTop, y=height, z=radiusBottom (unused)
  color: number;
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
      size: new THREE.Vector3(4, 6, 4), color: 0x334155,
      mass: 0, friction: 0.6, restitution: 0.1, tags: ['building'] },
    
    { id: 'building-tall', label: 'Tower', geometry: 'box',
      size: new THREE.Vector3(6, 20, 6), color: 0x475569,
      mass: 0, friction: 0.6, restitution: 0.1, tags: ['building'] },
      
    { id: 'building-wide', label: 'Warehouse', geometry: 'box',
      size: new THREE.Vector3(15, 5, 10), color: 0x1e293b,
      mass: 0, friction: 0.6, restitution: 0.1, tags: ['building'] },

    // Terrain
    { id: 'terrain-road', label: 'Road Segment', geometry: 'box',
      size: new THREE.Vector3(20, 0.2, 8), color: 0x0f172a,
      mass: 0, friction: 0.8, restitution: 0.05, tags: ['terrain'] },
    
    { id: 'terrain-platform', label: 'Platform', geometry: 'box',
      size: new THREE.Vector3(10, 0.5, 10), color: 0x64748b,
      mass: 0, friction: 0.7, restitution: 0.2, tags: ['terrain'] },

    // Props
    { id: 'prop-crate', label: 'Crate', geometry: 'box',
      size: new THREE.Vector3(1.5, 1.5, 1.5), color: 0xa16207, // brownish
      mass: 30, friction: 0.5, restitution: 0.3, tags: ['prop', 'dynamic'] },
    
    { id: 'prop-barrel', label: 'Barrel', geometry: 'cylinder',
      size: new THREE.Vector3(0.8, 1.8, 0.8), color: 0x4b5563,
      mass: 20, friction: 0.4, restitution: 0.4, tags: ['prop', 'dynamic'] },
      
    { id: 'prop-pillar', label: 'Pillar', geometry: 'cylinder',
      size: new THREE.Vector3(1, 8, 1), color: 0xcbd5e1,
      mass: 0, friction: 0.5, restitution: 0.1, tags: ['prop', 'static'] }
  ];

  spawnFromTemplate(engine: EngineService, templateId: string, position: THREE.Vector3): Entity {
    const tpl = this.templates.find(t => t.id === templateId);
    if (!tpl) throw new Error(`Template ${templateId} not found`);

    let bodyDef;
    if (tpl.geometry === 'box') {
      bodyDef = engine.physicsService.createBox(position.x, position.y, position.z, tpl.size.x, tpl.size.y, tpl.size.z, tpl.mass);
    } else if (tpl.geometry === 'cylinder') {
      // createCylinder(x, y, z, height, radius)
      // tpl.size.x is radius, tpl.size.y is height
      bodyDef = engine.physicsService.createCylinder(position.x, position.y, position.z, tpl.size.y, tpl.size.x, tpl.mass);
    } else {
       // Sphere
       bodyDef = engine.physicsService.createSphere(position.x, position.y, position.z, tpl.size.x, tpl.mass);
    }

    // Apply material props
    engine.physicsService.updateBodyMaterial(bodyDef.handle, { friction: tpl.friction, restitution: tpl.restitution });

    // Create Mesh
    const mesh = engine.sceneService.createMesh(bodyDef, tpl.color);
    
    // ECS registration
    const entity = engine.world.createEntity();
    engine.world.rigidBodies.add(entity, { handle: bodyDef.handle });
    engine.world.meshes.add(entity, { mesh });
    engine.world.transforms.add(entity, {
      position: { x: position.x, y: position.y, z: position.z },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      scale: { x: 1, y: 1, z: 1 }
    });
    engine.world.bodyDefs.add(entity, bodyDef);
    engine.world.physicsProps.add(entity, { friction: tpl.friction, restitution: tpl.restitution });
    engine.world.names.add(entity, tpl.label);

    engine.objectCount.update(c => c + 1);

    return entity;
  }

  getByTag(tag: string): EntityTemplate[] {
    return this.templates.filter(t => t.tags.includes(tag));
  }
}
    