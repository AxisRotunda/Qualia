
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { PhysicsBodyDef } from '../../engine/schema';
import { ShapesFactory } from '../../physics/shapes.factory';
import { EntityTemplate } from '../../data/entity-types';

@Injectable({
  providedIn: 'root'
})
export class PhysicsFactoryService {
  private shapes = inject(ShapesFactory);

  createBox(x: number, y: number, z: number, w?: number, h?: number, d?: number, mass?: number, material?: string): PhysicsBodyDef {
      return this.shapes.createBox(x, y, z, w, h, d, mass, material);
  }

  createSphere(x: number, y: number, z: number, r?: number, mass?: number, material?: string): PhysicsBodyDef {
      return this.shapes.createSphere(x, y, z, r, mass, material);
  }

  createCylinder(x: number, y: number, z: number, height: number, radius: number, mass: number = 1, material?: string): PhysicsBodyDef {
      return this.shapes.createCylinder(x, y, z, height, radius, mass, material);
  }

  createCone(x: number, y: number, z: number, height: number, radius: number, mass: number = 1, material?: string): PhysicsBodyDef {
      return this.shapes.createCone(x, y, z, height, radius, mass, material);
  }

  createTrimeshFromGeometry(geometry: THREE.BufferGeometry, x: number, y: number, z: number): PhysicsBodyDef {
      const geo = this.ensureIndexed(geometry);
      const vertices = geo.getAttribute('position').array as Float32Array;
      
      // CRITICAL: Rapier requires Uint32Array for indices. Three.js often uses Uint16Array.
      // We must convert it safely to avoid WASM memory out-of-bounds ('unreachable' error).
      const rawIndices = geo.index!.array;
      const indices = (rawIndices instanceof Uint32Array) ? rawIndices : new Uint32Array(rawIndices);

      return this.shapes.createTrimesh(x, y, z, vertices, indices);
  }

  createConvexHullFromGeometry(geometry: THREE.BufferGeometry, x: number, y: number, z: number, mass: number, material?: string): PhysicsBodyDef {
      const geo = this.ensureIndexed(geometry);
      const vertices = geo.getAttribute('position').array as Float32Array;
      
      return this.shapes.createConvexHull(x, y, z, vertices, mass, material);
  }

  createHeightfield(x: number, y: number, z: number, rows: number, cols: number, heights: Float32Array, scale: {x: number, y: number, z: number}): PhysicsBodyDef {
      return this.shapes.createHeightfield(x, y, z, rows, cols, heights, scale);
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
               return this.createConvexHullFromGeometry(geometry, x, y, z, tpl.mass, tpl.physicsMaterial);
          } else if (tpl.physicsShape === 'trimesh' && geometry) {
               return this.createTrimeshFromGeometry(geometry, x, y, z);
          } else if (tpl.physicsShape === 'capsule' || tpl.physicsShape === 'cylinder') {
               // Removed offset (tpl.size.y/2) - Caller handles centering
               return this.createCylinder(x, y, z, tpl.size.y, tpl.size.x, tpl.mass, tpl.physicsMaterial);
          } else if (tpl.physicsShape === 'sphere') {
               return this.createSphere(x, y, z, tpl.size.x, tpl.mass, tpl.physicsMaterial);
          } else if (tpl.physicsShape === 'cone') {
               // Removed offset
               return this.createCone(x, y, z, tpl.size.y, tpl.size.x, tpl.mass, tpl.physicsMaterial);
          } else {
               // Default fallback for meshes
               return this.createBox(x, y, z, 1, 1, 1, tpl.mass, tpl.physicsMaterial);
          }
      } else {
          // Primitive templates
          if (tpl.geometry === 'box') {
            return this.createBox(x, y, z, tpl.size.x, tpl.size.y, tpl.size.z, tpl.mass, tpl.physicsMaterial);
          } else if (tpl.geometry === 'cylinder') {
            return this.createCylinder(x, y, z, tpl.size.y, tpl.size.x, tpl.mass, tpl.physicsMaterial);
          } else if (tpl.geometry === 'cone') {
            return this.createCone(x, y, z, tpl.size.y, tpl.size.x, tpl.mass, tpl.physicsMaterial);
          } else {
            return this.createSphere(x, y, z, tpl.size.x, tpl.mass, tpl.physicsMaterial);
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
    } else if (def.type === 'heightfield' && def.heightData && def.fieldSize && def.size) {
        return this.createHeightfield(x, y, z, def.fieldSize.rows, def.fieldSize.cols, def.heightData, {x: def.size.w, y: 1, z: def.size.d});
    } else {
        return this.createBox(x, y, z, 1, 1, 1, def.mass);
    }
  }
}
