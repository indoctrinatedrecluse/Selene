/**
 * Selene Static Site Generator (SSG) Engine
 * Formats Selene documents with specialized frontmatter metadata and shortcodes
 * for Hugo, Astro, Nextra, and Docusaurus.
 */

export type SsgTarget = "hugo" | "astro" | "nextra" | "docusaurus";

export interface SsgExportOptions {
  title: string;
  markdown: string;
  target?: SsgTarget;
  author?: string;
  tags?: string[];
  slug?: string;
}

export function exportMarkdownToSsg(options: SsgExportOptions): {
  filename: string;
  content: string;
  mimeType: string;
} {
  const {
    title,
    markdown,
    target = "astro",
    author = "Selene Engineer",
    tags = ["architecture", "polymorphic", "selene"],
    slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  } = options;

  const nowIso = new Date().toISOString();
  const dateFormatted = nowIso.slice(0, 10);

  let outputContent = "";
  let fileExt = "md";

  if (target === "hugo") {
    fileExt = "md";
    const frontmatter = `+++
title = "${title}"
date = ${dateFormatted}
draft = false
tags = [${tags.map((t) => `"${t}"`).join(", ")}]
author = "${author}"
summary = "Technical specification and live computational document authored in Selene."
+++

`;
    // Transform admonitions to Hugo shortcodes if applicable
    const transformed = markdown.replace(
      />\s*\[!(NOTE|TIP|WARNING|CAUTION)\]\s*\n((?:>.*\n?)*)/gi,
      (_, type, body) => {
        const cleanBody = body
          .split("\n")
          .map((l: string) => l.replace(/^>\s?/, ""))
          .join("\n");
        return `{{< alert type="${type.toLowerCase()}" >}}\n${cleanBody}\n{{< /alert >}}\n`;
      }
    );
    outputContent = frontmatter + transformed;
  } else if (target === "docusaurus") {
    fileExt = "mdx";
    const frontmatter = `---
id: ${slug}
title: ${title}
sidebar_label: ${title}
sidebar_position: 1
description: Technical document authored in Selene Titan Edition
keywords: [${tags.join(", ")}]
---

`;
    // Transform admonitions to Docusaurus :::note syntax
    const transformed = markdown.replace(
      />\s*\[!(NOTE|TIP|WARNING|CAUTION)\]\s*\n((?:>.*\n?)*)/gi,
      (_, type, body) => {
        const lowerType = type.toLowerCase() === "caution" ? "danger" : type.toLowerCase();
        const cleanBody = body
          .split("\n")
          .map((l: string) => l.replace(/^>\s?/, ""))
          .join("\n");
        return `:::${lowerType}\n${cleanBody}\n:::\n`;
      }
    );
    outputContent = frontmatter + transformed;
  } else if (target === "nextra") {
    fileExt = "mdx";
    const frontmatter = `---
title: ${title}
description: Technical document authored in Selene Titan Edition
author: ${author}
date: ${dateFormatted}
---

import { Callout, Steps, Tabs, Tab } from 'nextra/components'

`;
    // Transform admonitions to Nextra Callouts
    const transformed = markdown.replace(
      />\s*\[!(NOTE|TIP|WARNING|CAUTION)\]\s*\n((?:>.*\n?)*)/gi,
      (_, type, body) => {
        const cleanBody = body
          .split("\n")
          .map((l: string) => l.replace(/^>\s?/, ""))
          .join("\n");
        const calloutType =
          type.toUpperCase() === "WARNING" || type.toUpperCase() === "CAUTION"
            ? "warning"
            : "info";
        return `<Callout type="${calloutType}">\n${cleanBody}\n</Callout>\n`;
      }
    );
    outputContent = frontmatter + transformed;
  } else {
    // Astro Starlight / Content Collections
    fileExt = "mdx";
    const frontmatter = `---
title: "${title}"
description: "Technical document authored in Selene Titan Edition"
author: "${author}"
pubDate: "${dateFormatted}"
tags: [${tags.map((t) => `"${t}"`).join(", ")}]
---

import { Aside, Card, Badge } from '@astrojs/starlight/components';

`;
    // Transform admonitions to Astro Asides
    const transformed = markdown.replace(
      />\s*\[!(NOTE|TIP|WARNING|CAUTION)\]\s*\n((?:>.*\n?)*)/gi,
      (_, type, body) => {
        const asideType =
          type.toUpperCase() === "WARNING"
            ? "caution"
            : type.toUpperCase() === "CAUTION"
            ? "danger"
            : type.toLowerCase();
        const cleanBody = body
          .split("\n")
          .map((l: string) => l.replace(/^>\s?/, ""))
          .join("\n");
        return `<Aside type="${asideType}">\n${cleanBody}\n</Aside>\n`;
      }
    );
    outputContent = frontmatter + transformed;
  }

  return {
    filename: `${slug}.${fileExt}`,
    content: outputContent,
    mimeType: fileExt === "mdx" ? "text/mdx" : "text/markdown",
  };
}
