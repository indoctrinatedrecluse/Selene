# 🎨 Interactive Web UI Components

Test multiple web framework stacks side-by-side with zero CSS leakage.

## 1. Metric Counter Card (React + Tailwind)

```tsx
import React, { useState } from "react";

export default function MetricCard() {
  const [metric, setMetric] = useState(98.4);

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl max-w-sm mx-auto text-white space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Engine Throughput</span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium border border-emerald-500/20">
          Optimal
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-extrabold tracking-tight text-white">{metric}</span>
        <span className="text-sm font-medium text-slate-400">req/ms</span>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => setMetric((m) => +(m + 0.5).toFixed(1))}
          className="flex-1 py-1.5 px-3 bg-sky-600 hover:bg-sky-500 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95"
        >
          Boost
        </button>
        <button
          onClick={() => setMetric((m) => +(m - 0.5).toFixed(1))}
          className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold transition-all border border-slate-700"
        >
          Throttle
        </button>
      </div>
    </div>
  );
}
```

---

## 2. Vue 3 Reactive SFC Component

```vue
<template>
  <div class="p-6 bg-slate-900 rounded-2xl border border-emerald-500/30 max-w-sm mx-auto text-white shadow-xl space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-emerald-400 font-bold text-sm tracking-wide">Vue 3 Live Preview</h3>
      <span class="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
        Composition API
      </span>
    </div>
    <p class="text-xs text-slate-300">
      Reactive state counter: <span class="font-bold text-white font-mono">{{ count }}</span>
    </p>
    <button
      @click="count++"
      class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95"
    >
      Increment Counter
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const count = ref(10);
</script>
```

---

## 3. Svelte Reactive Snippet

```svelte
<script>
  let count = 5;
  $: doubled = count * 2;
</script>

<div class="p-6 bg-slate-900 rounded-2xl border border-orange-500/30 max-w-sm mx-auto text-white shadow-xl space-y-3">
  <div class="flex items-center justify-between">
    <h3 class="text-orange-400 font-bold text-sm tracking-wide">Svelte Reactive Canvas</h3>
    <span class="text-[10px] font-mono bg-orange-950 text-orange-300 px-2 py-0.5 rounded border border-orange-800">
      Compiler Reactive
    </span>
  </div>
  <p class="text-xs text-slate-300">
    Count: <span class="font-bold text-white font-mono">{count}</span> (Doubled: <span class="font-mono text-orange-400">{doubled}</span>)
  </p>
  <button
    on:click={() => count++}
    class="w-full py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
  >
    Add Count
  </button>
</div>
```
