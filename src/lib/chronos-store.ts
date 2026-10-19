"use client";

/**
 * ⏳ Chronos Timeline & Revisions Store
 * Primordial Titan of Time and Cosmic Epochs
 *
 * Provides persistent local snapshots, milestone tagging, time-travel rollback,
 * and semantic AST/line-by-line visual diffing for Selene documents.
 */

export interface ChronosSnapshot {
  id: string;
  documentId: string;
  timestamp: number;
  title: string;
  content: string;
  charCount: number;
  wordCount: number;
  lineCount: number;
  tag?: string;
  isMilestone?: boolean;
  isManual?: boolean;
  author?: string;
}

export type DiffLineType = "add" | "remove" | "same";

export interface DiffLine {
  type: DiffLineType;
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
}

export interface DiffSummary {
  added: number;
  removed: number;
  unchanged: number;
  codeBlocksModified: number;
  charDelta: number;
  wordDelta: number;
  lines: DiffLine[];
}

const STORAGE_PREFIX = "selene_chronos_revs_";
const MAX_SNAPSHOTS_PER_DOC = 60;

/**
 * Computes words count from string.
 */
function countWords(str: string): number {
  if (!str.trim()) return 0;
  return str.trim().split(/\s+/).length;
}

/**
 * Loads all historical snapshots for a given document.
 */
export function loadChronosSnapshots(documentId: string): ChronosSnapshot[] {
  if (typeof window === "undefined" || !documentId) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${documentId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Sort descending by timestamp (newest first)
    return parsed.sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.error("Failed to load Chronos snapshots", err);
    return [];
  }
}

/**
 * Saves a new historical snapshot for a document.
 */
export function saveChronosSnapshot(
  documentId: string,
  title: string,
  content: string,
  options?: {
    tag?: string;
    isMilestone?: boolean;
    isManual?: boolean;
    author?: string;
  }
): ChronosSnapshot {
  const existing = loadChronosSnapshots(documentId);

  // If the latest snapshot has identical content and is recent (< 20 seconds), skip duplicate auto-saves
  if (!options?.isManual && !options?.tag && existing.length > 0) {
    const latest = existing[0];
    if (latest.content === content && Date.now() - latest.timestamp < 20000) {
      return latest;
    }
  }

  const lines = content.split("\n");
  const newSnapshot: ChronosSnapshot = {
    id: `epoch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    documentId,
    timestamp: Date.now(),
    title: title || "Untitled Document",
    content,
    charCount: content.length,
    wordCount: countWords(content),
    lineCount: lines.length,
    tag: options?.tag,
    isMilestone: options?.isMilestone ?? Boolean(options?.tag),
    isManual: options?.isManual ?? false,
    author: options?.author || "Chronos Keeper",
  };

  // Keep milestones permanently, trim older automatic checkpoints past capacity
  const milestones = existing.filter((s) => s.isMilestone);
  const regular = existing.filter((s) => !s.isMilestone);
  const updatedRegular = [newSnapshot, ...regular].slice(0, MAX_SNAPSHOTS_PER_DOC - milestones.length);
  const combined = [...milestones, ...updatedRegular].sort((a, b) => b.timestamp - a.timestamp);

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${documentId}`, JSON.stringify(combined));
  } catch (err) {
    console.warn("Chronos storage limit reached; pruning oldest snapshots", err);
    // If quota exceeded, prune to 20
    const pruned = combined.slice(0, 20);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${documentId}`, JSON.stringify(pruned));
    } catch {
      // Storage fully saturated
    }
  }

  return newSnapshot;
}

/**
 * Assigns or updates a milestone tag on an existing snapshot.
 */
export function tagChronosSnapshot(
  documentId: string,
  snapshotId: string,
  tag: string,
  isMilestone = true
): void {
  const existing = loadChronosSnapshots(documentId);
  const updated = existing.map((s) =>
    s.id === snapshotId ? { ...s, tag: tag.trim() || undefined, isMilestone } : s
  );
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${documentId}`, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to tag Chronos snapshot", err);
  }
}

