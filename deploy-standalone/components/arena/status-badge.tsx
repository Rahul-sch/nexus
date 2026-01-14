"use client";

import { Badge } from "@/components/ui/badge";
import type { RefineryStatus } from "@nexus/shared";
import { Loader2 } from "lucide-react";

interface StatusBadgeProps {
  status: RefineryStatus;
  className?: string;
}

const statusConfig: Record<
  RefineryStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }
> = {
  pending: { label: "Pending", variant: "secondary" },
  queued: { label: "Queued", variant: "warning" },
  running: { label: "Running", variant: "default" },
  completed: { label: "Completed", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "outline" },
  awaiting_user: { label: "Awaiting Input", variant: "warning" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "secondary" as const };
  const isActive = status === "running" || status === "queued";

  return (
    <Badge variant={config.variant} className={className}>
      {isActive && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
      {config.label}
    </Badge>
  );
}
