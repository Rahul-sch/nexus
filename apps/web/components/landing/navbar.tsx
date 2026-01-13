"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-4 mt-4">
        <div className="max-w-6xl mx-auto px-6 py-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-[var(--border)]/50 shadow-lg shadow-black/[0.03]">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[var(--primary)]/25">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-[var(--foreground)]">Nexus</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
              >
                Features
              </Link>
              <Link
                href="#workflow"
                className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
              >
                How it Works
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
              >
                Dashboard
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <button className="px-4 py-2.5 rounded-xl text-[var(--foreground)] text-sm font-medium transition-all hover:bg-[var(--background-secondary)]">
                  Sign In
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium transition-all hover:bg-[var(--primary-hover)] hover:shadow-lg hover:shadow-[var(--primary)]/25">
                  Get Started
                </button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-[var(--background-secondary)] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-[var(--foreground)]" />
              ) : (
                <Menu className="h-5 w-5 text-[var(--foreground)]" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden mt-4 pt-4 border-t border-[var(--border)]"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex flex-col gap-4">
                <Link
                  href="#features"
                  className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#workflow"
                  className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How it Works
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="flex gap-2 pt-2">
                  <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--foreground)] text-sm font-medium">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
