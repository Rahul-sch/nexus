"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isSubmitting?: boolean;
  placeholder?: string;
  initialValue?: string;
  disabled?: boolean;
}

export function PromptInput({
  onSubmit,
  isSubmitting = false,
  placeholder = "Describe your prompt in detail...",
  initialValue = "",
  disabled = false,
}: PromptInputProps) {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 400)}px`;
    }
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isSubmitting && !disabled) {
      onSubmit(value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const charCount = value.length;
  const maxChars = 50000;
  const isOverLimit = charCount > maxChars;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSubmitting || disabled}
          className="min-h-[200px] pr-4 pb-8"
        />
        <div className="absolute bottom-2 right-3 text-xs text-[var(--foreground-secondary)]">
          <span className={isOverLimit ? "text-[var(--error)]" : ""}>
            {charCount.toLocaleString()}
          </span>
          /{maxChars.toLocaleString()}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--foreground-secondary)]">
          Press <kbd className="px-1.5 py-0.5 text-xs bg-[var(--background-secondary)] rounded border border-[var(--border)]">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 text-xs bg-[var(--background-secondary)] rounded border border-[var(--border)]">Enter</kbd> to submit
        </p>
        <Button
          type="submit"
          disabled={!value.trim() || isSubmitting || disabled || isOverLimit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Start Refining
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
