import { STARTER_TEMPLATES } from "../src/lib/workspace-store";

console.log("=== ALL 26 STARTER TEMPLATES CODE BLOCKS ===");
const globalLanguages = new Set<string>();

for (const [idx, t] of STARTER_TEMPLATES.entries()) {
  const codeBlockRegex = /```([a-zA-Z0-9_\-\+\#]*)/g;
  let match;
  const langs: string[] = [];
  let isOpening = true;

  while ((match = codeBlockRegex.exec(t.content)) !== null) {
    if (isOpening) {
      const lang = match[1].trim().toLowerCase() || "plaintext";
      langs.push(lang);
      globalLanguages.add(lang);
      isOpening = false;
    } else {
      isOpening = true;
    }
  }

  console.log(`${idx + 1}. ${t.title} (${langs.length} blocks): [${langs.join(", ")}]`);
}

console.log("\nAll unique languages across all 26 templates:");
console.log(Array.from(globalLanguages).sort());
