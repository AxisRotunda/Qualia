
import { Injectable } from '@angular/core';
import { CITY_CONFIG } from '../../config/asset-registry';

export type CellType = 'void' | 'highway' | 'road' | 'intersection' | 'building' | 'plaza' | 'reserved';

@Injectable({
  providedIn: 'root'
})
export class CityGridService {
  private cells = new Map<string, CellType>();
  private readonly UNIT = CITY_CONFIG.GRID_UNIT;

  reset() {
    this.cells.clear();
  }

  // Convert World Coordinate to Grid Key "x:z"
  getKey(x: number, z: number): string {
    const gx = Math.round(x / this.UNIT);
    const gz = Math.round(z / this.UNIT);
    return `${gx}:${gz}`;
  }

  // Snap World Coordinate to nearest Grid Node
  snap(x: number, z: number): { x: number, z: number } {
    const gx = Math.round(x / this.UNIT);
    const gz = Math.round(z / this.UNIT);
    return { x: gx * this.UNIT, z: gz * this.UNIT };
  }

  mark(x: number, z: number, type: CellType) {
    const key = this.getKey(x, z);
    this.cells.set(key, type);
  }

  markRect(x: number, z: number, width: number, depth: number, type: CellType) {
      // Mark all grid points covered by this rectangle
      // Assuming center x,z
      const halfW = width / 2;
      const halfD = depth / 2;
      
      const startX = this.snap(x - halfW + 1, z).x;
      const endX = this.snap(x + halfW - 1, z).x;
      const startZ = this.snap(x, z - halfD + 1).z;
      const endZ = this.snap(x, z + halfD - 1).z;

      for(let ix = startX; ix <= endX; ix += this.UNIT) {
          for(let iz = startZ; iz <= endZ; iz += this.UNIT) {
              this.mark(ix, iz, type);
          }
      }
  }

  get(x: number, z: number): CellType {
    return this.cells.get(this.getKey(x, z)) || 'void';
  }

  isFree(x: number, z: number): boolean {
      return !this.cells.has(this.getKey(x, z));
  }
}
