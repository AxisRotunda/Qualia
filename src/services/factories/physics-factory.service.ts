
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { PhysicsBodyDef, RigidBodyType } from '../../engine/schema';
import { ShapesFactory } from '../../physics/shapes.factory';
import { EntityTemplate } from '../../data/entity-types';
import { MassCalculator } from '../../physics/logic/mass-calculator';

@Injectable({
  providedIn: 'root'
})
export class PhysicsFactoryService {
  private shapes = inject(ShapesFactory);
  private massCalc = inject(MassCalculator);

  createBox(x: number, y: number, z: number, w?: number, h?: number, d?: number, mass?: number, material?: string, bodyType?: RigidBodyType, tags: string[] = []): PhysicsBodyDef {
      return this.shapes.createBox(x, y, z, w, h, d, mass, material, bodyType, tags);
  }

  createSphere(x: number, y: number, z: number, r?: number, mass?: number, material?: string, bodyType?: RigidBodyType, tags: string[] = []): PhysicsBodyDef {
      return this.shapes.createSphere(x, y, z, r, mass, material, bodyType, tags);
  }

  createCylinder(x: number, y: number, z: number, height: number, radius: number, mass?: number, material?: string, bodyType?: RigidBodyType, tags: string[] = []): PhysicsBodyDef {
      return this.shapes.createCylinder(x, y, z, height, radius, mass, material, bodyType, tags);
  }

  createCone(x: number, y: number, z: number, height: number, radius: number, mass?: number, material?: string, bodyType?: RigidBodyType, tags: string[] = []): PhysicsBodyDef {
      return this.shapes.createCone(x, y, z, height, radius, mass, material, bodyType, tags);
  }

  createCapsule(x: number, y: number, z: number, height: number, radius: number, mass?: number, material?: string, bodyType?: RigidBodyType, tags: string[] = []): PhysicsBodyDef {
      return this.shapes.createCapsule(x, y, z, height, radius, mass, material, bodyType, tags);
  }

  createTrimeshFromGeometry(geometry: THREE.BufferGeometry, x: number, y: number, z: number, tags: string[] = []): PhysicsBodyDef {
      const geo = this.ensureIndexed(geometry);
      const vertices = this.getVertexArray(geo);
      const indices = this.getIndexArray(geo);
      return this.shapes.createTrimesh(x, y, z, vertices, indices, tags);
  }

  createConvexHullFromGeometry(geometry: THREE.BufferGeometry, x: number, y: number, z: number, mass?: number, material?: string, bodyType?: RigidBodyType, tags: string[] = []): PhysicsBodyDef {
      const vertices = this.getVertexArray(geometry);
      return this.shapes.createConvexHull(x, y, z, vertices, mass, material, bodyType, tags);
  }

  createHeightfield(x: number, y: number, z: number, rows: number, cols: number, heights: Float32Array, scale: {x: number, y: number, z: number}, tags: string[] = []): PhysicsBodyDef {
      return this.shapes.createHeightfield(x, y, z, rows, cols, heights, scale, tags);
  }

