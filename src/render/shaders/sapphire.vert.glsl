#version 300 es

// Fullscreen triangle — no VBO required.
// gl_VertexID trick: 3 vertices, 1 TRIANGLES call covers the NDC clip space.
void main() {
  vec2 pos = vec2(
    float((gl_VertexID << 1) & 2),
    float(gl_VertexID & 2)
  );
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}
