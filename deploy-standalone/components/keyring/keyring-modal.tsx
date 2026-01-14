"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ExternalLink,
  Shield,
  Sparkles,
} from "lucide-react";

interface ProviderConfig {
  id: ProviderType;
  name: string;
  required: boolean;
  placeholder: string;
  helpUrl: string;
  gradient: string;
  icon: string;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    required: true,
    placeholder: "sk-ant-...",
    helpUrl: "https://console.anthropic.com/settings/keys",
    gradient: "from-amber-400 to-orange-500",
    icon: "A",
  },
  {
    id: "openai",
    name: "OpenAI",
    required: true,
    placeholder: "sk-...",
    helpUrl: "https://platform.openai.com/api-keys",
    gradient: "from-emerald-400 to-teal-500",
    icon: "O",
  },
  {
    id: "xai",
    name: "xAI (Grok)",
    required: false,
    placeholder: "xai-...",
    helpUrl: "https://console.x.ai/",
    gradient: "from-blue-400 to-indigo-500",
    icon: "X",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    required: false,
    placeholder: "sk-...",
    helpUrl: "https://platform.deepseek.com/api_keys",
    gradient: "from-purple-400 to-pink-500",
    icon: "D",
  },
];

interface KeyringModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyringModal({ open, onOpenChange }: KeyringModalProps) {
  const { entries, isLoading, error, addKey, removeKey, validateKey, refresh } =
    useVault();

  const [selectedProvider, setSelectedProvider] = useState<ProviderType | null>(null);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header with gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-[#8b5cf6] to-[#06b6d4] opacity-10" />
          <div className="relative px-6 py-6 border-b border-[var(--border)]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[#8b5cf6] flex items-center justify-center">
                  <Key className="h-5 w-5 text-white" />
                </div>
                API Keyring
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2">
                <Shield className="h-4 w-4 text-[var(--success)]" />
                Keys are encrypted with AES-256-GCM and stored securely
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 text-sm text-[var(--error)] bg-red-50 rounded-xl border border-red-200"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!hasAllRequired && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200"
              >
                <div className="p-2 rounded-lg bg-[var(--warning)]/10">
                  <Sparkles className="h-5 w-5 text-[var(--warning)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--foreground)]">Setup Required</p>
                  <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                    Add Anthropic and OpenAI keys to start refining prompts with our AI council.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Required Providers */}
              <div>
                <h3 className="text-xs font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
                  Required Providers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requiredProviders.map((provider, index) => (
                    <motion.div
                      key={provider.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ProviderCard
                        provider={provider}
                        entry={getEntryForProvider(provider.id)}
                        isValidating={validating === provider.id}
                        isSelected={selectedProvider === provider.id}
                        onAdd={() => setSelectedProvider(provider.id)}
                        onRemove={() => handleRemoveKey(provider.id)}
                        onValidate={() => handleValidateKey(provider.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Optional Providers */}
              <div>
                <h3 className="text-xs font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
                  Optional Providers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {optionalProviders.map((provider, index) => (
                    <motion.div
                      key={provider.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                    >
                      <ProviderCard
                        provider={provider}
                        entry={getEntryForProvider(provider.id)}
                        isValidating={validating === provider.id}
                        isSelected={selectedProvider === provider.id}
                        onAdd={() => setSelectedProvider(provider.id)}
                        onRemove={() => handleRemoveKey(provider.id)}
                        onValidate={() => handleValidateKey(provider.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Add Key Form */}
              <AnimatePresence>
                {selectedProvider && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddKey}
                    className="space-y-4 pt-6 border-t border-[var(--border)] overflow-hidden"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                          PROVIDERS.find((p) => p.id === selectedProvider)?.gradient
                        } flex items-center justify-center text-white font-bold`}
                      >
                        {PROVIDERS.find((p) => p.id === selectedProvider)?.icon}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          Add {PROVIDERS.find((p) => p.id === selectedProvider)?.name} Key
                        </p>
                        <a
                          href={PROVIDERS.find((p) => p.id === selectedProvider)?.helpUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
                        >
                          Get your API key <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="apiKey" className="sr-only">
                        API Key
                      </Label>
                      <div className="relative">
                        <Input
                          id="apiKey"
                          type={showKey ? "text" : "password"}
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                          placeholder={
                            PROVIDERS.find((p) => p.id === selectedProvider)?.placeholder
                          }
                          className="pr-10 h-12 text-base"
                          autoComplete="off"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                        >
                          {showKey ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {submitError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2 p-3 text-sm text-[var(--error)] bg-red-50 rounded-xl"
                        >
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          {submitError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={!apiKeyInput.trim() || submitting}
                        className="flex-1"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Save Key
                          </>
                        )}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-[var(--border)] bg-[var(--background-secondary)]/50">
          <Button variant="ghost" size="sm" onClick={refresh} className="text-[var(--foreground-secondary)]">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ProviderCardProps {
  provider: ProviderConfig;
  entry?: {
    id: string;
    providerType: ProviderType;
    keyHint: string;
    isValid: boolean | null;
    validatedAt: Date | null;
  };
  isValidating: boolean;
  isSelected: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onValidate: () => void;
}

function ProviderCard({
  provider,
  entry,
  isValidating,
  isSelected,
  onAdd,
  onRemove,
  onValidate,
}: ProviderCardProps) {
  const hasKey = !!entry;

  return (
    <div
      className={`relative group rounded-2xl border transition-all duration-300 overflow-hidden ${
        hasKey
          ? "bg-white border-[var(--border)]"
          : isSelected
          ? "bg-[var(--primary)]/5 border-[var(--primary)]/30"
          : "bg-[var(--background-secondary)] border-[var(--border)] hover:border-[var(--primary)]/30"
      }`}
    >
      {/* Gradient accent line */}
      <div className={`h-1 bg-gradient-to-r ${provider.gradient}`} />

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${provider.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
              style={{
                boxShadow: hasKey ? `0 4px 14px ${provider.gradient.includes('amber') ? '#f59e0b40' : provider.gradient.includes('emerald') ? '#10b98140' : provider.gradient.includes('blue') ? '#3b82f640' : '#a855f740'}` : undefined,
              }}
            >
              {provider.icon}
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)]">{provider.name}</p>
              {hasKey ? (
                <p className="text-xs text-[var(--foreground-secondary)] font-mono mt-0.5">
                  ****{entry.keyHint}
                </p>
              ) : (
                <p className="text-xs text-[var(--foreground-secondary)] mt-0.5">
                  {provider.required ? "Required" : "Optional"}
                </p>
              )}
            </div>
          </div>

          {/* Status indicator */}
          {hasKey && (
            <div className="flex items-center gap-1">
              {entry.isValid === true && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  <Check className="h-3 w-3" />
                  Valid
                </div>
              )}
              {entry.isValid === false && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                  <X className="h-3 w-3" />
                  Invalid
                </div>
              )}
              {entry.isValid === null && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                  <AlertCircle className="h-3 w-3" />
                  Unverified
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          {hasKey ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onValidate}
                disabled={isValidating}
                className="flex-1"
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Validate
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onRemove}
                className="text-[var(--error)] border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={onAdd}
              className="w-full"
            >
              <Key className="h-4 w-4 mr-2" />
              Add Key
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
