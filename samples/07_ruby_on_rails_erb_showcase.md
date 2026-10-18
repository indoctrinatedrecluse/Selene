# 💎 Ruby on Rails 8.0 & ERB Engine Showcase

Selene includes full native live rendering for **Ruby on Rails 8.0 & ERB** templates! The engine parses ERB scriptlets (`<% %>`), output tags (`<%= %>`), and evaluates Rails view helpers, Hotwire Turbo Frames, and Stimulus data controllers in real-time.

> [!NOTE]
> 🚀 **Dual Execution Runtime**:
> 1. **In-Browser ERB & Hotwire Engine**: Compiles Ruby collections, `turbo_frame_tag`, Rails helpers, and Stimulus interactivity client-side with zero dependencies.
> 2. **Puma Server Bridge**: Connect directly to your local Rails development server (`bin/rails server` on port `3000`) using the **Puma Server** toggle in the header.

---

## 🚀 1. Rails Hotwire & Turbo Frame Card (Stimulus + ERB)

Below is an interactive Rails component rendering within a Turbo Frame and responding to Stimulus actions:

```erb
<%
  @cluster = "Olympus-Rails-08"
  @uptime = "99.99%"
  @mrr = 28450.00
  @status = "optimal"
  @services = [
    { name: "Turbo Streams Hub", port: 3000, status: "healthy", latency: "3ms" },
    { name: "Sidekiq Job Worker", port: 7433, status: "healthy", latency: "6ms" },
    { name: "PostgreSQL Replica", port: 5432, status: "healthy", latency: "1ms" },
    { name: "Redis Cache Store", port: 6379, status: "healthy", latency: "0.8ms" }
  ]
%>

<%= turbo_frame_tag "metrics_panel" do %>
  <div data-controller="telemetry" class="p-6 max-w-lg mx-auto bg-slate-900/90 rounded-2xl border border-rose-500/30 shadow-2xl backdrop-blur-md text-slate-100 font-sans">
    <%# Rails Header with Ruby Crimson Branding %>
    <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-600 flex items-center justify-center text-white font-bold shadow-lg shadow-rose-600/25">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <span><%= @cluster %></span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <%= @status.upcase %>
            </span>
          </h3>
          <p class="text-xs text-rose-400/90 font-mono">Rails 8.0 • Hotwire & Turbo Frames</p>
        </div>
      </div>
      <div class="text-right">
        <span class="text-xs font-mono text-rose-400 font-semibold"><%= @uptime %></span>
        <p class="text-[10px] text-slate-500">Service SLA</p>
      </div>
    </div>

    <%# Metrics Row %>
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
        <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Monthly Run Rate</span>
        <span class="text-sm font-bold font-mono text-white"><%= number_to_currency(@mrr) %></span>
      </div>
      <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
        <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Active Services</span>
        <span class="text-sm font-bold font-mono text-rose-400"><%= pluralize(@services.count, "Worker Node") %></span>
      </div>
    </div>

    <%# Services List %>
    <div class="space-y-2 mb-4">
      <% @services.each do |service| %>
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="font-medium text-slate-200"><%= service[:name] %></span>
            <span class="text-[10px] font-mono text-slate-500">:<%= service[:port] %></span>
          </div>
          <span class="font-mono text-slate-400 text-[11px]"><%= service[:latency] %></span>
        </div>
      <% end %>
    </div>

    <%# Interactive Stimulus Controller %>
    <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
      <button
        data-action="click->telemetry#dispatchPulse"
        class="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
      >
        <span>⚡ Turbo Stream Pulse</span>
        <span data-telemetry-target="counter" class="px-1.5 py-0.2 rounded bg-black/30 font-mono text-[10px]">1</span>
      </button>
      <span data-telemetry-target="message" class="text-xs text-emerald-400 font-mono">
        Hotwire Connected
      </span>
    </div>
  </div>
<% end %>
```

---

## 💎 2. ActiveRecord Relation Table (ERB Iteration)

```erb
<%
  @deployments = [
    { id: 104, commit: "8e35ea0", branch: "main", author: "Selene Titan", status: "deployed", latency: "14ms" },
    { id: 103, commit: "4f9b2c1", branch: "feat/turbo", author: "Hyperion Sun", status: "deployed", latency: "18ms" },
    { id: 102, commit: "1a8d9e2", branch: "fix/stimulus", author: "Phoebe Corona", status: "running", latency: "32ms" },
    { id: 101, commit: "9c3f0b4", branch: "chore/deps", author: "Theia Dawn", status: "queued", latency: "0ms" }
  ]
%>

<div class="p-6 max-w-xl mx-auto bg-slate-900 rounded-2xl border border-rose-500/25 shadow-2xl text-slate-100 font-sans">
  <div class="flex items-center justify-between mb-4">
    <div>
      <h3 class="text-base font-bold text-white">Deployment.recent.includes(:author)</h3>
      <p class="text-xs text-rose-400/90 font-mono">ActiveRecord Relation • ERB Iteration</p>
    </div>
    <span class="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300">
      <%= pluralize(@deployments.count, "Deployment") %>
    </span>
  </div>

  <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
    <table class="w-full text-left text-xs">
      <thead class="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
        <tr>
          <th class="p-3">ID</th>
          <th class="p-3">Commit</th>
          <th class="p-3">Branch</th>
          <th class="p-3">Author</th>
          <th class="p-3">Status</th>
          <th class="p-3 text-right">Latency</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-800/60">
        <% @deployments.each do |dep| %>
          <tr class="hover:bg-slate-800/40 transition-colors">
            <td class="p-3 font-mono text-slate-500">#<%= dep[:id] %></td>
            <td class="p-3 font-mono text-rose-400"><%= dep[:commit] %></td>
            <td class="p-3 text-slate-300 font-mono text-[11px]"><%= dep[:branch] %></td>
            <td class="p-3 font-medium text-white"><%= dep[:author] %></td>
            <td class="p-3">
              <% if dep[:status] == "deployed" %>
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">Deployed</span>
              <% elsif dep[:status] == "running" %>
                <span class="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">Running</span>
              <% else %>
                <span class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono">Queued</span>
              <% end %>
            </td>
            <td class="p-3 text-right font-mono text-slate-400"><%= dep[:latency] %></td>
          </tr>
        <% end %>
      </tbody>
    </table>
  </div>
</div>
```
