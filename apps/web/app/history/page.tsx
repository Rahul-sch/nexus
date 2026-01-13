"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar, SidebarItem } from "@/components/shell/sidebar";
import { Header, UserMenu } from "@/components/shell/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/arena/status-badge";
import { KeyringModal } from "@/components/keyring/keyring-modal";
import { useRefineries } from "@/hooks/use-refineries";
import { useVault } from "@/hooks/use-vault";
import type { RefineryStatus } from "@nexus/shared";
import {
  Plus,
  Key,
  History,
  LayoutDashboard,
  Sparkles,
  Loader2,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STATUS_FILTERS: { label: string; value: RefineryStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Running", value: "running" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function HistoryPage() {
  const [keyringOpen, setKeyringOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<RefineryStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { refineries, total, isLoading, deleteRefinery, fetchRefineries } = useRefineries(pageSize);
  const { hasRequiredKeys } = useVault();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this refinement?")) {
      await deleteRefinery(id);
    }
  };

  const handleFilterChange = (status: RefineryStatus | "all") => {
    setStatusFilter(status);
    setPage(0);
    fetchRefineries({
      limit: pageSize,
      offset: 0,
      status: status === "all" ? undefined : status,
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchRefineries({
      limit: pageSize,
      offset: newPage * pageSize,
      status: statusFilter === "all" ? undefined : statusFilter,
    });
  };

  // Filter refineries by search query (client-side)
  const filteredRefineries = refineries.filter((r) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.initialPrompt.toLowerCase().includes(query) ||
      r.title?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <Sidebar>
        <Link href="/">
          <SidebarItem icon={<LayoutDashboard className="h-4 w-4" />}>
            Dashboard
          </SidebarItem>
        </Link>
        <SidebarItem active icon={<History className="h-4 w-4" />}>
          History
        </SidebarItem>
        <SidebarItem
          icon={<Key className="h-4 w-4" />}
          onClick={() => setKeyringOpen(true)}
        >
          API Keys
          {!hasRequiredKeys() && (
            <span className="ml-auto h-2 w-2 rounded-full bg-[var(--warning)]" />
          )}
        </SidebarItem>
      </Sidebar>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header title="History">
          <Link href="/composer">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Refinement
            </Button>
          </Link>
          <UserMenu email="user@example.com" />
        </Header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-secondary)]" />
              <Input
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--foreground-secondary)]" />
              <div className="flex gap-1">
                {STATUS_FILTERS.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={statusFilter === filter.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleFilterChange(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
            </div>
          ) : filteredRefineries.length > 0 ? (
            <>
              <div className="space-y-3">
                {filteredRefineries.map((refinery) => (
                  <div
                    key={refinery.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-white hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-4 w-4 text-[var(--primary)] flex-shrink-0" />
                        <p className="font-medium text-[var(--foreground)] truncate">
                          {refinery.title || "Untitled Refinement"}
                        </p>
                        <StatusBadge status={refinery.status} />
                      </div>
                      <p className="mt-1 text-sm text-[var(--foreground-secondary)] truncate ml-7">
                        {refinery.initialPrompt.substring(0, 150)}
                        {refinery.initialPrompt.length > 150 && "..."}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-[var(--foreground-secondary)] ml-7">
                        <span>
                          {new Date(refinery.createdAt).toLocaleDateString()} at{" "}
                          {new Date(refinery.createdAt).toLocaleTimeString()}
                        </span>
                        {refinery.totalTokensUsed > 0 && (
                          <span>{refinery.totalTokensUsed.toLocaleString()} tokens</span>
                        )}
                        <span>
                          {refinery.currentIteration}/{refinery.config.maxIterations} iterations
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Link href={`/refinery/${refinery.id}`}>
                        <Button variant="secondary" size="sm">
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(refinery.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-[var(--error)]" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Showing {page * pageSize + 1} - {Math.min((page + 1) * pageSize, total)} of {total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-[var(--foreground-secondary)]">
                      Page {page + 1} of {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <History className="h-12 w-12 mx-auto text-[var(--foreground-secondary)] mb-4" />
                <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
                  {searchQuery || statusFilter !== "all"
                    ? "No matching refinements"
                    : "No refinements yet"}
                </h3>
                <p className="text-[var(--foreground-secondary)] mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters or search query."
                    : "Start refining your first prompt to see it here."}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Link href="/composer">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Start Refining
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Keyring Modal */}
      <KeyringModal open={keyringOpen} onOpenChange={setKeyringOpen} />
    </div>
  );
}
