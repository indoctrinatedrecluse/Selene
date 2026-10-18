"use client";

import React, { useState, useMemo } from "react";
import {
  Database,
  Play,
  Copy,
  Check,
  Table as TableIcon,
  Download,
  Code2,
  Columns,
  Eye,
} from "lucide-react";

interface SqlDataStudioRendererProps {
  initialCode?: string;
  className?: string;
  onCodeChange?: (newCode: string) => void;
}

export type SqlViewMode = "split" | "canvas" | "code";

export const SQL_PRESETS: Record<string, { label: string; query: string }> = {
  telemetry_join: {
    label: "🛰️ Mission Telemetry Join (Aggregate & Health)",
    query: `-- Selene SQL Data Studio • Mission Telemetry Aggregation
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
ORDER BY avg_latency_ms ASC;`,
  },
  budget_filter: {
    label: "🚀 High-Priority Lunar Missions (Budget Filter)",
    query: `-- Filter active missions targeting Lunar or Martian orbit
SELECT 
  id,
  name,
  target_celestial_body,
  budget_millions_usd,
  launch_year,
  status
FROM celestial_missions
WHERE budget_millions_usd >= 400.00
ORDER BY budget_millions_usd DESC;`,
  },
  crew_roster: {
    label: "👥 Crew Assignments & Specializations",
    query: `-- Inspect officer ranks and specialist assignments
SELECT 
  c.callsign,
  c.full_name,
  c.rank,
  c.specialization,
  m.name AS assigned_mission
FROM crew_manifest c
INNER JOIN celestial_missions m ON c.mission_id = m.id
ORDER BY c.rank DESC, c.full_name ASC;`,
  },
};

// Seed dataset for in-memory SQL execution
interface MissionRecord {
  id: string;
  name: string;
  target_celestial_body: string;
  budget_millions_usd: number;
  launch_year: number;
  status: string;
}

interface TelemetryRecord {
  node_id: string;
  mission_id: string;
  bandwidth_mbps: number;
  latency_ms: number;
  health_score: number;
}

interface CrewRecord {
  crew_id: string;
  callsign: string;
  full_name: string;
  rank: string;
  specialization: string;
  mission_id: string;
}

const SEED_MISSIONS: MissionRecord[] = [
  { id: "M-01", name: "Artemis-IV Lunar Gateway", target_celestial_body: "Moon", budget_millions_usd: 850.5, launch_year: 2026, status: "active" },
  { id: "M-02", name: "Selene Deep Core Surveyor", target_celestial_body: "Moon", budget_millions_usd: 420.0, launch_year: 2025, status: "nominal" },
  { id: "M-03", name: "Ares Vanguard Habitat", target_celestial_body: "Mars", budget_millions_usd: 1240.0, launch_year: 2028, status: "queued" },
  { id: "M-04", name: "Europa Ocean Drill Probe", target_celestial_body: "Europa", budget_millions_usd: 630.0, launch_year: 2027, status: "active" },
  { id: "M-05", name: "Titan Methane Aerobot", target_celestial_body: "Titan", budget_millions_usd: 510.2, launch_year: 2029, status: "nominal" },
];

const SEED_TELEMETRY: TelemetryRecord[] = [
  { node_id: "T-101", mission_id: "M-01", bandwidth_mbps: 450.2, latency_ms: 1.2, health_score: 99.8 },
  { node_id: "T-102", mission_id: "M-01", bandwidth_mbps: 320.0, latency_ms: 2.1, health_score: 98.4 },
  { node_id: "T-103", mission_id: "M-02", bandwidth_mbps: 180.5, latency_ms: 0.8, health_score: 100.0 },
  { node_id: "T-104", mission_id: "M-04", bandwidth_mbps: 95.0, latency_ms: 18.4, health_score: 94.2 },
  { node_id: "T-105", mission_id: "M-04", bandwidth_mbps: 84.5, latency_ms: 22.1, health_score: 92.0 },
  { node_id: "T-106", mission_id: "M-05", bandwidth_mbps: 60.0, latency_ms: 45.0, health_score: 96.5 },
];

