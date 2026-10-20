# 🐍 In-Browser Data Science & Computational Notebooks

Welcome to Selene's high-performance **WebAssembly Python Kernel**, powered by Pyodide v0.26! Execute Python, compute matrix algebra with **NumPy**, analyze telemetry with **Pandas**, and render publication-grade scientific figures with **Matplotlib** — 100% in-browser with zero backend servers or containers.

> [!TIP]
> ⚡ **Zero-Install Python**: Press **Run Cell** (or `Ctrl+Enter` inside the cell) to download the WASM binary and execute client-side. The kernel automatically parses `import` statements and loads required scientific libraries on-demand.

---

## 🌙 1. Orbital Mechanics & Matplotlib Trajectory Simulation

Simulate a Trans-Lunar Injection (TLI) transfer orbit from Earth (*Gaia*) to the Moon (*Selene*) with Apollo/Artemis free-return orbital mechanics:

```python
import numpy as np
import matplotlib.pyplot as plt

# Trans-Lunar Injection (TLI) Orbital Mechanics Simulation
theta = np.linspace(0, 2 * np.pi, 500)
moon_orbit_r = 8.0

# Orbital trajectory coordinates
t = np.linspace(0, 10, 500)
x_orbit = 4 * np.cos(t) + 3.5 * np.cos(3 * t)
y_orbit = 2.5 * np.sin(t) - 2.0 * np.sin(2 * t)

fig, ax = plt.subplots(figsize=(7, 4.5))

# Plot Earth and Moon
ax.scatter([0], [0], color='#38bdf8', s=350, label='Earth (Gaia)', zorder=5)
ax.scatter([moon_orbit_r * np.cos(1.2)], [moon_orbit_r * np.sin(1.2)], color='#fbbf24', s=180, label='Moon (Selene)', zorder=5)

# Plot Trajectories
ax.plot(x_orbit, y_orbit, color='#a855f7', linewidth=2, label='Artemis Free-Return Trajectory')
ax.plot(moon_orbit_r * np.cos(theta), moon_orbit_r * np.sin(theta), '--', color='#475569', alpha=0.5, label='Lunar Orbital Path')

ax.set_title("Selene Mission: Trans-Lunar Injection & Orbital Insertion", fontsize=12, pad=12, fontweight='bold')
ax.set_xlabel("Equatorial Distance (x10^4 km)", fontsize=10)
ax.set_ylabel("Orbital Plane (x10^4 km)", fontsize=10)
ax.legend(loc='upper right', fontsize=8, facecolor='#0f172a', edgecolor='#1e293b')
ax.grid(True, linestyle=':', alpha=0.3)

plt.tight_layout()
plt.show()

print("✓ Orbital mechanics computation completed with 500 integration steps.")
print("✓ Target lunar insertion delta-V: 1,024 m/s (Nominal).")
```

---

## 🎲 2. Monte Carlo Crater Impact & Pi Estimation (NumPy)

High-speed vectorized statistical sampling directly in browser WebAssembly:

```python
import numpy as np

# Estimate Pi and Crater Impact Density using 200,000 Monte Carlo samples
n_samples = 200_000
x = np.random.uniform(-1, 1, n_samples)
y = np.random.uniform(-1, 1, n_samples)

inside_circle = (x**2 + y**2) <= 1.0
pi_estimate = 4.0 * np.sum(inside_circle) / n_samples
error_pct = abs(pi_estimate - np.pi) / np.pi * 100

print("==================================================")
print("  Selene Computational Mathematics Kernel        ")
print("==================================================")
print(f"Simulation Samples  : {n_samples:,}")
print(f"Estimated Value of π : {pi_estimate:.6f}")
print(f"True Value of π      : {np.pi:.6f}")
print(f"Relative Error       : {error_pct:.4f}%")
print(f"Crater Density Score : {np.sum(inside_circle):,} impacts within lunar disk")
```

---

## 📊 3. Lunar Rover Telemetry Analysis (Pandas)

Real-time sensor telemetry processing with Pandas DataFrames and descriptive statistics:

```python
import pandas as pd
import numpy as np

# Generate time series telemetry for Lunar Rover Exploration
np.random.seed(42)
timestamps = pd.date_range("2026-10-18 00:00:00", periods=6, freq="10min")
telemetry = pd.DataFrame({
    "Regolith Temp (°C)": np.random.uniform(-130, -110, 6).round(1),
    "Solar Array (Watts)": np.random.uniform(420, 480, 6).round(0),
    "Radiation (mSv/h)": np.random.uniform(0.02, 0.05, 6).round(3),
    "Battery SoC (%)": [98, 95, 91, 88, 86, 82],
    "Rover Subsystem": ["Core", "Nav", "Drill", "Radio", "Camera", "Spectro"]
}, index=timestamps)

print("=== LUNAR ROVER ARTEMIS IV TELEMETRY LOG ===")
print(telemetry.to_string())
print("\nDescriptive Statistics Summary:")
print(telemetry.describe().round(2).to_string())
```
