
import { Entity } from '../schema';

// --- ECS Lifecycle Events ---
export interface EntityCreatedEvent {
  entity: Entity;
  isStatic: boolean;
  tags: string[];
}

export interface EntityDestroyedEvent {
  entity: Entity;
}

// --- Scene Lifecycle Events ---
export interface SceneLoadEvent {
  id: string;
  timestamp: number;
}

export interface SceneProgressEvent {
  stage: string;
  progress: number;
}

// --- Physics Events ---
export interface CollisionEvent {
  entityA: number;
  entityB: number;
  started: boolean;
}

// --- Input Events ---
export interface PointerEventData {
  x: number;
  y: number;
  originalEvent: PointerEvent | MouseEvent;
  button: number;
}
