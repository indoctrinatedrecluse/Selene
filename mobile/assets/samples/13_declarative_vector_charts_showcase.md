# 📊 Declarative Vector Charts & Visualizations Showcase

Selene features a zero-dependency, pure SVG declarative charting engine. Transform structured JSON specifications into interactive, high-performance data visualizations with custom themes, smooth cubic-bezier curves, tooltips, and instant SVG/CSV export.

> [!NOTE]
> 📈 **Pure SVG Rendering**:
> - **Zero Canvas Overhead**: All visualizations are generated as accessible SVG vector nodes, ensuring razor-sharp clarity on Retina / 4K displays.
> - **Multi-Type Polymorphism**: Supports `area`, `bar`, `line`, `scatter`, `donut`, `pie`, and `heatmap` visualization modes.
> - **Direct Tooling**: Click **SVG Export** or **CSV Export** directly above the chart to download publication-ready graphics.

---

## ⚡ 1. Multi-Series Area Chart (Mission Telemetry & Uplink)

Below is a live multi-series area chart tracking telemetry packet throughput and carrier signal strength across orbital passes:

```chart
{
  "type": "area",
  "title": "Artemis Orbital Passes: Telemetry Throughput",
  "description": "Comparative telemetry packet volume (MB/s) and uplink signal ratio over four tracking intervals",
  "xKey": "pass",
  "yKey": ["telemetry_mbps", "carrier_signal"],
  "colors": ["#38bdf8", "#818cf8"],
  "options": {
    "curved": true,
    "showGrid": true,
    "showPoints": true,
    "showLegend": true
  },
  "data": [
    { "pass": "Pass 1 (Perigee)", "telemetry_mbps": 140, "carrier_signal": 88 },
    { "pass": "Pass 2 (Translunar)", "telemetry_mbps": 290, "carrier_signal": 145 },
    { "pass": "Pass 3 (Lunar Capture)", "telemetry_mbps": 480, "carrier_signal": 230 },
    { "pass": "Pass 4 (Station Orbit)", "telemetry_mbps": 720, "carrier_signal": 390 }
  ]
}
```

---

## 📊 2. Comparative Multi-Bar Chart (Deep-Space Mission Budgets)

Compare project funding allocations across global space agencies and mission milestones:

```chart
{
  "type": "bar",
  "title": "Lunar & Deep-Space Exploration Budgets",
  "description": "Funding allocations in millions USD across fiscal quarters",
  "xKey": "agency",
  "yKey": ["habitation", "propulsion", "robotics"],
  "colors": ["#38bdf8", "#34d399", "#fbbf24"],
  "options": {
    "showGrid": true,
    "showLegend": true
  },
  "data": [
    { "agency": "NASA Artemis", "habitation": 420, "propulsion": 680, "robotics": 310 },
    { "agency": "ESA Moonlight", "habitation": 290, "propulsion": 410, "robotics": 260 },
    { "agency": "JAXA SLIM-II", "habitation": 180, "propulsion": 240, "robotics": 390 },
    { "agency": "ISRO Chandrayaan", "habitation": 120, "propulsion": 190, "robotics": 280 }
  ]
}
```

---

## 🍩 3. Multi-Segment Donut Chart (Subsystem Power Consumption)

Visualizing the distribution of power draws on board the Selene Lunar Gateway Station:

```chart
{
  "type": "donut",
  "title": "Selene Station Power Distribution",
  "description": "Power consumption percentage by critical habitat subsystem",
  "xKey": "subsystem",
  "yKey": "power_kw",
  "colors": ["#38bdf8", "#818cf8", "#34d399", "#fbbf24", "#f472b6"],
  "options": {
    "innerRadius": 0.65,
    "showLegend": true
  },
  "data": [
    { "subsystem": "Life Support (ECLSS)", "power_kw": 45 },
    { "subsystem": "Ion Propulsion", "power_kw": 65 },
    { "subsystem": "Thermal Radiators", "power_kw": 25 },
    { "subsystem": "Scientific Payloads", "power_kw": 30 },
    { "subsystem": "Deep-Space Comms", "power_kw": 18 }
  ]
}
```

---

## 📈 4. Multi-Series Line Chart (Lunar Surface Thermal Cycles)

Track daytime and sub-surface temperature dynamics across 14 Earth days of lunar daylight:

```chart
{
  "type": "line",
  "title": "Equatorial Lunar Temperature Dynamics",
  "description": "Surface regolith vs 1-meter sub-surface borehole temperature (°C)",
  "xKey": "sol_day",
  "yKey": ["surface_temp", "borehole_temp"],
  "colors": ["#f43f5e", "#06b6d4"],
  "options": {
    "curved": true,
    "showGrid": true,
    "showPoints": true,
    "showLegend": true
  },
  "data": [
    { "sol_day": "Sol 01", "surface_temp": -130, "borehole_temp": -20 },
    { "sol_day": "Sol 03", "surface_temp": -40, "borehole_temp": -20 },
    { "sol_day": "Sol 06", "surface_temp": 50, "borehole_temp": -19 },
    { "sol_day": "Sol 08", "surface_temp": 115, "borehole_temp": -19 },
    { "sol_day": "Sol 10", "surface_temp": 120, "borehole_temp": -18 },
    { "sol_day": "Sol 12", "surface_temp": 45, "borehole_temp": -19 },
    { "sol_day": "Sol 14", "surface_temp": -120, "borehole_temp": -20 }
  ]
}
```
