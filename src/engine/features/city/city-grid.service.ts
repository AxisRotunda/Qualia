
import { Injectable } from '@angular/core';
import { CITY_CONFIG } from './city.config';

export type CellType = 'void' | 'highway' | 'road' | 'intersection' | 'building' | 'plaza' | 'reserved';

@Injectable({
  providedIn: 'root'
})
export class CityGridService {
  private cells = new Map<number, CellType>();
  private readonly UNIT = CITY_CONFIG.GRID_UNIT;

  reset() {
    this.cells.clear();
  }

  /**
   * Generates a unique 32-bit integer key for a world-space coordinate.
   * Uses floor-quantization to ensure stability across boundary floating point noise.
   */
  private getKey(x: number, z: number): number {
    const gx = Math.floor(x / this.UNIT + 0.5);
    const gz = Math.floor(z / this.UNIT + 0.5);
    // Pack 2x 16-bit signed integers into one 32-bit integer.
    return (gx & 0xFFFF) | ((gz & 0xFFFF) << 16);
  }

  snap(x: number, z: number): { x: number, z: number } {
    const gx = Math.floor(x / this.UNIT + 0.5);
    const gz = Math.floor(z / this.UNIT + 0.5);
    return { x: gx * this.UNIT, z: gz * this.UNIT };
  }

  mark(x: number, z: number, type: CellType) {
    const key = this.getKey(x, z);
    this.cells.set(key, type);
  }

  /**
   * Reserves a rectangular area in the grid based on world dimensions.
   */
  markRect(x: number, z: number, width: number, depth: number, type: CellType) {
      const snapped = this.snap(x, z);
      const halfW = width / 2;
      const halfD = depth / 2;
      
      const startX = snapped.x - Math.floor(halfW / this.UNIT) * this.UNIT;
      const endX = snapped.x + Math.floor(halfW / this.UNIT) * this.UNIT;
      const startZ = snapped.z - Math.floor(halfD / this.UNIT) * this.UNIT;
      const endZ = snapped.z + Math.floor(halfD / this.UNIT) * this.UNIT;

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

  isRectFree(x: number, z: number, width: number, depth: number): boolean {
      const snapped = this.snap(x, z);
      const halfW = width / 2;
      const halfD = depth / 2;
      
      const startX = snapped.x - Math.floor(halfW / this.UNIT) * this.UNIT;
      const endX = snapped.x + Math.floor(halfW / this.UNIT) * this.UNIT;
      const startZ = snapped.z - Math.floor(halfD / this.UNIT) * this.UNIT;
      const endZ = snapped.z + Math.floor(halfD / this.UNIT) * this.UNIT;

      for(let ix = startX; ix <= endX; ix += this.UNIT) {
          for(let iz = startZ; iz <= endZ; iz += this.UNIT) {
              if (!this.isFree(ix, iz)) return false;
          }
      }
      return true;
  }
}
