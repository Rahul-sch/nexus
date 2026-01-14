"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CouncilNetwork } from "@/components/council";
import { KeyringModal } from "@/components/keyring/keyring-modal";
import { ClarificationForm } from "@/components/arena/clarification-form";
import { MessageItem } from "@/components/arena/message-item";
import { StatusBadge } from "@/components/arena/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRefinery } from "@/hooks/use-refinery";
import { useVault } from "@/hooks/use-vault";
import {
  Key,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Loader2,
  Copy,
  Check,
  XCircle,
  Settings2,
  ChevronDown,
  Clock,
  Zap,
  Home,
} from "lucide-react";
import Link from "next/link";

export default function ComposerPage() {
  const router = useRouter();
  const [keyringOpen, setKeyringOpen] = useState(false);
  const [config, setConfig] = useState({ maxIterations: 2, temperature: 0.7 });
  const [showConfig, setShowConfig] = useState(false);
  const [promptValue, setPromptValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isLoading: vaultLoading, hasRequiredKeys } = useVault();

  const {
    refinery,
    messages,
    artifacts,
    isLoading: refineryLoading,
    error: refineryError,
    createRefinery,
    startRefinery,
    cancelRefinery,
    resumeRefinery,
    subscribeToRefinery,
    clearError,
  } = useRefinery();

  // Subscribe to refinery updates
  useEffect(() => {
    if (refinery?.id) {
      const unsubscribe = subscribeToRefinery(refinery.id);
      return unsubscribe;
    }
  }, [refinery?.id, subscribeToRefinery]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
    }
  }, [promptValue]);

  const handleSubmit = async () => {
    if (!promptValue.trim() || refineryLoading) return;

    if (!hasRequiredKeys()) {
      setKeyringOpen(true);
      return;
    }

    clearError();
    const refineryId = await createRefinery(promptValue.trim(), config);
    if (refineryId) {
      await startRefinery(refineryId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCancel = async () => {
    if (refinery?.id) {
      setIsCancelling(true);
      await cancelRefinery(refinery.id);
      setIsCancelling(false);
    }
  };

  const handleResume = async (answers: string[]) => {
    if (refinery?.id) {
      setIsResuming(true);
      await resumeRefinery(refinery.id, answers);
      setIsResuming(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewRefinery = () => {
    window.location.reload();
  };

  // Get clarification questions
  const clarificationArtifact = artifacts
    .filter((a) => a.artifactType === "clarification_questions")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  const clarificationQuestions: string[] =
    (clarificationArtifact?.content as { questions?: string[] })?.questions || [];

  // Get final prompt
  const finalArtifact = artifacts.find((a) => a.artifactType === "final");
  const finalPrompt =
    (finalArtifact?.content as { prompt?: string })?.prompt || refinery?.finalPrompt;

  const showComposer = !refinery || refinery.status === "pending";
  const isActive = refinery?.status === "running" || refinery?.status === "queued";
  const isAwaitingUser = refinery?.status === "awaiting_user";
  const isCompleted = refinery?.status === "completed";
  const isFailed = refinery?.status === "failed";

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-white/80 backdrop-blur-xl px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="w-px h-5 bg-[var(--border)]" />
          <h1 className="text-lg font-medium text-[var(--foreground)]">
            {showComposer ? "New Refinement" : refinery?.title || "Refinement"}
          </h1>
          {refinery && <StatusBadge status={refinery.status} />}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setKeyringOpen(true)}>
            <Key className="h-4 w-4 mr-2" />
            Keys
            {!hasRequiredKeys() && (
              <span className="ml-2 h-2 w-2 rounded-full bg-[var(--warning)]" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex">
        {/* Left Panel - Input/Output */}
        <div className="flex-1 flex flex-col border-r border-[var(--border)]">
          <div className="flex-1 overflow-auto p-6">
            {/* Error Display */}
            <AnimatePresence>
              {refineryError && (
                <motion.div
                  className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AlertCircle className="h-5 w-5 text-[var(--error)] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-[var(--error)]">Error</p>
                    <p className="text-sm text-[var(--error)] mt-1">{refineryError}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearError}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Composer View */}
            {showComposer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Missing Keys Warning */}
                {!vaultLoading && !hasRequiredKeys() && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertCircle className="h-5 w-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-[var(--foreground)]">API Keys Required</p>
                      <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                        Add Anthropic and OpenAI API keys to start refining.
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setKeyringOpen(true)}>
                      <Key className="h-4 w-4 mr-2" />
                      Add Keys
                    </Button>
                  </div>
                )}

                {/* Prompt Input Card */}
                <div className="rounded-2xl border border-[var(--border)] bg-white overflow-hidden">
                  <div className="p-6 pb-4">
                    <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                      Your Prompt
                    </h2>
                    <p className="text-sm text-[var(--foreground-secondary)] mb-4">
                      Describe your prompt idea. Our AI council will refine it through intelligent iteration.
                    </p>
                    <Textarea
                      ref={textareaRef}
                      value={promptValue}
                      onChange={(e) => setPromptValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="I need a prompt that helps me..."
                      className="min-h-[180px] resize-none border-0 focus:ring-0 p-0 text-base"
                      disabled={refineryLoading || !hasRequiredKeys()}
                    />
                  </div>

                  {/* Config Section */}
                  <div className="border-t border-[var(--border)] bg-[var(--background-secondary)]/50">
                    <button
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--background-secondary)] transition-colors"
                      onClick={() => setShowConfig(!showConfig)}
                    >
                      <div className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)]">
                        <Settings2 className="h-4 w-4" />
                        <span>Configuration</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-[var(--foreground-secondary)] transition-transform ${
                          showConfig ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {showConfig && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-medium text-[var(--foreground-secondary)] mb-2 block">
                                Max Iterations
                              </label>
                              <select
                                value={config.maxIterations}
                                onChange={(e) =>
                                  setConfig({ ...config, maxIterations: Number(e.target.value) })
                                }
                                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-white text-sm"
                              >
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-[var(--foreground-secondary)] mb-2 block">
                                Temperature
                              </label>
                              <select
                                value={config.temperature}
                                onChange={(e) =>
                                  setConfig({ ...config, temperature: Number(e.target.value) })
                                }
                                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-white text-sm"
                              >
                                <option value={0.5}>0.5 - Focused</option>
                                <option value={0.7}>0.7 - Balanced</option>
                                <option value={0.9}>0.9 - Creative</option>
                              </select>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Submit Section */}
                  <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
                    <p className="text-xs text-[var(--foreground-secondary)]">
                      <kbd className="px-1.5 py-0.5 bg-[var(--background-secondary)] rounded border border-[var(--border)]">
                        Ctrl
                      </kbd>
                      +
                      <kbd className="px-1.5 py-0.5 bg-[var(--background-secondary)] rounded border border-[var(--border)]">
                        Enter
                      </kbd>{" "}
                      to submit
                    </p>
                    <Button
                      onClick={handleSubmit}
                      disabled={!promptValue.trim() || refineryLoading || !hasRequiredKeys()}
                      className="gap-2"
                    >
                      {refineryLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Start Refining
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Active Session View */}
            {refinery && !showComposer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Session Info */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[var(--foreground-secondary)]">
                    Iteration {refinery.currentIteration}/{refinery.config.maxIterations}
                    {refinery.currentPhase && (
                      <span className="ml-3 px-2 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium">
                        {refinery.currentPhase}
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className="text-[var(--error)] border-[var(--error)]/30 hover:bg-red-50"
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
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                    <AlertCircle className="h-5 w-5 text-[var(--error)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[var(--error)]">Refinement Failed</p>
                      <p className="text-sm text-[var(--error)] mt-1">{refinery.errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Clarification Form */}
                {isAwaitingUser && clarificationQuestions.length > 0 && (
                  <div className="rounded-2xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-6">
                    <ClarificationForm
                      questions={clarificationQuestions}
                      onSubmit={handleResume}
                      isSubmitting={isResuming}
                    />
                  </div>
                )}

                {/* Messages Log */}
                {messages.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-[var(--foreground-secondary)]">
                      Activity Log
                    </h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <MessageItem message={message} />
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                )}

                {/* Final Result */}
                {isCompleted && finalPrompt && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl border-2 border-[var(--success)] bg-green-50/50 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Check className="h-5 w-5 text-[var(--success)]" />
                        <h3 className="text-lg font-semibold text-[var(--success)]">
                          Final Refined Prompt
                        </h3>
                      </div>
                      <div className="relative">
                        <pre className="p-4 bg-white rounded-xl border border-[var(--border)] text-sm whitespace-pre-wrap font-sans">
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
                          <Zap className="h-4 w-4" />
                          <span>{refinery.totalTokensUsed.toLocaleString()} tokens</span>
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
                              s
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-white border-t border-[var(--border)] flex items-center justify-between">
                      <Link href="/dashboard">
                        <Button variant="outline" size="sm">
                          <Home className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                      <Button onClick={handleNewRefinery}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        New Refinement
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Original Prompt */}
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--foreground)]">
                    View Original Prompt
                  </summary>
                  <div className="mt-3 p-4 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)]">
                    <pre className="text-sm whitespace-pre-wrap font-sans text-[var(--foreground)]">
                      {refinery.initialPrompt}
                    </pre>
                  </div>
                </details>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Panel - Council Visualization */}
        <div className="w-[400px] bg-[var(--background-secondary)]/30 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <CouncilNetwork
              activeAgent={isActive ? "active" : null}
              phase={refinery?.currentPhase}
            />

            {/* Status Text */}
            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {showComposer && (
                <>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                    The AI Council
                  </h3>
                  <p className="text-sm text-[var(--foreground-secondary)] max-w-xs">
                    Four specialized agents will collaborate to refine your prompt into a polished,
                    production-ready instruction.
                  </p>
                </>
              )}
              {isActive && (
                <>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                    Processing...
                  </h3>
                  <p className="text-sm text-[var(--foreground-secondary)] max-w-xs">
                    {refinery?.currentPhase
                      ? `The ${refinery.currentPhase} agent is analyzing your prompt.`
                      : "Initializing the refinement process..."}
                  </p>
                </>
              )}
              {isAwaitingUser && (
                <>
                  <h3 className="text-lg font-semibold text-[var(--primary)] mb-2">
                    Your Input Needed
                  </h3>
                  <p className="text-sm text-[var(--foreground-secondary)] max-w-xs">
                    Please answer the clarifying questions to continue.
                  </p>
                </>
              )}
              {isCompleted && (
                <>
                  <h3 className="text-lg font-semibold text-[var(--success)] mb-2">
                    Refinement Complete
                  </h3>
                  <p className="text-sm text-[var(--foreground-secondary)] max-w-xs">
                    Your prompt has been refined and is ready to use.
                  </p>
                </>
              )}
              {isFailed && (
                <>
                  <h3 className="text-lg font-semibold text-[var(--error)] mb-2">
                    Process Failed
                  </h3>
                  <p className="text-sm text-[var(--foreground-secondary)] max-w-xs">
                    Something went wrong. Please try again.
                  </p>
                </>
              )}
            </motion.div>
          </div>

          {/* Agent Legend */}
          <div className="p-6 border-t border-[var(--border)] bg-white">
            <h4 className="text-xs font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-3">
              Agent Roles
            </h4>
            <div className="space-y-2 text-xs text-[var(--foreground-secondary)]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#0066ff]" />
                <span>Clarifier - Identifies ambiguities</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                <span>Drafter - Creates refined versions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#06b6d4]" />
                <span>Critic - Evaluates quality</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                <span>Finalizer - Polishes output</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyring Modal */}
      <KeyringModal open={keyringOpen} onOpenChange={setKeyringOpen} />
    </div>
  );
}
