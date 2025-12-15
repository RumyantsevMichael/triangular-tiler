/**
 * Edge types define what can connect to what.
 * Edges must match for tiles to be compatible neighbors.
 */
export type EdgeType = string;

/**
 * A tile definition with three edges (for triangular tiles).
 * Edges are ordered: [edge0, edge1, edge2] going clockwise.
 */
export interface TileDefinition {
  id: string;
  name: string;
  edges: [EdgeType, EdgeType, EdgeType];
  rotation: number; // 0, 1, or 2 (120-degree rotations)
  baseId?: string; // If this is a rotated version, reference to the base tile
  metadata?: Record<string, any>; // For rendering hints, colors, etc.
}

/**
 * Coordinate system for triangular tiles.
 * We use axial coordinates where triangles alternate orientation.
 */
export interface TriCoord {
  q: number; // column
  r: number; // row
  pointing: 'up' | 'down'; // orientation
}

/**
 * A placed tile on the map
 */
export interface PlacedTile {
  coord: TriCoord;
  tile: TileDefinition;
}

/**
 * Direction indices for the three edges of a triangle
 */
export enum EdgeDirection {
  EDGE_0 = 0,
  EDGE_1 = 1,
  EDGE_2 = 2
}
