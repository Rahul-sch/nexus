"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Shield, LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { user, email, name, logout } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              Settings
            </h2>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-lg hover:bg-[var(--background-secondary)] transition-colors"
            >
              <X className="h-5 w-5 text-[var(--foreground-secondary)]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Profile Section */}
            <div>
              <h3 className="text-sm font-medium text-[var(--foreground-secondary)] mb-4">
                Profile
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--background-secondary)]/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-lg">
                    {name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      {name || "User"}
                    </p>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      {email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)]">
                  <Mail className="h-5 w-5 text-[var(--foreground-secondary)]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--foreground)]">Email</p>
                    <p className="text-sm text-[var(--foreground-secondary)]">{email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)]">
                  <Shield className="h-5 w-5 text-[var(--foreground-secondary)]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--foreground)]">Account ID</p>
                    <p className="text-sm text-[var(--foreground-secondary)] font-mono truncate">
                      {user?.id || "Loading..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Section */}
            <div>
              <h3 className="text-sm font-medium text-[var(--foreground-secondary)] mb-4">
                Actions
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    logout();
                    onOpenChange(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>

                {!showDeleteConfirm ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete account
                  </Button>
                ) : (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600 mb-3">
                      Are you sure? This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => {
                          // TODO: Implement account deletion
                          alert("Account deletion not yet implemented");
                        }}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
