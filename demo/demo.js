import { MapGenerator } from '../dist/generator.js';
import { WebGPURenderer } from '../dist/renderer.js';
import { baseTiles } from '../dist/tiles.js';
import { createPalette } from '../dist/tileUtils.js';
import { generateGridCoords } from '../dist/grid.js';

let renderer;
let generator;
let currentTiles = [];

async function init() {
    const canvas = document.getElementById('canvas');
    const tileSize = parseInt(document.getElementById('tileSize').value);

    // Check WebGPU support
    if (!navigator.gpu) {
        showError('WebGPU is not supported in this browser. Please use Chrome/Edge 113+ or another WebGPU-enabled browser.');
        return;
    }

    try {
        // Initialize renderer
        renderer = new WebGPURenderer(canvas, tileSize);
        await renderer.initialize();

        // Create tile palette with all rotations
        const palette = createPalette(baseTiles);
        generator = new MapGenerator(palette);

        // Generate initial map
        generateMap();
    } catch (error) {
        showError(`Failed to initialize WebGPU: ${error.message}`);
        console.error(error);
    }
}

function generateMap() {
    const width = parseInt(document.getElementById('width').value);
    const height = parseInt(document.getElementById('height').value);
    const tileSize = parseInt(document.getElementById('tileSize').value);

    // Update canvas size
    const canvas = document.getElementById('canvas');
    canvas.width = width * tileSize + tileSize;
    canvas.height = height * tileSize * Math.sqrt(3) / 2 + tileSize;

    if (renderer) {
        renderer.resize(canvas.width, canvas.height);
    }

    // Generate grid coordinates
    const coords = generateGridCoords(width, height);

    try {
        // Generate map using Wave Function Collapse
        currentTiles = generator.generate(coords);

        // Render the map
        renderer.render(currentTiles);

        console.log(`Generated ${currentTiles.length} tiles`);
    } catch (error) {
        showError(`Failed to generate map: ${error.message}`);
        console.error(error);
    }
}

function showError(message) {
    const container = document.querySelector('.container');
    const existingError = container.querySelector('.error');

    if (existingError) {
        existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    container.insertBefore(errorDiv, container.firstChild.nextSibling);
}

// Event listeners
document.getElementById('generate').addEventListener('click', () => {
    if (!renderer) {
        init();
    } else {
        generateMap();
    }
});

document.getElementById('regenerate').addEventListener('click', () => {
    if (renderer && generator) {
        generateMap();
    }
});

// Initialize on load
init();
