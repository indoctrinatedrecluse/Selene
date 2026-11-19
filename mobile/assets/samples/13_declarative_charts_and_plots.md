`# 📊 Declarative Charting & Data Plotting Engine

Selene introduces a native **Declarative Charting Engine** (\`chart\` / \`plot\`) allowing data scientists, engineers, and researchers to author interactive vector charts directly inside markdown canvases.

> [!NOTE]
> 📈 **Declarative Vector Graphics**:
> - **Zero External Bundle Dependencies**: Rendered using ultra-crisp responsive SVGs with hardware-accelerated animations.
> - **Supported Visualizations**: Bar (grouped/stacked), Line (smooth Catmull-Rom), Area, Scatter, Donut / Pie, and Heatmap matrices.
> - **Interactive Controls**: Real-time chart-type switcher, interactive hover tooltips, live specification editor, tabular data inspector, and 1-click SVG/CSV downloads.

---

## ⚡ 1. High-Performance Multi-Series Line Chart

Below is a declarative line plot tracking inference throughput across global clusters:

\`\`\`chart
{
  "type": "line",
  "title": "Global Neural Cluster Throughput",
  "description": "Requests per second (kRPS) across distributed edge nodes",
  "xKey": "month",
  "yKey": ["us_east", "eu_west", "ap_southeast"],
  "colors": ["#38bdf8", "#818cf8", "#34d399"],
  "data": [
    { "month": "Jan", "us_east": 45, "eu_west": 32, "ap_southeast": 28 },
    { "month": "Feb", "us_east": 58, "eu_west": 41, "ap_southeast": 36 },
    { "month": "Mar", "us_east": 72, "eu_west": 54, "ap_southeast": 49 },
    { "month": "Apr", "us_east": 89, "eu_west": 68, "ap_southeast": 61 },
    { "month": "May", "us_east": 115, "eu_west": 87, "ap_southeast": 79 },
    { "month": "Jun", "us_east": 142, "eu_west": 105, "ap_southeast": 98 }
  ]
}
\`\`\`

---

## ⚡ 2. Grouped Bar & Cost Efficiency Breakdown

\`\`\`chart
{
  "type": "bar",
  "title": "Cloud Compute vs On-Premises Cost (USD/M Tokens)",
  "description": "Comparison of inferencing unit cost across hardware architectures",
  "xKey": "model",
  "yKey": ["cloud_gpu", "local_fpga", "optimized_npu"],
  "colors": ["#f472b6", "#fbbf24", "#38bdf8"],
  "data": [
    { "model": "Mistral-7B", "cloud_gpu": 0.42, "local_fpga": 0.28, "optimized_npu": 0.14 },
    { "model": "Llama-3-70B", "cloud_gpu": 2.85, "local_fpga": 1.95, "optimized_npu": 1.12 },
    { "model": "DeepSeek-V3", "cloud_gpu": 1.65, "local_fpga": 1.10, "optimized_npu": 0.65 },
    { "model": "Gemini-2.5", "cloud_gpu": 0.95, "local_fpga": 0.65, "optimized_npu": 0.38 }
  ]
}
\`\`\`

---

## ⚡ 3. Donut Market Share Distribution

\`\`\`chart
{
  "type": "donut",
  "title": "Global Model Ingestion Distribution",
  "description": "Proportion of documents transcribed via multimodal vision pipelines",
  "xKey": "modality",
  "yKey": "volume_share",
  "colors": ["#38bdf8", "#818cf8", "#34d399", "#fbbf24"],
  "data": [
    { "modality": "Academic Papers (PDF)", "volume_share": 42 },
    { "modality": "Architecture Diagrams", "volume_share": 28 },
    { "modality": "Handwritten Math", "volume_share": 18 },
    { "modality": "Technical Code Docs", "volume_share": 12 }
  ]
}
\`\`\`
`,