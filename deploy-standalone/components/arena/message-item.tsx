"use client";

import type { Message, AgentRole } from "@nexus/shared";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  User,
  Bot,
  Sparkles,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface MessageItemProps {
  message: Message;
  className?: string;
}

const roleConfig: Record<
  AgentRole | "user" | "system",
  { label: string; icon: React.ElementType; bgColor: string; textColor: string }
> = {
  clarifier: {
    label: "Clarifier",
    icon: MessageSquare,
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
  },
  drafter: {
    label: "Drafter",
    icon: Sparkles,
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
  },
  critic: {
    label: "Critic",
    icon: AlertTriangle,
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
  },
  finalizer: {
    label: "Finalizer",
    icon: CheckCircle,
    bgColor: "bg-green-50",
    textColor: "text-green-700",
  },
  user: {
    label: "You",
    icon: User,
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
  },
  system: {
    label: "System",
    icon: Bot,
    bgColor: "bg-slate-50",
    textColor: "text-slate-700",
  },
};

export function MessageItem({ message, className }: MessageItemProps) {
  const config = roleConfig[message.role] || roleConfig.system;
  const Icon = config.icon;

  // Try to parse content if it's JSON (for Q&A messages)
  let displayContent = message.content;
  try {
    const parsed = JSON.parse(message.content);
    if (parsed.questions && parsed.answers) {
      displayContent = parsed.questions
        .map((q: string, i: number) => `Q: ${q}\nA: ${parsed.answers[i] || "(no answer)"}`)
        .join("\n\n");
    }
  } catch {
    // Not JSON, use as-is
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--border)] overflow-hidden",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-2 border-b border-[var(--border)]",
          config.bgColor
        )}
      >
        <Icon className={cn("h-4 w-4", config.textColor)} />
        <span className={cn("text-sm font-medium", config.textColor)}>
          {config.label}
        </span>
        {message.providerType && (
          <span className="text-xs text-[var(--foreground-secondary)] ml-auto">
            {message.providerType}
            {message.modelId && ` / ${message.modelId}`}
          </span>
        )}
        <span className="text-xs text-[var(--foreground-secondary)]">
          Iteration {message.iteration}
        </span>
      </div>
      <div className="p-4 bg-white">
        <pre className="text-sm text-[var(--foreground)] whitespace-pre-wrap font-sans">
          {displayContent}
        </pre>
      </div>
      {(message.inputTokens || message.outputTokens || message.latencyMs) && (
        <div className="flex items-center gap-4 px-4 py-2 bg-[var(--background-secondary)] text-xs text-[var(--foreground-secondary)]">
          {message.inputTokens && (
            <span>In: {message.inputTokens.toLocaleString()} tokens</span>
          )}
          {message.outputTokens && (
            <span>Out: {message.outputTokens.toLocaleString()} tokens</span>
          )}
          {message.latencyMs && (
            <span>{(message.latencyMs / 1000).toFixed(2)}s</span>
          )}
        </div>
      )}
    </div>
  );
}
