
import * as THREE from 'three';

export type EntityCategory = 'building' | 'terrain' | 'prop' | 'nature' | 'shape';

export interface EntityTemplate {
  id: string;
  label: string;
  category: EntityCategory;
  icon: string;
  geometry: 'box' | 'cylinder' | 'sphere' | 'cone' | 'mesh';
  meshId?: string;
  physicsShape?: 'box' | 'cylinder' | 'capsule' | 'sphere' | 'cone' | 'convex-hull' | 'trimesh';
  size: THREE.Vector3;
  materialId?: string;
  color?: number;
  mass: number;
  physicsMaterial?: string; // New field for hard realism density lookup
  lockRotation?: boolean;
  friction: number;
  restitution: number;
  tags: string[];
}
