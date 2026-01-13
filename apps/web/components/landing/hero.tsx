"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Shield, Brain } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
          style={{
            background: "radial-gradient(circle, #0066ff 0%, transparent 70%)",
            top: "-10%",
            left: "-10%",
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-20"
          style={{
            background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
            bottom: "10%",
            right: "-5%",
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, -40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-15"
          style={{
            background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
            top: "40%",
            left: "50%",
          }}
          animate={{
            x: [0, 40, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1d1d1f 1px, transparent 1px),
            linear-gradient(to bottom, #1d1d1f 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium border border-[var(--primary)]/20">
            <Sparkles className="h-4 w-4" />
            AI-Powered Prompt Engineering
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          className="mt-8 text-5xl md:text-7xl font-bold tracking-tight text-[var(--foreground)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Transform Prompts
          <br />
          <span className="bg-gradient-to-r from-[#0066ff] via-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">
            Into Precision
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mt-6 text-lg md:text-xl text-[var(--foreground-secondary)] max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          A council of specialized AI agents collaborates to refine your rough ideas
          into production-ready prompts through intelligent iteration.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link href="/dashboard">
            <button className="group relative px-8 py-4 rounded-xl bg-[var(--primary)] text-white font-medium text-lg overflow-hidden transition-all hover:shadow-lg hover:shadow-[var(--primary)]/25 hover:scale-[1.02] active:scale-[0.98]">
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#0066ff] to-[#8b5cf6]"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </button>
          </Link>
          <Link href="/composer">
            <button className="px-8 py-4 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-medium text-lg transition-all hover:bg-[var(--background-secondary)] hover:border-[var(--foreground-secondary)]/30">
              Try Demo
            </button>
          </Link>
        </motion.div>

        {/* Stats or social proof */}
        <motion.div
          className="mt-16 flex items-center justify-center gap-8 md:gap-16 text-[var(--foreground-secondary)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">4</div>
            <div className="text-sm">AI Agents</div>
          </div>
          <div className="w-px h-8 bg-[var(--border)]" />
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">2</div>
            <div className="text-sm">LLM Providers</div>
          </div>
          <div className="w-px h-8 bg-[var(--border)]" />
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">∞</div>
            <div className="text-sm">Possibilities</div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-[var(--border)] flex items-start justify-center p-1"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[var(--foreground-secondary)]"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
