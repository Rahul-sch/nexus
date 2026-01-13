"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

export default function Home() {
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
            <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
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
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Link href="/composer">
              <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--primary)] text-white">
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
              <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--background-secondary)]">
                      <History className="h-5 w-5 text-[var(--foreground)]" />
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
              className="h-full cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setKeyringOpen(true)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--background-secondary)]">
                    <Key className="h-5 w-5 text-[var(--foreground)]" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Manage Keys</CardTitle>
                    <CardDescription>Configure API providers</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Recent Refineries */}
          <div>
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
                {recentRefineries.map((refinery) => (
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
                        {refinery.initialPrompt.substring(0, 100)}
                        {refinery.initialPrompt.length > 100 && "..."}
                      </p>
                      <p className="mt-1 text-xs text-[var(--foreground-secondary)] ml-7">
                        {new Date(refinery.createdAt).toLocaleDateString()} at{" "}
                        {new Date(refinery.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Link href={`/refinery/${refinery.id}`}>
                        <Button variant="ghost" size="sm">
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
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Sparkles className="h-12 w-12 mx-auto text-[var(--foreground-secondary)] mb-4" />
                  <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
                    No refinements yet
                  </h3>
                  <p className="text-[var(--foreground-secondary)] mb-4">
                    Start refining your first prompt to see it here.
                  </p>
                  <Link href="/composer">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Start Refining
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Keyring Modal */}
      <KeyringModal open={keyringOpen} onOpenChange={setKeyringOpen} />
    </div>
  );
}
