
import * as THREE from 'three';

export type Entity = number;

export interface Transform {
  position: { x: number, y: number, z: number };
  rotation: { x: number, y: number, z: number, w: number };
  scale: { x: number, y: number, z: number };
}

export interface PhysicsProps {
  friction: number;
  restitution: number;
  density?: number; // Added for Archimedes' principle calculations
}

export interface RigidBodyRef {
  handle: number;
}

export interface MeshRef {
  mesh: THREE.Mesh;
}

export interface PhysicsBodyDef {
  handle: number;
  type: 'box' | 'sphere' | 'cylinder' | 'capsule' | 'cone' | 'trimesh' | 'convex-hull' | 'heightfield';
  position: { x: number, y: number, z: number };
  rotation: { x: number, y: number, z: number, w: number };
  size?: { w: number, h: number, d: number };
  radius?: number;
  height?: number;
  mass?: number;
  lockRotation?: boolean;
  // Heightfield specific
  heightData?: Float32Array;
  fieldSize?: { rows: number, cols: number };
}
