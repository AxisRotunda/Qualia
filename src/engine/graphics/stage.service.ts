
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { MaterialService } from '../../services/material.service';

@Injectable({
  providedIn: 'root'
})
export class StageService {
  private materialService = inject(MaterialService);
  
  private ground: THREE.Mesh | null = null;
  private grid: THREE.GridHelper | null = null;

  init(scene: THREE.Scene) {
    this.createGround(scene);
    this.createGrid(scene);
  }

  private createGround(scene: THREE.Scene) {
    if (this.ground) return;

    // Increased segments from default to 250x250 for displacement fidelity
    const groundGeo = new THREE.PlaneGeometry(500, 500, 250, 250);
    
    // Tiling adjustments for realism
    const uvs = groundGeo.attributes['uv'];
    for(let i=0; i<uvs.count; i++) {
        uvs.setXY(i, uvs.getX(i) * 50, uvs.getY(i) * 50); // 50x repeat
    }

    // Explicitly compute tangents if normal mapping relies on them (optional but good for some shaders)
    groundGeo.computeTangents();

    const groundMat = this.materialService.getMaterial('mat-ground');
    
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.ground.castShadow = false; // Self-shadowing on displacement can be expensive/glitchy
    this.ground.position.y = -0.01; 
    
    scene.add(this.ground);
  }

  private createGrid(scene: THREE.Scene) {
    if (this.grid) return;

    this.grid = new THREE.GridHelper(500, 100, 0xffffff, 0xffffff);
    (this.grid.material as THREE.Material).opacity = 0.05; 
    (this.grid.material as THREE.Material).transparent = true;
    this.grid.position.y = 0.01; 
    
    scene.add(this.grid);
  }

  setVisible(visible: boolean) {
      if (this.ground) this.ground.visible = visible;
      if (this.grid) this.grid.visible = visible;
  }
}
