
# Mathematics & Algorithms
> **Scope**: Formula Reference, Algorithmic Logic, Signal Processing.
> **Source**: `src/engine/workers/terrain/`, `src/physics/logic/`, `src/engine/systems/buoyancy.system.ts`
> **Audience**: AI Agents (Implementation & Tuning).

## 1. Procedural Generation (Terrain & Noise)

### 1.1 Integer Hashing (Squirrel3 Variant)
Used for deterministic pseudo-random number generation in shaders/workers without texture lookups.
```javascript
hash(n) =
  i = floor(n)
  i *= 0xB5297A4D; i ^= (i >> 8)
  i *= 0x68E31DA4; i ^= (i << 8)
  i *= 0x1B56C4E9; i ^= (i >> 8)
  return (i / 4294967296.0) // Normalized [0, 1]
```

### 1.2 2D Noise Interpolation (Quintic)
Smoothstep variant for reducing grid artifacts in value noise.
$$ u(t) = t^3 (t (t \cdot 6 - 15) + 10) $$
Where $t$ is the fractional component of the coordinate.

### 1.3 Fractal Brownian Motion (FBM)
Summation of noise octaves to create detail.
$$ FBM(p) = \sum_{i=0}^{octaves} A \cdot noise(f \cdot p) $$
*   **Persistence ($A_{decay}$)**: 0.5 (Amplitude halves each step)
*   **Lacunarity ($f_{gain}$)**: 2.0 (Frequency doubles each step)

### 1.4 Domain Warping (Glacial Terrain)
Feeding noise output into noise input to simulate fluid flow/distortion.
$$ q = FBM(p + vec2(0.0, 0.0)) $$
$$ r = FBM(p + 4.0 \cdot q + vec2(1.7, 9.2)) $$
$$ height(p) = FBM(p + 4.0 \cdot r) $$

### 1.5 Hydraulic Erosion (Iterative Particle Drop)
Simulates water carrying sediment downhill.
**Algorithm**:
1.  Spawn droplet at random $(x, y)$.
2.  Calculate Gradient $\nabla h$ at position.
3.  Update Velocity: $v_{new} = v_{old} \cdot inertia - \nabla h \cdot (1 - inertia)$.
4.  Update Position: $p_{new} = p_{old} + v_{new}$.
5.  Check Height Diff: $\Delta h = h_{old} - h_{new}$.
6.  **Capacity**: $C = \max(-\Delta h, minSlope) \cdot v \cdot water \cdot capacityFactor$.
7.  **Deposition**: If sediment > $C$, deposit $(sediment - C) \cdot depositionRate$.
8.  **Erosion**: If sediment < $C$, erode $\min((C - sediment) \cdot erosionRate, -\Delta h)$.
9.  Evaporate: $water *= (1 - evaporationRate)$.

## 2. Physics & Simulation

### 2.1 Mass Calculation
Derived from material density and bounding geometry volume.
$$ M = V \cdot \rho $$
*   **Box**: $V = w \cdot h \cdot d$
*   **Sphere**: $V = \frac{4}{3} \pi r^3$
*   **Cylinder**: $V = \pi r^2 h$
*   **Cone**: $V = \frac{1}{3} \pi r^2 h$

### 2.2 Buoyancy (Archimedes' Principle)
Approximated on CPU for rigid bodies.
$$ F_{buoyancy} = \rho_{fluid} \cdot V_{displaced} \cdot g \cdot dt $$
*   **Submerged Ratio ($S$)**: Approximated linearly based on object center depth vs characteristic height. $S = clamp(\frac{depth}{height}, 0, 1)$.
*   **Displaced Volume**: $V_{disp} = (M / \rho_{object}) \cdot S$.

**Hydrodynamic Drag**:
$$ F_{drag} = -\hat{v} \cdot (C_L \cdot |v| + C_Q \cdot |v|^2) \cdot A \cdot \rho_{fluid} $$
Where $A$ (Cross Section) is approx $V_{total}^{2/3}$.

### 2.3 Spring Joint (Interaction Hand)
Rapier Impulse Joint Config.
*   **Stiffness ($k$)**: $BaseStiffness \cdot Mass_{target}$. (Clamped [10, 20000]).
*   **Damping ($c$)**: Critical damping approximation. $c = 2 \sqrt{Mass \cdot Stiffness} \cdot 0.8$ (Under-damped for feel).

### 2.4 Timestep Accumulator
Decouples Physics Hz from Render Hz.
```javascript
accumulator += dt_render
while (accumulator >= dt_physics) {
    world.step()
    accumulator -= dt_physics
}
alpha = accumulator / dt_physics // Interpolation factor
```

## 3. Rendering Mathematics

### 3.1 Water Wave Function (Vertex Shader)
Sum of 3 sine waves with varying direction and frequency.
$$ y(p, t) = \sum_{i=1}^{3} A_i \cdot \sin((p \cdot D_i) \cdot f_i + t \cdot s_i) $$
*   **Choppiness**: For Wave 2, applied as $(sin(...))^3$ to sharpen peaks.
*   **Normal Recalculation**: Finite Difference Method using $\epsilon = 0.1$.
    $$ \vec{n} = normalize((\vec{p}_x - \vec{p}) \times (\vec{p}_z - \vec{p})) $$

### 3.2 Triplanar Mapping
Texture projection independent of UVs, blending 3 planar projections based on normal.
$$ w = |n| / (|n_x| + |n_y| + |n_z|) $$ (Normalized weights)
$$ C_{final} = C_{yz}(p_{yz}) \cdot w_x + C_{xz}(p_{xz}) \cdot w_y + C_{xy}(p_{xy}) \cdot w_z $$

## 4. Input Signal Processing

### 4.1 Virtual Joystick Normalization
Mapping circular touch area to cartesian vector.
$$ v = \frac{p_{current} - p_{base}}{R_{max}} $$
*   **Clamping**: $|v| \le 1.0$.
*   **Coord System**: Screen Y is Down, Game Y (Forward) is Up. Input Y is inverted: $v_y = -v_{screenY}$.

### 4.2 Camera Orbit (Spherical)
$$ x = r \sin(\phi) \cos(\theta) $$
$$ y = r \cos(\phi) $$
$$ z = r \sin(\phi) \sin(\theta) $$
*   **$\theta$ (Theta)**: Horizontal Azimuth.
*   **$\phi$ (Phi)**: Vertical Polar Angle. Clamped $[0, \pi]$ to prevent flipping.
