"use client";

import { useState, useCallback, useEffect } from "react";
import type { Refinery, RefineryStatus } from "@nexus/shared";

interface RefineriesState {
  refineries: Refinery[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

interface UseRefineriesReturn extends RefineriesState {
  fetchRefineries: (options?: { limit?: number; offset?: number; status?: RefineryStatus }) => Promise<void>;
  deleteRefinery: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useRefineries(initialLimit = 10): UseRefineriesReturn {
  const [state, setState] = useState<RefineriesState>({
    refineries: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const fetchRefineries = useCallback(
    async (options?: { limit?: number; offset?: number; status?: RefineryStatus }) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const params = new URLSearchParams();
        params.set("limit", String(options?.limit ?? initialLimit));
        params.set("offset", String(options?.offset ?? 0));
        if (options?.status) {
          params.set("status", options.status);
        }

        const response = await fetch(`/api/refineries?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch refineries");
        }

        const data = await response.json();
        setState({
          refineries: data.refineries || [],
          total: data.total || 0,
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
    },
    [initialLimit]
  );

  const deleteRefinery = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/refineries/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete refinery");
        }

        // Remove from local state
        setState((prev) => ({
          ...prev,
          refineries: prev.refineries.filter((r) => r.id !== id),
          total: prev.total - 1,
        }));

        return true;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Failed to delete",
        }));
        return false;
      }
    },
    []
  );

  const refresh = useCallback(() => fetchRefineries(), [fetchRefineries]);

  useEffect(() => {
    fetchRefineries();
  }, [fetchRefineries]);

  return {
    ...state,
    fetchRefineries,
    deleteRefinery,
    refresh,
  };
}
