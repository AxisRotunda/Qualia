
import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class SelectionVisualsFactory {
  
  createSelectionVisuals(target: THREE.Mesh): THREE.Group {
    const group = new THREE.Group();
    
    // Ensure bounding box is computed
    if (!target.geometry.boundingBox) target.geometry.computeBoundingBox();
    const box = target.geometry.boundingBox!.clone();
    
    // Slight padding
    box.expandByScalar(0.05);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // 1. Sleek AR Brackets
    const bracketGeo = this.createBracketGeometry(box);
    const bracketMat = new THREE.LineBasicMaterial({ 
        color: 0x00ffff, 
        depthTest: false,
        linewidth: 1, // Default to 1 as WebGL limits this often
        transparent: true,
        opacity: 0.8
    });
    const brackets = new THREE.LineSegments(bracketGeo, bracketMat);
    group.add(brackets);

    // 2. Animated Pulse Box (Simulated via simple transparency for now)
    const boxGeo = new THREE.BoxGeometry(size.x, size.y, size.z);
    boxGeo.translate(center.x, center.y, center.z);
    
    const fillMat = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff, 
        transparent: true, 
        opacity: 0.05, 
        depthTest: true,
        side: THREE.BackSide, // Render inside only to avoid occlusion weirdness
        blending: THREE.AdditiveBlending
    });
    const fill = new THREE.Mesh(boxGeo, fillMat);
    group.add(fill);

    // 3. Corner Dots for Tech feel
    const dotGeo = this.createCornerDots(box);
    const dotMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8,
        depthTest: false
    });
    const dots = new THREE.Points(dotGeo, dotMat);
    group.add(dots);

    return group;
  }

  private createBracketGeometry(box: THREE.Box3): THREE.BufferGeometry {
      const min = box.min;
      const max = box.max;
      const points: number[] = [];
      
      const dims = new THREE.Vector3().subVectors(max, min);
      const len = Math.min(Math.min(dims.x, dims.y), dims.z) * 0.2; // Proportional length

      const addL = (x: number, y: number, z: number, dx: number, dy: number, dz: number) => {
          points.push(x, y, z, x + dx * len, y, z);
          points.push(x, y, z, x, y + dy * len, z);
          points.push(x, y, z, x, y, z + dz * len);
      };

      // 8 Corners
      addL(min.x, min.y, min.z, 1, 1, 1);
      addL(max.x, min.y, min.z, -1, 1, 1);
      addL(min.x, max.y, min.z, 1, -1, 1);
      addL(max.x, max.y, min.z, -1, -1, 1);

      addL(min.x, min.y, max.z, 1, 1, -1);
      addL(max.x, min.y, max.z, -1, 1, -1);
      addL(min.x, max.y, max.z, 1, -1, -1);
      addL(max.x, max.y, max.z, -1, -1, -1);

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
      return geo;
  }

  private createCornerDots(box: THREE.Box3): THREE.BufferGeometry {
      const min = box.min;
      const max = box.max;
      const points: number[] = [];
      
      points.push(min.x, min.y, min.z);
      points.push(max.x, min.y, min.z);
      points.push(min.x, max.y, min.z);
      points.push(max.x, max.y, min.z);
      
      points.push(min.x, min.y, max.z);
      points.push(max.x, min.y, max.z);
      points.push(min.x, max.y, max.z);
      points.push(max.x, max.y, max.z);

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
      return geo;
  }

  dispose(group: THREE.Group) {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments || child instanceof THREE.Points) {
           child.geometry.dispose();
           if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
           else child.material.dispose();
        }
      });
  }
}
