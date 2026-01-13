"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArenaView } from "@/components/arena/arena-view";
import { StatusBadge } from "@/components/arena/status-badge";
import { DiffViewer } from "@/components/diff/diff-viewer";
import { useRefinery } from "@/hooks/use-refinery";
import {
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export default function RefineryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const refineryId = params.id as string;

  const [copied, setCopied] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  const {
    refinery,
    messages,
    artifacts,
    isLoading,
    error,
    fetchRefinery,
    cancelRefinery,
    resumeRefinery,
    subscribeToRefinery,
  } = useRefinery();

  // Fetch refinery on mount
  useEffect(() => {
    if (refineryId) {
      fetchRefinery(refineryId);
    }
  }, [refineryId, fetchRefinery]);

  // Subscribe to updates
  useEffect(() => {
    if (refineryId) {
      const unsubscribe = subscribeToRefinery(refineryId);
      return unsubscribe;
    }
  }, [refineryId, subscribeToRefinery]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancel = async () => {
    if (refineryId) {
      await cancelRefinery(refineryId);
    }
  };

  const handleResume = async (answers: string[]) => {
    if (refineryId) {
      await resumeRefinery(refineryId, answers);
    }
  };

  if (isLoading && !refinery) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (error || !refinery) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <header className="flex h-14 items-center border-b border-[var(--border)] bg-white px-6">
          <button
            onClick={() => router.push("/history")}
            className="flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to History</span>
          </button>
        </header>
        <main className="container max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="h-5 w-5 text-[var(--error)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[var(--error)]">Error Loading Refinement</p>
              <p className="text-sm text-[var(--error)] mt-1">
                {error || "Refinement not found"}
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => router.push("/history")}
              >
                Go to History
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const finalPrompt = refinery.finalPrompt || "";
  const isCompleted = refinery.status === "completed";
  const isActive = refinery.status === "running" || refinery.status === "queued";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-white px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/history")}
            className="flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="text-lg font-medium text-[var(--foreground)]">
            {refinery.title || "Refinement Details"}
          </h1>
          <StatusBadge status={refinery.status} />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchRefinery(refineryId)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto py-8 px-4">
        {/* Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[var(--primary)]" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-[var(--foreground-secondary)]">Status</p>
                <p className="font-medium capitalize">{refinery.status.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-[var(--foreground-secondary)]">Iterations</p>
                <p className="font-medium">
                  {refinery.currentIteration} / {refinery.config.maxIterations}
                </p>
              </div>
              <div>
                <p className="text-[var(--foreground-secondary)]">Tokens Used</p>
                <p className="font-medium">{refinery.totalTokensUsed.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[var(--foreground-secondary)]">Created</p>
                <p className="font-medium">
                  {new Date(refinery.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {refinery.startedAt && refinery.completedAt && (
              <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-2 text-sm text-[var(--foreground-secondary)]">
                <Clock className="h-4 w-4" />
                <span>
                  Duration:{" "}
                  {Math.round(
                    (new Date(refinery.completedAt).getTime() -
                      new Date(refinery.startedAt).getTime()) /
                      1000
                  )}
                  s
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Refinement Arena */}
        {(isActive || refinery.status === "awaiting_user") && (
          <ArenaView
            refinery={refinery}
            messages={messages}
            artifacts={artifacts}
            onCancel={handleCancel}
            onResume={handleResume}
            isLoading={isLoading}
          />
        )}

        {/* Completed View */}
        {isCompleted && finalPrompt && (
          <div className="space-y-6">
            {/* Toggle Diff View */}
            <div className="flex items-center gap-4">
              <Button
                variant={!showDiff ? "default" : "secondary"}
                onClick={() => setShowDiff(false)}
              >
                Final Prompt
              </Button>
              <Button
                variant={showDiff ? "default" : "secondary"}
                onClick={() => setShowDiff(true)}
              >
                Compare Changes
              </Button>
            </div>

            {showDiff ? (
              <DiffViewer original={refinery.initialPrompt} refined={finalPrompt} />
            ) : (
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
                </CardContent>
              </Card>
            )}

            {/* Messages (collapsed by default) */}
            {messages.length > 0 && (
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--foreground)]">
                  View Process Log ({messages.length} messages)
                </summary>
                <div className="mt-4 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="p-4 bg-[var(--background-secondary)] rounded-lg border border-[var(--border)]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium capitalize">{message.role}</span>
                        <span className="text-xs text-[var(--foreground-secondary)]">
                          Iteration {message.iteration}
                        </span>
                      </div>
                      <pre className="text-sm whitespace-pre-wrap font-sans">
                        {message.content}
                      </pre>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Failed/Cancelled View */}
        {(refinery.status === "failed" || refinery.status === "cancelled") && (
          <div className="space-y-6">
            {refinery.errorMessage && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="h-5 w-5 text-[var(--error)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[var(--error)]">
                    {refinery.status === "failed" ? "Refinement Failed" : "Refinement Cancelled"}
                  </p>
                  <p className="text-sm text-[var(--error)] mt-1">{refinery.errorMessage}</p>
                  {refinery.errorCode && (
                    <p className="text-xs text-[var(--foreground-secondary)] mt-2">
                      Error code: {refinery.errorCode}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Original Prompt */}
            <Card>
              <CardHeader>
                <CardTitle>Original Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-[var(--background-secondary)] rounded-lg border border-[var(--border)] text-sm whitespace-pre-wrap font-sans">
                  {refinery.initialPrompt}
                </pre>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Link href="/composer">
                <Button>Start New Refinement</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Pending View */}
        {refinery.status === "pending" && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Refinement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--foreground-secondary)] mb-4">
                This refinement was created but not started. You can start it from here.
              </p>
              <pre className="p-4 bg-[var(--background-secondary)] rounded-lg border border-[var(--border)] text-sm whitespace-pre-wrap font-sans mb-4">
                {refinery.initialPrompt}
              </pre>
              <Link href="/composer">
                <Button>Start Refinement</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
