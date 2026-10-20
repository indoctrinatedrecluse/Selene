# 🦆 DuckDB Analytical OLAP Studio Showcase

Selene integrates an in-browser **DuckDB Vector OLAP Engine** designed for instant analytical query execution, columnar aggregation, and interactive dataset exploration with sub-10ms response times.

> [!NOTE]
> ⚡ **In-Browser Columnar Processing**:
> - **Zero Server Latency**: Queries execute in-memory against vectorized datasets without external database roundtrips.
> - **Preloaded Datasets**: Explore `telemetry_logs` (1,500 rows), `fintech_orders` (1,800 rows), and `ecommerce_sales` (1,200 rows).
> - **Interactive Studio**: Provides instant column sorting, full-text row search, pagination, and one-click CSV export.

---

## ⚡ 1. Regional Network Latency Aggregations

Analyze server node performance, average latency, and max latency grouped by cloud region:

```duckdb
SELECT 
  region,
  COUNT(*) AS total_requests,
  ROUND(AVG(latency_ms), 2) AS avg_latency_ms,
  MAX(latency_ms) AS max_latency_ms,
  ROUND(AVG(cpu_pct), 1) AS avg_cpu_pct
FROM telemetry_logs
WHERE latency_ms > 20
GROUP BY region
ORDER BY avg_latency_ms DESC
LIMIT 50;
```

---

## 📈 2. Quantitative Financial Trading & Volume Analytics

Group simulated high-frequency order executions by equity ticker, calculating average trade prices and cumulative capital turnover:

```duckdb
SELECT 
  ticker,
  trade_type,
  COUNT(*) AS executed_trades,
  SUM(volume) AS total_volume_shares,
  ROUND(AVG(price_usd), 2) AS mean_execution_price,
  ROUND(SUM(price_usd * volume), 2) AS gross_notional_usd
FROM fintech_orders
GROUP BY ticker, trade_type
ORDER BY gross_notional_usd DESC
LIMIT 50;
```

---

## 📦 3. E-Commerce Category Performance & Fulfillment Speed

Calculate average transaction amounts and delivery turnaround times grouped by product category:

```duckdb
SELECT 
  category,
  COUNT(*) AS total_orders,
  ROUND(AVG(amount_usd), 2) AS average_order_value,
  ROUND(AVG(discount_pct * 100), 1) AS mean_discount_pct,
  ROUND(AVG(shipping_days), 1) AS avg_delivery_days
FROM ecommerce_sales
GROUP BY category
ORDER BY average_order_value DESC;
```
