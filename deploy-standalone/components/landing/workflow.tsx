"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { MessageSquare, PenTool, Search, CheckCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Submit Your Prompt",
    description: "Enter your rough idea or initial prompt. Don't worry about perfection—that's our job.",
    icon: MessageSquare,
  },
  {
    number: "02",
    title: "Clarify Intent",
    description: "Our Clarifier agent asks targeted questions to understand your true goals and requirements.",
    icon: Search,
  },
  {
    number: "03",
    title: "Draft & Critique",
    description: "The Drafter creates refined versions while the Critic provides actionable feedback.",
    icon: PenTool,
  },
  {
    number: "04",
    title: "Finalize",
    description: "The Finalizer synthesizes everything into a polished, production-ready prompt.",
    icon: CheckCircle,
  },
];

export function Workflow() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-24 px-6">
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
            How It Works
          </h2>
          <p className="mt-4 text-[var(--foreground-secondary)] max-w-2xl mx-auto">
            A streamlined process that transforms vague ideas into precise,
            effective prompts in minutes.
          </p>
        </motion.div>

        {/* Workflow steps */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Steps list */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.button
                key={step.number}
                className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${
                  activeStep === index
                    ? "bg-[var(--primary)]/5 border-[var(--primary)]/30"
                    : "bg-white border-[var(--border)] hover:bg-[var(--background-secondary)]"
                }`}
                onClick={() => setActiveStep(index)}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      activeStep === index
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--background-secondary)] text-[var(--foreground-secondary)]"
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className={`text-xs font-mono ${
                          activeStep === index
                            ? "text-[var(--primary)]"
                            : "text-[var(--foreground-secondary)]"
                        }`}
                      >
                        {step.number}
                      </span>
                      <h3 className="font-semibold text-[var(--foreground)]">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Visual representation */}
          <motion.div
            className="relative h-[400px] lg:h-[500px]"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--background-secondary)] to-white border border-[var(--border)] overflow-hidden">
              {/* Animated content based on active step */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-6">
                    {(() => {
                      const Icon = steps[activeStep].icon;
                      return <Icon className="h-10 w-10 text-[var(--primary)]" />;
                    })()}
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--foreground)] mb-3">
                    {steps[activeStep].title}
                  </h3>
                  <p className="text-[var(--foreground-secondary)] max-w-xs mx-auto">
                    {steps[activeStep].description}
                  </p>

                  {/* Progress indicator */}
                  <div className="mt-8 flex items-center justify-center gap-2">
                    {steps.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === activeStep
                            ? "w-8 bg-[var(--primary)]"
                            : i < activeStep
                            ? "w-4 bg-[var(--primary)]/50"
                            : "w-4 bg-[var(--border)]"
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-4 right-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28ca42]" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
