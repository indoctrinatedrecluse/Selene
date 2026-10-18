# 🐹 Go Template & Hugo Engine Showcase

Selene brings native, high-performance live rendering for **Go 1.23 `html/template`** and **Hugo Static Site** templates! This engine compiles Go template directives in-memory with instant feedback, complete with mock context extraction, scoped conditionals, range iterations, and **Tailwind CSS 3.4** integration.

> [!NOTE]
> ⚡ **Dual Execution Runtime**:
> 1. **In-Browser Go Template Engine**: Evaluates `{{ .Property }}`, `{{ range .Collection }}`, `{{ if eq .Field "val" }}`, pipeline functions (`upper`, `len`, `lower`), and embedded JSON context with 0ms latency.
> 2. **Go HTTP Server Bridge**: Connect seamlessly to your local Go server (`http.ListenAndServe(":8080", ...)`) or Hugo dev server (`hugo server -p 1313`) via the engine switcher in the header!

---

## ⚡ 1. Microservice Distributed Telemetry Dashboard (`html/template`)

The block below demonstrates a Go template with embedded mock context, pipeline filters, service loop iteration, and visual property tweaking:

```go
{{/* Context:
{
  "Cluster": "Artemis-Golang-10",
  "Uptime": "99.99%",
  "Goroutines": 14280,
  "Throughput": "184.2 MB/s",
  "Status": "optimal",
  "Services": [
    { "Name": "gRPC Ingestion Gateway", "Port": 50051, "Status": "active", "Latency": "0.4ms" },
    { "Name": "Raft Consensus Cluster", "Port": 7000, "Status": "active", "Latency": "1.2ms" },
    { "Name": "Zero-Alloc Memory Pool", "Port": 9090, "Status": "active", "Latency": "0.1ms" },
    { "Name": "Pebble KV Engine", "Port": 6380, "Status": "active", "Latency": "0.6ms" }
  ]
}
*/}}

<div class="p-6 max-w-lg mx-auto bg-slate-900/90 rounded-2xl border border-cyan-500/30 shadow-2xl backdrop-blur-md text-slate-100 font-sans">
  {{/* Header with Go Cyan Branding */}}
  <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-500 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 8h4l2 4-2 4h-4"/>
          <circle cx="8" cy="12" r="5"/>
          <path d="M13 12h3"/>
        </svg>
      </div>
      <div>
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span>{{ .Cluster }}</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {{ upper .Status }}
          </span>
        </h3>
        <p class="text-xs text-cyan-400/90 font-mono">Go 1.23 • html/template Engine</p>
      </div>
    </div>
    <div class="text-right">
      <span class="text-xs font-mono text-cyan-400 font-semibold">{{ .Uptime }}</span>
      <p class="text-[10px] text-slate-500">Service SLA</p>
    </div>
  </div>

  {{/* Metrics Grid */}}
  <div class="grid grid-cols-2 gap-3 mb-4">
    <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
      <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Active Goroutines</span>
      <span class="text-sm font-bold font-mono text-white">{{ .Goroutines }}</span>
    </div>
    <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
      <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Throughput Rate</span>
      <span class="text-sm font-bold font-mono text-cyan-400">{{ .Throughput }}</span>
    </div>
  </div>

  {{/* Active Microservice Endpoints */}}
  <div class="space-y-2 mb-4">
    <div class="flex items-center justify-between text-xs text-slate-400 px-1">
      <span>Consensus Nodes</span>
      <span class="font-mono text-[11px]">{{ len .Services }} active</span>
    </div>
    {{ range .Services }}
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="font-medium text-slate-200">{{ .Name }}</span>
          <span class="text-[10px] font-mono text-slate-500">:{{ .Port }}</span>
        </div>
        <span class="font-mono text-cyan-400/80 text-[11px]">{{ .Latency }}</span>
      </div>
    {{ end }}
  </div>

  {{/* Interactive Trigger */}}
  <div class="pt-2 flex items-center justify-between border-t border-slate-800">
    <button id="go-sync-btn" class="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2">
      <span>⚡ Rebalance Channels</span>
      <span class="px-1.5 py-0.2 rounded bg-black/30 font-mono text-[10px]">SYNC</span>
    </button>
    <span id="go-sync-msg" class="text-xs text-slate-400 font-mono">Standby</span>
  </div>
</div>
```

---

## 🚀 2. Hugo Static Component / Content Widget (`hugo`)

Selene also supports Hugo site generators and shortcodes, parsing templates seamlessly:

```gotemplate
{{/* Context:
{
  "Title": "High-Throughput Go Pipelines",
  "Author": "Gopher Ops",
  "ReadingTime": "4 min read",
  "Tag": "CONCURRENCY",
  "Stars": 8420
}
*/}}

<div class="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl border border-sky-500/30 shadow-2xl text-slate-100 font-sans">
  <div class="flex items-center justify-between mb-3">
    <span class="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30">
      {{ .Tag }}
    </span>
    <span class="text-xs text-slate-400 font-mono">{{ .ReadingTime }}</span>
  </div>
  <h3 class="text-base font-bold text-white mb-2">{{ .Title }}</h3>
  <p class="text-xs text-slate-400 leading-relaxed mb-4">
    Learn how Go channels and worker pools process gigabytes of data concurrently with zero memory leaks.
  </p>
  <div class="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
    <span class="text-slate-400">By <strong class="text-slate-200">{{ .Author }}</strong></span>
    <span class="text-sky-400 font-mono">⭐ {{ .Stars }}</span>
  </div>
</div>
```

---

## 🛠️ How It Works Under The Hood

- **Parser Engine**: Parses `{{ .Field }}` variables, pipeline functions (`upper`, `lower`, `len`), `{{ range }}...{{ end }}` loops, and `{{ if }}...{{ else }}...{{ end }}` conditionals directly inside Selene's JavaScript engine.
- **Visual Property Tweaking**: Toggle the **Tweak Props** button to visually alter padding, rounded corners, accent colors, and surface themes with real-time code synchronization.
- **Local Server Bridge**: Run `go run main.go` on port `8080` and switch the engine mode to **Go Server** for full live integration with real Go backends!
