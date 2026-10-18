/**
 * Selene AST & Code Transformer Engine
 * Provides bi-directional extraction and updating of visual properties across:
 * - React (TSX / JSX)
 * - Vue 3 SFC
 * - Svelte 4 / 5
 * - Angular Ivy Components
 * - Vanilla HTML / CSS
 */

export type AccentColorId =
  | "sky"
  | "cyan"
  | "indigo"
  | "emerald"
  | "rose"
  | "amber"
  | "violet"
  | "fuchsia"
  | "red";

export type SurfaceThemeId =
  | "slate"
  | "midnight"
  | "obsidian"
  | "glass"
  | "indigo-night";

export type PaddingOptionId = "p-3" | "p-4" | "p-6" | "p-8" | "p-10";

export type RadiusOptionId =
  | "rounded-none"
  | "rounded-lg"
  | "rounded-xl"
  | "rounded-2xl"
  | "rounded-3xl"
  | "rounded-full";

export type ShadowOptionId =
  | "shadow-none"
  | "shadow-md"
  | "shadow-xl"
  | "shadow-2xl"
  | "lunar-glow";

export type MaxWidthOptionId =
  | "max-w-xs"
  | "max-w-sm"
  | "max-w-md"
  | "max-w-lg"
  | "max-w-xl"
  | "max-w-full";

export interface UniversalVisualProps {
  // Content & Typography
  title: string;
  subtitle: string;
  buttonText: string;

  // Geometry & Spacing
  padding: PaddingOptionId;
  borderRadius: RadiusOptionId;
  maxWidth: MaxWidthOptionId;

  // Theme & Surface
  accentColor: AccentColorId;
  surfaceTheme: SurfaceThemeId;

  // Elevation & Glow
  shadow: ShadowOptionId;

  // Logic & Reactive State
  initialCount?: number;
}

export const ACCENT_THEMES = [
  { id: "sky" as const, name: "Sky Moon", bg: "bg-sky-500", text: "text-sky-400", hex: "#38bdf8", darkHex: "#0284c7" },
  { id: "cyan" as const, name: "Cyan Ice", bg: "bg-cyan-500", text: "text-cyan-400", hex: "#06b6d4", darkHex: "#0891b2" },
  { id: "indigo" as const, name: "Indigo Orbit", bg: "bg-indigo-500", text: "text-indigo-400", hex: "#6366f1", darkHex: "#4f46e5" },
  { id: "emerald" as const, name: "Emerald Aurora", bg: "bg-emerald-500", text: "text-emerald-400", hex: "#10b981", darkHex: "#059669" },
  { id: "rose" as const, name: "Rose Corona", bg: "bg-rose-500", text: "text-rose-400", hex: "#f43f5e", darkHex: "#e11d48" },
  { id: "amber" as const, name: "Amber Solar", bg: "bg-amber-500", text: "text-amber-400", hex: "#f59e0b", darkHex: "#d97706" },
  { id: "violet" as const, name: "Violet Nebulae", bg: "bg-violet-500", text: "text-violet-400", hex: "#8b5cf6", darkHex: "#7c3aed" },
  { id: "fuchsia" as const, name: "Fuchsia Flare", bg: "bg-fuchsia-500", text: "text-fuchsia-400", hex: "#d946ef", darkHex: "#c026d3" },
  { id: "red" as const, name: "Crimson Titan", bg: "bg-red-500", text: "text-red-400", hex: "#ef4444", darkHex: "#dc2626" },
];

export const SURFACE_THEMES = [
  { id: "slate" as const, label: "Deep Slate", bgClass: "bg-slate-900", borderClass: "border-slate-800" },
  { id: "midnight" as const, label: "Midnight Lunar", bgClass: "bg-[#070a14]", borderClass: "border-sky-950/50" },
  { id: "obsidian" as const, label: "Cyber Obsidian", bgClass: "bg-black", borderClass: "border-zinc-800" },
  { id: "glass" as const, label: "Translucent Glass", bgClass: "bg-slate-900/60 backdrop-blur-xl", borderClass: "border-white/10" },
  { id: "indigo-night" as const, label: "Indigo Cosmos", bgClass: "bg-[#0b0f19]", borderClass: "border-indigo-950/60" },
];

