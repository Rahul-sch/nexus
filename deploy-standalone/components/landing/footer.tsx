"use client";

import { motion } from "framer-motion";
import { Github, Twitter, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-[var(--foreground)]">Nexus</span>
          </motion.div>

          {/* Links */}
          <motion.div
            className="flex items-center gap-6 text-sm text-[var(--foreground-secondary)]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <a href="#" className="hover:text-[var(--foreground)] transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-[var(--foreground)] transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-[var(--foreground)] transition-colors">
              Terms
            </a>
          </motion.div>

          {/* Social */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-[var(--background-secondary)] flex items-center justify-center text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-[var(--background-secondary)] flex items-center justify-center text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </motion.div>
        </div>

        <motion.div
          className="mt-8 pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--foreground-secondary)]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p>&copy; {new Date().getFullYear()} Nexus. Built with AI.</p>
        </motion.div>
      </div>
    </footer>
  );
}
