import { PlacedTile } from './types.js';
import { coordToPosition } from './grid.js';
import { triangleVertexShader, triangleFragmentShader } from './shaders.js';

/**
 * WebGPU renderer for triangular tile maps
 */
export class WebGPURenderer {
  private device!: GPUDevice;
  private context!: GPUCanvasContext;
  private pipeline!: GPURenderPipeline;
  private uniformBuffer!: GPUBuffer;
  private uniformBindGroup!: GPUBindGroup;
  private canvas: HTMLCanvasElement;
  private tileSize: number;

  constructor(canvas: HTMLCanvasElement, tileSize: number = 50) {
    this.canvas = canvas;
    this.tileSize = tileSize;
  }

  async initialize(): Promise<void> {
    if (!navigator.gpu) {
      throw new Error('WebGPU is not supported in this browser');
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error('Failed to get GPU adapter');
    }

    this.device = await adapter.requestDevice();
    this.context = this.canvas.getContext('webgpu')!;

    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({
      device: this.device,
      format: presentationFormat,
      alphaMode: 'opaque',
    });

    await this.createPipeline(presentationFormat);
    this.createUniforms();
  }

  private async createPipeline(format: GPUTextureFormat): Promise<void> {
    const vertexShaderModule = this.device.createShaderModule({
      code: triangleVertexShader,
    });

    const fragmentShaderModule = this.device.createShaderModule({
      code: triangleFragmentShader,
    });

    const vertexBufferLayout: GPUVertexBufferLayout = {
      arrayStride: 8 * 4, // 8 floats per vertex
      stepMode: 'vertex',
      attributes: [
        { shaderLocation: 0, offset: 0, format: 'float32x2' },      // position
        { shaderLocation: 1, offset: 2 * 4, format: 'float32x2' },  // tilePos
        { shaderLocation: 2, offset: 4 * 4, format: 'float32x3' },  // color
        { shaderLocation: 3, offset: 7 * 4, format: 'float32' },    // isPointingUp
      ],
    };

    this.pipeline = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: vertexShaderModule,
        entryPoint: 'main',
        buffers: [vertexBufferLayout],
      },
      fragment: {
        module: fragmentShaderModule,
        entryPoint: 'main',
        targets: [{ format }],
      },
      primitive: {
        topology: 'triangle-list',
      },
    });
  }

  private createUniforms(): void {
    // Create uniform buffer for view-projection matrix and tile size
    this.uniformBuffer = this.device.createBuffer({
      size: 64 + 16, // mat4x4 + vec4 (tileSize + padding)
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.uniformBindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: { buffer: this.uniformBuffer },
        },
      ],
    });

    this.updateUniforms();
  }

  private updateUniforms(): void {
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Create orthographic projection matrix
    const projectionMatrix = this.createOrthographicMatrix(0, width, height, 0, -1, 1);

    const uniformData = new Float32Array(64 / 4 + 16 / 4);
    uniformData.set(projectionMatrix, 0);
    uniformData[16] = this.tileSize;

    this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData.buffer);
  }

  private createOrthographicMatrix(
    left: number, right: number,
    bottom: number, top: number,
    near: number, far: number
  ): Float32Array {
    const matrix = new Float32Array(16);
    matrix[0] = 2 / (right - left);
    matrix[5] = 2 / (top - bottom);
    matrix[10] = -2 / (far - near);
    matrix[12] = -(right + left) / (right - left);
    matrix[13] = -(top + bottom) / (top - bottom);
    matrix[14] = -(far + near) / (far - near);
    matrix[15] = 1;
    return matrix;
  }

  render(tiles: PlacedTile[]): void {
    const vertices = this.createVertexData(tiles);
    const vertexBuffer = this.device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(vertexBuffer, 0, vertices.buffer);

    const commandEncoder = this.device.createCommandEncoder();
    const textureView = this.context.getCurrentTexture().createView();

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    });

    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, this.uniformBindGroup);
    renderPass.setVertexBuffer(0, vertexBuffer);
    renderPass.draw(vertices.length / 8, 1, 0, 0);
    renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }

  private createVertexData(tiles: PlacedTile[]): Float32Array {
    const verticesPerTile = 3;
    const floatsPerVertex = 8;
    const vertices = new Float32Array(tiles.length * verticesPerTile * floatsPerVertex);

    let offset = 0;

    for (const placedTile of tiles) {
      const { coord, tile } = placedTile;
      const pos = coordToPosition(coord, this.tileSize);
      const color = this.getTileColor(tile);
      const isPointingUp = coord.pointing === 'up' ? 1.0 : 0.0;

      // Define triangle vertices based on orientation
      let v0: [number, number], v1: [number, number], v2: [number, number];

      if (coord.pointing === 'up') {
        // Upward pointing triangle
        v0 = [0, 0];                          // Top vertex
        v1 = [this.tileSize, this.tileSize * Math.sqrt(3) / 2];  // Bottom-right
        v2 = [-this.tileSize / 2, this.tileSize * Math.sqrt(3) / 2]; // Bottom-left
      } else {
        // Downward pointing triangle
        v0 = [0, this.tileSize * Math.sqrt(3) / 2];  // Bottom vertex
        v1 = [-this.tileSize / 2, 0];                 // Top-left
        v2 = [this.tileSize / 2, 0];                  // Top-right
      }

      const vertexData = [v0, v1, v2];

      for (const [vx, vy] of vertexData) {
        vertices[offset++] = vx;
        vertices[offset++] = vy;
        vertices[offset++] = pos.x;
        vertices[offset++] = pos.y;
        vertices[offset++] = color[0];
        vertices[offset++] = color[1];
        vertices[offset++] = color[2];
        vertices[offset++] = isPointingUp;
      }
    }

    return vertices;
  }

  private getTileColor(tile: any): [number, number, number] {
    // Get color from metadata or use default
    if (tile.metadata?.color) {
      return tile.metadata.color;
    }

    // Default color based on tile name
    if (tile.name.includes('grass')) {
      return [0.3, 0.7, 0.3]; // Green
    } else if (tile.name.includes('road')) {
      return [0.4, 0.4, 0.4]; // Gray
    }

    return [0.5, 0.5, 0.5]; // Default gray
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.updateUniforms();
  }
}
