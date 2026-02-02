
import * as THREE from 'three';

export type Entity = number;

export type RigidBodyType = 'dynamic' | 'fixed' | 'kinematicPosition' | 'kinematicVelocity';

export interface Transform {
  position: { x: number, y: number, z: number };
  rotation: { x: number, y: number, z: number, w: number };
  scale: { x: number, y: number, z: number };
}

export interface KinematicController {
    targetPosition: { x: number, y: number, z: number };
    targetRotation: { x: number, y: number, z: number, w: number };
}

export interface AnimationRef {
    mixer: THREE.AnimationMixer;
    actions: Map<string, THREE.AnimationAction>;
    activeActionName?: string;
}

export interface PhysicsProps {
  friction: number;
  restitution: number;
  density?: number;
  materialType?: string; // Added for material-aware interactions (metal, rock, wood, etc)
}

export interface RigidBodyRef {
  handle: number;
}

export interface MeshRef {
  mesh: THREE.Mesh;
}

export interface Projectile {
  damage: number;
  impulse: number; // Kinetic energy payload
  life: number; // Remaining lifetime in seconds (Simulation Time)
  ownerId: Entity;
}

export interface PhysicsBodyDef {
  handle: number;
  type: 'box' | 'sphere' | 'cylinder' | 'capsule' | 'cone' | 'trimesh' | 'convex-hull' | 'heightfield';
  bodyType: RigidBodyType;
  position: { x: number, y: number, z: number };
  rotation: { x: number, y: number, z: number, w: number };
  size?: { w: number, h: number, d: number };
  radius?: number;
  height?: number;
  mass?: number;
  lockRotation?: boolean;
  gravityScale?: number;
  canSleep?: boolean;
  // Complex Geometry Buffers
  vertices?: Float32Array;
  indices?: Uint32Array;
  // Heightfield specific
  heightData?: Float32Array;
  fieldSize?: { rows: number, cols: number };
}
