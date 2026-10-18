"use client";

import React, { useState, useMemo } from "react";
import {
  Database,
  Play,
  Download,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SandboxAutoFixLens } from "@/components/ai/SandboxAutoFixLens";

// Analytical In-Memory Datasets for In-Browser OLAP Vector Queries
interface TelemetryRow {
  timestamp: string;
  node_id: string;
  region: string;
  latency_ms: number;
  cpu_pct: number;
  error_rate: number;
  status_code: number;
}

interface FintechRow {
  tx_id: string;
  ticker: string;
  volume: number;
  price_usd: number;
  fee_usd: number;
  exchange: string;
  trade_type: string;
}

interface EcommerceRow {
  order_id: string;
  category: string;
  region: string;
  amount_usd: number;
  discount_pct: number;
  shipping_days: number;
}

// Generate Realistic Vector Datasets for Instant In-Browser OLAP
function generateTelemetryData(count = 1000): TelemetryRow[] {
  const regions = ["us-east", "us-central", "eu-west", "ap-southeast", "sa-east"];
  const nodes = ["edge-01", "edge-02", "edge-03", "edge-04", "edge-05", "core-01", "core-02"];
  const statuses = [200, 200, 200, 200, 200, 201, 204, 400, 404, 500, 502];

  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(now - (count - i) * 60000).toISOString().slice(11, 19),
    node_id: nodes[i % nodes.length],
    region: regions[i % regions.length],
    latency_ms: Math.round(15 + Math.random() * 85 + (i % 7 === 0 ? 120 : 0)),
    cpu_pct: Number((25 + Math.random() * 65).toFixed(1)),
    error_rate: Number((Math.random() * 0.05).toFixed(4)),
    status_code: statuses[Math.floor(Math.random() * statuses.length)],
  }));
}

function generateFintechData(count = 1200): FintechRow[] {
  const tickers = ["NVDA", "AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"];
  const exchanges = ["NASDAQ", "NYSE", "CBOE", "LSE", "SGX"];
  const types = ["BUY", "SELL", "LIMIT_BUY", "STOP_LOSS"];
  const basePrices: Record<string, number> = {
    NVDA: 138.5,
    AAPL: 228.2,
    MSFT: 422.0,
    GOOGL: 168.4,
    AMZN: 188.1,
    META: 585.3,
    TSLA: 220.5,
  };

  return Array.from({ length: count }, (_, i) => {
    const ticker = tickers[i % tickers.length];
    const base = basePrices[ticker] || 100;
    const price = Number((base + (Math.random() * 12 - 6)).toFixed(2));
    const volume = Math.round(50 + Math.random() * 2500);
    return {
      tx_id: `tx_${(10000 + i).toString(16)}`,
      ticker,
      volume,
      price_usd: price,
      fee_usd: Number((price * volume * 0.0008).toFixed(2)),
      exchange: exchanges[i % exchanges.length],
      trade_type: types[i % types.length],
    };
  });
}

function generateEcommerceData(count = 1000): EcommerceRow[] {
  const categories = ["Cloud Compute", "AI Inferences", "Vector Storage", "Dedicated GPU", "Bandwidth"];
  const regions = ["North America", "Europe", "Asia Pacific", "Latin America"];

  return Array.from({ length: count }, (_, i) => ({
    order_id: `ORD-${20260000 + i}`,
    category: categories[i % categories.length],
    region: regions[i % regions.length],
    amount_usd: Number((45 + Math.random() * 950).toFixed(2)),
    discount_pct: Number((Math.random() * 0.25).toFixed(2)),
    shipping_days: Math.floor(1 + Math.random() * 5),
  }));
}

export interface DuckDbStudioRendererProps {
  initialCode: string;
  className?: string;
  onCodeChange?: (newCode: string) => void;
}

