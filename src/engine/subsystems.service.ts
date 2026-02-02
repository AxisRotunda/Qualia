
import { Injectable, inject } from '@angular/core';
import { PhysicsService } from '../services/physics.service';
import { SceneService } from '../services/scene.service';
import { SceneGraphService } from './graphics/scene-graph.service';
import { AssetService } from '../services/asset.service';
import { MaterialService } from '../services/material.service';
import { PhysicsFactoryService } from '../services/factories/physics-factory.service';
import { VisualsFactoryService } from './graphics/visuals-factory.service';
import { TemplateFactoryService } from '../services/factories/template-factory.service';
import { ParticleService } from '../services/particle.service';

@Injectable({
  providedIn: 'root'
})
export class SubsystemsService {
  public readonly physics = inject(PhysicsService);
  public readonly scene = inject(SceneService);
  public readonly graph = inject(SceneGraphService);
  public readonly assets = inject(AssetService);
  public readonly materials = inject(MaterialService);
  public readonly particles = inject(ParticleService);
  public readonly physicsFactory = inject(PhysicsFactoryService);
  public readonly visualsFactory = inject(VisualsFactoryService);
  public readonly entityFactory = inject(TemplateFactoryService);
}
