# 🐘 PHP & Laravel 11 Blade Engine Showcase

Selene now features native, zero-config live render execution for **PHP 8.3 & Laravel Blade** templates! This engine compiles Blade directives in-memory and injects **Alpine.js 3.x** and **Tailwind CSS 3.4** inside an isolated sandbox.

> [!NOTE]
> ⚡ **Dual Execution Runtime**:
> 1. **In-Browser Blade Engine**: Compiles `@php`, `@foreach`, `@if`, `{{ }}`, and Alpine.js reactivity with zero latency and 100% offline capability.
> 2. **Artisan Serve Bridge**: Connect directly to your local `php artisan serve` instance running on port `8000` using the engine toggle in the block header.

---

## ⚡ 1. Interactive Blade Metric Card (Alpine.js + Directives)

Below is a live Blade component featuring variable scopes, nested associative arrays, loops, and Alpine.js interactive tabs:

```blade
@php
  $cluster = "Artemis-Prime-04";
  $uptime = "99.98%";
  $memoryUsage = "4.2 GB / 16 GB";
  $status = "optimal";
  $services = [
    ["name" => "Auth Gatekeeper", "port" => 8080, "status" => "active", "latency" => "12ms"],
    ["name" => "Polymorphic AST", "port" => 9000, "status" => "active", "latency" => "4ms"],
    ["name" => "LibSQL Replica", "port" => 5432, "status" => "syncing", "latency" => "28ms"],
  ];
@endphp

<div x-data="{ count: 42, activeTab: 'overview', boosted: false }" class="p-6 max-w-lg mx-auto bg-slate-900/90 rounded-2xl border border-red-500/30 shadow-2xl backdrop-blur-md text-slate-100 font-sans">
  {{-- Header with Laravel Crimson Branding --}}
  <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-bold shadow-lg shadow-red-500/20">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div>
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span>{{ $cluster }}</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {{ strtoupper($status) }}
          </span>
        </h3>
        <p class="text-xs text-slate-400 font-mono">Laravel 11 • Blade Template Engine</p>
      </div>
    </div>
    <div class="text-right">
      <span class="text-xs font-mono text-red-400 font-semibold">{{ $uptime }}</span>
      <p class="text-[10px] text-slate-500">Service SLA</p>
    </div>
  </div>

  {{-- Interactive Alpine.js Tab Switcher --}}
  <div class="flex items-center gap-2 mb-4 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs font-medium">
    <button @click="activeTab = 'overview'" :class="activeTab === 'overview' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'" class="flex-1 py-1 rounded-md transition-all">
      Overview
    </button>
    <button @click="activeTab = 'services'" :class="activeTab === 'services' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'" class="flex-1 py-1 rounded-md transition-all">
      Services ({{ count($services) }})
    </button>
  </div>

  {{-- Tab 1: Overview --}}
  <div x-show="activeTab === 'overview'" class="space-y-3">
    <div class="grid grid-cols-2 gap-3">
      <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
        <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Memory Allocation</span>
        <span class="text-sm font-bold font-mono text-white">{{ $memoryUsage }}</span>
      </div>
      <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
        <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Interactive Metric</span>
        <span class="text-sm font-bold font-mono text-red-400" x-text="'Payload ' + count + ' MB/s'"></span>
      </div>
    </div>

    <div class="pt-2 flex items-center justify-between">
      <button @click="count += 5; boosted = true" class="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2">
        <span>⚡ Trigger Pipeline Event</span>
        <span class="px-1.5 py-0.2 rounded bg-black/30 font-mono text-[10px]" x-text="count"></span>
      </button>
      <span x-show="boosted" class="text-xs text-emerald-400 font-mono animate-pulse">✓ Signal Dispatched</span>
    </div>
  </div>

  {{-- Tab 2: Service Loop (@foreach simulation) --}}
  <div x-show="activeTab === 'services'" class="space-y-2">
    @foreach ($services as $service)
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full {{ $service['status'] === 'active' ? 'bg-emerald-400' : 'bg-amber-400' }} animate-pulse"></span>
          <span class="font-medium text-slate-200">{{ $service['name'] }}</span>
          <span class="text-[10px] font-mono text-slate-500">:{{ $service['port'] }}</span>
        </div>
        <span class="font-mono text-slate-400 text-[11px]">{{ $service['latency'] }}</span>
      </div>
    @endforeach
  </div>
</div>
```

---

## 📦 2. Eloquent Collection Table (Blade Directives)

```blade
@php
  $users = [
    ["id" => 1, "name" => "Selene Titan", "role" => "Celestial Admin", "status" => "online", "tokens" => "1.2M"],
    ["id" => 2, "name" => "Hyperion Sun", "role" => "AST Architect", "status" => "online", "tokens" => "840K"],
    ["id" => 3, "name" => "Phoebe Corona", "role" => "Security Auditor", "status" => "idle", "tokens" => "420K"],
    ["id" => 4, "name" => "Theia Dawn", "role" => "Compiler Ops", "status" => "busy", "tokens" => "2.4M"],
  ];
@endphp

<div class="p-6 max-w-xl mx-auto bg-slate-900 rounded-2xl border border-red-500/25 shadow-2xl text-slate-100 font-sans">
  <div class="flex items-center justify-between mb-4">
    <div>
      <h3 class="text-base font-bold text-white">App\Models\CelestialTeam::all()</h3>
      <p class="text-xs text-red-400/90 font-mono">Eloquent Collection • Dynamic Blade Directives</p>
    </div>
    <span class="text-xs font-mono px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-300">
      {{ count($users) }} Records
    </span>
  </div>

  <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
    <table class="w-full text-left text-xs">
      <thead class="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
        <tr>
          <th class="p-3">ID</th>
          <th class="p-3">Member</th>
          <th class="p-3">Role</th>
          <th class="p-3">Status</th>
          <th class="p-3 text-right">Throughput</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-800/60">
        @foreach ($users as $user)
          <tr class="hover:bg-slate-800/40 transition-colors">
            <td class="p-3 font-mono text-slate-500">#{{ $user['id'] }}</td>
            <td class="p-3 font-semibold text-white">{{ $user['name'] }}</td>
            <td class="p-3 text-slate-400">{{ $user['role'] }}</td>
            <td class="p-3">
              @if ($user['status'] === 'online')
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">Online</span>
              @elseif ($user['status'] === 'busy')
                <span class="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">Busy</span>
              @else
                <span class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono">Idle</span>
              @endif
            </td>
            <td class="p-3 text-right font-mono text-red-400">{{ $user['tokens'] }}</td>
          </tr>
        @endforeach
      </tbody>
    </table>
  </div>
</div>
```
