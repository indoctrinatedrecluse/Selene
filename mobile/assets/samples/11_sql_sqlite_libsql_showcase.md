# 🗄️ SQL & LibSQL In-Browser Data Studio Showcase

Selene now features a native, zero-latency **SQL & LibSQL In-Browser Data Studio**! Execute relational queries, inspect data grids, filter records, sort columns, and export data directly within your markdown documents.

> [!NOTE]
> ⚡ **Interactive Data Studio Capabilities**:
> 1. **In-Memory SQL Execution**: Evaluates `SELECT`, `JOIN`, `GROUP BY`, `ORDER BY`, `ROUND()`, `AVG()`, and aggregation functions with sub-millisecond latency.
> 2. **Interactive Tabular Grid**: Sort by clicking column headers, filter records dynamically via the instant search input, and inspect schema structures.
> 3. **Export Suite**: Export result sets to CSV with 1-click.

---

## ⚡ 1. Mission Telemetry Join (Aggregates & Metrics)

Below is an interactive SQL query block joining `celestial_missions` with `telemetry_nodes`. Click **Run Query** (`Ctrl+Enter`) to evaluate in real-time:

```sql
-- Selene SQL Data Studio • Mission Telemetry Aggregation
SELECT 
  m.name AS mission_name,
  m.target_celestial_body,
  m.status,
  COUNT(t.node_id) AS active_nodes,
  ROUND(AVG(t.latency_ms), 1) AS avg_latency_ms,
  ROUND(SUM(t.bandwidth_mbps), 1) AS total_bandwidth_mbps
FROM celestial_missions m
LEFT JOIN telemetry_nodes t ON m.id = t.mission_id
WHERE m.status IN ('active', 'nominal')
GROUP BY m.id, m.name, m.target_celestial_body, m.status
ORDER BY avg_latency_ms ASC;
```

---

## 🚀 2. High-Priority Lunar & Martian Missions

Filter missions with budget thresholds over $400M:

```sqlite
-- Filter active missions targeting Lunar or Martian orbit
SELECT 
  id,
  name,
  target_celestial_body,
  budget_millions_usd,
  launch_year,
  status
FROM celestial_missions
WHERE budget_millions_usd >= 400.00
ORDER BY budget_millions_usd DESC;
```

---

## 👥 3. Crew Manifest & Specialist Roster

Inspect astronaut ranks, callsigns, and assigned missions:

```libsql
-- Inspect officer ranks and specialist assignments
SELECT 
  c.callsign,
  c.full_name,
  c.rank,
  c.specialization,
  m.name AS assigned_mission
FROM crew_manifest c
INNER JOIN celestial_missions m ON c.mission_id = m.id
ORDER BY c.rank DESC, c.full_name ASC;
```

---

## 🛠️ How It Works Under The Hood

- **In-Memory LibSQL Engine**: Runs completely client-side with zero network calls and sub-millisecond execution.
- **Relational Tables Pre-seeded**: Includes `celestial_missions`, `telemetry_nodes`, and `crew_manifest`.
- **Export Ready**: Download query results as CSV for immediate analysis in Excel or Python.
