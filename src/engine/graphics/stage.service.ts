
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { MaterialService } from '../../services/material.service';
import { EntityAssemblerService } from '../ecs/entity-assembler.service';
import { EntityStoreService } from '../ecs/entity-store.service';
import { PhysicsService } from '../../services/physics.service';
import { SceneLifecycleService } from '../level/scene-lifecycle.service';
import { Geo } from './geo-builder';

@Injectable({
  providedIn: 'root'
})
export class StageService {
  private materialService = inject(MaterialService);
  private assembler = inject(EntityAssemblerService);
  private entityStore = inject(EntityStoreService);
  private physics = inject(PhysicsService);
  private lifecycle = inject(SceneLifecycleService);
  
  private floorEntityId: number | null = null;
  private grid: THREE.GridHelper | null = null;
  private sceneReference: THREE.Scene | null = null;

  init(scene: THREE.Scene) {
    this.sceneReference = scene;
    this.createFloor(scene);
    this.createGrid(scene);

    // RUN_LIFECYCLE: Rebuild stage elements when the world is reset to ensure
    // ECS entities match the active physics world.
    this.lifecycle.onWorldCleared.subscribe(() => {
        this.rebuildStage();
    });
  }

  private rebuildStage() {
      if (!this.sceneReference) return;
      
      // Cleanup existing visuals
      if (this.grid) {
          this.sceneReference.remove(this.grid);
          this.grid.geometry.dispose();
          if (Array.isArray(this.grid.material)) {
              this.grid.material.forEach(m => m.dispose());
          } else {
              (this.grid.material as THREE.Material).dispose();
          }
          this.grid = null;
      }
      
      // Reset ID tracking (ECS was wiped by LevelManager)
      this.floorEntityId = null;
      
      // Re-create
      this.createFloor(this.sceneReference);
      this.createGrid(this.sceneReference);
  }

  private createFloor(scene: THREE.Scene) {
    if (this.floorEntityId !== null) return;

    // Physics Dimensions
    // RUN_INDUSTRY: Expanded floor to 2km to push horizon back
    const floorSize = 2000;
    const floorH = 4.0;
    const floorY = -floorH / 2; // -2.0

    // RUN_OPT: Optimized Geometry
    // Using 1x1 segments instead of 250x250. Flat planes do not need internal vertices
    // unless using vertex displacement (which we handle via Parallax/Triplanar in frag shader).
    const groundGeo = Geo.plane(floorSize, floorSize, 1, 1)
        .rotateX(-Math.PI / 2)
        .translate(0, floorH / 2, 0)
        .get();
    
    // RUN_GEO: Planar UV Normalization for infinite tiling (200x repeat)
    const uvs = groundGeo.attributes['uv'];
    const tiling = 200.0;
    for(let i=0; i<uvs.count; i++) {
        uvs.setXY(i, uvs.getX(i) * tiling, uvs.getY(i) * tiling);
    }
    groundGeo.computeTangents();

    // Physics Body (Fixed Box)
    const bodyDef = this.physics.shapes.createBox(
        0, floorY, 0,
        floorSize, floorH, floorSize,
        0, // Mass 0 = Fixed
        'concrete',
        'fixed',
        ['static', 'terrain']
    );

    this.floorEntityId = this.assembler.createEntityFromDef(
        bodyDef,
        { materialId: 'mat-concrete' },
        { name: 'WORLD_FLOOR', tags: ['static', 'terrain'], isStatic: true }
    );

    // RUN_OPT: Enforce high rigidity on the world floor
    const world = this.entityStore.world;
    
    world.physicsProps.setProps(this.floorEntityId, 1.0, 0.1, 2400); // Friction 1.0, Restitution 0.1
    this.physics.materials.updateBodyMaterial(bodyDef.handle, { friction: 1.0, restitution: 0.1 });

    // Swap Geometry on the created mesh
    const meshRef = world.meshes.get(this.floorEntityId);
    if (meshRef) {
        meshRef.mesh.geometry.dispose(); // Dispose default box geometry created by factory
        meshRef.mesh.geometry = groundGeo;
        meshRef.mesh.receiveShadow = true;
        meshRef.mesh.castShadow = false;
        
        // Darken bedrock for contrast
        if (!Array.isArray(meshRef.mesh.material)) {
            const mat = meshRef.mesh.material as THREE.MeshStandardMaterial;
            mat.color.setHex(0x1e293b); // Slate-900 bedrock
        }
    }
  }

  private createGrid(scene: THREE.Scene) {
    if (this.grid) return;
    // Expanded grid visual to match new floor size
    this.grid = new THREE.GridHelper(2000, 200, 0x0ea5e9, 0x1e293b);
    (this.grid.material as THREE.Material).opacity = 0.08; 
    (this.grid.material as THREE.Material).transparent = true;
    this.grid.position.y = 0.02; // Slight bias above floor to prevent Z-fighting
    scene.add(this.grid);
  }

  setVisible(visible: boolean) {
      const world = this.entityStore.world;
      if (this.floorEntityId !== null) {
          const meshRef = world.meshes.get(this.floorEntityId);
          if (meshRef) meshRef.mesh.visible = visible;
      }
      if (this.grid) this.grid.visible = visible;
  }
}
