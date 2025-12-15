# Triangular Tile Map Generator

A procedural map generator and visualizer for triangular tiles using the Wave Function Collapse algorithm and WebGPU rendering.

## Features

- **Triangular Grid System**: Efficient coordinate system for alternating up/down triangular tiles
- **Wave Function Collapse**: Constraint-based procedural generation ensuring compatible tile placement
- **Extensible Tile System**: Easy-to-define tiles with edge-based compatibility rules
- **WebGPU Rendering**: High-performance hardware-accelerated rendering
- **Automatic Rotations**: Tiles are automatically rotated to create variations
- **Built-in Tile Sets**: Grass and road tiles (straight, crossroad, T-junction, dead-end)

## Architecture

The project is built with TypeScript and uses modern web technologies:

```
src/
├── types.ts          # Core type definitions
├── tileUtils.ts      # Tile manipulation utilities
├── grid.ts           # Triangular grid coordinate system
├── generator.ts      # Wave Function Collapse implementation
├── renderer.ts       # WebGPU renderer
├── shaders.ts        # WGSL vertex and fragment shaders
├── tiles.ts          # Predefined tile definitions
└── index.ts          # Main exports
```

## How It Works

### Tile Definition

Each tile has three edges, and neighboring tiles must have compatible edges:

```typescript
{
  id: 'grass',
  name: 'Grass',
  edges: ['grass', 'grass', 'grass'],
  rotation: 0,
  metadata: {
    color: [0.3, 0.7, 0.3]
  }
}
```

### Wave Function Collapse Algorithm

1. Initialize all cells with all possible tiles
2. Find the cell with minimum entropy (fewest possibilities)
3. Collapse it by randomly choosing one of its possible tiles
4. Propagate constraints to neighboring cells
5. Repeat until all cells are collapsed

### Triangular Coordinate System

We use an axial coordinate system where each position has:
- `q`: column index
- `r`: row index
- `pointing`: orientation ('up' or 'down')

Each triangle has exactly 3 neighbors, one per edge.

## Installation

```bash
npm install
```

## Building

Compile TypeScript to JavaScript:

```bash
npm run build
```

This generates the `dist/` folder with compiled JavaScript modules.

## Running the Demo

### Local Development

1. Build the project:
```bash
npm run build
```

2. Start a local web server:
```bash
npm run demo
```

3. Open your browser to `http://localhost:8000/demo/`

**Note**: You need a WebGPU-enabled browser (Chrome/Edge 113+, or enable experimental features in other browsers).

### GitHub Pages Deployment

The project includes a GitHub Actions workflow that automatically builds and deploys the demo to GitHub Pages when you push to the `main` or `master` branch.

To enable GitHub Pages:

1. Go to your repository settings
2. Navigate to **Pages** under **Code and automation**
3. Under **Source**, select **GitHub Actions**
4. Push your changes to the main branch
5. The workflow will automatically build and deploy the site

The demo will be available at: `https://[username].github.io/[repository-name]/`

## Usage

### Basic Example

```typescript
import { MapGenerator } from './dist/generator.js';
import { WebGPURenderer } from './dist/renderer.js';
import { baseTiles } from './dist/tiles.js';
import { createPalette } from './dist/tileUtils.js';
import { generateGridCoords } from './dist/grid.js';

// Create tile palette with rotations
const palette = createPalette(baseTiles);

// Initialize generator
const generator = new MapGenerator(palette);

// Generate grid coordinates
const coords = generateGridCoords(20, 15); // 20 wide, 15 tall

// Generate map
const tiles = generator.generate(coords);

// Render with WebGPU
const canvas = document.getElementById('canvas');
const renderer = new WebGPURenderer(canvas, 50); // 50px tile size
await renderer.initialize();
renderer.render(tiles);
```

### Creating Custom Tiles

Define custom tiles by specifying edge types:

```typescript
const customTile: TileDefinition = {
  id: 'water',
  name: 'Water',
  edges: ['water', 'water', 'beach'],
  rotation: 0,
  metadata: {
    color: [0.2, 0.4, 0.8],
    description: 'Water tile with one beach edge'
  }
};
```

Add to your tile set:

```typescript
const myTiles = [...baseTiles, customTile];
const palette = createPalette(myTiles);
```

### Extending Edge Rules

Edge compatibility is currently strict equality. To customize:

```typescript
// In tileUtils.ts
export function edgesCompatible(edge1: EdgeType, edge2: EdgeType): boolean {
  // Custom logic here
  if (edge1 === 'beach' && edge2 === 'water') return true;
  if (edge1 === 'water' && edge2 === 'beach') return true;
  return edge1 === edge2;
}
```

## API Reference

### MapGenerator

```typescript
class MapGenerator {
  constructor(palette: TileDefinition[])
  generate(coords: TriCoord[]): PlacedTile[]
}
```

### WebGPURenderer

```typescript
class WebGPURenderer {
  constructor(canvas: HTMLCanvasElement, tileSize: number)
  async initialize(): Promise<void>
  render(tiles: PlacedTile[]): void
  resize(width: number, height: number): void
}
```

### Utility Functions

```typescript
// Generate all rotations of a tile
generateRotations(baseTile: TileDefinition): TileDefinition[]

// Create palette with all rotations
createPalette(baseTiles: TileDefinition[]): TileDefinition[]

// Generate rectangular grid of coordinates
generateGridCoords(width: number, height: number): TriCoord[]

// Get neighboring coordinates
getNeighbors(coord: TriCoord): [TriCoord, TriCoord, TriCoord]

// Convert coordinate to screen position
coordToPosition(coord: TriCoord, tileSize: number): { x: number; y: number }
```

## Browser Compatibility

Requires WebGPU support:
- Chrome/Edge 113+
- Firefox with `dom.webgpu.enabled` flag
- Safari Technology Preview with WebGPU enabled

## License

MIT

## Future Enhancements

- [ ] Texture support for tiles
- [ ] Custom edge compatibility rules per tile set
- [ ] Constraint weights for biasing generation
- [ ] Export to image/JSON
- [ ] Interactive tile painting
- [ ] Tile set editor UI
- [ ] Multiple layers support
- [ ] Hexagonal tile support
