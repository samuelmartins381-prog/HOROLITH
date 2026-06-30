#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;    // normalised 0..1, Y-up
uniform float u_time;    // seconds
uniform float u_intensity; // 0 = none, 1 = opus-aeternum

out vec4 fragColor;

// HSL → linear RGB (no gamma correction needed for an overlay blend)
vec3 hsl2rgb(float h, float s, float l) {
  float c = (1.0 - abs(2.0 * l - 1.0)) * s;
  float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
  float m = l - c * 0.5;
  if (h < 1.0 / 6.0) return vec3(c + m, x + m, m);
  if (h < 2.0 / 6.0) return vec3(x + m, c + m, m);
  if (h < 3.0 / 6.0) return vec3(m, c + m, x + m);
  if (h < 4.0 / 6.0) return vec3(m, x + m, c + m);
  if (h < 5.0 / 6.0) return vec3(x + m, m, c + m);
  return vec3(c + m, m, x + m);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  // Mouse parallax offset
  vec2 mouse = u_mouse - 0.5;
  vec2 p = uv - 0.5 - mouse * 0.09;

  // Polar
  float r = length(p * vec2(1.0, 0.68)); // slight ellipse (card portrait ratio)
  float a = atan(p.y, p.x);

  // Iridescent hue drifts over time + shifts with viewing angle
  float hue = fract(u_time * 0.04 + r * 1.5 + a / (2.0 * 3.14159) * 0.3);
  vec3 color = hsl2rgb(hue, 0.62, 0.58);

  // Specular hotspot that tracks the mouse
  float spot = exp(-length(p - mouse * 0.14) * 9.0);
  color = mix(color, vec3(0.98, 0.96, 0.94), spot * 0.55);

  // Radial edge vignette — transparent at corners and centre rim
  float fade = smoothstep(0.0, 0.12, r) * (1.0 - smoothstep(0.22, 0.46, r));

  float alpha = fade * u_intensity * 0.26;
  fragColor = vec4(color, alpha);
}
