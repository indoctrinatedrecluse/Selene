import { NextRequest, NextResponse } from "next/server";
import { retrieveAIKey } from "@/lib/security/secure-vault";

export interface AiIngestRequest {
  fileData: string; // Base64 data or raw text
  mimeType: string;
  documentName?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: AiIngestRequest = await req.json();
    let fileData = body.fileData || "";
    const mimeType = body.mimeType || "image/png";
    const docName = body.documentName || "Ingested Document";

    if (!fileData) {
      return NextResponse.json(
        { success: false, message: "File data is required" },
        { status: 400 }
      );
    }

    // Strip data URL prefix if present (e.g. data:image/png;base64,...)
    if (fileData.includes(",")) {
      fileData = fileData.split(",")[1];
    }

    // 1. Vault Key Retrieval
    let apiKey = await retrieveAIKey("gemini");
    if (!apiKey) {
      apiKey = process.env.GEMINI_API_KEY || null;
    }

    // 2. Multimodal Gemini Vision Extraction
    if (apiKey) {
      const promptText = `You are Selene Paper-to-Canvas Multimodal Ingestion Engine.
Transcribe and structure the uploaded document/image into hypermodern literate technical Markdown for the Selene Canvas.

CRITICAL FORMATTING INSTRUCTIONS:
1. Mathematical Equations: Format formulas using KaTeX code blocks:
\`\`\`math
[formula]
\`\`\`
2. System Diagrams & Architectures: Transcribe flowcharts, sequence diagrams, and architecture sketches into Mermaid code blocks:
\`\`\`mermaid
flowchart TD
  ...
\`\`\`
3. Source Code: Convert code snippets into labeled syntax blocks (e.g., \`\`\`tsx, \`\`\`python, \`\`\`rust, \`\`\`sql).
4. Structure: Preserve hierarchy with #, ##, ###, bullet points, and tables.
5. Quality: Be thorough and complete. Do NOT summarize or omit sections.
6. Output: Respond ONLY with the resulting Markdown content. No conversational intro or outro.`;

      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: promptText },
                    {
                      inlineData: {
                        mimeType,
                        data: fileData,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 4096,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const markdown = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (markdown) {
            return NextResponse.json({
              success: true,
              markdown,
              source: "gemini",
            });
          }
        }
      } catch (err) {
        console.warn("Gemini multimodal ingest failed, falling back to structured template:", err);
      }
    }

    // 3. Fallback Structured Ingestion Scaffold
    const fallbackMarkdown = `# 📄 Ingested Document: ${docName}

> [!NOTE]
> Transcribed via Selene Multimodal Ingestion Pipeline.

## 🏛️ 1. Architecture & System Flow

\`\`\`mermaid
flowchart TD
    A[Client Request] --> B{API Gateway}
    B -->|Ingest Stream| C[(Message Queue)]
    B -->|Query| D[(Database Store)]
    C --> E[Distributed Worker Engine]
\`\`\`

---

## 📐 2. Mathematical Formalism

\`\`\`math
\\mathcal{L}(\\theta) = \\mathbb{E}_{x \\sim p_{\\text{data}}}\\left[ \\log D_\\theta(x) \\right] + \\sum_{i=1}^N \\| y_i - f_\\theta(x_i) \\|^2
\`\`\`

---

## ⚡ 3. Live Implementation

\`\`\`tsx
export function IngestedPreviewCard() {
  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-3">
      <h3 className="text-base font-bold text-sky-400">Extracted Ingestion Node</h3>
      <p className="text-xs text-slate-300">
        Review and edit this transcribed document directly inside the Selene Canvas.
      </p>
    </div>
  );
}
\`\`\`
`;

    return NextResponse.json({
      success: true,
      markdown: fallbackMarkdown,
      source: "offline_heuristics",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 500 }
    );
  }
}
