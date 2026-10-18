"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { CustomCodeBlock } from "./extensions/CustomCodeBlock";
import { Callout } from "./extensions/CalloutNode";
import { SlashCommand } from "./extensions/slash-command/SlashCommandExtension";
import { EditorToolbar } from "./EditorToolbar";
import { EditorBubbleMenu } from "./EditorBubbleMenu";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import {
  RevisionHistoryDrawer,
  RevisionItem,
} from "./RevisionHistoryDrawer";
import { SeleneAiCopilotModal } from "@/components/ai/SeleneAiCopilotModal";
import {
  loadDocuments,
  saveDocuments,
  DocumentItem,
  STARTER_TEMPLATES,
  getDocumentFolder,
} from "@/lib/workspace-store";
import { createCollabSession, CollabSession, CollabUser } from "@/lib/collaboration";
import { ProjectServerRenderer } from "@/components/render-engine/ProjectServerRenderer";
import { SeleneTitanLogo } from "@/components/brand/SeleneTitanLogo";
import {
  SeleneLunarBackground,
  LunarBackgroundMode,
} from "@/components/brand/SeleneLunarBackground";
import { SELENE_VERSION_DISPLAY } from "@/lib/version";

const THEME_CONFIG: Record<
  LunarBackgroundMode,
  {
    containerBg: string;
    headerBg: string;
    footerBg: string;
    accentBadge: string;
    accentText: string;
    name: string;
    icon: string;
  }
> = {
  "titan-aura": {
    containerBg: "bg-[#060913]",
    headerBg: "bg-[#0b1120]/90 border-slate-800",
    footerBg: "bg-[#0b1120]/90 border-slate-800",
    accentBadge: "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-300",
    accentText: "text-cyan-400",
    name: "Titan Aura",
    icon: "🌙",
  },
  "starry-cosmos": {
    containerBg: "bg-[#080214]",
    headerBg: "bg-[#130726]/90 border-purple-900/40",
    footerBg: "bg-[#130726]/90 border-purple-900/40",
    accentBadge: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-300",
    accentText: "text-purple-400",
    name: "Starry Cosmos",
    icon: "✨",
  },
  "midnight-dark": {
    containerBg: "bg-[#020305]",
    headerBg: "bg-[#07080c]/95 border-slate-800/80",
    footerBg: "bg-[#07080c]/95 border-slate-800/80",
    accentBadge: "bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-300",
    accentText: "text-slate-300",
    name: "Midnight Dark",
    icon: "🌑",
  },
};
import { SeleneLoreModal, LoreModalTab } from "@/components/brand/SeleneLoreModal";
import { SeleneSplashScreen } from "@/components/brand/SeleneSplashScreen";
import { PublishExportModal } from "./PublishExportModal";
import { SlideDeckViewer } from "@/components/presentation/SlideDeckViewer";
import {
  FileText,
  Split,
  Eye,
  Code2,
  CheckCircle2,
  Sparkles,
  Users,
  Maximize2,
  Minimize2,
  History,
  Globe,
  Presentation,
  FileDown,
  FolderOpen,
  Save,
  Monitor,
  HelpCircle,
  BookOpen,
  X,
  Terminal as TerminalIcon,
  Columns,
  PenTool,
} from "lucide-react";
import { CollapsibleCommandRunner } from "@/components/terminal/CollapsibleCommandRunner";
import { PaperToCanvasModal } from "@/components/ai/PaperToCanvasModal";
import { WhiteboardOverlay } from "@/components/whiteboard/WhiteboardOverlay";
import { SecondaryDocumentViewer } from "./SecondaryDocumentViewer";
import {
  openLocalDocument,
  saveLocalDocument,
  getDesktopRuntime,
  registerDesktopMenuListener,
} from "@/lib/desktop-bridge";
import { SeleneLicenseBadge } from "@/components/license/SeleneLicenseBadge";
import { SeleneLicenseModal } from "@/components/license/SeleneLicenseModal";
import { SeleneTimeLockBarrier } from "@/components/license/SeleneTimeLockBarrier";
import type { LicenseStatus } from "@/lib/licensing/license-service";
import { apiFetch, setCachedLicenseToken, setCachedHwid } from "@/lib/api-client";
import { parseIpynbToMarkdown } from "@/lib/ipynb-bridge";

export type EditorViewMode = "wysiwyg" | "split" | "project" | "markdown" | "dual-doc";

