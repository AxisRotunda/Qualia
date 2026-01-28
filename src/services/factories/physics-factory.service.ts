
import { Injectable, inject } from '@angular/core';
import { PhysicsBodyDef } from '../physics.service';
import { ShapesFactory } from '../../physics/shapes.factory';

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
}
