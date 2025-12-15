import { TileDefinition, EdgeType } from './types.js';

/**
 * Generate rotated versions of a tile.
 * Triangular tiles can be rotated by 120 and 240 degrees.
 */
export function generateRotations(baseTile: TileDefinition): TileDefinition[] {
  const tiles: TileDefinition[] = [baseTile];

  // Create 120-degree rotation
  const rotation1: TileDefinition = {
    ...baseTile,
    id: `${baseTile.id}_r1`,
    edges: [baseTile.edges[2], baseTile.edges[0], baseTile.edges[1]],
    rotation: 1,
    baseId: baseTile.id
  };

  // Create 240-degree rotation
  const rotation2: TileDefinition = {
    ...baseTile,
    id: `${baseTile.id}_r2`,
    edges: [baseTile.edges[1], baseTile.edges[2], baseTile.edges[0]],
    rotation: 2,
    baseId: baseTile.id
  };

  tiles.push(rotation1, rotation2);
  return tiles;
}

/**
 * Check if two edge types are compatible
 */
export function edgesCompatible(edge1: EdgeType, edge2: EdgeType): boolean {
  return edge1 === edge2;
}

/**
 * Create a tile palette with all rotations
 */
export function createPalette(baseTiles: TileDefinition[]): TileDefinition[] {
  const palette: TileDefinition[] = [];

  for (const baseTile of baseTiles) {
    palette.push(...generateRotations(baseTile));
  }

  return palette;
}
