"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import type { Refinery, Message, Artifact } from "@nexus/shared";
import { StatusBadge } from "./status-badge";
import { MessageItem } from "./message-item";
import { ClarificationForm } from "./clarification-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Copy,
  Check,
  XCircle,
  Loader2,
  AlertCircle,
  Sparkles,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ArenaViewProps {
  refinery: Refinery;
  messages: Message[];
  artifacts: Artifact[];
  onCancel: () => Promise<void>;
  onResume: (answers: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function ArenaView({
  refinery,
  messages,
  artifacts,
  onCancel,
  onResume,
  isLoading = false,
}: ArenaViewProps) {
  const [copied, setCopied] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [isResuming, setIsResuming] = React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    await onCancel();
    setIsCancelling(false);
  };

  const handleResume = async (answers: string[]) => {
    setIsResuming(true);
    await onResume(answers);
    setIsResuming(false);
  };

  // Get clarification questions from latest artifact
  const clarificationArtifact = artifacts
    .filter((a) => a.artifactType === "clarification_questions")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const clarificationQuestions: string[] =
    (clarificationArtifact?.content as { questions?: string[] })?.questions || [];

  // Get final prompt
  const finalArtifact = artifacts.find((a) => a.artifactType === "final");
  const finalPrompt =
    (finalArtifact?.content as { prompt?: string })?.prompt || refinery.finalPrompt;

  const isActive = refinery.status === "running" || refinery.status === "queued";
  const isAwaitingUser = refinery.status === "awaiting_user";
  const isCompleted = refinery.status === "completed";
  const isFailed = refinery.status === "failed";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {refinery.title || "Refinement Session"}
          </h2>
          <div className="flex items-center gap-3 text-sm text-[var(--foreground-secondary)]">
            <StatusBadge status={refinery.status} />
            {refinery.currentPhase && (
              <span>Phase: {refinery.currentPhase}</span>
            )}
            <span>
              Iteration {refinery.currentIteration}/{refinery.config.maxIterations}
            </span>
          </div>
        </div>

        {isActive && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Cancel
          </Button>
        )}
      </div>

      {/* Error Display */}
      {isFailed && refinery.errorMessage && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-5 w-5 text-[var(--error)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[var(--error)]">Refinement Failed</p>
            <p className="text-sm text-[var(--error)] mt-1">
              {refinery.errorMessage}
            </p>
            {refinery.errorCode && (
              <p className="text-xs text-[var(--foreground-secondary)] mt-2">
                Error code: {refinery.errorCode}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      )}

      {/* Active Processing Indicator */}
      {isActive && !isLoading && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]">
          <div className="relative">
            <Sparkles className="h-5 w-5 text-[var(--primary)]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse" />
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)]">
              Processing your prompt...
            </p>
            <p className="text-sm text-[var(--foreground-secondary)]">
              {refinery.currentPhase
                ? `Currently in ${refinery.currentPhase} phase`
                : "Initializing refinement process"}
            </p>
          </div>
        </div>
      )}

      {/* Clarification Form */}
      {isAwaitingUser && clarificationQuestions.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <ClarificationForm
              questions={clarificationQuestions}
              onSubmit={handleResume}
              isSubmitting={isResuming}
            />
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[var(--foreground)]">
            Process Log
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Final Result */}
      {isCompleted && finalPrompt && (
        <Card className="border-[var(--success)] bg-green-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[var(--success)]">
              <Check className="h-5 w-5" />
              Final Refined Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="p-4 bg-white rounded-lg border border-[var(--border)] text-sm whitespace-pre-wrap font-sans">
                {finalPrompt}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(finalPrompt)}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-[var(--success)]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[var(--border)] text-sm text-[var(--foreground-secondary)]">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span>{refinery.totalTokensUsed.toLocaleString()} tokens used</span>
              </div>
              {refinery.startedAt && refinery.completedAt && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>
                    {Math.round(
                      (new Date(refinery.completedAt).getTime() -
                        new Date(refinery.startedAt).getTime()) /
                        1000
                    )}
                    s total time
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Original Prompt Reference */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--foreground)]">
          View Original Prompt
        </summary>
        <div className="mt-3 p-4 bg-[var(--background-secondary)] rounded-lg border border-[var(--border)]">
          <pre className="text-sm whitespace-pre-wrap font-sans text-[var(--foreground)]">
            {refinery.initialPrompt}
          </pre>
        </div>
      </details>
    </div>
  );
}
