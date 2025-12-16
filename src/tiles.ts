import { TileDefinition } from './types.js';

/**
 * Predefined tile definitions for grass and roads
 */

/**
 * Edge types:
 * - 'grass': Grassy edge
 * - 'road': Road edge
 */

export const baseTiles: TileDefinition[] = [
  // Full grass tile - all edges are grass
  {
    id: 'grass',
    name: 'Grass',
    edges: ['grass', 'grass', 'grass'],
    rotation: 0,
    metadata: {
      color: [0.3, 0.7, 0.3], // Green
      description: 'A tile fully covered with grass'
    }
  },

  // Crossroad - all three edges have roads
  // This ensures any road edge can connect to another road edge
  {
    id: 'road_cross',
    name: 'Road Crossroad',
    edges: ['road', 'road', 'road'],
    rotation: 0,
    metadata: {
      color: [0.35, 0.35, 0.35], // Darker gray
      description: 'A three-way crossroad'
    }
  },

  // Road with two adjacent road edges
  {
    id: 'road_bend',
    name: 'Road Bend',
    edges: ['road', 'road', 'grass'],
    rotation: 0,
    metadata: {
      color: [0.4, 0.4, 0.4], // Gray
      description: 'A road bend with one grass edge'
    }
  },

  // Road with only one road edge (dead end)
  {
    id: 'road_end',
    name: 'Road End',
    edges: ['road', 'grass', 'grass'],
    rotation: 0,
    metadata: {
      color: [0.45, 0.45, 0.45], // Lighter gray
      description: 'A road dead end'
    }
  },
];