export const PADDING_OPTIONS = [
  { id: "p-3" as const, label: "Compact (12px)" },
  { id: "p-4" as const, label: "Small (16px)" },
  { id: "p-6" as const, label: "Balanced (24px)" },
  { id: "p-8" as const, label: "Spacious (32px)" },
  { id: "p-10" as const, label: "Generous (40px)" },
];

export const RADIUS_OPTIONS = [
  { id: "rounded-none" as const, label: "Sharp" },
  { id: "rounded-lg" as const, label: "Subtle (8px)" },
  { id: "rounded-xl" as const, label: "Medium (12px)" },
  { id: "rounded-2xl" as const, label: "Smooth (16px)" },
  { id: "rounded-3xl" as const, label: "Curved (24px)" },
  { id: "rounded-full" as const, label: "Pill Shape" },
];

export const SHADOW_OPTIONS = [
  { id: "shadow-none" as const, label: "Flat" },
  { id: "shadow-md" as const, label: "Subtle" },
  { id: "shadow-xl" as const, label: "Elevated" },
  { id: "shadow-2xl" as const, label: "High Depth" },
  { id: "lunar-glow" as const, label: "Lunar Glow" },
];

export const WIDTH_OPTIONS = [
  { id: "max-w-xs" as const, label: "XS (320px)" },
  { id: "max-w-sm" as const, label: "SM (384px)" },
  { id: "max-w-md" as const, label: "MD (448px)" },
  { id: "max-w-lg" as const, label: "LG (512px)" },
  { id: "max-w-xl" as const, label: "XL (576px)" },
  { id: "max-w-full" as const, label: "Full Width" },
];

export const DEFAULT_UNIVERSAL_PROPS: UniversalVisualProps = {
  title: "Selene Live Preview",
  subtitle: "Isolated HMR Sandbox",
  buttonText: "Like",
  padding: "p-6",
  borderRadius: "rounded-2xl",
  maxWidth: "max-w-sm",
  accentColor: "sky",
  surfaceTheme: "slate",
  shadow: "shadow-xl",
  initialCount: 42,
};

/**
 * Extracts current visual properties from code based on its framework language.
 */
