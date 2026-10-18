/**
 * Selene Public Embed Generator
 * Produces secure, responsive iframe embed code and React components
 * for embedding Selene canvases into Notion, documentation portals, or blogs.
 */

export interface EmbedOptions {
  shareUrl: string;
  width?: string;
  height?: string;
  theme?: "dark" | "light";
  hideHeader?: boolean;
}

export function generateHtmlEmbedCode(options: EmbedOptions): string {
  const {
    shareUrl,
    width = "100%",
    height = "650px",
    theme = "dark",
    hideHeader = false,
  } = options;

  const urlObj = new URL(shareUrl);
  urlObj.searchParams.set("embed", "true");
  urlObj.searchParams.set("theme", theme);
  if (hideHeader) {
    urlObj.searchParams.set("hideHeader", "true");
  }

  const finalUrl = urlObj.toString();

  return `<iframe
  src="${finalUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  style="border-radius: 16px; border: 1px solid rgba(56, 189, 248, 0.25); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5); overflow: hidden;"
  allow="clipboard-write; fullscreen"
  loading="lazy"
  title="Selene Technical Document Canvas"
></iframe>`;
}

export function generateReactEmbedCode(options: EmbedOptions): string {
  const {
    shareUrl,
    width = "100%",
    height = "650px",
    theme = "dark",
    hideHeader = false,
  } = options;

  const urlObj = new URL(shareUrl);
  urlObj.searchParams.set("embed", "true");
  urlObj.searchParams.set("theme", theme);
  if (hideHeader) {
    urlObj.searchParams.set("hideHeader", "true");
  }

  const finalUrl = urlObj.toString();

  return `export function EmbeddedSeleneCanvas() {
  return (
    <div style={{ width: "${width}", maxWidth: "100%", margin: "0 auto" }}>
      <iframe
        src="${finalUrl}"
        width="100%"
        height="${height}"
        style={{
          borderRadius: 16,
          border: "1px solid rgba(56, 189, 248, 0.25)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
          overflow: "hidden",
        }}
        allow="clipboard-write; fullscreen"
        loading="lazy"
        title="Selene Technical Document Canvas"
      />
    </div>
  );
}`;
}
