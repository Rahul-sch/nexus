"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";

interface RefineryConfig {
  maxIterations: number;
  temperature: number;
}

interface ConfigPanelProps {
  config: RefineryConfig;
  onChange: (config: RefineryConfig) => void;
  disabled?: boolean;
}

export function ConfigPanel({ config, onChange, disabled = false }: ConfigPanelProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] p-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-4 w-4 text-[var(--foreground-secondary)]" />
        <h3 className="text-sm font-medium text-[var(--foreground)]">
          Configuration
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="maxIterations" className="text-xs">
            Max Iterations
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="maxIterations"
              type="number"
              min={1}
              max={3}
              value={config.maxIterations}
              onChange={(e) =>
                onChange({
                  ...config,
                  maxIterations: Math.min(3, Math.max(1, parseInt(e.target.value) || 1)),
                })
              }
              disabled={disabled}
              className="w-20"
            />
            <span className="text-xs text-[var(--foreground-secondary)]">
              (1-3)
            </span>
          </div>
          <p className="text-xs text-[var(--foreground-secondary)]">
            Number of draft/critique cycles
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="temperature" className="text-xs">
            Temperature
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="temperature"
              type="number"
              min={0}
              max={1.5}
              step={0.1}
              value={config.temperature}
              onChange={(e) =>
                onChange({
                  ...config,
                  temperature: Math.min(1.5, Math.max(0, parseFloat(e.target.value) || 0.7)),
                })
              }
              disabled={disabled}
              className="w-20"
            />
            <span className="text-xs text-[var(--foreground-secondary)]">
              (0-1.5)
            </span>
          </div>
          <p className="text-xs text-[var(--foreground-secondary)]">
            Model creativity level
          </p>
        </div>
      </div>
    </div>
  );
}
