"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Copy, Check, ArrowLeftRight, Layers } from "lucide-react";

interface DiffViewerProps {
  original: string;
  refined: string;
  className?: string;
}

type ViewMode = "split" | "unified";

export function DiffViewer({ original, refined, className }: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedRefined, setCopiedRefined] = useState(false);

  const handleCopy = async (text: string, which: "original" | "refined") => {
    await navigator.clipboard.writeText(text);
    if (which === "original") {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedRefined(true);
      setTimeout(() => setCopiedRefined(false), 2000);
    }
  };

  // Simple diff highlighting (word-level)
  const computeDiff = () => {
    const originalWords = original.split(/(\s+)/);
    const refinedWords = refined.split(/(\s+)/);

    // Simple LCS-based diff
    const added: Set<number> = new Set();
    const removed: Set<number> = new Set();

    // Find words in refined that aren't in original (added)
    refinedWords.forEach((word, idx) => {
      if (word.trim() && !originalWords.includes(word)) {
        added.add(idx);
      }
    });

    // Find words in original that aren't in refined (removed)
    originalWords.forEach((word, idx) => {
      if (word.trim() && !refinedWords.includes(word)) {
        removed.add(idx);
      }
    });

    return { originalWords, refinedWords, added, removed };
  };

  const { originalWords, refinedWords, added, removed } = computeDiff();

  return (
    <div className={cn("rounded-lg border border-[var(--border)] overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--background-secondary)] border-b border-[var(--border)]">
        <h3 className="text-sm font-medium text-[var(--foreground)]">Comparison</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "split" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("split")}
          >
            <ArrowLeftRight className="h-4 w-4 mr-1" />
            Split
          </Button>
          <Button
            variant={viewMode === "unified" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("unified")}
          >
            <Layers className="h-4 w-4 mr-1" />
            Unified
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "split" ? (
        <div className="grid grid-cols-2 divide-x divide-[var(--border)]">
          {/* Original */}
          <div>
            <div className="flex items-center justify-between px-4 py-2 bg-red-50 border-b border-[var(--border)]">
              <span className="text-sm font-medium text-red-700">Original</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(original, "original")}
              >
                {copiedOriginal ? (
                  <Check className="h-4 w-4 text-[var(--success)]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="p-4 max-h-[500px] overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-sans">
                {originalWords.map((word, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      removed.has(idx) && "bg-red-200 line-through"
                    )}
                  >
                    {word}
                  </span>
                ))}
              </pre>
            </div>
          </div>

          {/* Refined */}
          <div>
            <div className="flex items-center justify-between px-4 py-2 bg-green-50 border-b border-[var(--border)]">
              <span className="text-sm font-medium text-green-700">Refined</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(refined, "refined")}
              >
                {copiedRefined ? (
                  <Check className="h-4 w-4 text-[var(--success)]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="p-4 max-h-[500px] overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-sans">
                {refinedWords.map((word, idx) => (
                  <span
                    key={idx}
                    className={cn(added.has(idx) && "bg-green-200")}
                  >
                    {word}
                  </span>
                ))}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        /* Unified View */
        <div>
          <div className="flex items-center justify-between px-4 py-2 bg-[var(--background-secondary)] border-b border-[var(--border)]">
            <span className="text-sm text-[var(--foreground-secondary)]">
              <span className="inline-block w-3 h-3 bg-red-200 rounded mr-1" /> Removed
              <span className="inline-block w-3 h-3 bg-green-200 rounded ml-3 mr-1" /> Added
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(refined, "refined")}
            >
              {copiedRefined ? (
                <Check className="h-4 w-4 text-[var(--success)]" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="p-4 max-h-[500px] overflow-y-auto">
            <div className="mb-4 pb-4 border-b border-[var(--border)]">
              <p className="text-xs text-[var(--foreground-secondary)] mb-2">Original:</p>
              <pre className="text-sm whitespace-pre-wrap font-sans">
                {originalWords.map((word, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      removed.has(idx) && "bg-red-200 line-through"
                    )}
                  >
                    {word}
                  </span>
                ))}
              </pre>
            </div>
            <div>
              <p className="text-xs text-[var(--foreground-secondary)] mb-2">Refined:</p>
              <pre className="text-sm whitespace-pre-wrap font-sans">
                {refinedWords.map((word, idx) => (
                  <span
                    key={idx}
                    className={cn(added.has(idx) && "bg-green-200")}
                  >
                    {word}
                  </span>
                ))}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
