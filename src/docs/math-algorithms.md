
# Mathematics & Algorithms
> **Scope**: Formula Reference, Algorithmic Logic, Signal Processing.
> **Source**: `src/engine/workers/terrain/`, `src/physics/logic/`, `src/engine/systems/buoyancy.system.ts`
> **Audience**: AI Agents (Implementation & Tuning).

## 1. Procedural Generation

### 1.1 Integer Hashing (Squirrel3)
For $n \in \mathbb{R}$, $i = \lfloor n \rfloor$ (32-bit unsigned):
$$
\begin{align*}
i &\mathrel{*}= 0xB5297A4D;\ i &\mathrel{\wedge}= i \gg 8 \\
i &\mathrel{*}= 0x68E31DA4;\ i &\mathrel{\wedge}= i \ll 8 \\
i &\mathrel{*}= 0x1B56C4E9;\ i &\mathrel{\wedge}= i \gg 8
\end{align*}
$$
$$
h(n) = \frac{i}{2^{32}}
$$

### 1.2 Quintic Interpolation
$$
u(t) = 6t^5 - 15t^4 + 10t^3,\ t \in [0,1]
$$

### 1.3 Fractal Brownian Motion (FBM)
$$
FBM(p) = \sum_{i=0}^{N-1} 0.5^i \cdot noise(2^i p)
$$

### 1.4 Domain Warping
$$
\begin{align*}
q &= FBM(p) \\
r &= FBM(p + 4q + \langle 1.7,9.2 \rangle) \\
h(p) &= FBM(p + 4r)
\end{align*}
$$

### 1.5 Hydraulic Erosion (Droplet)
1. $\nabla h = \nabla h(p)$
2. $v \leftarrow v \cdot I - \nabla h \cdot (1-I)$
3. $p \leftarrow p + v$
4. $\Delta h = h(p_{old}) - h(p)$
5. $C = \max(-\Delta h, s_{min}) |v| w c_f$
6. $sed \leftarrow sed + (\max(C-sed,0) e_r + \min(sed-C,0) d_r)$
7. $w \leftarrow w(1-e_w)$

## 2. Physics

### 2.1 Mass
$$
M = \rho V
$$
$V$: box $whd$, sphere $\frac{4}{3}\pi r^3$, cyl $\pi r^2 h$, cone $\frac{1}{3}\pi r^2 h$.

### 2.2 Buoyancy
$$
F_b = \rho_f g dt \cdot \left(\frac{M}{\rho_o}\right) S,\quad S = \mathrm{clamp}\left(\frac{d}{h},0,1\right)
$$
**Hydrodynamic Drag**:
$$
F_d = -\hat{v} (C_L |v| + C_Q |v|^2) A \rho_f,\quad A = V^{2/3}
$$

### 2.3 Aerodynamic Drag (Ballistics)
Hard Realism requires Quadratic Drag, not Linear Damping.
$$
F_{drag} = -\frac{1}{2} \rho_{air} v^2 C_d A
$$
*   $\rho_{air} \approx 1.225 \, kg/m^3$
*   $C_d \approx 0.47$ (Sphere)
*   $A \approx \pi r^2$

### 2.4 Spring Joint
$$
k = \mathrm{clamp}(k_b M_t,10,20000),\quad c = 1.6 \sqrt{k M}
$$

### 2.5 Accumulator
$$
a \leftarrow a + \Delta t_r;\quad\mathrm{while}(a \ge \Delta t_p)\{\mathrm{step}();\ a \leftarrow a - \Delta t_p\};\quad\alpha = a / \Delta t_p
$$

## 3. Rendering

### 3.1 Water Waves
$$
y(p,t) = \sum_{i=1}^3 A_i \sin\big((p\cdot D_i)f_i + t s_i\big)
$$
Wave 2 chop: $\sin^3(\cdot)$.

**Normal**: $\epsilon=0.1$,
$$
n = \frac{(p_x - p) \times (p_z - p)}{||(p_x - p) \times (p_z - p injection)}
$$

### 3.2 Triplanar
$$
w_{xyz} = \frac{|n_{xyz}|}{\sum |n_i|},\quad C = \sum w_i C_i(p_i)
$$

### 3.3 Volumetric Height-Fog (RUN_VOLUMETRICS)
Exponential vertical density modulation applied to standard distance-based fog factor.
$$
D_v = \mathrm{clamp}(e^{-(y - y_{base}) \cdot \sigma_v}, 0, 1)
$$
$$
F_{final} = F_{dist} \cdot D_v
$$

## 4. Input/Camera

### 4.1 Joystick
$$
v = \frac{p_c - p_b}{R},\quad |v| \ge 1 \implies v \leftarrow v/|v|;\quad v_y \leftarrow -v_{sy}
$$

### 4.2 Orbit
$$
\begin{align*}
x &= r\sin\phi\cos\theta \\
y &= r\cos\phi \\
z &= r\sin\phi\sin\theta
\end{align*},\quad\phi\in[0,\pi]
$$
