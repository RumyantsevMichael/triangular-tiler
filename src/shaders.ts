/**
 * WebGPU shaders for rendering triangular tiles
 */

export const triangleVertexShader = `
struct Uniforms {
  viewProjection: mat4x4<f32>,
  tileSize: f32,
  padding: vec3<f32>,
}

struct VertexInput {
  @location(0) position: vec2<f32>,
  @location(1) tilePos: vec2<f32>,
  @location(2) color: vec3<f32>,
  @location(3) isPointingUp: f32,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;

  // Transform vertex position based on tile position and orientation
  var worldPos = input.position * uniforms.tileSize + input.tilePos;

  // Apply view-projection matrix
  output.position = uniforms.viewProjection * vec4<f32>(worldPos, 0.0, 1.0);
  output.color = input.color;

  return output;
}
`;

export const triangleFragmentShader = `
struct FragmentInput {
  @location(0) color: vec3<f32>,
}

@fragment
fn main(input: FragmentInput) -> @location(0) vec4<f32> {
  return vec4<f32>(input.color, 1.0);
}
`;
