"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Refinery, RefineryStatus, Message, Artifact } from "@nexus/shared";
import { createBrowserClient } from "@supabase/ssr";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface RefineryState {
  refinery: Refinery | null;
  messages: Message[];
  artifacts: Artifact[];
  isLoading: boolean;
  error: string | null;
}

interface UseRefineryReturn extends RefineryState {
  createRefinery: (initialPrompt: string, config?: { maxIterations?: number; temperature?: number }) => Promise<string | null>;
  startRefinery: (refineryId: string) => Promise<boolean>;
  cancelRefinery: (refineryId: string) => Promise<boolean>;
  resumeRefinery: (refineryId: string, answers: string[]) => Promise<boolean>;
  fetchRefinery: (refineryId: string) => Promise<void>;
  subscribeToRefinery: (refineryId: string) => () => void;
  clearError: () => void;
}

export function useRefinery(): UseRefineryReturn {
  const [state, setState] = useState<RefineryState>({
    refinery: null,
    messages: [],
    artifacts: [],
    isLoading: false,
    error: null,
  });

  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null);

  // Initialize supabase client
  useEffect(() => {
    if (!supabaseRef.current) {
      supabaseRef.current = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
  }, []);

  const fetchRefinery = useCallback(async (refineryId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/refineries/${refineryId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch refinery");
      }

      const data = await response.json();
      setState({
        refinery: data.refinery,
        messages: data.messages || [],
        artifacts: data.artifacts || [],
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, []);

  const createRefinery = useCallback(
    async (
      initialPrompt: string,
      config?: { maxIterations?: number; temperature?: number }
    ): Promise<string | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch("/api/refineries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initial_prompt: initialPrompt, config }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create refinery");
        }

        const data = await response.json();
        setState((prev) => ({
          ...prev,
          refinery: data.refinery,
          isLoading: false,
        }));

        return data.refinery.id;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to create refinery",
        }));
        return null;
      }
    },
    []
  );

  const startRefinery = useCallback(
    async (refineryId: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/refine/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refinery_id: refineryId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to start refinery");
        }

        // Update local state
        setState((prev) => ({
          ...prev,
          refinery: prev.refinery
            ? { ...prev.refinery, status: "queued" as RefineryStatus }
            : null,
        }));

        return true;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Failed to start refinery",
        }));
        return false;
      }
    },
    []
  );

  const cancelRefinery = useCallback(
    async (refineryId: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/refine/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refinery_id: refineryId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to cancel refinery");
        }

        setState((prev) => ({
          ...prev,
          refinery: prev.refinery
            ? { ...prev.refinery, status: "cancelled" as RefineryStatus }
            : null,
        }));

        return true;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Failed to cancel",
        }));
        return false;
      }
    },
    []
  );

  const resumeRefinery = useCallback(
    async (refineryId: string, answers: string[]): Promise<boolean> => {
      try {
        const response = await fetch("/api/refine/resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refinery_id: refineryId, answers }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to resume refinery");
        }

        setState((prev) => ({
          ...prev,
          refinery: prev.refinery
            ? { ...prev.refinery, status: "queued" as RefineryStatus }
            : null,
        }));

        return true;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Failed to resume",
        }));
        return false;
      }
    },
    []
  );

  const subscribeToRefinery = useCallback(
    (refineryId: string): (() => void) => {
      if (!supabaseRef.current) return () => {};

      const channel = supabaseRef.current
        .channel(`refinery:${refineryId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "refineries",
            filter: `id=eq.${refineryId}`,
          },
          (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
            setState((prev) => ({
              ...prev,
              refinery: payload.new as Refinery,
            }));
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `refinery_id=eq.${refineryId}`,
          },
          (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
            setState((prev) => ({
              ...prev,
              messages: [...prev.messages, payload.new as Message],
            }));
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "artifacts",
            filter: `refinery_id=eq.${refineryId}`,
          },
          (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
            setState((prev) => ({
              ...prev,
              artifacts: [...prev.artifacts, payload.new as Artifact],
            }));
          }
        )
        .subscribe();

      return () => {
        supabaseRef.current?.removeChannel(channel);
      };
    },
    []
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    createRefinery,
    startRefinery,
    cancelRefinery,
    resumeRefinery,
    fetchRefinery,
    subscribeToRefinery,
    clearError,
  };
}