  createFromTemplate(tpl: EntityTemplate, x: number, y: number, z: number, geometry?: THREE.BufferGeometry, scale: number = 1, bodyType?: RigidBodyType): PhysicsBodyDef {
      const sx = tpl.size.x * scale;
      const sy = tpl.size.y * scale;
      const sz = tpl.size.z * scale;
      const targetType = bodyType || (tpl.mass === 0 ? 'fixed' : 'dynamic');
      const vertices = geometry ? this.getVertexArray(geometry) : undefined;
      const massData = this.massCalc.resolve(
          tpl.physicsShape || (tpl.geometry as any),
          { w: sx, h: sy, d: sz, r: sx/2, vertices },
          tpl.mass === 0 ? 0 : undefined,
          tpl.physicsMaterial
      );

      if (tpl.geometry === 'mesh') {
          if (tpl.physicsShape === 'convex-hull' && geometry) {
               return this.shapes.createConvexHull(x, y, z, vertices!, massData.mass, tpl.physicsMaterial, targetType, tpl.tags);
          } else if (tpl.physicsShape === 'trimesh' && geometry) {
               return this.shapes.createTrimesh(x, y, z, vertices!, this.getIndexArray(geometry), tpl.tags);
          } else if (tpl.physicsShape === 'capsule') {
               return this.createCapsule(x, y, z, sy, sx, massData.mass, tpl.physicsMaterial, targetType, tpl.tags);
          } else if (tpl.physicsShape === 'cylinder') {
               return this.createCylinder(x, y, z, sy, sx, massData.mass, tpl.physicsMaterial, targetType, tpl.tags);
          } else if (tpl.physicsShape === 'sphere') {
               return this.createSphere(x, y, z, sx, massData.mass, tpl.physicsMaterial, targetType, tpl.tags);
          } else if (tpl.physicsShape === 'cone') {
               return this.createCone(x, y, z, sy, sx, massData.mass, tpl.physicsMaterial, targetType, tpl.tags);
          } else {
               return this.createBox(x, y, z, sx, sy, sz, massData.mass, tpl.physicsMaterial, targetType, tpl.tags);
          }
      } else {
          if (tpl.geometry === 'box') {
            return this.createBox(x, y, z, sx, sy, sz, massData.mass, tpl.physicsMaterial, targetType, tpl.tags);
          } else if (tpl.geometry === 'cylinder') {
            return this.createCylinder(x, y, z, sy, sx, massData.mass, tpl.physicsMaterial, targetType, tpl.tags);
          } else if (tpl.geometry === 'cone') {
            return this.createCone(x, y, z, sy, sx, massData.mass, tpl.physicsMaterial, targetType, tpl.tags);
          } else {
            return this.createSphere(x, y, z, sx, massData.mass, tpl.physicsMaterial, targetType, tpl.tags);
          }
      }
  }

  recreateBody(def: PhysicsBodyDef, x: number, y: number, z: number, tags: string[] = []): PhysicsBodyDef {
    if (def.type === 'sphere') return this.createSphere(x, y, z, def.radius, def.mass, undefined, def.bodyType, tags);
    if (def.type === 'cylinder') return this.createCylinder(x, y, z, def.height!, def.radius!, def.mass, undefined, def.bodyType, tags);
    if (def.type === 'cone') return this.createCone(x, y, z, def.height!, def.radius!, def.mass, undefined, def.bodyType, tags);
    if (def.type === 'box') return this.createBox(x, y, z, def.size?.w, def.size?.h, def.size?.d, def.mass, undefined, def.bodyType, tags);
    if (def.type === 'capsule') return this.createCapsule(x, y, z, def.height!, def.radius!, def.mass, undefined, def.bodyType, tags);
    if (def.type === 'convex-hull' && def.vertices) return this.shapes.createConvexHull(x, y, z, new Float32Array(def.vertices), def.mass, undefined, def.bodyType, tags);
    if (def.type === 'trimesh' && def.vertices && def.indices) return this.shapes.createTrimesh(x, y, z, new Float32Array(def.vertices), new Uint32Array(def.indices), tags);
    return this.createBox(x, y, z, 1, 1, 1, def.mass, undefined, def.bodyType, tags);
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

  // RUN_OPT: Zero-copy access to underlying buffer
  private getVertexArray(geometry: THREE.BufferGeometry): Float32Array {
      const posAttr = geometry.getAttribute('position');
      // Check for interleaved buffer by checking constructor name or array property
      const isInterleaved = !(posAttr.array instanceof Float32Array) && 'data' in posAttr;
      if (isInterleaved || posAttr.itemSize !== 3) {
          // Fallback for interleaved data (must copy)
          const vertices = new Float32Array(posAttr.count * 3);
          for (let i = 0; i < posAttr.count; i++) {
              vertices[i*3] = posAttr.getX(i);
              vertices[i*3+1] = posAttr.getY(i);
              vertices[i*3+2] = posAttr.getZ(i);
          }
          return vertices;
      } else {
          // Direct view into the buffer if it's a Float32Array
          // This prevents massive GC during level loading of complex meshes
          if (posAttr.array instanceof Float32Array) {
              return posAttr.array;
          }
          return new Float32Array(posAttr.array); 
      }
  }

  private getIndexArray(geometry: THREE.BufferGeometry): Uint32Array {
      if (!geometry.index) {
          const count = geometry.getAttribute('position').count;
          const indices = new Uint32Array(count);
          for(let i=0; i<count; i++) indices[i] = i;
          return indices;
      }
      const rawIndices = geometry.index.array;
      // Copy is usually acceptable here as indices are 3x smaller than vertices
      // and usually already typed correctly.
      return (rawIndices instanceof Uint32Array) ? rawIndices : new Uint32Array(rawIndices);
  }
}
