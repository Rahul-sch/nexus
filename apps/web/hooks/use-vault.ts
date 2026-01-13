"use client";

import { useState, useCallback, useEffect } from "react";
import type { VaultEntry, ProviderType } from "@nexus/shared";

interface VaultState {
  entries: VaultEntry[];
  isLoading: boolean;
  error: string | null;
}

interface UseVaultReturn extends VaultState {
  addKey: (provider: ProviderType, apiKey: string) => Promise<boolean>;
  removeKey: (provider: ProviderType) => Promise<boolean>;
  validateKey: (provider: ProviderType) => Promise<boolean>;
  refresh: () => Promise<void>;
  hasProvider: (provider: ProviderType) => boolean;
  hasRequiredKeys: () => boolean;
}

export function useVault(): UseVaultReturn {
  const [state, setState] = useState<VaultState>({
    entries: [],
    isLoading: true,
    error: null,
  });

  const fetchEntries = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch("/api/vault");
      if (!response.ok) {
        throw new Error("Failed to fetch vault entries");
      }
      const data = await response.json();
      setState({ entries: data.entries || [], isLoading: false, error: null });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addKey = useCallback(
    async (provider: ProviderType, apiKey: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/vault", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider_type: provider, api_key: apiKey }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to add key");
        }

        await fetchEntries();
        return true;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Failed to add key",
        }));
        return false;
      }
    },
    [fetchEntries]
  );

  const removeKey = useCallback(
    async (provider: ProviderType): Promise<boolean> => {
      try {
        const response = await fetch(`/api/vault/${provider}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to remove key");
        }

        await fetchEntries();
        return true;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Failed to remove key",
        }));
        return false;
      }
    },
    [fetchEntries]
  );

  const validateKey = useCallback(
    async (provider: ProviderType): Promise<boolean> => {
      try {
        const response = await fetch(`/api/vault/${provider}/validate`, {
          method: "POST",
        });

        if (!response.ok) {
          return false;
        }

        const data = await response.json();
        await fetchEntries();
        return data.valid === true;
      } catch {
        return false;
      }
    },
    [fetchEntries]
  );

  const hasProvider = useCallback(
    (provider: ProviderType): boolean => {
      return state.entries.some((e) => e.providerType === provider);
    },
    [state.entries]
  );

  const hasRequiredKeys = useCallback((): boolean => {
    const required: ProviderType[] = ["anthropic", "openai"];
    return required.every((p) => hasProvider(p));
  }, [hasProvider]);

  return {
    ...state,
    addKey,
    removeKey,
    validateKey,
    refresh: fetchEntries,
    hasProvider,
    hasRequiredKeys,
  };
}
