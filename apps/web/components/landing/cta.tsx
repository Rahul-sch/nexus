"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="relative rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0066ff] via-[#8b5cf6] to-[#06b6d4]" />

          {/* Pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                radial-gradient(circle at 75% 75%, white 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Content */}
          <div className="relative px-8 py-16 md:px-16 md:py-20 text-center text-white">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Sparkles className="h-12 w-12 mx-auto mb-6 opacity-80" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Prompts?
            </h2>
            <p className="text-lg opacity-90 max-w-xl mx-auto mb-8">
              Join the future of prompt engineering. Let our AI council elevate
              your instructions to production quality.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <button className="group px-8 py-4 rounded-xl bg-white text-[#0066ff] font-semibold transition-all hover:shadow-lg hover:shadow-white/25 hover:scale-[1.02] active:scale-[0.98]">
                  <span className="flex items-center gap-2">
                    Start Refining
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </Link>
              <Link href="/composer">
                <button className="px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold transition-all hover:bg-white/10 hover:border-white/50">
                  Try Demo
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
