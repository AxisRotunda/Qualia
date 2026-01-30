
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { PhysicsBodyDef } from '../physics.service';
import { ShapesFactory } from '../../physics/shapes.factory';
import { EntityTemplate } from '../../data/entity-types';

@Injectable({
  providedIn: 'root'
})
export class PhysicsFactoryService {
  private shapes = inject(ShapesFactory);

  createBox(x: number, y: number, z: number, w?: number, h?: number, d?: number, mass?: number): PhysicsBodyDef {
      return this.shapes.createBox(x, y, z, w, h, d, mass);
  }

  createSphere(x: number, y: number, z: number, r?: number, mass?: number): PhysicsBodyDef {
      return this.shapes.createSphere(x, y, z, r, mass);
  }

  createCylinder(x: number, y: number, z: number, height: number, radius: number, mass: number = 1): PhysicsBodyDef {
      return this.shapes.createCylinder(x, y, z, height, radius, mass);
  }

  createCone(x: number, y: number, z: number, height: number, radius: number, mass: number = 1): PhysicsBodyDef {
      return this.shapes.createCone(x, y, z, height, radius, mass);
  }

  createTrimeshFromGeometry(geometry: THREE.BufferGeometry, x: number, y: number, z: number): PhysicsBodyDef {
      const geo = this.ensureIndexed(geometry);
      const vertices = geo.getAttribute('position').array as Float32Array;
      const indices = geo.index!.array as Uint32Array;

      return this.shapes.createTrimesh(x, y, z, vertices, indices);
  }

  createConvexHullFromGeometry(geometry: THREE.BufferGeometry, x: number, y: number, z: number, mass: number): PhysicsBodyDef {
      const geo = this.ensureIndexed(geometry);
      const vertices = geo.getAttribute('position').array as Float32Array;
      
      return this.shapes.createConvexHull(x, y, z, vertices, mass);
  }

  private ensureIndexed(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
      let geo = geometry;
      if (!geo.index) {
          geo = BufferUtils.mergeVertices(geo);
          if (!geo.index) {
              const pos = geo.getAttribute('position');
              const indices = [];
              for(let i=0; i<pos.count; i++) indices.push(i);
              geo.setIndex(indices);
          }
      }
      return geo;
  }

  createFromTemplate(tpl: EntityTemplate, x: number, y: number, z: number, geometry?: THREE.BufferGeometry): PhysicsBodyDef {
      if (tpl.geometry === 'mesh') {
          // Complex mesh shapes
          if (tpl.physicsShape === 'convex-hull' && geometry) {
               return this.createConvexHullFromGeometry(geometry, x, y, z, tpl.mass);
          } else if (tpl.physicsShape === 'trimesh' && geometry) {
               return this.createTrimeshFromGeometry(geometry, x, y, z);
          } else if (tpl.physicsShape === 'capsule' || tpl.physicsShape === 'cylinder') {
               return this.createCylinder(x, y + (tpl.size.y/2), z, tpl.size.y, tpl.size.x, tpl.mass);
          } else if (tpl.physicsShape === 'sphere') {
               return this.createSphere(x, y, z, tpl.size.x, tpl.mass);
          } else if (tpl.physicsShape === 'cone') {
               return this.createCone(x, y + (tpl.size.y/2), z, tpl.size.y, tpl.size.x, tpl.mass);
          } else {
               // Default fallback for meshes
               return this.createBox(x, y, z, 1, 1, 1, tpl.mass);
          }
      } else {
          // Primitive templates
          if (tpl.geometry === 'box') {
            return this.createBox(x, y, z, tpl.size.x, tpl.size.y, tpl.size.z, tpl.mass);
          } else if (tpl.geometry === 'cylinder') {
            return this.createCylinder(x, y, z, tpl.size.y, tpl.size.x, tpl.mass);
          } else if (tpl.geometry === 'cone') {
            return this.createCone(x, y, z, tpl.size.y, tpl.size.x, tpl.mass);
          } else {
            return this.createSphere(x, y, z, tpl.size.x, tpl.mass);
          }
      }
  }

  recreateBody(def: PhysicsBodyDef, x: number, y: number, z: number): PhysicsBodyDef {
    if (def.type === 'sphere') {
        return this.createSphere(x, y, z, def.radius, def.mass);
    } else if (def.type === 'cylinder') {
        return this.createCylinder(x, y, z, def.height!, def.radius!, def.mass);
    } else if (def.type === 'cone') {
        return this.createCone(x, y, z, def.height!, def.radius!, def.mass);
    } else if (def.type === 'box') {
        return this.createBox(x, y, z, def.size?.w, def.size?.h, def.size?.d, def.mass);
    } else {
        // Fallback for trimesh/hulls during simple duplication
        return this.createBox(x, y, z, 1, 1, 1, def.mass);
    }
  }
}
