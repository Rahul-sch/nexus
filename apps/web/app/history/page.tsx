"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar, SidebarItem } from "@/components/shell/sidebar";
import { Header, UserMenu } from "@/components/shell/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/arena/status-badge";
import { KeyringModal } from "@/components/keyring/keyring-modal";
import { SettingsModal } from "@/components/settings/settings-modal";
import { useRefineries } from "@/hooks/use-refineries";
import { useVault } from "@/hooks/use-vault";
import { useAuth } from "@/hooks/use-auth";
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
  ChevronLeft,
  ChevronRight,
  Clock,
  Zap,
  ArrowRight,
  Calendar,
  Settings,
} from "lucide-react";

const STATUS_FILTERS: { label: string; value: RefineryStatus | "all"; color?: string }[] = [
  { label: "All", value: "all" },
  { label: "Completed", value: "completed", color: "#10b981" },
  { label: "Running", value: "running", color: "#0066ff" },
  { label: "Pending", value: "pending", color: "#6b7280" },
  { label: "Failed", value: "failed", color: "#ef4444" },
  { label: "Cancelled", value: "cancelled", color: "#f59e0b" },
];

export default function HistoryPage() {
  const [keyringOpen, setKeyringOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<RefineryStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { refineries, total, isLoading, deleteRefinery, fetchRefineries } = useRefineries(pageSize);
  const { hasRequiredKeys } = useVault();
  const { email, logout } = useAuth();

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
        <Link href="/dashboard">
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
        <SidebarItem
          icon={<Settings className="h-4 w-4" />}
          onClick={() => setSettingsOpen(true)}
        >
          Settings
        </SidebarItem>
      </Sidebar>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header title="History">
          <Link href="/composer">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Refinement
            </Button>
          </Link>
          <UserMenu
            email={email || "Loading..."}
            onSettings={() => setSettingsOpen(true)}
            onLogout={logout}
          />
        </Header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              Refinement History
            </h1>
            <p className="text-[var(--foreground-secondary)]">
              Browse and manage all your prompt refinements
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 space-y-4"
          >
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground-secondary)]" />
              <Input
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base rounded-xl"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleFilterChange(filter.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    statusFilter === filter.value
                      ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/25"
                      : "bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--border)]"
                  }`}
                >
                  {filter.color && statusFilter !== filter.value && (
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: filter.color }}
                    />
                  )}
                  {filter.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[#8b5cf6]/10 border border-[var(--primary)]/20">
              <p className="text-2xl font-bold text-[var(--foreground)]">{total}</p>
              <p className="text-sm text-[var(--foreground-secondary)]">Total Refinements</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200">
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {refineries.filter((r) => r.status === "completed").length}
              </p>
              <p className="text-sm text-[var(--foreground-secondary)]">Completed</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200">
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {refineries.filter((r) => r.status === "running" || r.status === "pending").length}
              </p>
              <p className="text-sm text-[var(--foreground-secondary)]">In Progress</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]">
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {refineries.reduce((sum, r) => sum + r.totalTokensUsed, 0).toLocaleString()}
              </p>
              <p className="text-sm text-[var(--foreground-secondary)]">Total Tokens</p>
            </div>
          </motion.div>

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)] mx-auto mb-4" />
                <p className="text-[var(--foreground-secondary)]">Loading refinements...</p>
              </div>
            </div>
          ) : filteredRefineries.length > 0 ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <AnimatePresence>
                  {filteredRefineries.map((refinery, index) => (
                    <motion.div
                      key={refinery.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative rounded-2xl border border-[var(--border)] bg-white hover:border-[var(--primary)]/30 hover:shadow-lg hover:shadow-[var(--primary)]/5 transition-all overflow-hidden"
                    >
                      {/* Status indicator line */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{
                          backgroundColor:
                            refinery.status === "completed"
                              ? "#10b981"
                              : refinery.status === "running"
                              ? "#0066ff"
                              : refinery.status === "failed"
                              ? "#ef4444"
                              : refinery.status === "cancelled"
                              ? "#f59e0b"
                              : "#6b7280",
                        }}
                      />

                      <div className="p-5 pl-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 rounded-lg bg-[var(--primary)]/10 group-hover:bg-[var(--primary)]/20 transition-colors">
                                <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                              </div>
                              <h3 className="font-semibold text-[var(--foreground)] truncate">
                                {refinery.title || "Untitled Refinement"}
                              </h3>
                              <StatusBadge status={refinery.status} />
                            </div>

                            <p className="text-sm text-[var(--foreground-secondary)] line-clamp-2 mb-3 ml-11">
                              {refinery.initialPrompt}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--foreground-secondary)] ml-11">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(refinery.createdAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {new Date(refinery.createdAt).toLocaleTimeString()}
                              </span>
                              {refinery.totalTokensUsed > 0 && (
                                <span className="flex items-center gap-1">
                                  <Zap className="h-3.5 w-3.5" />
                                  {refinery.totalTokensUsed.toLocaleString()} tokens
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-full bg-[var(--background-secondary)]">
                                {refinery.currentIteration}/{refinery.config.maxIterations} iterations
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link href={`/refinery/${refinery.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 group-hover:bg-[var(--primary)] group-hover:text-white group-hover:border-[var(--primary)] transition-all"
                              >
                                View
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(refinery.id);
                              }}
                              className="hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 text-[var(--error)]" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border)]"
                >
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Showing{" "}
                    <span className="font-medium text-[var(--foreground)]">
                      {page * pageSize + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-medium text-[var(--foreground)]">
                      {Math.min((page + 1) * pageSize, total)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-[var(--foreground)]">{total}</span>{" "}
                    refinements
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 0}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        const pageNum = page <= 2 ? i : page >= totalPages - 2 ? totalPages - 5 + i : page - 2 + i;
                        if (pageNum < 0 || pageNum >= totalPages) return null;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                              page === pageNum
                                ? "bg-[var(--primary)] text-white"
                                : "hover:bg-[var(--background-secondary)]"
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages - 1}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary)]/10 to-[#8b5cf6]/10 flex items-center justify-center mx-auto mb-6">
                <History className="h-10 w-10 text-[var(--primary)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                {searchQuery || statusFilter !== "all"
                  ? "No matching refinements"
                  : "No refinements yet"}
              </h3>
              <p className="text-[var(--foreground-secondary)] mb-6 max-w-md mx-auto">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters or search query to find what you're looking for."
                  : "Start your first prompt refinement and watch our AI council transform your ideas."}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Link href="/composer">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Start Refining
                  </Button>
                </Link>
              )}
            </motion.div>
          )}
        </main>
      </div>

      {/* Keyring Modal */}
      <KeyringModal open={keyringOpen} onOpenChange={setKeyringOpen} />

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
