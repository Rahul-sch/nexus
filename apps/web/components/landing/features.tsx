"use client";

import { motion } from "framer-motion";
import { Brain, MessageSquare, Target, CheckCircle2, Zap, Shield } from "lucide-react";

const agents = [
  {
    name: "Clarifier",
    description: "Identifies ambiguities and generates targeted questions to understand your true intent",
    icon: MessageSquare,
    color: "#0066ff",
    model: "Claude 3.5 Sonnet",
  },
  {
    name: "Drafter",
    description: "Produces refined prompt drafts based on clarified requirements",
    icon: Target,
    color: "#8b5cf6",
    model: "GPT-4o",
  },
  {
    name: "Critic",
    description: "Evaluates drafts against quality criteria and provides actionable feedback",
    icon: Brain,
    color: "#06b6d4",
    model: "Claude 3.5 Sonnet",
  },
  {
    name: "Finalizer",
    description: "Synthesizes all feedback into a polished, production-ready prompt",
    icon: CheckCircle2,
    color: "#10b981",
    model: "Claude 3.5 Sonnet",
  },
];

const features = [
  {
    title: "Multi-Agent Collaboration",
    description: "Four specialized AI agents work together, each bringing unique expertise to refine your prompts.",
    icon: Brain,
  },
  {
    title: "Iterative Refinement",
    description: "Continuous feedback loops ensure your prompts improve with each iteration.",
    icon: Zap,
  },
  {
    title: "Secure by Design",
    description: "Enterprise-grade encryption keeps your API keys and prompts safe.",
    icon: Shield,
  },
];

export function Features() {
  return (
    <section className="py-24 px-6 bg-[var(--background-secondary)]">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
            The AI Council
          </h2>
          <p className="mt-4 text-[var(--foreground-secondary)] max-w-2xl mx-auto">
            Each agent specializes in a different aspect of prompt engineering,
            working together to transform your ideas into precise instructions.
          </p>
        </motion.div>

        {/* Agent cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.name}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                style={{ background: `${agent.color}20` }}
              />
              <div className="relative p-6 rounded-2xl bg-white border border-[var(--border)] transition-all duration-300 group-hover:border-transparent group-hover:shadow-lg h-full">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${agent.color}15` }}
                >
                  <agent.icon className="h-6 w-6" style={{ color: agent.color }} />
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  {agent.name}
                </h3>
                <p className="text-sm text-[var(--foreground-secondary)] mb-4">
                  {agent.description}
                </p>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-[var(--background-secondary)] text-[var(--foreground-secondary)] inline-block">
                  {agent.model}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features grid */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
            Built for Excellence
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-7 w-7 text-[var(--primary)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                {feature.title}
              </h3>
              <p className="text-[var(--foreground-secondary)]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
