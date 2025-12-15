/**
 * Triangular Tiler - Main exports
 */

export { TileDefinition, TriCoord, PlacedTile, EdgeType, EdgeDirection } from './types.js';
export { generateRotations, edgesCompatible, createPalette } from './tileUtils.js';
export { getNeighbors, getOppositeEdge, coordToPosition, generateGridCoords, coordKey } from './grid.js';
export { MapGenerator } from './generator.js';
export { WebGPURenderer } from './renderer.js';
export { baseTiles } from './tiles.js';
