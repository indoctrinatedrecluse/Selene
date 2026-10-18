# 🐍 Django & Jinja2 Template Engine Showcase

Selene brings native, high-performance live rendering for **Python 3.12**, **Django Template Language (DTL)**, and **Jinja2**! This engine compiles Django & Jinja2 templates in-memory with instant feedback, complete with mock context extraction, filters (`|upper`, `|length`, `|lower`), tags (`{% for %}`, `{% if %}`), and **Tailwind CSS 3.4** integration.

> [!NOTE]
> ⚡ **Dual Execution Runtime**:
> 1. **In-Browser Jinja2 / DTL Engine**: Evaluates `{{ var }}`, `{% for item in col %}`, `{% if cond %}`, pipeline filters (`|upper`, `|length`), and embedded JSON context with 0ms latency.
> 2. **Django / FastAPI Server Bridge**: Connect seamlessly to your local Django server (`python manage.py runserver 8000`) or FastAPI/Flask dev server (`uvicorn app:app --port 8000`) via the engine switcher in the block header!

---

## ⚡ 1. Django ASGI Microservice Telemetry Card (`django`)

The block below demonstrates a Django template with embedded mock context, template filters, service loop iteration, and visual property tweaking:

```django
{# Context:
{
  "cluster": "Artemis-Django-11",
  "uptime": "99.98%",
  "workers": 8,
  "status": "optimal",
  "throughput": "9,420 req/s",
  "services": [
    { "name": "Django ASGI Gateway", "port": 8000, "status": "active", "latency": "1.2ms" },
    { "name": "Celery Task Broker", "port": 5555, "status": "active", "latency": "3.8ms" },
    { "name": "PostgreSQL Connection Pool", "port": 6432, "status": "active", "latency": "0.5ms" },
    { "name": "Redis Session Cache", "port": 6379, "status": "active", "latency": "0.2ms" }
  ]
}
#}

<div class="p-6 max-w-lg mx-auto bg-slate-900/90 rounded-2xl border border-emerald-500/30 shadow-2xl backdrop-blur-md text-slate-100 font-sans">
  {# Header with Django Emerald Branding #}
  <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-green-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-600/25">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h4v16H4zM12 8h4v12h-4zM20 12h-4"/>
        </svg>
      </div>
      <div>
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span>{{ cluster }}</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {{ status|upper }}
          </span>
        </h3>
        <p class="text-xs text-emerald-400/90 font-mono">Django 5.0 • ASGI & Jinja2 Template</p>
      </div>
    </div>
    <div class="text-right">
      <span class="text-xs font-mono text-emerald-400 font-semibold">{{ uptime }}</span>
      <p class="text-[10px] text-slate-500">Service SLA</p>
    </div>
  </div>

  {# Metrics Grid #}
  <div class="grid grid-cols-2 gap-3 mb-4">
    <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
      <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Gunicorn / Uvicorn Workers</span>
      <span class="text-sm font-bold font-mono text-white">{{ workers }} Active</span>
    </div>
    <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
      <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Throughput Rate</span>
      <span class="text-sm font-bold font-mono text-emerald-400">{{ throughput }}</span>
    </div>
  </div>

  {# Active Microservice Endpoints #}
  <div class="space-y-2 mb-4">
    <div class="flex items-center justify-between text-xs text-slate-400 px-1">
      <span>Discovered Endpoints</span>
      <span class="font-mono text-[11px]">{{ services|length }} active</span>
    </div>
    {% for service in services %}
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="font-medium text-slate-200">{{ service.name }}</span>
          <span class="text-[10px] font-mono text-slate-500">:{{ service.port }}</span>
        </div>
        <span class="font-mono text-emerald-400/80 text-[11px]">{{ service.latency }}</span>
      </div>
    {% endfor %}
  </div>

  {# Interactive Action Footer #}
  <div class="pt-2 flex items-center justify-between border-t border-slate-800">
    <button id="django-purge-btn" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2">
      <span>⚡ Invalidate Redis Cache</span>
      <span class="px-1.5 py-0.2 rounded bg-black/30 font-mono text-[10px]">FLUSH</span>
    </button>
    <span id="django-purge-msg" class="text-xs text-slate-400 font-mono">Idle</span>
  </div>
</div>
```

---

## 🐍 2. Jinja2 / FastAPI Modern Card (`jinja2`)

Selene also supports FastAPI, Flask, and Jinja2 templates:

```jinja2
{# Context:
{
  "title": "FastAPI High Performance Async Service",
  "author": "Python Core Ops",
  "status": "ready",
  "version": "v2.4.0",
  "stars": 12890
}
#}

<div class="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl border border-emerald-500/30 shadow-2xl text-slate-100 font-sans">
  <div class="flex items-center justify-between mb-3">
    <span class="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
      {{ version }}
    </span>
    <span class="text-xs font-mono text-emerald-400 font-semibold">{{ status|upper }}</span>
  </div>
  <h3 class="text-base font-bold text-white mb-2">{{ title }}</h3>
  <p class="text-xs text-slate-400 leading-relaxed mb-4">
    Built on Starlette and Pydantic, executing asynchronous requests with peak Python performance.
  </p>
  <div class="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
    <span class="text-slate-400">Maintained by <strong class="text-slate-200">{{ author }}</strong></span>
    <span class="text-emerald-400 font-mono">⭐ {{ stars }}</span>
  </div>
</div>
```

---

## 🛠️ How It Works Under The Hood

- **Parser Engine**: Evaluates `{{ var }}`, filters (`|upper`, `|length`, `|lower`), `{% for x in list %}` iterations, and `{% if %}` blocks directly inside Selene's client-side sandbox.
- **Visual Property Tweaking**: Toggle the **Tweak Props** button to visually alter padding, rounded corners, accent colors, and surface themes with live two-way code updates.
- **Local Server Bridge**: Run `python manage.py runserver 8000` or `uvicorn main:app --port 8000` and switch the engine mode to **Django Server** for direct interaction with live backend code!
