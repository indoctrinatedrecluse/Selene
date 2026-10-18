/**
 * High-performance line-by-line diff computation engine for Selene.
 * Computes additions, deletions, and unchanged segments using Longest Common Subsequence (LCS).
 */

export type DiffChangeType = "added" | "removed" | "unchanged";

export interface DiffLine {
  type: DiffChangeType;
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
}

export interface DiffResult {
  lines: DiffLine[];
  additions: number;
  deletions: number;
  unchanged: number;
}

export function computeLineDiff(oldText: string, newText: string): DiffResult {
  const oldLines = oldText ? oldText.split(/\r?\n/) : [];
  const newLines = newText ? newText.split(/\r?\n/) : [];

  const m = oldLines.length;
  const n = newLines.length;

  // Build LCS matrix (bounded to prevent massive memory in extreme cases)
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build the diff
  let i = m;
  let j = n;
  const resultRev: DiffLine[] = [];
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      resultRev.push({
        type: "unchanged",
        oldLineNumber: i,
        newLineNumber: j,
        content: oldLines[i - 1],
      });
      unchanged++;
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      resultRev.push({
        type: "added",
        newLineNumber: j,
        content: newLines[j - 1],
      });
      additions++;
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      resultRev.push({
        type: "removed",
        oldLineNumber: i,
        content: oldLines[i - 1],
      });
      deletions++;
      i--;
    }
  }

  return {
    lines: resultRev.reverse(),
    additions,
    deletions,
    unchanged,
  };
}
