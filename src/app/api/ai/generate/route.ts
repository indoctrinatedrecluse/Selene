import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { resolveOracleModel } from "@/lib/ai/delphic-oracle";
import { AIProvider } from "@/lib/security/secure-vault";

export interface AiGenerateRequest {
  prompt: string;
  category: "ui" | "diagram" | "math" | "freeform";
  stack?: string;
  diagramType?: string;
  preferredProvider?: AIProvider;
  modelOverride?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: AiGenerateRequest = await req.json();
    const prompt = (body.prompt || "").trim();
    const category = body.category || "ui";
    const stack = (body.stack || "tsx").toLowerCase();
    const diagramType = body.diagramType || "flowchart";

    if (!prompt) {
      return NextResponse.json(
        { success: false, message: "Prompt is required" },
        { status: 400 }
      );
    }

    // 1. Hook into Hardware-Bound Secure Vault for multi-provider BYOK via Vercel AI SDK
    const oracle = await resolveOracleModel({
      preferredProvider: body.preferredProvider,
      modelOverride: body.modelOverride,
    });

    if (oracle) {
      let systemInstruction = "";
      if (category === "ui") {
        systemInstruction = `You are the Selene Delphic Oracle & UI Living Canvas Copilot. The user requests a production-grade UI component in '${stack}'.
Use Tailwind CSS classes with modern dark lunar aesthetics (slate-900/950, sky/cyan/emerald/amber accents, rounded-2xl, border border-slate-800, backdrop-blur).
Respond ONLY with the complete runnable code enclosed in markdown code fences \`\`\`${stack} ... \`\`\`. Do not include conversational greetings.`;
      } else if (category === "diagram") {
        systemInstruction = `You are the Selene Delphic Oracle. The user requests a clean, beautiful Mermaid diagram of type '${diagramType}'.
Respond ONLY with the raw mermaid diagram enclosed in markdown code fences \`\`\`mermaid ... \`\`\`.
Only use standard diagram types (flowchart TD, sequenceDiagram, classDiagram, erDiagram, stateDiagram-v2). Quote labels containing parentheses.`;
      } else if (category === "math") {
        systemInstruction = `You are the Selene Delphic Oracle. The user requests a clean LaTeX / KaTeX formula.
Respond ONLY with the LaTeX formula enclosed in markdown code fences \`\`\`math ... \`\`\` or display math $$ ... $$.`;
      } else {
        systemInstruction = `You are the Selene Delphic Oracle. Provide high quality, elegant technical markdown content. Respond directly without conversational fluff.`;
      }

      try {
        const { text } = await generateText({
          model: oracle.model,
          system: systemInstruction,
          prompt: `User Request: ${prompt}`,
          temperature: 0.2,
        });

        if (text && text.trim()) {
          const generatedContent = text.trim();
          return NextResponse.json({
            success: true,
            generatedContent,
            content: generatedContent,
            code: generatedContent,
            provider: `${oracle.provider}-${oracle.modelId}`,
            vaultSource: oracle.source === "vault" ? "Selene Hardware Vault" : "Environment Variable",
          });
        }
      } catch (err) {
        console.warn(`Oracle generator (${oracle.provider}/${oracle.modelId}) error:`, err);
      }
    }

    // 2. Fallback: Offline Smart Heuristic Template Generator
    let fallbackCode = "";