/**
 * Deletes a specific snapshot.
 */
export function deleteChronosSnapshot(documentId: string, snapshotId: string): void {
  const existing = loadChronosSnapshots(documentId);
  const updated = existing.filter((s) => s.id !== snapshotId);
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${documentId}`, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to delete Chronos snapshot", err);
  }
}

/**
 * Clears all snapshots for a document.
 */
export function clearChronosSnapshots(documentId: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${documentId}`);
  } catch (err) {
    console.error("Failed to clear Chronos snapshots", err);
  }
}

/**
 * High-performance Myers-inspired line-by-line diff algorithm for markdown documents.
 */
export function computeSemanticDiff(oldText: string, newText: string): DiffSummary {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");

  const diffLines: DiffLine[] = [];
  let added = 0;
  let removed = 0;
  let unchanged = 0;

  // Simple LCS-based or token-window comparison
  let i = 0;
  let j = 0;
  let oldLineNum = 1;
  let newLineNum = 1;

  while (i < oldLines.length && j < newLines.length) {
    if (oldLines[i] === newLines[j]) {
      diffLines.push({
        type: "same",
        oldLineNumber: oldLineNum++,
        newLineNumber: newLineNum++,
        content: oldLines[i],
      });
      unchanged++;
      i++;
      j++;
    } else {
      // Lookahead window to determine insertions vs deletions
      const lookahead = 5;
      let foundInNew = -1;
      let foundInOld = -1;

      for (let offset = 1; offset <= lookahead; offset++) {
        if (j + offset < newLines.length && oldLines[i] === newLines[j + offset]) {
          foundInNew = offset;
          break;
        }
        if (i + offset < oldLines.length && oldLines[i + offset] === newLines[j]) {
          foundInOld = offset;
          break;
        }
      }

      if (foundInNew !== -1) {
        // Lines were added in new text
        for (let k = 0; k < foundInNew; k++) {
          diffLines.push({
            type: "add",
            newLineNumber: newLineNum++,
            content: newLines[j + k],
          });
          added++;
        }
        j += foundInNew;
      } else if (foundInOld !== -1) {
        // Lines were removed from old text
        for (let k = 0; k < foundInOld; k++) {
          diffLines.push({
            type: "remove",
            oldLineNumber: oldLineNum++,
            content: oldLines[i + k],
          });
          removed++;
        }
        i += foundInOld;
      } else {
        // 1 line modified: 1 deletion + 1 addition
        diffLines.push({
          type: "remove",
          oldLineNumber: oldLineNum++,
          content: oldLines[i],
        });
        removed++;
        diffLines.push({
          type: "add",
          newLineNumber: newLineNum++,
          content: newLines[j],
        });
        added++;
        i++;
        j++;
      }
    }
  }

  // Flush remaining old lines as deletions
  while (i < oldLines.length) {
    diffLines.push({
      type: "remove",
      oldLineNumber: oldLineNum++,
      content: oldLines[i++],
    });
    removed++;
  }

  // Flush remaining new lines as additions
  while (j < newLines.length) {
    diffLines.push({
      type: "add",
      newLineNumber: newLineNum++,
      content: newLines[j++],
    });
    added++;
  }

  // Count code block deltas (backtick markers)
  const oldBlocks = (oldText.match(/```[a-z0-9_-]*/gi) || []).length;
  const newBlocks = (newText.match(/```[a-z0-9_-]*/gi) || []).length;
  const codeBlocksModified = Math.abs(newBlocks - oldBlocks);

  return {
    added,
    removed,
    unchanged,
    codeBlocksModified,
    charDelta: newText.length - oldText.length,
    wordDelta: countWords(newText) - countWords(oldText),
    lines: diffLines,
  };
}
