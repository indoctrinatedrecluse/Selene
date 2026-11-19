`# 🦆 DuckDB-WASM In-Browser Analytical OLAP Engine

Welcome to the **DuckDB-WASM Analytical OLAP Studio**! Selene brings true vectorized columnar SQL querying directly into your browser, allowing you to run aggregations, percentiles, and complex group-by analytical queries over multi-thousand row datasets in **single-digit milliseconds**.

> [!NOTE]
> ⚡ **DuckDB In-Browser Capabilities**:
> - **Vectorized Columnar Execution**: Scans thousands of rows with SIMD-optimized memory layouts.
> - **Zero Server Dependencies**: Executes 100% locally in-memory inside the browser runtime.
> - **Pre-Loaded & Custom Datasets**: Query real-time telemetry logs, fintech orders, or retail orders with instantaneous responsiveness.
> - **Interactive Studio**: Built-in syntax highlighting, <kbd>Ctrl</kbd>+<kbd>Enter</kbd> execution, column sorting, pagination, and CSV export.

---

## ⚡ 1. Edge Telemetry Analysis (Aggregation & Group By)

Run the query below to calculate mean latency, CPU utilization, and request volume grouped across global cloud regions:

\`\`\`duckdb
-- In-Browser Analytical OLAP Query
SELECT 
  region,
  COUNT(*) AS total_samples,
  ROUND(AVG(latency_ms), 1) AS mean_latency_ms,
  MAX(latency_ms) AS peak_latency_ms,
  ROUND(AVG(cpu_pct), 1) AS avg_cpu_pct
FROM telemetry_logs
WHERE latency_ms > 25
GROUP BY region
ORDER BY mean_latency_ms ASC;
\`\`\`

---

## ⚡ 2. High-Frequency Fintech Volume-Weighted Analysis

Switch the dataset to \`fintech_orders\` to analyze volume-weighted average price (VWAP) across major tickers:

\`\`\`duckdb
SELECT 
  ticker,
  exchange,
  COUNT(*) AS order_count,
  SUM(volume) AS total_shares,
  ROUND(AVG(price_usd), 2) AS avg_execution_price,
  ROUND(SUM(fee_usd), 2) AS total_fees_paid
FROM fintech_orders
WHERE volume > 200
GROUP BY ticker, exchange
ORDER BY total_shares DESC
LIMIT 20;
\`\`\`
`,