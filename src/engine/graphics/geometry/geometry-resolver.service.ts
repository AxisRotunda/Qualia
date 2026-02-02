import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { AssetService } from '../../../services/asset.service';
import { PrimitiveRegistryService } from '../primitive-registry.service';
import { PhysicsBodyDef } from '../../schema';
import { VisualOptions } from '../visuals-factory.service';

@Injectable({
  providedIn: 'root'
})
export class GeometryResolverService {
  private assetService = inject(AssetService);
  private primitiveRegistry = inject(PrimitiveRegistryService);

  resolve(data: PhysicsBodyDef, options: VisualOptions): THREE.BufferGeometry {
      if (options.meshId) {
          return this.assetService.getGeometry(options.meshId);
      }
      return this.primitiveRegistry.getGeometry(data);
  }
}
