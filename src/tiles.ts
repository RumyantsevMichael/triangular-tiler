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

  // Straight road - road goes from edge 0 to edge 1
  {
    id: 'road_straight',
    name: 'Road Straight',
    edges: ['road', 'road', 'grass'],
    rotation: 0,
    metadata: {
      color: [0.4, 0.4, 0.4], // Gray
      description: 'A straight road segment'
    }
  },

  // Crossroad - all three edges have roads
  {
    id: 'road_cross',
    name: 'Road Crossroad',
    edges: ['road', 'road', 'road'],
    rotation: 0,
    metadata: {
      color: [0.35, 0.35, 0.35], // Slightly darker gray
      description: 'A three-way crossroad'
    }
  },

  // T-junction - road on two edges
  {
    id: 'road_tjunction',
    name: 'Road T-Junction',
    edges: ['road', 'road', 'grass'],
    rotation: 0,
    metadata: {
      color: [0.38, 0.38, 0.38], // Medium gray
      description: 'A T-junction road'
    }
  },

  // Dead end - road only on one edge
  {
    id: 'road_end',
    name: 'Road End',
    edges: ['road', 'grass', 'grass'],
    rotation: 0,
    metadata: {
      color: [0.42, 0.42, 0.42], // Lighter gray
      description: 'A dead-end road'
    }
  }
];