export function extractVisualProps(code: string, language = "tsx"): UniversalVisualProps {
  const result: UniversalVisualProps = { ...DEFAULT_UNIVERSAL_PROPS };

  const lang = language.toLowerCase();

  // 1. Title Extraction
  if (lang === "blade" || lang === "php" || lang === "laravel") {
    const phpTitle = code.match(/\$(?:cluster|title|name)\s*=\s*["']([^"']+)["']/);
    if (phpTitle) result.title = phpTitle[1];
  } else if (lang === "erb" || lang === "ruby" || lang === "rails") {
    const rubyTitle = code.match(/@(?:cluster|title|name)\s*=\s*["']([^"']+)["']/);
    if (rubyTitle) result.title = rubyTitle[1];
  } else if (lang === "go" || lang === "golang" || lang === "gotemplate" || lang === "hugo") {
    const goTitle = code.match(/"(?:Cluster|Title|Name)":\s*"([^"]+)"/);
    if (goTitle) result.title = goTitle[1];
  } else if (lang === "django" || lang === "jinja" || lang === "jinja2") {
    const djangoTitle = code.match(/"(?:cluster|title|name)":\s*"([^"]+)"/);
    if (djangoTitle) result.title = djangoTitle[1];
  } else if (lang === "rust" || lang === "rs" || lang === "yew" || lang === "leptos") {
    const rustTitle = code.match(/<h[1-6][^>]*>\{\s*"([^"]+)"\s*\}<\/h[1-6]>/) || code.match(/let\s+cluster\s*=\s*"([^"]+)";/);
    if (rustTitle) result.title = rustTitle[1];
  } else {
    const headingMatch = code.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/);
    if (headingMatch && headingMatch[1]) {
      // Strip inner HTML/JSX tags if any
      result.title = headingMatch[1].replace(/<[^>]+>/g, "").trim();
    }
  }

  // 2. Subtitle / Description Extraction
  const subtitleMatch =
    code.match(/<(?:p|span)[^>]*class="(?:[^"]*(?:subtitle|text-xs|desc|sub|text-slate-400))[^"]*"[^>]*>(.*?)<\/(?:p|span)>/) ||
    code.match(/<p[^>]*class="[^"]*text-sm[^"]*"[^>]*>(.*?)<\/p>/);
  if (subtitleMatch && subtitleMatch[1]) {
    result.subtitle = subtitleMatch[1].replace(/<[^>]+>/g, "").trim();
  }

  // 3. Button Text Extraction
  const buttonMatch = code.match(/<button[^>]*>([\s\S]*?)<\/button>/);
  if (buttonMatch && buttonMatch[1]) {
    const rawBtn = buttonMatch[1].replace(/<[^>]+>/g, "").trim();
    // Clean dynamic template variables like ({{ count }} or {likes})
    const cleanedBtn = rawBtn.replace(/(\(\s*\{.*?\}\s*\)|\(\s*\{\{.*?\}\}\s*\))/g, "").trim();
    if (cleanedBtn) {
      result.buttonText = cleanedBtn;
    }
  }

  // 4. Padding Extraction
  const paddingMatch = code.match(/\bp-(3|4|6|8|10)\b/);
  if (paddingMatch) {
    result.padding = `p-${paddingMatch[1]}` as PaddingOptionId;
  } else {
    // Check scoped styles for padding: 1.5rem
    const cssPadding = code.match(/padding:\s*([0-9.]+)(rem|px)/);
    if (cssPadding) {
      const val = parseFloat(cssPadding[1]);
      const unit = cssPadding[2];
      const px = unit === "rem" ? val * 16 : val;
      if (px <= 12) result.padding = "p-3";
      else if (px <= 16) result.padding = "p-4";
      else if (px <= 24) result.padding = "p-6";
      else if (px <= 32) result.padding = "p-8";
      else result.padding = "p-10";
    }
  }

  // 5. Border Radius Extraction
  const radiusMatch = code.match(/\brounded-(none|lg|xl|2xl|3xl|full)\b/);
  if (radiusMatch) {
    result.borderRadius = `rounded-${radiusMatch[1]}` as RadiusOptionId;
  } else {
    const cssRadius = code.match(/border-radius:\s*([0-9.]+)(rem|px)/);
    if (cssRadius) {
      const val = parseFloat(cssRadius[1]);
      const unit = cssRadius[2];
      const px = unit === "rem" ? val * 16 : val;
      if (px === 0) result.borderRadius = "rounded-none";
      else if (px <= 10) result.borderRadius = "rounded-lg";
      else if (px <= 14) result.borderRadius = "rounded-xl";
      else if (px <= 20) result.borderRadius = "rounded-2xl";
      else if (px <= 28) result.borderRadius = "rounded-3xl";
      else result.borderRadius = "rounded-full";
    }
  }

  // 6. Max Width Extraction
  const widthMatch = code.match(/\bmax-w-(xs|sm|md|lg|xl|full)\b/);
  if (widthMatch) {
    result.maxWidth = `max-w-${widthMatch[1]}` as MaxWidthOptionId;
  }

  // 7. Accent Color Detection
  const colorMatch = code.match(
    /\b(?:bg|text|from|to|border)-(sky|cyan|indigo|emerald|rose|amber|violet|fuchsia|red)-[0-9]{2,3}\b/
  );
  if (colorMatch) {
    result.accentColor = colorMatch[1] as AccentColorId;
  } else {
    // Check scoped CSS hex colors
    for (const theme of ACCENT_THEMES) {
      if (
        code.toLowerCase().includes(theme.hex.toLowerCase()) ||
        code.toLowerCase().includes(theme.darkHex.toLowerCase())
      ) {
        result.accentColor = theme.id;
        break;
      }
    }
  }

  // 8. Surface Theme Detection
  if (code.includes("backdrop-blur")) {
    result.surfaceTheme = "glass";
  } else if (code.includes("#070a14")) {
    result.surfaceTheme = "midnight";
  } else if (code.includes("bg-black")) {
    result.surfaceTheme = "obsidian";
  } else if (code.includes("#0b0f19")) {
    result.surfaceTheme = "indigo-night";
  } else {
    result.surfaceTheme = "slate";
  }

  // 9. Shadow Detection
  const shadowMatch = code.match(/\bshadow-(none|md|xl|2xl)\b/);
  if (shadowMatch) {
    result.shadow = `shadow-${shadowMatch[1]}` as ShadowOptionId;
  } else if (code.includes("lunar-glow") || code.includes("rgba(16, 185, 129, 0.25)")) {
    result.shadow = "lunar-glow";
  }

  // 10. Initial Count / Numeric State
  if (lang === "vue") {
    const vueRef = code.match(/ref\(\s*(\d+)\s*\)/);
    if (vueRef) result.initialCount = parseInt(vueRef[1], 10);
  } else if (lang === "svelte") {
    const svelteCount = code.match(/let\s+count\s*=\s*(\d+)/);
    if (svelteCount) result.initialCount = parseInt(svelteCount[1], 10);
  } else if (lang === "angular") {
    const ngCount = code.match(/(?:count|score|velocity)\s*=\s*(\d+(?:\.\d+)?)/);
    if (ngCount) result.initialCount = parseFloat(ngCount[1]);
  } else if (lang === "blade" || lang === "php" || lang === "laravel") {
    const alpineCount = code.match(/count:\s*(\d+)/) || code.match(/\$count\s*=\s*(\d+)/);
    if (alpineCount) result.initialCount = parseInt(alpineCount[1], 10);
  } else if (lang === "erb" || lang === "ruby" || lang === "rails") {
    const rubyCount = code.match(/@count\s*=\s*(\d+)/) || code.match(/counter"[^>]*>(\d+)</);
    if (rubyCount) result.initialCount = parseInt(rubyCount[1], 10);
  } else if (lang === "go" || lang === "golang" || lang === "gotemplate" || lang === "hugo") {
    const goCount = code.match(/"(?:Goroutines|Count|count)":\s*(\d+)/);
    if (goCount) result.initialCount = parseInt(goCount[1], 10);
  } else if (lang === "django" || lang === "jinja" || lang === "jinja2") {
    const pyCount = code.match(/"(?:workers|count|Count)":\s*(\d+)/);
    if (pyCount) result.initialCount = parseInt(pyCount[1], 10);
  } else if (lang === "rust" || lang === "rs" || lang === "yew" || lang === "leptos") {
    const rustCount = code.match(/use_state\(\s*\|\|\s*(\d+)\s*\)/) || code.match(/create_signal\(\s*(\d+)\s*\)/);
    if (rustCount) result.initialCount = parseInt(rustCount[1], 10);
  } else {
    // React / TSX
    const reactState = code.match(/useState\(\s*(\d+)\s*\)/);
    if (reactState) result.initialCount = parseInt(reactState[1], 10);
  }

  return result;
}

