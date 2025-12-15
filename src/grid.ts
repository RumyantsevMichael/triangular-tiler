import { TriCoord } from './types.js';

/**
 * Utilities for working with triangular grid coordinates
 */

/**
 * Get neighboring coordinates for a triangle.
 * A triangle has 3 neighbors (one per edge).
 */
export function getNeighbors(coord: TriCoord): [TriCoord, TriCoord, TriCoord] {
  const { q, r, pointing } = coord;

  if (pointing === 'up') {
    // Upward-pointing triangle neighbors
    return [
      { q: q - 1, r, pointing: 'down' },     // left edge (edge 0)
      { q, r: r + 1, pointing: 'down' },     // right edge (edge 1)
      { q, r: r - 1, pointing: 'up' }        // bottom edge (edge 2)
    ];
  } else {
    // Downward-pointing triangle neighbors
    return [
      { q, r: r - 1, pointing: 'down' },     // top edge (edge 0)
      { q: q + 1, r, pointing: 'up' },       // right edge (edge 1)
      { q, r: r + 1, pointing: 'up' }        // left edge (edge 2)
    ];
  }
}

/**
 * Get the opposite edge index for a neighbor.
 * When triangle A's edge i connects to triangle B,
 * we need to know which edge of B connects back.
 */
export function getOppositeEdge(edgeIndex: number): number {
  // In our neighbor ordering, the opposite edges line up nicely
  return edgeIndex;
}

/**
 * Convert grid coordinates to world position (for rendering)
 */
export function coordToPosition(coord: TriCoord, tileSize: number): { x: number; y: number } {
  const { q, r, pointing } = coord;

  const height = tileSize * Math.sqrt(3) / 2;
  const x = q * tileSize + (pointing === 'down' ? tileSize / 2 : 0);
  const y = r * height;

  return { x, y };
}

/**
 * Generate a rectangular grid of triangular coordinates
 */
export function generateGridCoords(width: number, height: number): TriCoord[] {
  const coords: TriCoord[] = [];

  for (let r = 0; r < height; r++) {
    for (let q = 0; q < width; q++) {
      // Each grid cell has two triangles: up and down
      coords.push({ q, r, pointing: 'up' });
      coords.push({ q, r, pointing: 'down' });
    }
  }

  return coords;
}

/**
 * Create a unique key for a coordinate
 */
export function coordKey(coord: TriCoord): string {
  return `${coord.q},${coord.r},${coord.pointing}`;
}
