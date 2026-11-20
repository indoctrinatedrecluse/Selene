import { z } from "zod";

/**
 * Zod schema for Hephaestus Code Auto-Fix Lens
 */
export const HephaestusAutoFixSchema = z.object({
  explanation: z
    .string()
    .describe("A concise explanation of what caused the bug or syntax error and how it is resolved."),
  fixedCode: z
    .string()
    .describe("The corrected, complete code block ready to be inserted directly into the canvas."),
  changesSummary: z
    .string()
    .describe("A bullet-pointed or 1-2 sentence executive summary of exact modifications made."),
});

export type HephaestusAutoFixResult = z.infer<typeof HephaestusAutoFixSchema>;

/**
 * Zod schema for Delphic Oracle Code & Component Generator
 */
export const DelphicGenerateSchema = z.object({
  title: z
    .string()
    .describe("An evocative, mythologically resonant title for the generated artifact."),
  code: z
    .string()
    .describe("The complete, runnable code block without markdown fence wrappers."),
  explanation: z
    .string()
    .describe("Brief architectural commentary on the code components and design patterns used."),
  tags: z
    .array(z.string())
    .describe("Relevant stack or category tags (e.g. ['React19', 'Tailwind', 'Interactive'])."),
});

export type DelphicGenerateResult = z.infer<typeof DelphicGenerateSchema>;

/**
 * Zod schema for Hermes Alexandrian Papyrus / PDF Ingestion
 */
export const HermesIngestSchema = z.object({
  title: z
    .string()
    .describe("Extracted or deduced document title from the papyrus/paper."),
  markdown: z
    .string()
    .describe("Full, rich literate markdown with KaTeX math ($$), structured tables, and code blocks."),
  summary: z
    .string()
    .describe("A brief 2-3 sentence academic abstract or summary of the ingested work."),
  equationsCount: z
    .number()
    .describe("Approximate count of mathematical formulations detected."),
});

export type HermesIngestResult = z.infer<typeof HermesIngestSchema>;
