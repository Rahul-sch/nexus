"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sidebar, SidebarItem } from "@/components/shell/sidebar";
import { Header, UserMenu } from "@/components/shell/header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/arena/status-badge";
import { KeyringModal } from "@/components/keyring/keyring-modal";
import { useRefineries } from "@/hooks/use-refineries";
import { useVault } from "@/hooks/use-vault";
import {
  Plus,
  Key,
  History,
  LayoutDashboard,
  Sparkles,
  Loader2,
  Trash2,
  ExternalLink,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export default function Dashboard() {
  const [keyringOpen, setKeyringOpen] = useState(false);
  const { refineries, total, isLoading, deleteRefinery } = useRefineries();
  const { hasRequiredKeys } = useVault();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this refinement?")) {
      await deleteRefinery(id);
    }
  };

  const recentRefineries = refineries.slice(0, 5);
  const hasRefineries = refineries.length > 0;

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <Sidebar>
        <SidebarItem active icon={<LayoutDashboard className="h-4 w-4" />}>
          Dashboard
        </SidebarItem>
        <Link href="/history">
          <SidebarItem icon={<History className="h-4 w-4" />}>
            History
          </SidebarItem>
        </Link>
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
        <Header title="Dashboard">
          <Button variant="ghost" size="sm" onClick={() => setKeyringOpen(true)}>
            <Key className="h-4 w-4 mr-2" />
            Keys
          </Button>
          <UserMenu email="user@example.com" />
        </Header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Missing Keys Warning */}
          {!hasRequiredKeys() && (
            <motion.div
              className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="h-5 w-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-[var(--foreground)]">API Keys Required</p>
                <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                  Add Anthropic and OpenAI API keys to start refining prompts.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setKeyringOpen(true)}
              >
                <Key className="h-4 w-4 mr-2" />
                Add Keys
              </Button>
            </motion.div>
          )}

          {/* Spotlight Input - Hero style */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/composer">
              <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-[var(--background-secondary)] to-white border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all cursor-pointer hover:shadow-lg hover:shadow-[var(--primary)]/5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[var(--primary)]/25">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg text-[var(--foreground-secondary)] group-hover:text-[var(--foreground)] transition-colors">
                      What would you like to refine today?
                    </p>
                    <p className="text-sm text-[var(--foreground-secondary)]/70 mt-1">
                      Start with a rough idea and let our AI council perfect it
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link href="/composer">
              <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-[var(--primary)]/30 group">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--primary)] text-white group-hover:scale-110 transition-transform">
                      <Plus className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">New Refinement</CardTitle>
                      <CardDescription>Start refining a new prompt</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/history">
              <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-[var(--primary)]/30 group">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--background-secondary)] group-hover:bg-[var(--primary)]/10 transition-colors">
                      <History className="h-5 w-5 text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors" />
                    </div>
                    <div>
                      <CardTitle className="text-base">History</CardTitle>
                      <CardDescription>View all refinements ({total})</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Card
              className="h-full cursor-pointer transition-all hover:shadow-md hover:border-[var(--primary)]/30 group"
              onClick={() => setKeyringOpen(true)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--background-secondary)] group-hover:bg-[var(--primary)]/10 transition-colors">
                    <Key className="h-5 w-5 text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Manage Keys</CardTitle>
                    <CardDescription>Configure API providers</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Recent Refineries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Recent Refinements
              </h2>
              {hasRefineries && (
                <Link href="/history">
                  <Button variant="ghost" size="sm">
                    View All
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </Link>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
              </div>
            ) : hasRefineries ? (
              <div className="space-y-3">
                {recentRefineries.map((refinery, index) => (
                  <motion.div
                    key={refinery.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-white hover:bg-[var(--background-secondary)] hover:border-[var(--primary)]/20 transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--primary)]/10 group-hover:bg-[var(--primary)]/20 transition-colors">
                          <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[var(--foreground)] truncate">
                              {refinery.title || "Untitled Refinement"}
                            </p>
                            <StatusBadge status={refinery.status} />
                          </div>
                          <p className="mt-0.5 text-sm text-[var(--foreground-secondary)] truncate">
                            {refinery.initialPrompt.substring(0, 100)}
                            {refinery.initialPrompt.length > 100 && "..."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-xs text-[var(--foreground-secondary)] hidden sm:block">
                        {new Date(refinery.createdAt).toLocaleDateString()}
                      </span>
                      <Link href={`/refinery/${refinery.id}`}>
                        <Button variant="ghost" size="sm" className="group-hover:bg-[var(--primary)]/10">
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
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-[var(--error)]" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12 border-dashed">
                <CardContent>
                  <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
                    No refinements yet
                  </h3>
                  <p className="text-[var(--foreground-secondary)] mb-6 max-w-sm mx-auto">
                    Start refining your first prompt to see it here. Our AI council will help perfect your ideas.
                  </p>
                  <Link href="/composer">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Start Refining
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </main>
      </div>

      {/* Keyring Modal */}
      <KeyringModal open={keyringOpen} onOpenChange={setKeyringOpen} />
    </div>
  );
}
