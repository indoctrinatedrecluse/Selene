# 🌌 WebGL Canvas Shader Engine Showcase

Selene brings native, hardware-accelerated **WebGL & GLSL Canvas Shaders** directly into your technical markdown canvas! Render mathematical animations, procedural noise, raymarched 3D geometries, and generative art in real time.

> [!NOTE]
> ⚡ **Shader Engine Features**:
> 1. **Hardware Accelerated**: Full GPU rendering via WebGL2/WebGL1 context on HTML5 `<canvas>`.
> 2. **Standard Shader Inputs**: Automatically provides `u_time` (elapsed seconds), `u_resolution` (viewport dimensions), and `u_mouse` (normalized cursor coordinates).
> 3. **Animation Controls**: Play, pause, reset time, and live FPS counter.

---

## ⚡ 1. Cosmic Lunar Nebula (FBM Plasma)

The block below runs a Fractional Brownian Motion (FBM) plasma shader producing celestial nebula clouds:

```glsl
// Selene WebGL Fragment Shader • Cosmic Nebula
#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    float t = u_time * 0.4;

    // Fractional Brownian Motion (FBM) & Plasma rings
    float d = length(uv);
    for (float i = 1.0; i < 4.0; i++) {
        uv.x += 0.3 / i * sin(i * 3.0 * uv.y + t) + 0.1;
        uv.y += 0.3 / i * cos(i * 3.0 * uv.x + t) + 0.1;
    }

    vec3 col = vec3(0.0);
    col.r = 0.5 + 0.5 * sin(uv.x + t * 0.8 + 0.0);
    col.g = 0.5 + 0.5 * sin(uv.y + t * 0.6 + 2.0);
    col.b = 0.5 + 0.5 * sin(uv.x + uv.y + t * 1.0 + 4.0);

    // Deep moonlit vignette & glow
    col *= 1.2 - d * 0.6;
    col += vec3(0.05, 0.15, 0.25) / (d + 0.2);

    gl_FragColor = vec4(col, 1.0);
}
```

---

## 🪐 2. Raymarched Titan Orb (3D SDF Geometry)

Render a 3D raymarched sphere with diffuse lighting, rim glow, and camera ray tracing:

```shader
// Selene WebGL Fragment Shader • Raymarched Sphere
#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float sphereSDF(vec3 p, float r) {
    return length(p) - r;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 ro = vec3(0.0, 0.0, -3.0); // Camera Ray origin
    vec3 rd = normalize(vec3(uv, 1.0)); // Ray direction

    // Raymarching loop
    float t = 0.0;
    vec3 spherePos = vec3(sin(u_time * 0.8) * 0.3, cos(u_time * 0.6) * 0.2, 0.0);
    for (int i = 0; i < 40; i++) {
        vec3 p = ro + rd * t;
        float d = sphereSDF(p - spherePos, 1.0);
        if (d < 0.001 || t > 10.0) break;
        t += d;
    }

    vec3 col = vec3(0.03, 0.05, 0.1); // Background void
    if (t < 10.0) {
        vec3 p = ro + rd * t;
        vec3 n = normalize(p - spherePos);
        vec3 lightDir = normalize(vec3(1.0, 1.5, -1.0));
        float diff = max(dot(n, lightDir), 0.0);
        float rim = 1.0 - max(dot(n, -rd), 0.0);

        vec3 surfaceColor = vec3(0.08, 0.45, 0.85); // Lunar Azure
        col = surfaceColor * diff + vec3(0.2, 0.8, 1.0) * pow(rim, 3.0);
    }

    gl_FragColor = vec4(col, 1.0);
}
```

---

## ⚡ 3. Cyber Grid Waves (`wgsl` / `glsl`)

Procedural perspective grid with horizon fog and neon wave frequencies:

```wgsl
// Selene WebGL Fragment Shader • Neon Wave Grid
#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
    float t = u_time * 1.5;

    // Perspective floor transform
    uv.y += 0.5;
    if (uv.y <= 0.0) {
        gl_FragColor = vec4(0.02, 0.03, 0.06, 1.0);
        return;
    }

    float z = 1.0 / uv.y;
    vec2 p = vec2(uv.x * z, z + t);

    // Grid lines
    vec2 grid = abs(fract(p - 0.5) - 0.5) / fwidth(p);
    float line = min(grid.x, grid.y);
    float c = 1.0 - min(line, 1.0);

    // Neon purple/cyan horizon glow
    vec3 col = vec3(c * 0.2, c * 0.6, c * 1.0);
    col *= exp(-0.3 * z);
    col += vec3(0.25, 0.05, 0.35) * (1.0 - uv.y);

    gl_FragColor = vec4(col, 1.0);
}
```