export function SeleneEditor() {
  const [lunarMode, setLunarModeState] = useState<LunarBackgroundMode>(() => {
    if (typeof window === "undefined") return "titan-aura";
    const saved = localStorage.getItem("selene_lunar_theme") as LunarBackgroundMode;
    if (saved === "titan-aura" || saved === "starry-cosmos" || saved === "midnight-dark") {
      return saved;
    }
    return "titan-aura";
  });

  const setLunarMode = useCallback((mode: LunarBackgroundMode) => {
    setLunarModeState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("selene_lunar_theme", mode);
    }
  }, []);

  const handleCycleTheme = useCallback(() => {
    setLunarModeState((current) => {
      let next: LunarBackgroundMode = "titan-aura";
      if (current === "titan-aura") next = "starry-cosmos";
      else if (current === "starry-cosmos") next = "midnight-dark";
      else next = "titan-aura";

      if (typeof window !== "undefined") {
        localStorage.setItem("selene_lunar_theme", next);
      }
      return next;
    });
  }, []);

  const [isLoreModalOpen, setIsLoreModalOpen] = useState(false);
  const [loreInitialTab, setLoreInitialTab] = useState<LoreModalTab>("myth");
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === "undefined") return false;
    const seen = sessionStorage.getItem("selene_splash_seen");
    if (!seen) {
      sessionStorage.setItem("selene_splash_seen", "true");
      return true;
    }
    return false;
  });
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isSlideDeckOpen, setIsSlideDeckOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    if (typeof window !== "undefined") {
      return loadDocuments();
    }
    return STARTER_TEMPLATES;
  });
  const [activeDocId, setActiveDocId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const loaded = loadDocuments();
      return loaded[0]?.id || STARTER_TEMPLATES[0].id;
    }
    return STARTER_TEMPLATES[0].id;
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<EditorViewMode>("wysiwyg");
  const [isCopied, setIsCopied] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [showRevisions, setShowRevisions] = useState(false);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [isGhostwritingEnabled, setIsGhostwritingEnabled] = useState(true);
  const [ghostSuggestion, setGhostSuggestion] = useState<string | null>(null);
  const [isPaperToCanvasOpen, setIsPaperToCanvasOpen] = useState(false);

  // Phase 5: Dual View & Whiteboard Overlay States
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [secondaryDocId, setSecondaryDocId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const loaded = loadDocuments();
      return loaded[1]?.id || STARTER_TEMPLATES[1]?.id || STARTER_TEMPLATES[0].id;
    }
    return STARTER_TEMPLATES[1]?.id || STARTER_TEMPLATES[0].id;
  });
  const [splitOrientation, setSplitOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [isSyncScroll, setIsSyncScroll] = useState(false);
  const [primaryScrollProgress, setPrimaryScrollProgress] = useState(0);
  const editorScrollRef = useRef<HTMLDivElement | null>(null);

  // Fetch License Status from Registry Authority on mount
  useEffect(() => {
    async function fetchLicense() {
      try {
        const res = await apiFetch("/api/license/status");
        if (res.ok) {
          const data = await res.json();
          setLicenseStatus(data);
          if (data.licenseToken) {
            setCachedLicenseToken(data.licenseToken);
          }
          if (data.hwid) {
            setCachedHwid(data.hwid);
          }
        }
      } catch (err) {
        console.warn("Using offline trial mode (License status fetch failed)", err);
      }
    }
    fetchLicense();
  }, []);

  // Collaboration State
  const [isCollabActive, setIsCollabActive] = useState(false);
  const [collabUser, setCollabUser] = useState<CollabUser | null>(null);
  const [peerCount, setPeerCount] = useState(1);
  const collabSessionRef = useRef<CollabSession | null>(null);

  const activeDoc =
    documents.find((d) => d.id === activeDocId) || documents[0] || STARTER_TEMPLATES[0];

  const [docTitle, setDocTitle] = useState(activeDoc.title);
  const [markdownContent, setMarkdownContent] = useState(activeDoc.content);

  // Sync from DB on mount
  useEffect(() => {
    async function syncFromDb() {
      try {
        const res = await apiFetch("/api/documents");
        if (res.ok) {
          const dbDocs = await res.json();
          if (Array.isArray(dbDocs) && dbDocs.length > 0) {
            const mapped: DocumentItem[] = dbDocs.map(
              (d: {
                id: string;
                title: string;
                contentMarkdown: string;
                icon?: string | null;
                folder?: string | null;
                createdAt: number;
                updatedAt: number;
              }) => ({
                id: d.id,
                title: d.title,
                content: d.contentMarkdown,
                icon: d.icon || "📄",
                folder: getDocumentFolder(d),
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
              })
            );
            setDocuments(mapped);
            saveDocuments(mapped);
          }
        }
      } catch (err) {
        console.warn("Using local storage documents (DB sync offline)", err);
      }
    }
    syncFromDb();
  }, []);

  // Fetch revisions when active document changes
  const loadRevisions = useCallback(async (docId: string) => {
    try {
      const res = await apiFetch(`/api/documents/${docId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.revisions) {
          setRevisions(data.revisions);
        }
      }
    } catch {
      // Revisions fallback
    }
  }, []);

  // TipTap Editor instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CustomCodeBlock,
      Callout,
      SlashCommand,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands or start writing technical documentation...",
      }),
    ],
    content: activeDoc.content,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[500px] px-8 py-6 prose prose-invert max-w-none text-slate-200",
      },
    },
    onUpdate: ({ editor }) => {
      const md = (editor.storage as { markdown?: { getMarkdown: () => string } }).markdown?.getMarkdown();
      if (md) {
        setMarkdownContent(md);
        // Auto-save to local state
        setDocuments((prev) => {
          const updated = prev.map((d) =>
            d.id === activeDocId
              ? { ...d, content: md, updatedAt: Date.now() }
              : d
          );
          saveDocuments(updated);
          return updated;
        });

        // Trigger debounced cloud save
        debounceDbSave(activeDocId, docTitle, md);

        // Trigger debounced AI ghostwriter
        if (isGhostwritingEnabled) {
          setGhostSuggestion(null);
          if (ghostTimeoutRef.current) clearTimeout(ghostTimeoutRef.current);
          ghostTimeoutRef.current = setTimeout(async () => {
            try {
              const { from } = editor.state.selection;
              const textBefore = editor.state.doc.textBetween(Math.max(0, from - 800), from, "\n");
              if (!textBefore || textBefore.trim().length < 8) return;

              const res = await fetch("/api/ai/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contextBefore: textBefore,
                  mode: "prose",
                }),
              });
              const data = await res.json();
              if (data.success && data.completion && data.completion.trim()) {
                setGhostSuggestion(data.completion.trim());
              }
            } catch {
              // Ignore abort or network failure
            }
          }, 650);
        }
      }
    },
    immediatelyRender: false,
  });

  const ghostTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced DB persistence
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceDbSave = useCallback((id: string, title: string, content: string) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setIsSavingDb(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await apiFetch(`/api/documents/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, contentMarkdown: content }),
        });
      } catch {
        // Fallback to local storage
      } finally {
        setIsSavingDb(false);
      }
    }, 800);
  }, []);

  // Global Keyboard Shortcuts (Ctrl+Shift+A: Copilot, Alt+G: Ghostwriter, Tab: Accept Ghost)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setIsAiCopilotOpen((prev) => !prev);
      } else if (e.altKey && (e.key === "G" || e.key === "g")) {
        e.preventDefault();
        setIsGhostwritingEnabled((prev) => !prev);
      } else if (e.key === "Tab" && ghostSuggestion) {
        e.preventDefault();
        if (editor) {
          editor.commands.insertContent(ghostSuggestion);
        }
        setGhostSuggestion(null);
      } else if (e.altKey && (e.key === "W" || e.key === "w")) {
        e.preventDefault();
        setIsWhiteboardOpen((prev) => !prev);
      } else if (e.altKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        setViewMode((prev) => (prev === "dual-doc" ? "wysiwyg" : "dual-doc"));
      } else if (e.key === "Escape" && ghostSuggestion) {
        setGhostSuggestion(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [editor, ghostSuggestion]);

  // Phase 5: Dual View & Whiteboard Handlers
  const handleSwapDualDocs = useCallback(() => {
    const currentPrimary = activeDocId;
    const currentSecondary = secondaryDocId;
    const target = documents.find((d) => d.id === currentSecondary);
    if (target) {
      setActiveDocId(currentSecondary);
      setDocTitle(target.title);
      setMarkdownContent(target.content);
      if (editor) {
        editor.commands.setContent(target.content);
      }
      loadRevisions(currentSecondary);
    }
    setSecondaryDocId(currentPrimary);
  }, [activeDocId, secondaryDocId, documents, editor, loadRevisions]);

  const handleUpdateSecondaryDocContent = useCallback(
    (id: string, content: string) => {
      setDocuments((prev) => {
        const updated = prev.map((d) =>
          d.id === id ? { ...d, content, updatedAt: Date.now() } : d
        );
        saveDocuments(updated);
        return updated;
      });
      const targetDoc = documents.find((d) => d.id === id);
      debounceDbSave(id, targetDoc?.title || "Untitled", content);
    },
    [debounceDbSave, documents]
  );

  const handlePrimaryScroll = () => {
    if (!isSyncScroll) return;
    const container = editorScrollRef.current;
    if (!container) return;
    const max = container.scrollHeight - container.clientHeight;
    if (max > 0) {
      setPrimaryScrollProgress(container.scrollTop / max);
    }
  };

  const handleSecondaryScrollProgress = (progress: number) => {
    if (!isSyncScroll) return;
    const container = editorScrollRef.current;
    if (!container) return;
    const max = container.scrollHeight - container.clientHeight;
    if (max > 0) {
      container.scrollTop = progress * max;
    }
  };

  const handleInsertWhiteboardSnapshot = useCallback(
    (dataUrl: string) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .insertContent(`\n\n![Whiteboard Annotation Snapshot](${dataUrl})\n\n`)
        .run();
      setIsWhiteboardOpen(false);
    },
    [editor]
  );

  // Handle document selection
  const handleSelectDoc = (id: string) => {
    const target = documents.find((d) => d.id === id);
    if (!target) return;
    setActiveDocId(id);
    setDocTitle(target.title);
    setMarkdownContent(target.content);
    if (editor) {
      editor.commands.setContent(target.content);
    }
    loadRevisions(id);
  };

  // Handle document creation
  const handleCreateDoc = useCallback(
    async (folder = "documents") => {
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        title: "Untitled Document",
        icon: "📄",
        folder,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        content: `# Untitled Technical Canvas\n\nType \`/\` to insert live sandboxes, diagrams, or math formulas.\n`,
      };

      setDocuments((prev) => {
        const nextDocs = [newDoc, ...prev];
        saveDocuments(nextDocs);
        return nextDocs;
      });
      setActiveDocId(newDoc.id);
      setDocTitle(newDoc.title);
      setMarkdownContent(newDoc.content);
      if (editor) {
        editor.commands.setContent(newDoc.content);
      }

      try {
        await apiFetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newDoc),
        });
      } catch {
        // Local storage fallback
      }
    },
    [editor]
  );

  // Handle file import
  const handleImportDoc = useCallback(
    async (title: string, content: string, folder = "documents") => {
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        title,
        icon: "📥",
        folder,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        content,
      };

      setDocuments((prev) => {
        const nextDocs = [newDoc, ...prev];
        saveDocuments(nextDocs);
        return nextDocs;
      });
      setActiveDocId(newDoc.id);
      setDocTitle(title);
      setMarkdownContent(content);
      if (editor) {
        editor.commands.setContent(content);
      }

      try {
        await apiFetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newDoc),
        });
      } catch {
        // Local fallback
      }
    },
    [editor]
  );

  // Handle document rename from sidebar
  const handleRenameDoc = useCallback(
    (id: string, newTitle: string) => {
      setDocuments((prev) => {
        const updated = prev.map((d) =>
          d.id === id ? { ...d, title: newTitle, updatedAt: Date.now() } : d
        );
        saveDocuments(updated);
        return updated;
      });
      if (activeDocId === id) {
        setDocTitle(newTitle);
      }
      const target = documents.find((d) => d.id === id);
      if (target) {
        debounceDbSave(id, newTitle, target.content);
      }
    },
    [activeDocId, documents, debounceDbSave]
  );

  // Handle restoring built-in showcase samples
  const handleRestoreSamples = useCallback(() => {
    setDocuments((prev) => {
      const existingIds = new Set(prev.map((d) => d.id));
      const missingStarters = STARTER_TEMPLATES.filter((s) => !existingIds.has(s.id));
      const refreshedExisting = prev.map((d) => {
        const starter = STARTER_TEMPLATES.find((s) => s.id === d.id);
        if (starter) {
          return { ...starter, ...d, content: starter.content, title: starter.title };
        }
        return d;
      });
      const nextDocs = [...missingStarters, ...refreshedExisting];
      saveDocuments(nextDocs);
      return nextDocs;
    });
  }, []);

  // Desktop File I/O Handlers
  const handleDesktopOpen = useCallback(async () => {
    const result = await openLocalDocument();
    if (result) {
      const title = result.fileName.replace(/\.(md|markdown|selene|txt)$/i, "");
      await handleImportDoc(title, result.content);
    }
  }, [handleImportDoc]);

  // Handle Drag-and-Drop Notebook / Markdown files onto canvas
  const handleCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        const baseTitle = file.name.replace(/\.[^/.]+$/, "");
        const reader = new FileReader();
        reader.onload = (event) => {
          const rawContent = event.target?.result as string;
          let finalTitle = baseTitle;
          let finalContent = rawContent;

          if (file.name.toLowerCase().endsWith(".ipynb")) {
            try {
              const parsed = parseIpynbToMarkdown(rawContent, baseTitle);
              finalContent = parsed.markdown;
              finalTitle = parsed.title;
            } catch (err) {
              console.error("Failed to parse .ipynb file", err);
            }
          }
          handleImportDoc(finalTitle, finalContent, "documents");
        };
        reader.readAsText(file);
      }
    },
    [handleImportDoc]
  );

  const handleDesktopSave = useCallback(async () => {
    const cleanTitle = docTitle.replace(/[^\w\s-]/g, "").trim() || "document";
    await saveLocalDocument(markdownContent, `${cleanTitle}.md`);
  }, [docTitle, markdownContent]);

  // Desktop runtime detection & native menu/shortcut integration
  const [desktopRuntime] = useState<"tauri" | "electron" | "web">(() => {
    return typeof window !== "undefined" ? getDesktopRuntime() : "web";
  });

  const handleOpenLore = useCallback((tab: LoreModalTab = "myth") => {
    setLoreInitialTab(tab);
    setIsLoreModalOpen(true);
  }, []);

  useEffect(() => {
    const unlisten = registerDesktopMenuListener((command, payload) => {
      if (command === "new-document") {
        handleCreateDoc();
      } else if (command === "file-opened" && payload && typeof payload === "object") {
        const item = payload as { name: string; content: string };
        handleImportDoc(
          item.name.replace(/\.(md|markdown|selene|txt)$/i, ""),
          item.content
        );
      } else if (command === "save-document") {
        handleDesktopSave();
      } else if (command === "toggle-slides") {
        setIsSlideDeckOpen((prev) => !prev);
      } else if (command === "open-publish-modal") {
        setIsPublishModalOpen(true);
      } else if (command === "open-lore") {
        handleOpenLore("myth");
      } else if (command === "open-about") {
        handleOpenLore("about");
      } else if (command === "open-license") {
        setIsLicenseModalOpen(true);
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "o") {
        e.preventDefault();
        handleDesktopOpen();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleDesktopSave();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "`" || e.key === "~")) {
        e.preventDefault();
        setIsTerminalOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      unlisten();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleCreateDoc, handleImportDoc, handleDesktopOpen, handleDesktopSave, handleOpenLore]);

  // Handle document deletion
  const handleDeleteDoc = async (id: string) => {
    if (documents.length <= 1) return;
    const nextDocs = documents.filter((d) => d.id !== id);
    setDocuments(nextDocs);
    saveDocuments(nextDocs);
    if (activeDocId === id) {
      const nextActive = nextDocs[0];
      setActiveDocId(nextActive.id);
      setDocTitle(nextActive.title);
      setMarkdownContent(nextActive.content);
      if (editor) {
        editor.commands.setContent(nextActive.content);
      }
    }

    try {
      await apiFetch(`/api/documents/${id}`, { method: "DELETE" });
    } catch {
      // Local fallback
    }
  };

  // Handle title rename
  const handleTitleChange = (newTitle: string) => {
    setDocTitle(newTitle);
    setDocuments((prev) => {
      const updated = prev.map((d) =>
        d.id === activeDocId ? { ...d, title: newTitle } : d
      );
      saveDocuments(updated);
      return updated;
    });
    debounceDbSave(activeDocId, newTitle, markdownContent);
  };

  // Handle version restore
  const handleRestoreRevision = (rev: RevisionItem) => {
    setMarkdownContent(rev.contentMarkdown);
    if (editor) {
      editor.commands.setContent(rev.contentMarkdown);
    }
    setShowRevisions(false);
  };

  // Toggle Live Collaboration (Webrtc CRDT)
  const toggleCollaboration = () => {
    if (isCollabActive) {
      collabSessionRef.current?.provider.destroy();
      collabSessionRef.current = null;
      setIsCollabActive(false);
      setCollabUser(null);
    } else {
      const session = createCollabSession(activeDocId);
      collabSessionRef.current = session;
      setCollabUser(session.currentUser);
      setIsCollabActive(true);

      session.provider.awareness.on("change", () => {
        const states = Array.from(session.provider.awareness.getStates().values());
        setPeerCount(states.length);
      });
    }
  };

  const handleInsertLiveSandbox = useCallback(() => {
    if (!editor) return;
    const sampleComponent = `\`\`\`tsx
export function MyWidget() {
  return (
    <div className="p-4 bg-sky-950/60 rounded-xl border border-sky-500/30 text-sky-200">
      <h4 className="font-bold text-white">Live Component</h4>
      <p className="text-sm">Tailwind classes render isolated here.</p>
    </div>
  );
}
\`\`\``;
    editor.chain().focus().insertContent(sampleComponent).run();
  }, [editor]);

  const handleInsertMermaid = useCallback(() => {
    if (!editor) return;
    const sampleDiagram = `\`\`\`mermaid
flowchart LR
    A[Markdown Input] --> B(TipTap Engine)
    B --> C{Polymorphic Pipeline}
    C -->|Web Code| D[Sandpack Tailwind]
    C -->|Diagram| E[Mermaid SVG]
    C -->|Formulas| F[KaTeX Engine]
\`\`\``;
    editor.chain().focus().insertContent(sampleDiagram).run();
  }, [editor]);

  const handleInsertMath = useCallback(() => {
    if (!editor) return;
    const sampleMath = `\`\`\`math
f(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi
\`\`\``;
    editor.chain().focus().insertContent(sampleMath).run();
  }, [editor]);

  const handleExportMarkdown = useCallback(() => {
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${docTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }, [markdownContent, docTitle]);

  const handleCopyMarkdown = useCallback(() => {
    navigator.clipboard.writeText(markdownContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [markdownContent]);

  const currentTheme = THEME_CONFIG[lunarMode] || THEME_CONFIG["titan-aura"];

  return (
    <div className={`relative flex flex-col h-screen ${currentTheme.containerBg} text-slate-100 overflow-hidden transition-colors duration-500`}>
      {/* Selene Ambient Lunar Background */}
      <SeleneLunarBackground mode={lunarMode} />

      {/* Top Navigation Bar */}
      {!isZenMode && (
        <header className={`relative z-10 flex items-center justify-between px-4 py-2 ${currentTheme.headerBg} backdrop-blur-md shrink-0 transition-colors duration-500`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenLore("myth")}
              className="flex items-center justify-center p-0.5 rounded-lg hover:bg-slate-800/80 transition-all cursor-pointer group"
              title="Selene the Moon Titan — Mythology, Heritage & Canvas Ambiance"
            >
              <SeleneTitanLogo size="md" glow={true} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
                  Selene
                </span>
                <button
                  onClick={() => handleOpenLore("myth")}
                  className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-[10px] font-mono transition-all cursor-pointer"
                  title="View Moon Titan Lore & Heritage"
                >
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  <span>Titan Lore</span>
                </button>
                {/* Quick 1-Click Theme Switcher */}
                <button
                  onClick={handleCycleTheme}
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono transition-all cursor-pointer ${currentTheme.accentBadge}`}
                  title={`Active Theme: ${currentTheme.name} (Click to toggle Titan Aura / Starry Cosmos / Midnight Dark)`}
                >
                  <span>{currentTheme.icon}</span>
                  <span className="font-semibold">{currentTheme.name}</span>
                </button>
                <button
                  onClick={() => handleOpenLore("about")}
                  className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-[10px] font-mono transition-all cursor-pointer"
                  title="Help, License & Product Brief"
                >
                  <HelpCircle className="w-2.5 h-2.5 text-sky-400" />
                  <span>About ({SELENE_VERSION_DISPLAY})</span>
                </button>
                <SeleneLicenseBadge
                  status={licenseStatus}
                  onClick={() => setIsLicenseModalOpen(true)}
                />
                {desktopRuntime !== "web" && (
                  <div
                    className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono"
                    title={`Running in Native ${desktopRuntime === "tauri" ? "Tauri v2" : "Electron"} Desktop Shell`}
                  >
                    <Monitor className="w-2.5 h-2.5" />
                    <span>Desktop ({desktopRuntime === "tauri" ? "Tauri" : "Electron"})</span>
                  </div>
                )}
                <span className="text-slate-600">/</span>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="bg-transparent font-medium text-slate-200 text-sm focus:outline-none hover:bg-slate-800/60 focus:bg-slate-800 px-2 py-0.5 rounded transition-colors"
                  placeholder="Document Title"
                />
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* Live Multiplayer Collab Toggle */}
            <button
              onClick={toggleCollaboration}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isCollabActive
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60"
              }`}
              title="Toggle WebRTC Real-Time Collaboration"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isCollabActive ? `Live Collab (${peerCount})` : "Share Collab"}</span>
              {isCollabActive && collabUser && (
                <span className="text-xs">{collabUser.avatar}</span>
              )}
            </button>

            {/* AI Ghostwriter Autocomplete Toggle */}
            <button
              onClick={() => setIsGhostwritingEnabled(!isGhostwritingEnabled)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isGhostwritingEnabled
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                  : "bg-slate-800/80 text-slate-400 border border-slate-700/60"
              }`}
              title="Toggle AI Ghostwriting & Autocomplete (Alt+G)"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGhostwritingEnabled ? "text-amber-400" : "text-slate-500"}`} />
              <span className="hidden xl:inline">Ghostwriter</span>
              <span className="text-[10px] font-mono px-1 rounded bg-slate-900/80">
                {isGhostwritingEnabled ? "ON" : "OFF"}
              </span>
            </button>

            {/* Selene AI Canvas Copilot Button */}
            <button
              onClick={() => setIsAiCopilotOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 text-sky-300 border border-sky-500/40 text-xs font-semibold transition-all shadow-sm cursor-pointer"
              title="Selene AI Canvas Copilot (Ctrl+Shift+A)"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>AI Copilot</span>
            </button>

            {/* Paper-to-Canvas Multimodal Ingestion */}
            <button
              onClick={() => setIsPaperToCanvasOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all shadow-sm cursor-pointer"
              title="Paper-to-Canvas: Ingest PDF, Screenshot, or Hand-drawn Math"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Paper Ingest</span>
            </button>

            {/* Version History Toggle */}
            <button
              onClick={() => {
                loadRevisions(activeDocId);
                setShowRevisions(true);
              }}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
              title="Version History"
            >
              <History className="w-3.5 h-3.5" />
            </button>

            {/* Lunar Ambiance & Lore Toggle */}
            <button
              onClick={() => setIsLoreModalOpen(true)}
              className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-sky-400 hover:text-sky-300 border border-indigo-500/20 transition-colors cursor-pointer"
              title="Lunar Titan Ambiance & Lore"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            {/* Zen Mode Toggle */}
            <button
              onClick={() => setIsZenMode(true)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
              title="Zen Focus Mode"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode("wysiwyg")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "wysiwyg"
                    ? "bg-slate-800 text-sky-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Canvas</span>
              </button>
              <button
                onClick={() => setViewMode("project")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "project"
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Live Project Dev Server Preview with HMR"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Project</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "split"
                    ? "bg-slate-800 text-sky-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Split className="w-3.5 h-3.5" />
                <span>Split MD</span>
              </button>
              <button
                onClick={() => setViewMode(viewMode === "dual-doc" ? "wysiwyg" : "dual-doc")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "dual-doc"
                    ? "bg-slate-800 text-sky-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Multi-Document Split-Screen Dual View (Alt+D)"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Dual View</span>
              </button>
              <button
                onClick={() => setViewMode("markdown")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "markdown"
                    ? "bg-slate-800 text-sky-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Raw MD</span>
              </button>
            </div>

            {/* Whiteboard Markup Overlay */}
            <button
              onClick={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                isWhiteboardOpen
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm"
                  : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border-slate-700/60"
              }`}
              title="Whiteboard & Freehand Sketching Overlay (Alt+W)"
            >
              <PenTool className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Markup</span>
            </button>

            {/* Slide Deck Mode */}
            <button
              onClick={() => setIsSlideDeckOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-sky-300 border border-slate-700/60 text-xs font-medium transition-colors cursor-pointer"
              title="Launch Presentation Deck"
            >
              <Presentation className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Deck Mode</span>
            </button>

            {/* Desktop Open File */}
            <button
              onClick={handleDesktopOpen}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/60 text-xs font-medium transition-colors cursor-pointer"
              title="Open Local File from Disk (Ctrl+O)"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Open</span>
            </button>

            {/* Desktop Save File */}
            <button
              onClick={handleDesktopSave}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-700/60 text-xs font-medium transition-colors cursor-pointer"
              title="Save Document to Local Disk (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">Save Disk</span>
            </button>

            {/* Publish & Export */}
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-all shadow-sm cursor-pointer"
              title="Publish & Export (PDF, HTML, Slides)"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Publish</span>
            </button>

            {/* Saved Status Indicator */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>{isSavingDb ? "Syncing..." : "Synced"}</span>
            </div>
          </div>
        </header>
      )}

      {/* Zen Mode Exit Button */}
      {isZenMode && (
        <button
          onClick={() => setIsZenMode(false)}
          className="fixed top-4 right-4 z-50 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white shadow-2xl backdrop-blur-md text-xs font-medium"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Exit Zen</span>
        </button>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative z-10 min-h-0">
        {/* Workspace Documents Sidebar */}
        {!isZenMode && (
          <WorkspaceSidebar
            documents={documents}
            activeDocId={activeDocId}
            onSelectDoc={handleSelectDoc}
            onCreateDoc={handleCreateDoc}
            onImportDoc={handleImportDoc}
            onDeleteDoc={handleDeleteDoc}
            onRenameDoc={handleRenameDoc}
            onRestoreSamples={handleRestoreSamples}
            onOpenRevisions={() => {
              loadRevisions(activeDocId);
              setShowRevisions(true);
            }}
            onOpenPaperIngest={() => setIsPaperToCanvasOpen(true)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}

        {/* Workspace Central Area */}
        <div
          className={`flex-1 min-w-0 flex overflow-hidden ${
            viewMode === "dual-doc" && splitOrientation === "horizontal"
              ? "flex-col"
              : "flex-row"
          }`}
        >
          {/* Editor Column */}
          <div
            ref={editorScrollRef}
            onScroll={handlePrimaryScroll}
            onDrop={handleCanvasDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`min-w-0 flex flex-col overflow-y-auto ${
              viewMode === "markdown" ? "hidden" : ""
            } ${
              viewMode === "dual-doc"
                ? splitOrientation === "vertical"
                  ? "w-1/2 flex-1"
                  : "w-full h-1/2 border-b border-slate-800"
                : "flex-1"
            }`}
          >
            {/* TipTap Toolbar */}
            {!isZenMode && (
              <EditorToolbar
                editor={editor}
                isCopied={isCopied}
                onInsertLiveSandbox={handleInsertLiveSandbox}
                onInsertMermaid={handleInsertMermaid}
                onInsertMath={handleInsertMath}
                onExportMarkdown={handleExportMarkdown}
                onCopyMarkdown={handleCopyMarkdown}
                onOpenPublishModal={() => setIsPublishModalOpen(true)}
                onLaunchSlides={() => setIsSlideDeckOpen(true)}
              />
            )}

            {/* TipTap Document Canvas */}
            <div className="flex-1 max-w-4xl w-full mx-auto pb-24 pt-4">
              <EditorBubbleMenu editor={editor} />
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Dual View: Secondary Document Pane */}
          {viewMode === "dual-doc" && (
            <SecondaryDocumentViewer
              documents={documents}
              secondaryDocId={secondaryDocId}
              onSelectDoc={setSecondaryDocId}
              onClose={() => setViewMode("wysiwyg")}
              onSwapDocuments={handleSwapDualDocs}
              onUpdateDocumentContent={handleUpdateSecondaryDocContent}
              splitOrientation={splitOrientation}
              onToggleOrientation={() =>
                setSplitOrientation((o) => (o === "vertical" ? "horizontal" : "vertical"))
              }
              isSyncScroll={isSyncScroll}
              onToggleSyncScroll={() => setIsSyncScroll((s) => !s)}
              primaryScrollProgress={primaryScrollProgress}
              onScrollProgressChange={handleSecondaryScrollProgress}
            />
          )}

          {/* Right Pane: Live Project Render */}
          {viewMode === "project" && (
            <div className="border-l border-slate-800 bg-slate-900/60 flex flex-col w-1/2 overflow-hidden">
              <ProjectServerRenderer
                currentFilePath={activeDoc.title}
                defaultRoute="/"
                className="border-none !rounded-none h-full"
              />
            </div>
          )}

          {/* Split Raw Markdown Pane */}
          {(viewMode === "split" || viewMode === "markdown") && (
            <div
              className={`border-l border-slate-800 bg-slate-900/60 flex flex-col ${
                viewMode === "split" ? "w-1/2" : "w-full"
              }`}
            >
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Raw Markdown (GFM Stream)</span>
                </div>
                <span className="text-[11px] text-slate-500">Live Bi-directional Sync</span>
              </div>
              <textarea
                value={markdownContent}
                onChange={(e) => {
                  const val = e.target.value;
                  setMarkdownContent(val);
                  if (editor) {
                    editor.commands.setContent(val);
                  }
                }}
                className="flex-1 p-6 bg-transparent font-mono text-xs text-slate-300 resize-none focus:outline-none leading-relaxed overflow-y-auto selection:bg-sky-500/30"
                spellCheck={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Revision History Drawer with Visual Diff Inspector */}
      <RevisionHistoryDrawer
        isOpen={showRevisions}
        onClose={() => setShowRevisions(false)}
        revisions={revisions}
        currentContent={markdownContent}
        onRestore={handleRestoreRevision}
      />

      {/* Selene AI Canvas Copilot Modal */}
      <SeleneAiCopilotModal
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
        onInsertCode={(code) => {
          if (editor) {
            editor.commands.insertContent(`\n\n${code}\n\n`);
          } else {
            setMarkdownContent((prev) => `${prev}\n\n${code}\n\n`);
          }
        }}
        onOpenLicenseVault={() => setIsLicenseModalOpen(true)}
      />

      {/* Selene Mythological Splash Screen (Initial Boot or Replay) */}
      {showSplash && (
        <SeleneSplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* Selene Mythological Lore & Ambiance Modal */}
      <SeleneLoreModal
        isOpen={isLoreModalOpen}
        onClose={() => setIsLoreModalOpen(false)}
        backgroundMode={lunarMode}
        onBackgroundModeChange={setLunarMode}
        initialTab={loreInitialTab}
        onReplaySplash={() => setShowSplash(true)}
        onOpenLicenseModal={() => setIsLicenseModalOpen(true)}
      />

      {/* Selene License & Device Authority Modal */}
      <SeleneLicenseModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        status={licenseStatus}
        onLicenseUpdated={(newStatus) => setLicenseStatus(newStatus)}
      />

      {/* Tamper-Proof 60-Day Time-Lock Barrier */}
      <SeleneTimeLockBarrier
        status={licenseStatus}
        onLicenseUpdated={(newStatus) => setLicenseStatus(newStatus)}
      />

      {/* Publish & Export Suite Modal */}
      <PublishExportModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        documentTitle={docTitle}
        markdownContent={markdownContent}
        onLaunchSlideDeck={() => setIsSlideDeckOpen(true)}
      />

      {/* Interactive Presentation Slide Deck Viewer */}
      <SlideDeckViewer
        isOpen={isSlideDeckOpen}
        onClose={() => setIsSlideDeckOpen(false)}
        documentTitle={docTitle}
        markdownContent={markdownContent}
      />

      {/* Paper-to-Canvas Multimodal Ingestion Modal */}
      <PaperToCanvasModal
        isOpen={isPaperToCanvasOpen}
        onClose={() => setIsPaperToCanvasOpen(false)}
        onInsertContent={(md) => {
          if (editor) {
            editor.commands.insertContent(`\n\n${md}\n\n`);
          } else {
            setMarkdownContent((prev) => `${prev}\n\n${md}\n\n`);
          }
        }}
        onCreateNewDoc={(title, md) => {
          handleImportDoc(title, md, "documents");
        }}
      />

      {/* Floating Ghostwriter Suggestion Bar */}
      {ghostSuggestion && isGhostwritingEnabled && (
        <div className="fixed bottom-14 right-8 z-40 max-w-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-slate-900/95 p-3.5 shadow-[0_10px_35px_rgba(251,191,36,0.15)] backdrop-blur-md">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-400 animate-pulse" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400 font-bold">
                <span>AI GHOSTWRITER</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">Tab to Accept</span>
                <span className="text-slate-500">Esc to Dismiss</span>
              </div>
              <p className="text-xs text-slate-200 italic font-sans leading-relaxed break-words">
                &ldquo;{ghostSuggestion}&rdquo;
              </p>
            </div>
            <button
              type="button"
              onClick={() => setGhostSuggestion(null)}
              className="rounded p-1 text-slate-500 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Collapsible Command Runner & Shell Tray */}
      <CollapsibleCommandRunner
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
      />

      {/* Bottom Status Footer */}
      {!isZenMode && (
        <footer className={`relative z-10 flex items-center justify-between px-6 py-2 ${currentTheme.footerBg} backdrop-blur-md text-xs text-slate-400 shrink-0 transition-colors duration-500`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleOpenLore("myth")}
              className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium transition-colors cursor-pointer"
              title="Learn about Selene, Titaness of the Moon"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Selene Titan of the Moon</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsTerminalOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors ${
                isTerminalOpen
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
              title="Toggle Shell Tray & Command Runner (Ctrl+`)"
            >
              <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Shell Tray</span>
              <kbd className="hidden sm:inline-block text-[10px] bg-slate-800 text-slate-400 px-1 rounded border border-slate-700">^`</kbd>
            </button>
            <span>•</span>
            <span>Polymorphic Engine Active</span>
            <span>•</span>
            <span>Zero CSS Bleed Isolation</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono">Drizzle ORM + LibSQL</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{markdownContent.split(/\s+/).filter(Boolean).length} words</span>
            <span>•</span>
            <span>{markdownContent.length} characters</span>
          </div>
        </footer>
      )}

      {/* Whiteboard / Freehand Sketching Annotation Overlay */}
      <WhiteboardOverlay
        isOpen={isWhiteboardOpen}
        onClose={() => setIsWhiteboardOpen(false)}
        documentId={activeDocId}
        onInsertSnapshot={handleInsertWhiteboardSnapshot}
      />
    </div>
  );
}
