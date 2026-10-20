# 🦀 Rust WebAssembly (Yew & Leptos) Engine Showcase

Selene brings native, high-performance live rendering for **Rust WebAssembly (`wasm32-unknown-unknown`)** components! This engine compiles and simulates Rust RSX macros (`html! { ... }` and `view! { ... }`), linear memory telemetry, and fine-grained reactive state inside an isolated sandbox with **Tailwind CSS 3.4**.

> [!NOTE]
> ⚡ **Dual Execution Runtime**:
> 1. **In-Browser WASM Engine**: Evaluates Rust RSX macros, hooks (`use_state`), signals (`create_signal`), and linear memory bounds with 0ms latency.
> 2. **Trunk Server Bridge**: Connect directly to your local Trunk or Cargo development server (`trunk serve -p 8080`) using the engine switcher in the block header!

---

## ⚡ 1. Rust Yew Microservice Telemetry Component (`yew`)

Below is a live Rust Yew component featuring state hooks, thread-safe memory allocations, and visual property tweaking:

```rust
use yew::prelude::*;

#[function_component(TelemetryApp)]
pub fn app() -> Html {
    let count = use_state(|| 42);
    let cluster = "Artemis-Rust-WASM";
    let memory_alloc = "1.2 MB / 4.0 MB (Zero Garbage Collector)";

    html! {
        <div class="p-6 max-w-lg mx-auto bg-slate-900/90 rounded-2xl border border-amber-500/30 shadow-2xl backdrop-blur-md text-slate-100 font-sans">
            <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20">
                        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                            <polyline points="2 17 12 22 22 17"/>
                            <polyline points="2 12 12 17 22 12"/>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-base font-bold text-white flex items-center gap-2">
                            <span>{ "Artemis-Rust-WASM" }</span>
                            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                { "OPTIMAL" }
                            </span>
                        </h3>
                        <p class="text-xs text-amber-400/90 font-mono">{ "Yew 0.21 • wasm32-unknown-unknown" }</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-xs font-mono text-amber-400 font-semibold">{ "99.999%" }</span>
                    <p class="text-[10px] text-slate-500">{ "Zero Panics" }</p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">{ "Linear Memory" }</span>
                    <span class="text-sm font-bold font-mono text-white">{ memory_alloc }</span>
                </div>
                <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">{ "Thread Safety" }</span>
                    <span class="text-sm font-bold font-mono text-emerald-400">{ "Send + Sync Validated" }</span>
                </div>
            </div>

            <div class="pt-2 flex items-center justify-between border-t border-slate-800">
                <button id="rust-counter-btn" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2">
                    <span>{ "⚡ Execute WASM Cycle" }</span>
                    <span id="rust-counter-val" class="px-1.5 py-0.2 rounded bg-black/30 font-mono text-[10px]">{ *count }</span>
                </button>
                <span class="text-xs text-slate-400 font-mono">{ "SIMD Enabled" }</span>
            </div>
        </div>
    }
}
```

---

## ⚡ 2. Leptos Fine-Grained Reactive Card (`leptos`)

Selene also supports the modern Leptos framework for sub-millisecond, virtual-DOM-free WebAssembly reactivity:

```leptos
use leptos::*;

#[component]
pub fn LeptosCard() -> impl IntoView {
    let (count, set_count) = create_signal(100);

    view! {
        <div class="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl border border-amber-500/30 shadow-2xl text-slate-100 font-sans">
            <div class="flex items-center justify-between mb-3">
                <span class="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    { "LEPTOS 0.6" }
                </span>
                <span class="text-xs font-mono text-emerald-400 font-semibold">{ "Sub-Millisecond VDOM-Free" }</span>
            </div>
            <h3 class="text-base font-bold text-white mb-2">{ "Fine-Grained Reactive Rust" }</h3>
            <p class="text-xs text-slate-400 leading-relaxed mb-4">
                { "Compiles directly to WebAssembly with zero virtual-DOM overhead and fine-grained DOM pinpoint updates." }
            </p>
            <div class="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <button id="rust-counter-btn" class="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-md transition-all active:scale-95">
                    { "Increment: " } <span id="rust-counter-val" class="font-mono">{ count }</span>
                </button>
                <span class="text-amber-400 font-mono">{ "wasm32" }</span>
            </div>
        </div>
    }
}
```

---

## 🛠️ How It Works Under The Hood

- **Macro & RSX Parser**: Parses `html! { ... }` and `view! { ... }` token trees into sandboxed reactive HTML elements.
- **Visual Property Tweaking**: Toggle the **Tweak Props** button to visually alter padding, rounded corners, accent colors, and surface themes with live two-way code updates.
- **Local Trunk Bridge**: Run `trunk serve` on port `8080` and switch the engine mode to **Trunk Server** for full integration with real Rust compilations!
