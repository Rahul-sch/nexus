"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useVault } from "@/hooks/use-vault";
import type { ProviderType } from "@nexus/shared";
import {
  Key,
  Check,
  X,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
} from "lucide-react";

interface ProviderConfig {
  id: ProviderType;
  name: string;
  required: boolean;
  placeholder: string;
  helpUrl: string;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    required: true,
    placeholder: "sk-ant-...",
    helpUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "openai",
    name: "OpenAI",
    required: true,
    placeholder: "sk-...",
    helpUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "xai",
    name: "xAI (Grok)",
    required: false,
    placeholder: "xai-...",
    helpUrl: "https://console.x.ai/",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    required: false,
    placeholder: "sk-...",
    helpUrl: "https://platform.deepseek.com/api_keys",
  },
];

interface KeyringModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyringModal({ open, onOpenChange }: KeyringModalProps) {
  const { entries, isLoading, error, addKey, removeKey, validateKey, refresh } =
    useVault();

  const [selectedProvider, setSelectedProvider] = useState<ProviderType | null>(
    null
  );
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState<ProviderType | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const getEntryForProvider = (provider: ProviderType) =>
    entries.find((e) => e.providerType === provider);

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider || !apiKeyInput.trim()) return;

    setSubmitting(true);
    setSubmitError(null);

    const success = await addKey(selectedProvider, apiKeyInput.trim());

    if (success) {
      setSelectedProvider(null);
      setApiKeyInput("");
      setShowKey(false);
    } else {
      setSubmitError("Failed to add key. Please check your API key and try again.");
    }

    setSubmitting(false);
  };

  const handleRemoveKey = async (provider: ProviderType) => {
    if (!confirm(`Remove ${provider} API key?`)) return;
    await removeKey(provider);
  };

  const handleValidateKey = async (provider: ProviderType) => {
    setValidating(provider);
    await validateKey(provider);
    setValidating(null);
  };

  const handleCancel = () => {
    setSelectedProvider(null);
    setApiKeyInput("");
    setShowKey(false);
    setSubmitError(null);
  };

  const requiredProviders = PROVIDERS.filter((p) => p.required);
  const optionalProviders = PROVIDERS.filter((p) => !p.required);
  const hasAllRequired = requiredProviders.every((p) =>
    entries.some((e) => e.providerType === p.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Management
          </DialogTitle>
          <DialogDescription>
            Manage your API keys for AI providers. Keys are encrypted and stored
            securely.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-[var(--error)] bg-red-50 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {!hasAllRequired && (
          <div className="flex items-center gap-2 p-3 text-sm text-[var(--warning)] bg-amber-50 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            Add Anthropic and OpenAI keys to start refining prompts.
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Required Providers */}
            <div>
              <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">
                Required
              </h3>
              <div className="space-y-3">
                {requiredProviders.map((provider) => (
                  <ProviderRow
                    key={provider.id}
                    provider={provider}
                    entry={getEntryForProvider(provider.id)}
                    isValidating={validating === provider.id}
                    onAdd={() => setSelectedProvider(provider.id)}
                    onRemove={() => handleRemoveKey(provider.id)}
                    onValidate={() => handleValidateKey(provider.id)}
                  />
                ))}
              </div>
            </div>

            {/* Optional Providers */}
            <div>
              <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">
                Optional
              </h3>
              <div className="space-y-3">
                {optionalProviders.map((provider) => (
                  <ProviderRow
                    key={provider.id}
                    provider={provider}
                    entry={getEntryForProvider(provider.id)}
                    isValidating={validating === provider.id}
                    onAdd={() => setSelectedProvider(provider.id)}
                    onRemove={() => handleRemoveKey(provider.id)}
                    onValidate={() => handleValidateKey(provider.id)}
                  />
                ))}
              </div>
            </div>

            {/* Add Key Form */}
            {selectedProvider && (
              <form onSubmit={handleAddKey} className="space-y-4 pt-4 border-t border-[var(--border)]">
                <div>
                  <Label htmlFor="apiKey">
                    {PROVIDERS.find((p) => p.id === selectedProvider)?.name} API Key
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="apiKey"
                      type={showKey ? "text" : "password"}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder={
                        PROVIDERS.find((p) => p.id === selectedProvider)?.placeholder
                      }
                      className="pr-10"
                      autoComplete="off"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
                    >
                      {showKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--foreground-secondary)]">
                    Get your API key from{" "}
                    <a
                      href={
                        PROVIDERS.find((p) => p.id === selectedProvider)?.helpUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary)] hover:underline"
                    >
                      {PROVIDERS.find((p) => p.id === selectedProvider)?.name}
                    </a>
                  </p>
                </div>

                {submitError && (
                  <div className="flex items-center gap-2 p-3 text-sm text-[var(--error)] bg-red-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {submitError}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={!apiKeyInput.trim() || submitting}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Key
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
          <Button variant="ghost" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ProviderRowProps {
  provider: ProviderConfig;
  entry?: {
    id: string;
    providerType: ProviderType;
    keyHint: string;
    isValid: boolean | null;
    validatedAt: Date | null;
  };
  isValidating: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onValidate: () => void;
}

function ProviderRow({
  provider,
  entry,
  isValidating,
  onAdd,
  onRemove,
  onValidate,
}: ProviderRowProps) {
  const hasKey = !!entry;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]">
      <div className="flex items-center gap-3">
        <div
          className={`w-2 h-2 rounded-full ${
            hasKey
              ? entry.isValid === true
                ? "bg-[var(--success)]"
                : entry.isValid === false
                ? "bg-[var(--error)]"
                : "bg-[var(--warning)]"
              : "bg-gray-300"
          }`}
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--foreground)]">
              {provider.name}
            </span>
            {provider.required && (
              <Badge variant="outline" className="text-xs">
                Required
              </Badge>
            )}
          </div>
          {hasKey && (
            <span className="text-xs text-[var(--foreground-secondary)]">
              ****{entry.keyHint}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {hasKey ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onValidate}
              disabled={isValidating}
              title="Validate key"
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : entry.isValid === true ? (
                <Check className="h-4 w-4 text-[var(--success)]" />
              ) : entry.isValid === false ? (
                <X className="h-4 w-4 text-[var(--error)]" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              title="Remove key"
            >
              <Trash2 className="h-4 w-4 text-[var(--error)]" />
            </Button>
          </>
        ) : (
          <Button variant="secondary" size="sm" onClick={onAdd}>
            Add Key
          </Button>
        )}
      </div>
    </div>
  );
}