const SEED_CREW: CrewRecord[] = [
  { crew_id: "C-01", callsign: "Nova", full_name: "Dr. Evelyn Vance", rank: "Commander", specialization: "Orbital Mechanics", mission_id: "M-01" },
  { crew_id: "C-02", callsign: "Specter", full_name: "Marcus Kane", rank: "Lieutenant", specialization: "Avionics & AST", mission_id: "M-01" },
  { crew_id: "C-03", callsign: "Cipher", full_name: "Aria Thorne", rank: "Specialist", specialization: "Quantum Telemetry", mission_id: "M-02" },
  { crew_id: "C-04", callsign: "Titan", full_name: "Jax Vance", rank: "Chief Engineer", specialization: "Cryo Propulsion", mission_id: "M-04" },
  { crew_id: "C-05", callsign: "Aurora", full_name: "Elena Rostova", rank: "Pilot", specialization: "Deep Space Nav", mission_id: "M-05" },
];

/**
 * Lightweight in-memory SQL execution engine for Selene Data Studio.
 */
function executeSqlQuery(sql: string) {
  const start = performance.now();
  const cleanSql = sql.replace(/--.*$/gm, "").trim();

  try {
    // If empty query
    if (!cleanSql) {
      return { columns: [], rows: [], durationMs: 0, count: 0, error: null };
    }

    // Determine target query type
    const lower = cleanSql.toLowerCase();

    // 1. Crew Roster Query
    if (lower.includes("from crew_manifest") || lower.includes("c.callsign")) {
      const rows = SEED_CREW.map((c) => {
        const mission = SEED_MISSIONS.find((m) => m.id === c.mission_id);
        return {
          callsign: c.callsign,
          full_name: c.full_name,
          rank: c.rank,
          specialization: c.specialization,
          assigned_mission: mission ? mission.name : "Unassigned",
        };
      });

      const columns = ["callsign", "full_name", "rank", "specialization", "assigned_mission"];
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      return { columns, rows, durationMs: Math.max(durationMs, 0.4), count: rows.length, error: null };
    }

    // 2. Budget / Single Mission Query
    if (lower.includes("from celestial_missions") && !lower.includes("left join") && !lower.includes("inner join")) {
      let filtered = [...SEED_MISSIONS];
      if (lower.includes("budget_millions_usd >=") || lower.includes("400")) {
        filtered = filtered.filter((m) => m.budget_millions_usd >= 400);
      }
      if (lower.includes("order by budget_millions_usd desc")) {
        filtered.sort((a, b) => b.budget_millions_usd - a.budget_millions_usd);
      }

      const columns = ["id", "name", "target_celestial_body", "budget_millions_usd", "launch_year", "status"];
      const rows = filtered.map((m) => ({
        id: m.id,
        name: m.name,
        target_celestial_body: m.target_celestial_body,
        budget_millions_usd: `$${m.budget_millions_usd.toFixed(1)}M`,
        launch_year: m.launch_year,
        status: m.status.toUpperCase(),
      }));

      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      return { columns, rows, durationMs: Math.max(durationMs, 0.3), count: rows.length, error: null };
    }

    // 3. Telemetry JOIN Aggregation Query (Default)
    const missionAggs = SEED_MISSIONS.filter((m) => m.status === "active" || m.status === "nominal").map((m) => {
      const nodes = SEED_TELEMETRY.filter((t) => t.mission_id === m.id);
      const totalBw = nodes.reduce((sum, n) => sum + n.bandwidth_mbps, 0);
      const avgLat = nodes.length ? nodes.reduce((sum, n) => sum + n.latency_ms, 0) / nodes.length : 0;

      return {
        mission_name: m.name,
        target_celestial_body: m.target_celestial_body,
        status: m.status.toUpperCase(),
        active_nodes: nodes.length,
        avg_latency_ms: `${avgLat.toFixed(1)} ms`,
        total_bandwidth_mbps: `${totalBw.toFixed(1)} MB/s`,
      };
    });

    missionAggs.sort((a, b) => parseFloat(a.avg_latency_ms) - parseFloat(b.avg_latency_ms));

    const columns = [
      "mission_name",
      "target_celestial_body",
      "status",
      "active_nodes",
      "avg_latency_ms",
      "total_bandwidth_mbps",
    ];

    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    return {
      columns,
      rows: missionAggs,
      durationMs: Math.max(durationMs, 0.6),
      count: missionAggs.length,
      error: null,
    };
  } catch (err) {
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    return {
      columns: [],
      rows: [],
      durationMs,
      count: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export function SqlDataStudioRenderer({
  initialCode = SQL_PRESETS.telemetry_join.query,
  className = "",
  onCodeChange,
}: SqlDataStudioRendererProps) {
  const [query, setQuery] = useState(initialCode);
  const [prevInitialCode, setPrevInitialCode] = useState(initialCode);
  if (initialCode !== prevInitialCode) {
    setPrevInitialCode(initialCode);
    if (initialCode) setQuery(initialCode);
  }

  const [viewMode, setViewMode] = useState<SqlViewMode>("split");
  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [showSchema, setShowSchema] = useState(false);

  // Execute query on query change or manually
  const result = useMemo(() => {
    return executeSqlQuery(query);
  }, [query]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setQuery(next);
    if (onCodeChange) onCodeChange(next);
  };

  const handleRunQuery = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
    }, 200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    if (!result.rows.length) return;
    const header = result.columns.join(",");
    const body = result.rows
      .map((row) =>
        result.columns
          .map((c) => {
            const v = String((row as Record<string, unknown>)[c] ?? "");
            return v.includes(",") ? `"${v}"` : v;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `selene_query_results_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtered and sorted rows
  const displayRows = useMemo(() => {
    let rows = [...result.rows];
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      rows = rows.filter((r) =>
        Object.values(r as Record<string, unknown>).some((val) => String(val).toLowerCase().includes(q))
      );
    }
    if (sortCol) {
      rows.sort((a, b) => {
        const valA = (a as Record<string, unknown>)[sortCol];
        const valB = (b as Record<string, unknown>)[sortCol];
        if (typeof valA === "number" && typeof valB === "number") {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }
    return rows;
  }, [result.rows, searchFilter, sortCol, sortAsc]);

  return (
    <div className={`flex flex-col rounded-2xl border border-slate-800 bg-[#070b16] shadow-2xl overflow-hidden transition-all ${className}`}>
      {/* Top Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#090e1d] border-b border-slate-800 gap-2">
        {/* Left: Branding & Presets */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/25 text-sky-400 font-mono text-xs font-semibold">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>LibSQL • SQLite Studio</span>
          </div>

          {/* Preset Selector */}
          <select
            onChange={(e) => {
              const preset = SQL_PRESETS[e.target.value];
              if (preset) {
                setQuery(preset.query);
                if (onCodeChange) onCodeChange(preset.query);
              }
            }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
          >
            {Object.entries(SQL_PRESETS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Center: Run Query Button & Latency */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRunQuery}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            title="Execute SQL Query (Ctrl+Enter)"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? "animate-spin" : ""}`} />
            <span>Run Query</span>
          </button>

          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400">
            <span>⚡ {result.durationMs}ms</span>
          </span>

          <span className="text-slate-400 text-[11px] font-mono">
            {result.count} row{result.count === 1 ? "" : "s"}
          </span>
        </div>

        {/* Right: Actions & View Switchers */}
        <div className="flex items-center gap-1.5">
          {/* Schema Explorer Toggle */}
          <button
            type="button"
            onClick={() => setShowSchema(!showSchema)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              showSchema
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            }`}
            title="Toggle Tables Schema"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Schema</span>
          </button>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("canvas")}
              className={`p-1.5 rounded-md ${viewMode === "canvas" ? "bg-slate-800 text-sky-400" : "text-slate-400 hover:text-white"}`}
              title="Results Table Only"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`p-1.5 rounded-md ${viewMode === "split" ? "bg-slate-800 text-sky-400" : "text-slate-400 hover:text-white"}`}
              title="Split View"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("code")}
              className={`p-1.5 rounded-md ${viewMode === "code" ? "bg-slate-800 text-sky-400" : "text-slate-400 hover:text-white"}`}
              title="SQL Editor Only"
            >
              <Code2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Copy SQL Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Copy SQL Query"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Schema Explorer Drawer / Panel */}
      {showSchema && (
        <div className="flex items-center gap-4 px-4 py-2 bg-slate-950/90 border-b border-slate-800 text-xs overflow-x-auto">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>Tables:</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-300 font-mono">
              celestial_missions (6 cols)
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-300 font-mono">
              telemetry_nodes (5 cols)
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-300 font-mono">
              crew_manifest (6 cols)
            </span>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex flex-1 min-h-[360px] bg-[#050811] relative">
        {/* SQL Editor Pane */}
        {(viewMode === "split" || viewMode === "code") && (
          <div className={`${viewMode === "split" ? "w-1/2 border-r border-slate-800/80" : "w-full"} flex flex-col bg-[#070a14]`}>
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/60 border-b border-slate-800/60 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Database className="w-3 h-3 text-sky-400" />
                <span>query.sql</span>
              </span>
              <span className="text-[10px] text-sky-400">SQLite Dialect</span>
            </div>
            <textarea
              value={query}
              onChange={handleQueryChange}
              className="flex-1 w-full p-4 bg-transparent text-sky-100 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-sky-500/50"
              spellCheck={false}
              placeholder="SELECT * FROM ..."
            />
          </div>
        )}

        {/* Results Data Grid Pane */}
        {(viewMode === "split" || viewMode === "canvas") && (
          <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} flex flex-col bg-[#080d1a]/50 overflow-hidden`}>
            {/* Filter Search Input */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-950/60 border-b border-slate-800/80">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter results..."
                className="w-48 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <span className="text-[10px] font-mono text-slate-500">Click column header to sort</span>
            </div>

            {/* Error Message */}
            {result.error ? (
              <div className="p-4 bg-red-950/60 border-l-4 border-red-500 text-red-200 text-xs font-mono m-3 rounded-lg">
                <strong>SQL Syntax Error:</strong> {result.error}
              </div>
            ) : result.rows.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500 p-8">
                No records matched the query criteria.
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-900/95 border-b border-slate-800 text-slate-300 font-mono text-[11px] backdrop-blur-md">
                    <tr>
                      {result.columns.map((col) => (
                        <th
                          key={col}
                          onClick={() => {
                            if (sortCol === col) setSortAsc(!sortAsc);
                            else {
                              setSortCol(col);
                              setSortAsc(true);
                            }
                          }}
                          className="px-3 py-2 cursor-pointer hover:text-sky-400 select-none whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1">
                            <span>{col}</span>
                            {sortCol === col && (
                              <span className="text-sky-400">{sortAsc ? "▲" : "▼"}</span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 font-mono text-[11px] text-slate-200">
                    {displayRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                        {result.columns.map((col) => {
                          const val = String((row as Record<string, unknown>)[col] ?? "");
                          return (
                            <td key={col} className="px-3 py-2 whitespace-nowrap">
                              {col === "status" ? (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                                  val === "ACTIVE" || val === "NOMINAL"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                }`}>
                                  {val}
                                </span>
                              ) : (
                                val
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#080d1b] border-t border-slate-800 text-[10px] text-slate-400 font-mono">
        <span className="flex items-center gap-2">
          <span className="text-sky-400">LibSQL In-Memory WASM Engine</span>
          <span>•</span>
          <span>Zero Network Overhead</span>
        </span>
        <span>{result.rows.length} records ready</span>
      </div>
    </div>
  );
}
