"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PromptInput } from "@/components/composer/prompt-input";
import { ConfigPanel } from "@/components/composer/config-panel";
import { ArenaView } from "@/components/arena/arena-view";
import { KeyringModal } from "@/components/keyring/keyring-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRefinery } from "@/hooks/use-refinery";
import { useVault } from "@/hooks/use-vault";
import { Key, AlertCircle, ArrowLeft } from "lucide-react";

export default function ComposerPage() {
  const router = useRouter();
  const [keyringOpen, setKeyringOpen] = useState(false);
  const [config, setConfig] = useState({ maxIterations: 2, temperature: 0.7 });

  const {
    entries,
    isLoading: vaultLoading,
    hasRequiredKeys,
  } = useVault();

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

  // Subscribe to refinery updates when we have an active refinery
  useEffect(() => {
    if (refinery?.id) {
      const unsubscribe = subscribeToRefinery(refinery.id);
      return unsubscribe;
    }
  }, [refinery?.id, subscribeToRefinery]);

  const handleSubmit = async (prompt: string) => {
    if (!hasRequiredKeys()) {
      setKeyringOpen(true);
      return;
    }

    clearError();
    const refineryId = await createRefinery(prompt, config);
    if (refineryId) {
      await startRefinery(refineryId);
    }
  };

  const handleCancel = async () => {
    if (refinery?.id) {
      await cancelRefinery(refinery.id);
    }
  };

  const handleResume = async (answers: string[]) => {
    if (refinery?.id) {
      await resumeRefinery(refinery.id, answers);
    }
  };

  const handleNewRefinery = () => {
    // Reset state by refreshing the page
    window.location.reload();
  };

  const hasActiveRefinery = refinery && !['pending', 'completed', 'failed', 'cancelled'].includes(refinery.status);
  const isCompleted = refinery?.status === 'completed';
  const showComposer = !refinery || refinery.status === 'pending';

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-white px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="text-lg font-medium text-[var(--foreground)]">
            {showComposer ? "New Refinement" : refinery?.title || "Refinement Session"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setKeyringOpen(true)}>
            <Key className="h-4 w-4 mr-2" />
            API Keys
            {!hasRequiredKeys() && (
              <span className="ml-2 h-2 w-2 rounded-full bg-[var(--warning)]" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto py-8 px-4">
        {/* Missing Keys Warning */}
        {!vaultLoading && !hasRequiredKeys() && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <AlertCircle className="h-5 w-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[var(--foreground)]">API Keys Required</p>
              <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                You need to add Anthropic and OpenAI API keys before you can start refining prompts.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => setKeyringOpen(true)}
              >
                <Key className="h-4 w-4 mr-2" />
                Add API Keys
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {refineryError && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="h-5 w-5 text-[var(--error)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[var(--error)]">Error</p>
              <p className="text-sm text-[var(--error)] mt-1">{refineryError}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-[var(--error)]"
                onClick={clearError}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Composer View */}
        {showComposer && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Your Prompt</CardTitle>
                <CardDescription>
                  Enter your initial prompt below. Our AI council will refine it through multiple iterations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PromptInput
                  onSubmit={handleSubmit}
                  isSubmitting={refineryLoading}
                  disabled={!hasRequiredKeys()}
                />
              </CardContent>
            </Card>

            <ConfigPanel
              config={config}
              onChange={setConfig}
              disabled={refineryLoading}
            />
          </div>
        )}

        {/* Arena View */}
        {refinery && !showComposer && (
          <ArenaView
            refinery={refinery}
            messages={messages}
            artifacts={artifacts}
            onCancel={handleCancel}
            onResume={handleResume}
            isLoading={refineryLoading}
          />
        )}

        {/* Completed Actions */}
        {isCompleted && (
          <div className="mt-6 flex justify-center">
            <Button onClick={handleNewRefinery}>
              Start New Refinement
            </Button>
          </div>
        )}
      </main>

      {/* Keyring Modal */}
      <KeyringModal open={keyringOpen} onOpenChange={setKeyringOpen} />
    </div>
  );
}
