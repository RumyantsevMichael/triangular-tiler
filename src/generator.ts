import { TileDefinition, TriCoord, PlacedTile } from './types.js';
import { getNeighbors, getOppositeEdge, coordKey } from './grid.js';
import { edgesCompatible } from './tileUtils.js';

/**
 * Wave Function Collapse implementation for triangular tiles
 */

interface Cell {
  coord: TriCoord;
  possibleTiles: Set<string>; // tile IDs
  collapsed: boolean;
  tile?: TileDefinition;
}

export class MapGenerator {
  private palette: TileDefinition[];
  private tileMap: Map<string, TileDefinition>;
  private cells: Map<string, Cell>;

  constructor(palette: TileDefinition[]) {
    this.palette = palette;
    this.tileMap = new Map(palette.map(t => [t.id, t]));
    this.cells = new Map();
  }

  /**
   * Generate a map using Wave Function Collapse algorithm
   * Retries up to maxAttempts times if contradictions occur
   *
   * @param coords Grid coordinates to generate tiles for
   * @param maxAttempts Maximum number of generation attempts (default: 100)
   */
  generate(coords: TriCoord[], maxAttempts: number = 100): PlacedTile[] {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        this.initializeCells(coords);

        while (true) {
          // Find cell with minimum entropy (fewest possibilities)
          const cellToCollapse = this.findMinEntropyCell();

          if (!cellToCollapse) {
            break; // All cells collapsed
          }

          // Collapse the cell (choose a random tile)
          this.collapseCell(cellToCollapse);

          // Propagate constraints to neighbors
          this.propagate(cellToCollapse);
        }

        return this.getPlacedTiles();
      } catch (error) {
        // Contradiction occurred, try again
        if (attempt === maxAttempts - 1) {
          // Last attempt failed, rethrow
          throw error;
        }
        // Otherwise retry
      }
    }

    throw new Error('Failed to generate map after maximum attempts');
  }

  private initializeCells(coords: TriCoord[]): void {
    this.cells.clear();

    for (const coord of coords) {
      const key = coordKey(coord);
      this.cells.set(key, {
        coord,
        possibleTiles: new Set(this.palette.map(t => t.id)),
        collapsed: false
      });
    }
  }

  private findMinEntropyCell(): Cell | null {
    let minEntropy = Infinity;
    let candidates: Cell[] = [];

    for (const cell of this.cells.values()) {
      if (cell.collapsed) continue;

      const entropy = cell.possibleTiles.size;

      if (entropy === 0) {
        // Contradiction - no valid tiles
        throw new Error(`No valid tiles for cell at ${coordKey(cell.coord)}`);
      }

      if (entropy < minEntropy) {
        minEntropy = entropy;
        candidates = [cell];
      } else if (entropy === minEntropy) {
        candidates.push(cell);
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    // Pick random candidate with minimum entropy
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  private collapseCell(cell: Cell): void {
    const possibleTiles = Array.from(cell.possibleTiles);
    const chosenTileId = possibleTiles[Math.floor(Math.random() * possibleTiles.length)];
    const chosenTile = this.tileMap.get(chosenTileId)!;

    cell.tile = chosenTile;
    cell.collapsed = true;
    cell.possibleTiles = new Set([chosenTileId]);
  }

  private propagate(startCell: Cell): void {
    const stack: Cell[] = [startCell];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const cell = stack.pop()!;
      const cellKey = coordKey(cell.coord);

      if (visited.has(cellKey)) continue;
      visited.add(cellKey);

      const neighbors = getNeighbors(cell.coord);

      for (let edgeIdx = 0; edgeIdx < 3; edgeIdx++) {
        const neighborCoord = neighbors[edgeIdx];
        const neighborKey = coordKey(neighborCoord);
        const neighborCell = this.cells.get(neighborKey);

        if (!neighborCell || neighborCell.collapsed) continue;

        // Constrain neighbor based on current cell's possibilities
        const validNeighborTiles = this.getValidNeighborTiles(cell, edgeIdx);
        const oldSize = neighborCell.possibleTiles.size;

        // Intersect with valid tiles
        neighborCell.possibleTiles = new Set(
          Array.from(neighborCell.possibleTiles).filter(id => validNeighborTiles.has(id))
        );

        // If possibilities changed, add to stack
        if (neighborCell.possibleTiles.size < oldSize) {
          stack.push(neighborCell);
        }
      }
    }
  }

  private getValidNeighborTiles(cell: Cell, edgeIdx: number): Set<string> {
    const validTiles = new Set<string>();
    const neighbors = getNeighbors(cell.coord);
    const neighborCoord = neighbors[edgeIdx];
    const oppositeEdge = getOppositeEdge(edgeIdx, cell.coord.pointing, neighborCoord.pointing);

    for (const tileId of cell.possibleTiles) {
      const tile = this.tileMap.get(tileId)!;
      const edge = tile.edges[edgeIdx];

      // Find all tiles that can connect to this edge
      for (const neighborTile of this.palette) {
        if (edgesCompatible(edge, neighborTile.edges[oppositeEdge])) {
          validTiles.add(neighborTile.id);
        }
      }
    }

    return validTiles;
  }

  private getPlacedTiles(): PlacedTile[] {
    const result: PlacedTile[] = [];

    for (const cell of this.cells.values()) {
      if (cell.tile) {
        result.push({
          coord: cell.coord,
          tile: cell.tile
        });
      }
    }

    return result;
  }
}