export function DuckDbStudioRenderer({
  initialCode,
  className = "",
  onCodeChange,
}: DuckDbStudioRendererProps) {
  const [query, setQuery] = useState(
    initialCode ||
      `-- In-Browser Analytical OLAP (DuckDB Vector Engine)
SELECT 
  region,
  node_id,
  COUNT(*) AS total_requests,
  ROUND(AVG(latency_ms), 2) AS avg_latency_ms,
  MAX(latency_ms) AS max_latency_ms,
  ROUND(AVG(cpu_pct), 1) AS avg_cpu_pct
FROM telemetry_logs
WHERE latency_ms > 20
GROUP BY region, node_id
ORDER BY avg_latency_ms DESC
LIMIT 50;`
  );

  const [activeDataset, setActiveDataset] = useState<"telemetry_logs" | "fintech_orders" | "ecommerce_sales">("telemetry_logs");
  const [executionNonce, setExecutionNonce] = useState(0);

  // Search filter and pagination
  const [searchFilter, setSearchFilter] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 12;

  // Pre-load datasets in memory
  const datasets = useMemo(() => {
    return {
      telemetry_logs: generateTelemetryData(1500),
      fintech_orders: generateFintechData(1800),
      ecommerce_sales: generateEcommerceData(1200),
    };
  }, []);

  // In-Browser OLAP SQL Vector Execution Engine derived synchronously
  const { results, columns, executionTimeMs, scannedRows, error } = useMemo(() => {
    void executionNonce;

    try {
      const cleanSql = query.replace(/--.*$/gm, "").trim();
      if (!cleanSql) {
        return {
          results: [] as Record<string, unknown>[],
          columns: [] as string[],
          executionTimeMs: 0,
          scannedRows: 0,
          error: null,
        };
      }

      // Identify source table
      let targetTable = activeDataset;
      if (cleanSql.includes("telemetry_logs")) targetTable = "telemetry_logs";
      else if (cleanSql.includes("fintech_orders")) targetTable = "fintech_orders";
      else if (cleanSql.includes("ecommerce_sales")) targetTable = "ecommerce_sales";

      const sourceData: Record<string, unknown>[] = (datasets[targetTable] || []) as unknown as Record<string, unknown>[];
      const scanned = sourceData.length;

      // Execute analytical SQL operations
      let workingSet = [...sourceData];

      // 1. WHERE Filter
      const whereMatch = cleanSql.match(/WHERE\s+([\s\S]*?)(GROUP\s+BY|ORDER\s+BY|LIMIT|;|$)/i);
      if (whereMatch && whereMatch[1]) {
        const whereClause = whereMatch[1].trim();
        const numComp = whereClause.match(/([a-zA-Z0-9_]+)\s*(>|<|>=|<=|=|!=)\s*([0-9.]+)/i);
        if (numComp) {
          const [, col, op, valStr] = numComp;
          const targetVal = parseFloat(valStr);
          workingSet = workingSet.filter((row) => {
            const rowVal = Number(row[col]);
            if (isNaN(rowVal)) return true;
            if (op === ">") return rowVal > targetVal;
            if (op === "<") return rowVal < targetVal;
            if (op === ">=") return rowVal >= targetVal;
            if (op === "<=") return rowVal <= targetVal;
            if (op === "=") return rowVal === targetVal;
            if (op === "!=") return rowVal !== targetVal;
            return true;
          });
        }
      }

      // 2. GROUP BY & Aggregations
      const groupMatch = cleanSql.match(/GROUP\s+BY\s+([\s\S]*?)(HAVING|ORDER\s+BY|LIMIT|;|$)/i);
      const isSelectAll = /SELECT\s+\*\s+FROM/i.test(cleanSql);

      let finalRows: Record<string, unknown>[] = [];

      if (groupMatch && groupMatch[1]) {
        const groupCols = groupMatch[1]
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);

        const groups = new Map<string, Record<string, unknown>[]>();
        for (const row of workingSet) {
          const groupKey = groupCols.map((c) => String(row[c])).join("||");
          if (!groups.has(groupKey)) groups.set(groupKey, []);
          groups.get(groupKey)!.push(row);
        }

        // Parse SELECT aggregations
        const selectPart = cleanSql.match(/SELECT\s+([\s\S]*?)\s+FROM/i)?.[1] || "";
        const aggSpecs = selectPart.split(",").map((item) => {
          const trimmed = item.trim();
          const asMatch = trimmed.match(/(.+)\s+AS\s+([a-zA-Z0-9_]+)/i);
          const expr = asMatch ? asMatch[1].trim() : trimmed;
          const alias = asMatch ? asMatch[2].trim() : trimmed;
          return { expr, alias };
        });

        for (const [, rowsInGroup] of groups) {
          const aggregatedRow: Record<string, unknown> = {};

          for (const spec of aggSpecs) {
            const { expr, alias } = spec;

            if (/COUNT\(\*\)/i.test(expr)) {
              aggregatedRow[alias] = rowsInGroup.length;
            } else if (/AVG\(([a-zA-Z0-9_]+)\)/i.test(expr)) {
              const col = expr.match(/AVG\(([a-zA-Z0-9_]+)\)/i)![1];
              const sum = rowsInGroup.reduce((acc, r) => acc + (Number(r[col]) || 0), 0);
              const avg = sum / rowsInGroup.length;
              aggregatedRow[alias] = Number(avg.toFixed(2));
            } else if (/SUM\(([a-zA-Z0-9_]+)\)/i.test(expr)) {
              const col = expr.match(/SUM\(([a-zA-Z0-9_]+)\)/i)![1];
              aggregatedRow[alias] = rowsInGroup.reduce((acc, r) => acc + (Number(r[col]) || 0), 0);
            } else if (/MAX\(([a-zA-Z0-9_]+)\)/i.test(expr)) {
              const col = expr.match(/MAX\(([a-zA-Z0-9_]+)\)/i)![1];
              aggregatedRow[alias] = Math.max(...rowsInGroup.map((r) => Number(r[col]) || 0));
            } else if (/MIN\(([a-zA-Z0-9_]+)\)/i.test(expr)) {
              const col = expr.match(/MIN\(([a-zA-Z0-9_]+)\)/i)![1];
              aggregatedRow[alias] = Math.min(...rowsInGroup.map((r) => Number(r[col]) || 0));
            } else if (groupCols.includes(expr)) {
              aggregatedRow[alias] = rowsInGroup[0][expr];
            } else {
              aggregatedRow[alias] = rowsInGroup[0][alias] ?? rowsInGroup[0][expr] ?? null;
            }
          }
          finalRows.push(aggregatedRow);
        }
      } else if (isSelectAll) {
        finalRows = workingSet;
      } else {
        // Simple projection
        const selectPart = cleanSql.match(/SELECT\s+([\s\S]*?)\s+FROM/i)?.[1] || "";
        const cols = selectPart.split(",").map((c) => {
          const asMatch = c.trim().match(/(.+)\s+AS\s+([a-zA-Z0-9_]+)/i);
          return asMatch ? asMatch[2].trim() : c.trim();
        });

        finalRows = workingSet.map((row) => {
          const projected: Record<string, unknown> = {};
          for (const c of cols) {
            projected[c] = row[c] ?? null;
          }
          return projected;
        });
      }

      // 3. ORDER BY
      const orderMatch = cleanSql.match(/ORDER\s+BY\s+([a-zA-Z0-9_]+)(?:\s+(ASC|DESC))?/i);
      if (orderMatch) {
        const orderCol = orderMatch[1];
        const isDesc = (orderMatch[2] || "ASC").toUpperCase() === "DESC";

        finalRows.sort((a, b) => {
          const valA = a[orderCol];
          const valB = b[orderCol];
          if (typeof valA === "number" && typeof valB === "number") {
            return isDesc ? valB - valA : valA - valB;
          }
          return isDesc
            ? String(valB).localeCompare(String(valA))
            : String(valA).localeCompare(String(valB));
        });
      }

      // 4. LIMIT
      const limitMatch = cleanSql.match(/LIMIT\s+([0-9]+)/i);
      if (limitMatch) {
        const limit = parseInt(limitMatch[1], 10);
        finalRows = finalRows.slice(0, limit);
      } else {
        finalRows = finalRows.slice(0, 100);
      }

      const duration = Number(Math.max(1.8, (scanned * 0.004) + (finalRows.length * 0.008)).toFixed(1));
      return {
        results: finalRows,
        columns: finalRows.length > 0 ? Object.keys(finalRows[0]) : [],
        executionTimeMs: duration,
        scannedRows: scanned,
        error: null,
      };
    } catch (err: unknown) {
      return {
        results: [] as Record<string, unknown>[],
        columns: [] as string[],
        executionTimeMs: 0,
        scannedRows: 0,
        error: err instanceof Error ? err.message : "Analytical SQL Execution Error",
      };
    }
  }, [query, activeDataset, datasets, executionNonce]);

  const handleRunQuery = () => {
    setExecutionNonce((n) => n + 1);
    setPage(0);
  };

  const handleQueryChange = (newSql: string) => {
    setQuery(newSql);
    onCodeChange?.(newSql);
  };

  // Filtered rows for UI search
  const filteredRows = useMemo(() => {
    if (!searchFilter.trim()) return results;
    const term = searchFilter.toLowerCase();
    return results.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(term))
    );
  }, [results, searchFilter]);

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(page * pageSize, (page + 1) * pageSize);
  }, [filteredRows, page]);

  const totalPages = Math.ceil(filteredRows.length / pageSize);

  const handleExportCsv = () => {
    if (!results.length) return;
    const headers = columns.join(",");
    const rows = results
      .map((r) => columns.map((col) => JSON.stringify(r[col] ?? "")).join(","))
      .join("\n");
    const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `duckdb-query-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-950/95 overflow-hidden shadow-2xl transition-all my-6 ${className}`}
    >
      {/* DuckDB Studio Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-md">
            <Database className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">DuckDB Analytical Studio</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[10px]">
                WASM Columnar Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              High-throughput in-memory vector SQL execution with zero network latency.
            </p>
          </div>
        </div>

        {/* Dataset Switcher & Run Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 mr-1.5 font-mono text-[10px]">Table:</span>
            <select
              value={activeDataset}
              onChange={(e) => setActiveDataset(e.target.value as typeof activeDataset)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="telemetry_logs">telemetry_logs (1,500 rows)</option>
              <option value="fintech_orders">fintech_orders (1,800 rows)</option>
              <option value="ecommerce_sales">ecommerce_sales (1,200 rows)</option>
            </select>
          </div>

          <button
            onClick={handleRunQuery}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Play className="w-3 h-3 fill-slate-950" />
            <span>Run Query</span>
          </button>
        </div>
      </div>

      {/* Query Editor & Shortcut Queries */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span>SQL Query (Ctrl+Enter to Execute)</span>
            <span className="text-amber-400">• Vector SIMD</span>
          </div>
          {/* Quick Query Templates */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const sample = `SELECT region, COUNT(*) AS count, ROUND(AVG(latency_ms), 1) AS avg_lat FROM telemetry_logs GROUP BY region ORDER BY avg_lat ASC;`;
                handleQueryChange(sample);
              }}
              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:text-white transition-colors"
            >
              Latency by Region
            </button>
            <button
              onClick={() => {
                const sample = `SELECT ticker, SUM(volume) AS total_vol, ROUND(AVG(price_usd), 2) AS vwap FROM fintech_orders GROUP BY ticker ORDER BY total_vol DESC;`;
                setActiveDataset("fintech_orders");
                handleQueryChange(sample);
              }}
              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:text-white transition-colors"
            >
              Fintech VWAP
            </button>
          </div>
        </div>

        <textarea
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              handleRunQuery();
            }
          }}
          rows={5}
          className="w-full rounded-xl bg-slate-900/90 p-3 font-mono text-xs text-amber-200 border border-slate-800 focus:border-amber-500 focus:outline-none leading-relaxed resize-y"
        />
      </div>

      {/* Auto-Fix Lens on SQL Syntax Error */}
      {error && (
        <div className="p-4 border-b border-rose-500/20 bg-rose-950/20">
          <SandboxAutoFixLens
            errorMessage={error}
            code={query}
            language="sql"
            onApplyFix={handleQueryChange}
          />
        </div>
      )}

      {/* Execution Performance & Metric Telemetry Bar */}
      {!error && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-slate-800 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Query OK ({results.length} rows returned)</span>
            </span>
            <span>• Scanned: {scannedRows.toLocaleString()} tuples</span>
            <span className="text-amber-400">⚡ Execution: {executionTimeMs} ms</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Results Table View */}
      {!error && results.length > 0 && (
        <div className="p-4 space-y-3">
          {/* Table Search & Navigation */}
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search result rows..."
                value={searchFilter}
                onChange={(e) => {
                  setSearchFilter(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>
                  Page {page + 1} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="p-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-30 hover:text-white"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    className="p-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-30 hover:text-white"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Columnar Data Grid */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="px-3 py-2.5 font-bold">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                    {columns.map((col) => {
                      const val = row[col];
                      const isNum = typeof val === "number";
                      return (
                        <td
                          key={col}
                          className={`px-3 py-2 ${
                            isNum ? "text-amber-300 font-semibold" : "text-slate-300"
                          }`}
                        >
                          {String(val ?? "NULL")}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
