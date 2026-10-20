# 🔥 Elixir & Phoenix LiveView (Phoenix of Olympus) Engine Showcase

Selene now features native, zero-config live render execution for **Elixir & Phoenix LiveView** (`heex` and `liveview`)! Named **Phoenix of Olympus**, this engine brings Erlang BEAM concurrency models, high-throughput reactive assigns, and server-driven LiveView semantics directly into Selene's polymorphic workspace.

> [!NOTE]
> ⚡ **Dual Execution Runtime**:
> 1. **In-Browser HEEx Engine**: Evaluates assigns (`@assign`), map collections (`%{}`), for-comprehensions (`<%= for node <- @nodes do %>`), conditionals (`<%= if ... do %>`), and interactive `phx-click` socket events with zero latency and 100% offline capability.
> 2. **Phoenix Mix Server Bridge**: Connect directly to your local Phoenix application running via `mix phx.server` on port `4000` using the engine toggle in the block header.

---

## ⚡ 1. Interactive Phoenix LiveView Telemetry Dashboard

Below is a live Phoenix LiveView component simulating a BEAM OTP telemetry supervisor node with real-time assigns, cluster node lists, and interactive `phx-click` handlers:

```heex
<%# Phoenix LiveView Assigns
  @cluster = "Olympus-Phoenix-01"
  @uptime = "99.999%"
  @throughput = "48,200 msg/s"
  @status = "optimal"
  @services = [
    %{ name: "BEAM Cluster Node A", port: 4000, status: "active", latency: "0.2ms" },
    %{ name: "Phoenix PubSub Channel", port: 4001, status: "active", latency: "0.1ms" },
    %{ name: "Postgrex Ecto Pool", port: 5432, status: "active", latency: "0.6ms" },
    %{ name: "Telemetry ETS Cache", port: 6379, status: "active", latency: "0.05ms" }
  ]
%>

<div class="p-6 max-w-lg mx-auto bg-slate-900/90 rounded-2xl border border-violet-500/30 shadow-2xl backdrop-blur-md text-slate-100 font-sans">
  <%# Header with Phoenix Flame Branding %>
  <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/25">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      </div>
      <div>
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span><%= @cluster %></span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <%= String.upcase(@status) %>
          </span>
        </h3>
        <p class="text-xs text-slate-400 font-mono">Phoenix 1.7 • LiveView HEEx Engine</p>
      </div>
    </div>
    <div class="text-right">
      <span class="text-xs font-mono text-violet-400 font-semibold"><%= @uptime %></span>
      <p class="text-[10px] text-slate-500">BEAM SLA</p>
    </div>
  </div>

  <%# Telemetry Metrics Grid %>
  <div class="grid grid-cols-2 gap-3 mb-4">
    <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
      <span class="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">PubSub Throughput</span>
      <span class="text-lg font-mono font-bold text-violet-300"><%= @throughput %></span>
    </div>
    <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
      <span class="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Process Count</span>
      <span class="text-lg font-mono font-bold text-fuchsia-400">12,842 procs</span>
    </div>
  </div>

  <%# Active Services Loop %>
  <div class="space-y-2 mb-4">
    <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Supervised BEAM Processes</p>
    <%= for service <- @services do %>
      <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-violet-500/30 transition-all text-xs">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="font-medium text-slate-200"><%= service.name %></span>
          <span class="text-[10px] font-mono text-slate-500">:<%= service.port %></span>
        </div>
        <span class="font-mono text-[11px] text-violet-400 font-semibold"><%= service.latency %></span>
      </div>
    <% end %>
  </div>

  <%# Phoenix LiveView Event Triggers %>
  <div class="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
    <button phx-click="benchmark_ping" class="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-all flex items-center justify-center gap-1.5">
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
      Broadcast Ping (phx-click)
    </button>
    <button phx-click="cycle_cluster" class="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all">
      Reload State
    </button>
  </div>
</div>
```

---

## ⚡ 2. Phoenix LiveView Form & Stateful Event Component

LiveView is renowned for handling real-time interactive forms without requiring complex clientside state orchestrators. Here is a LiveView template demonstrating assigns interpolation and dynamic conditional rendering:

```liveview
<%# Assigns:
  @session_id = "phx-sess-8819"
  @environment = "production"
  @replica_count = 8
%>

<div class="p-5 max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-sans shadow-xl">
  <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
    <div class="flex items-center gap-2">
      <div class="w-3 h-3 rounded-full bg-violet-500 animate-ping"></div>
      <span class="text-xs font-mono font-bold text-violet-400">LiveView Socket Connected</span>
    </div>
    <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400"><%= @session_id %></span>
  </div>

  <div class="space-y-3 mb-4">
    <div>
      <label class="block text-xs font-semibold text-slate-400 mb-1">Target Cluster Zone</label>
      <input type="text" value="olympus-europe-west-1" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500" readonly />
    </div>

    <div>
      <label class="block text-xs font-semibold text-slate-400 mb-1">Active Erlang Nodes: <%= @replica_count %></label>
      <div class="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
        <div class="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full w-4/5"></div>
      </div>
    </div>
  </div>

  <button phx-click="scale_cluster" class="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs rounded-lg shadow-lg shadow-violet-600/20 transition-all">
    Scale BEAM Pool (+4 Nodes)
  </button>
</div>
```

---

## 🚀 Key Phoenix Engine Capabilities in Selene

- **HEEx Grammar Compliance**: Full parsing of `<%= expression %>`, `<%# comments %>`, and `<%= for item <- collection do %>` comprehensions.
- **Assigns Scoping**: Injects Elixir assigns directly from template comment frontmatter (`@cluster`, `@services`, `@status`).
- **Interactive `phx-click` Simulation**: Simulates server socket events in-browser with instantaneous visual feedback and toast notifications.
- **Mix Bridge Ready**: Seamlessly swap from in-browser compilation to a live `mix phx.server` running locally on port `4000`.
- **Property Inspector**: Fully compatible with Selene's **Universal Property Inspector** for visual styling changes.
