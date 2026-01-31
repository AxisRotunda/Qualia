
export class SpatialGrid {
  private cells = new Map<string, Set<number>>();
  private entityCellMap = new Map<number, string>();

  constructor(private cellSize: number = 20) {}

  private getKey(x: number, z: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cz = Math.floor(z / this.cellSize);
    return `${cx}:${cz}`;
  }

  insert(id: number, x: number, z: number) {
    this.remove(id); // Ensure no duplicates
    const key = this.getKey(x, z);
    
    if (!this.cells.has(key)) {
      this.cells.set(key, new Set());
    }
    
    this.cells.get(key)!.add(id);
    this.entityCellMap.set(id, key);
  }

  remove(id: number) {
    const key = this.entityCellMap.get(id);
    if (!key) return;

    const cell = this.cells.get(key);
    if (cell) {
      cell.delete(id);
      if (cell.size === 0) {
        this.cells.delete(key);
      }
    }
    this.entityCellMap.delete(id);
  }

  query(x: number, z: number, radius: number): Set<number> {
    const results = new Set<number>();
    
    // Calculate cell range
    const minX = Math.floor((x - radius) / this.cellSize);
    const maxX = Math.floor((x + radius) / this.cellSize);
    const minZ = Math.floor((z - radius) / this.cellSize);
    const maxZ = Math.floor((z + radius) / this.cellSize);

    for (let cx = minX; cx <= maxX; cx++) {
      for (let cz = minZ; cz <= maxZ; cz++) {
        const key = `${cx}:${cz}`;
        const cell = this.cells.get(key);
        if (cell) {
          for (const id of cell) {
            results.add(id);
          }
        }
      }
    }
    
    return results;
  }

  clear() {
    this.cells.clear();
    this.entityCellMap.clear();
  }
}