/**
 * Bi-directionally applies visual properties to source code.
 */
export function applyVisualProps(
  code: string,
  language: string,
  props: UniversalVisualProps
): string {
  let updated = code;
  const lang = language.toLowerCase();

  // 1. Update Title
  if (props.title) {
    if (lang === "blade" || lang === "php" || lang === "laravel") {
      updated = updated.replace(/(\$(?:cluster|title|name)\s*=\s*["'])[^"']+(["'])/, `$1${props.title}$2`);
    } else if (lang === "erb" || lang === "ruby" || lang === "rails") {
      updated = updated.replace(/(@(?:cluster|title|name)\s*=\s*["'])[^"']+(["'])/, `$1${props.title}$2`);
    } else if (lang === "go" || lang === "golang" || lang === "gotemplate" || lang === "hugo") {
      updated = updated.replace(/("(?:Cluster|Title|Name)":\s*")[^"]+(")/, `$1${props.title}$2`);
    } else if (lang === "django" || lang === "jinja" || lang === "jinja2") {
      updated = updated.replace(/("(?:cluster|title|name)":\s*")[^"]+(")/, `$1${props.title}$2`);
    } else if (lang === "rust" || lang === "rs" || lang === "yew" || lang === "leptos") {
      updated = updated.replace(/(<h[1-6][^>]*>\{\s*")[^"]+("\s*\}<\/h[1-6]>)/, `$1${props.title}$2`);
      updated = updated.replace(/(let\s+cluster\s*=\s*")[^"]+(";)/, `$1${props.title}$2`);
    }
    const titleMatch = updated.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/);
    if (titleMatch && !titleMatch[1].includes("{{") && !titleMatch[1].includes("<%") && !titleMatch[1].includes("{")) {
      updated = updated.replace(
        /<h([1-6])([^>]*)>(.*?)<\/h\1>/,
        `<h$1$2>${props.title}</h$1>`
      );
    }
  }

  // 2. Update Subtitle
  if (props.subtitle) {
    const subMatch = updated.match(
      /<(p|span)([^>]*class="[^"]*(?:subtitle|text-xs|desc|sub|text-slate-400)[^"]*"[^>]*)>(.*?)<\/\1>/
    );
    if (subMatch) {
      updated = updated.replace(
        /<(p|span)([^>]*class="[^"]*(?:subtitle|text-xs|desc|sub|text-slate-400)[^"]*"[^>]*)>(.*?)<\/\1>/,
        `<$1$2>${props.subtitle}</$1>`
      );
    }
  }

  // 3. Update Padding (Tailwind & Scoped CSS)
  updated = updated.replace(/\bp-(?:0|1|2|3|4|5|6|8|10|12)\b/g, props.padding);
  const paddingRemMap: Record<PaddingOptionId, string> = {
    "p-3": "0.75rem",
    "p-4": "1rem",
    "p-6": "1.5rem",
    "p-8": "2rem",
    "p-10": "2.5rem",
  };
  updated = updated.replace(
    /padding:\s*[0-9.]+(?:rem|px);/g,
    `padding: ${paddingRemMap[props.padding]};`
  );

  // 4. Update Border Radius (Tailwind & Scoped CSS)
  updated = updated.replace(
    /\brounded-(?:none|sm|md|lg|xl|2xl|3xl|full)\b/g,
    props.borderRadius
  );
  const radiusRemMap: Record<RadiusOptionId, string> = {
    "rounded-none": "0px",
    "rounded-lg": "0.5rem",
    "rounded-xl": "0.75rem",
    "rounded-2xl": "1rem",
    "rounded-3xl": "1.5rem",
    "rounded-full": "9999px",
  };
  updated = updated.replace(
    /border-radius:\s*[0-9.]+(?:rem|px);/g,
    `border-radius: ${radiusRemMap[props.borderRadius]};`
  );

  // 5. Update Max Width
  updated = updated.replace(/\bmax-w-(?:xs|sm|md|lg|xl|full)\b/g, props.maxWidth);

  // 6. Update Accent Color (Tailwind classes)
  const targetTheme = ACCENT_THEMES.find((t) => t.id === props.accentColor) || ACCENT_THEMES[0];
  updated = updated.replace(
    /\b(bg|text|from|to|border)-(?:sky|cyan|indigo|emerald|rose|amber|violet|fuchsia|red)-([0-9]{2,3})\b/g,
    `$1-${targetTheme.id}-$2`
  );

  // Update Scoped CSS Hex colors
  for (const theme of ACCENT_THEMES) {
    if (theme.id !== targetTheme.id) {
      // Replace old theme primary hex
      updated = updated.replaceAll(theme.hex, targetTheme.hex);
      updated = updated.replaceAll(theme.hex.toLowerCase(), targetTheme.hex);
      // Replace old theme dark hex
      updated = updated.replaceAll(theme.darkHex, targetTheme.darkHex);
      updated = updated.replaceAll(theme.darkHex.toLowerCase(), targetTheme.darkHex);
    }
  }

  // 7. Update Surface Theme
  const surface = SURFACE_THEMES.find((s) => s.id === props.surfaceTheme) || SURFACE_THEMES[0];
  // Replace background container classes
  updated = updated.replace(
    /\b(?:bg-slate-900(?:\/60)?|bg-slate-950|bg-\[#070a14\]|bg-black|bg-\[#0b0f19\])(?:\s+backdrop-blur-(?:md|xl))?\b/g,
    surface.bgClass
  );
  // Update scoped CSS container background
  const surfaceHexMap: Record<SurfaceThemeId, string> = {
    slate: "#0f172a",
    midnight: "#070a14",
    obsidian: "#000000",
    glass: "rgba(15, 23, 42, 0.75)",
    "indigo-night": "#0b0f19",
  };
  updated = updated.replace(
    /background:\s*(?:#[0-9a-fA-F]{3,8}|rgba?\([^)]+\));/g,
    `background: ${surfaceHexMap[props.surfaceTheme]};`
  );

  // 8. Update Shadow & Glow
  if (props.shadow === "lunar-glow") {
    updated = updated.replace(/\bshadow-(?:none|sm|md|lg|xl|2xl)\b/g, "shadow-2xl shadow-sky-500/25");
  } else {
    updated = updated.replace(/\bshadow-(?:none|sm|md|lg|xl|2xl)\b(?:\s+shadow-[a-z]+-[0-9]{2,3}\/[0-9]{1,3})?/g, props.shadow);
  }

  // 9. Update Initial Count / Numeric State if provided
  if (props.initialCount !== undefined && !isNaN(props.initialCount)) {
    if (lang === "vue") {
      updated = updated.replace(/ref\(\s*\d+\s*\)/g, `ref(${props.initialCount})`);
    } else if (lang === "svelte") {
      updated = updated.replace(/let\s+count\s*=\s*\d+;/g, `let count = ${props.initialCount};`);
    } else if (lang === "angular") {
      updated = updated.replace(
        /(count|score|velocity)\s*=\s*\d+(?:\.\d+)?/g,
        `$1 = ${props.initialCount}`
      );
    } else if (lang === "blade" || lang === "php" || lang === "laravel") {
      updated = updated.replace(/count:\s*\d+/g, `count: ${props.initialCount}`);
      updated = updated.replace(/\$count\s*=\s*\d+/g, `$count = ${props.initialCount}`);
      updated = updated.replace(/(x-text="[^"]*"[^>]*>)\d*(<\/span>)/g, `$1${props.initialCount}$2`);
    } else if (lang === "erb" || lang === "ruby" || lang === "rails") {
      updated = updated.replace(/@count\s*=\s*\d+/g, `@count = ${props.initialCount}`);
      updated = updated.replace(/(data-telemetry-target="counter"[^>]*>)\d*(<\/span>)/g, `$1${props.initialCount}$2`);
    } else if (lang === "go" || lang === "golang" || lang === "gotemplate" || lang === "hugo") {
      updated = updated.replace(/("(?:Goroutines|Count|count)":\s*)\d+/g, `$1${props.initialCount}`);
    } else if (lang === "django" || lang === "jinja" || lang === "jinja2") {
      updated = updated.replace(/("(?:workers|count|Count)":\s*)\d+/g, `$1${props.initialCount}`);
    } else if (lang === "rust" || lang === "rs" || lang === "yew" || lang === "leptos") {
      updated = updated.replace(/use_state\(\s*\|\|\s*\d+\s*\)/g, `use_state(|| ${props.initialCount})`);
      updated = updated.replace(/create_signal\(\s*\d+\s*\)/g, `create_signal(${props.initialCount})`);
    } else {
      updated = updated.replace(/useState\(\s*\d+\s*\)/g, `useState(${props.initialCount})`);
    }
  }

  return updated;
}
