# 🔬 Typst, WebR & OpenSCAD Scientific Computing Showcase

> *Athena's academic vector typesetting, Apollo's empirical statistical regression, and Daedalus's 3D parametric CAD solid modeling within Selene's unified document canvas.*

---

## 1. Athena's Academic Typesetter (`typst`)

Typst is an ultra-fast, modern academic markup language designed for technical papers, mathematical formulas, and scientific manuscripts with sub-20ms rendering.

```typst
#set page(paper: "a4", margin: (x: 2cm, y: 2.5cm))
#set text(font: "Crimson Pro", size: 11pt, lang: "en")

= Principles of Celestial Orbital Dynamics
== Selene Academic Working Paper • Series 2026.IV
_Athena Research Laboratory for Astronautical Computation_

The trajectory of an unperturbed lunar orbiter in a central gravitational field is governed by Newton's law of universal gravitation:

$ frac(d^2 bold(r), d t^2) + frac(mu, r^3) bold(r) = bold(0) $

Where $mu = G(M + m) approx 4.9048 times 10^12 space "m"^3 "s"^(-2)$ represents the selenocentric gravitational parameter.

== Conservation of Specific Orbital Energy

The vis-viva equation relates orbital velocity $v$ and radius vector $r$ to semi-major axis $a$:

$ v^2 = mu (frac(2, r) - frac(1, a)) $

#rect(fill: luma(240), stroke: 1pt + rgb("38bdf8"), radius: 4pt)[
  *Theorem 1.1 (Orbital Invariant)*: For any closed elliptic lunar trajectory, the specific angular momentum vector $bold(h) = bold(r) times bold(v)$ remains strictly constant over the epoch $[t_0, t_f]$.
]

== Orbital Parameterization Matrix

#table(
  columns: (1fr, 1.5fr, 1fr),
  [ *Parameter* ], [ *Symbolic Formulation* ], [ *Canonical Unit* ],
  [ Eccentricity ], [ $e = sqrt(1 - frac(b^2, a^2))$ ], [ Dimensionless ],
  [ Orbital Period ], [ $T = 2 pi sqrt(frac(a^3, mu))$ ], [ Seconds (s) ],
  [ Escape Velocity ], [ $v_e = sqrt(frac(2 mu, r))$ ], [ km / s ],
)
```

---

## 2. Apollo's Empirical Observatory (`r`)

The R statistical computing language powers deep econometric modeling, ordinary least squares (OLS) regression, hypothesis testing, and confidence interval decomposition.

```r
# Apollo's Empirical Observatory • Lunar Orbit Telemetry Regression
library(ggplot2)

# Orbital altitude (km) vs Signal Attenuation (dB)
altitude <- c(100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650)
attenuation <- c(12.4, 15.1, 19.3, 22.8, 26.5, 30.2, 33.7, 38.0, 41.5, 45.3, 49.0, 52.8)

# Fit Ordinary Least Squares (OLS) Linear Model
model <- lm(attenuation ~ altitude)
summary(model)

# Correlation and variance analysis
cor(altitude, attenuation)
anova(model)
```

---

## 3. Daedalus's 3D Parametric Forge (`openscad`)

OpenSCAD is the programmatic standard for 3D CAD modeling. It uses Constructive Solid Geometry (CSG) to create complex physical parts through boolean unions, subtractions, and rotations.

```openscad
// Daedalus's 3D Parametric Forge • Celestial Cube with Cylindrical Bore
$fn = 32;

// Outer dimensions
cube_size = 40;
bore_radius = 12;
bore_height = 50;

difference() {
    // Primary cubic body
    cube([cube_size, cube_size, cube_size], center = true);

    // Three orthogonal cylindrical bores
    cylinder(h = bore_height, r = bore_radius, center = true);
    
    rotate([90, 0, 0])
        cylinder(h = bore_height, r = bore_radius, center = true);
        
    rotate([0, 90, 0])
        cylinder(h = bore_height, r = bore_radius, center = true);
}
```