    if (category === "diagram") {
      fallbackCode = `\`\`\`mermaid
flowchart TD
    Client["Client / User Agent"] --> Gateway["Selene API Gateway"]
    Gateway --> AST["Polymorphic AST Engine"]
    Gateway --> WASM["WASM Compute Kernel"]
    Gateway --> DB[("LibSQL Database")]
    AST --> LiveRender["Sandboxed Canvas"]
    WASM --> LiveRender
\`\`\``;
    } else if (category === "math") {
      fallbackCode = `\`\`\`math
\\begin{aligned}
  \\Delta v &= v_e \\ln\\left(\\frac{m_0}{m_f}\\right) \\\\[6pt]
  r_p &= a(1 - e), \\quad r_a = a(1 + e)
\\end{aligned}
\`\`\``;
    } else {
      // UI Component fallback based on stack
      if (stack === "rust" || stack === "yew") {
        fallbackCode = `\`\`\`rust
use yew::prelude::*;

#[function_component(App)]
pub fn app() -> Html {
    let count = use_state(|| 42);
    html! {
        <div class="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl border border-amber-500/30 text-white shadow-2xl font-sans">
            <h3 class="text-base font-bold text-amber-400">{ "${prompt}" }</h3>
            <p class="text-xs text-slate-400 mt-1">{ "Rust WebAssembly • Zero GC Overhead" }</p>
            <button id="rust-counter-btn" class="mt-4 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold">
                { "WASM Cycles: " } <span id="rust-counter-val" class="font-mono">{ *count }</span>
            </button>
        </div>
    }
}
\`\`\``;
      } else if (stack === "sql") {
        fallbackCode = `\`\`\`sql
-- Generated query for: ${prompt}
SELECT 
  id,
  name,
  target_celestial_body,
  budget_millions_usd,
  status
FROM celestial_missions
WHERE status = 'active'
ORDER BY budget_millions_usd DESC;
\`\`\``;
      } else if (stack === "blade" || stack === "php") {
        fallbackCode = `\`\`\`blade
@php
  $title = "${prompt}";
  $status = "nominal";
@endphp

<div x-data="{ count: 42 }" class="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl border border-red-500/30 text-white shadow-2xl font-sans">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-base font-bold text-white">{{ $title }}</h3>
    <span class="text-xs font-mono text-emerald-400">{{ strtoupper($status) }}</span>
  </div>
  <button @click="count++" class="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-semibold">
    ⚡ Pipeline Count: <span x-text="count"></span>
  </button>
</div>
\`\`\``;
      } else if (stack === "erb" || stack === "ruby") {
        fallbackCode = `\`\`\`erb
<%
  @title = "${prompt}"
  @status = "healthy"
  @count = 42
%>

<div class="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl border border-rose-500/30 text-white shadow-2xl font-sans">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-base font-bold text-white"><%= @title %></h3>
    <span class="text-xs font-mono text-emerald-400"><%= @status.upcase %></span>
  </div>
  <p class="text-xs text-slate-400">Telemetry Active</p>
</div>
\`\`\``;
      } else if (stack === "go" || stack === "gotemplate") {
        fallbackCode = `\`\`\`go
{{/* Context:
{
  "Cluster": "${prompt}",
  "Status": "optimal",
  "Throughput": "184.2 MB/s",
  "Uptime": "99.99%"
}
*/}}

<div class="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl border border-cyan-500/30 text-white shadow-2xl font-sans">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-base font-bold text-white">{{ .Cluster }}</h3>
    <span class="text-xs font-mono text-emerald-400">{{ upper .Status }}</span>
  </div>
  <p class="text-xs text-slate-400">Throughput: {{ .Throughput }}</p>
</div>
\`\`\``;
      } else if (stack === "django" || stack === "jinja") {
        fallbackCode = `\`\`\`django
{# Context:
{
  "cluster": "${prompt}",
  "status": "optimal",
  "throughput": "9,420 req/s"
}
#}

<div class="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl border border-emerald-500/30 text-white shadow-2xl font-sans">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-base font-bold text-white">{{ cluster }}</h3>
    <span class="text-xs font-mono text-emerald-400">{{ status|upper }}</span>
  </div>
  <p class="text-xs text-slate-400">Throughput: {{ throughput }}</p>
</div>
\`\`\``;
      } else {
        // React TSX default
        fallbackCode = `\`\`\`tsx
import React, { useState } from "react";

export default function Component() {
  const [likes, setLikes] = useState(42);

  return (
    <div className="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl border border-sky-500/30 text-white shadow-2xl space-y-4">
      <h3 className="text-base font-bold text-sky-400">${prompt}</h3>
      <p className="text-xs text-slate-300">
        Generated with Selene Canvas Copilot.
      </p>
      <button
        onClick={() => setLikes(l => l + 1)}
        className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold"
      >
        ❤️ Likes ({likes})
      </button>
    </div>
  );
}
\`\`\``;
      }
    }

    return NextResponse.json({
      success: true,
      generatedContent: fallbackCode,
      content: fallbackCode,
      code: fallbackCode,
      provider: "offline-heuristic",
      note: "Tip: Save your API key in License & Vault settings to enable unrestricted live generative AI across DeepSeek, OpenRouter, Gemini, and OpenAI!",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, message: "AI generation failed", details: msg },
      { status: 500 }
    );
  }
}
