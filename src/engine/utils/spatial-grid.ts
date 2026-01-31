
export class SpatialGrid {
  // Use number (packed int) instead of string for zero-allocation keys
  // Optimization: Use Array instead of Set for faster iteration (Data Locality)
  private cells = new Map<number, number[]>();
  private entityCellMap = new Map<number, number>();

  constructor(private cellSize: number = 20) {}

  private getKey(x: number, z: number): number {
    const cx = Math.floor(x / this.cellSize);
    const cz = Math.floor(z / this.cellSize);
    // Pack 2x 16-bit signed integers into one 32-bit integer.
    // Supports range +/- 32,767 cells (~655km at 20m cell size).
    // Note: JS bitwise operations cast to 32-bit signed int automatically.
    return (cx & 0xFFFF) | ((cz & 0xFFFF) << 16);
  }

  insert(id: number, x: number, z: number) {
    this.remove(id); // Ensure no duplicates
    const key = this.getKey(x, z);
    
    let cell = this.cells.get(key);
    if (!cell) {
      cell = [];
      this.cells.set(key, cell);
    }
    
    cell.push(id);
    this.entityCellMap.set(id, key);
  }

  remove(id: number) {
    const key = this.entityCellMap.get(id);
    if (key === undefined) return;

    const cell = this.cells.get(key);
    if (cell) {
      // Swap-and-Pop Removal (O(1))
      const idx = cell.indexOf(id);
      if (idx !== -1) {
          const last = cell[cell.length - 1];
          cell[idx] = last;
          cell.pop();
      }

      if (cell.length === 0) {
        this.cells.delete(key);
      }
    }
    this.entityCellMap.delete(id);
  }

  /**
   * Zero-Allocation Query.
   * Iterates potential cells and executes callback for each entity found.
   */
  query(x: number, z: number, radius: number, callback: (entity: number) => void): void {
    // Calculate cell range
    const minX = Math.floor((x - radius) / this.cellSize);
    const maxX = Math.floor((x + radius) / this.cellSize);
    const minZ = Math.floor((z - radius) / this.cellSize);
    const maxZ = Math.floor((z + radius) / this.cellSize);

    for (let cx = minX; cx <= maxX; cx++) {
      for (let cz = minZ; cz <= maxZ; cz++) {
        // Manually packing key to match getKey logic
        const key = (cx & 0xFFFF) | ((cz & 0xFFFF) << 16);
        const cell = this.cells.get(key);
        if (cell) {
          // Iterate Array (Fast)
          const len = cell.length;
          for (let i = 0; i < len; i++) {
            callback(cell[i]);
          }
        }
      }
    }
  }

  clear() {
    this.cells.clear();
    this.entityCellMap.clear();
  }
}