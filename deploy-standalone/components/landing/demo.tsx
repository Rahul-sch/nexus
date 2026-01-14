"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  PenTool,
  Brain,
  CheckCircle2,
  Sparkles,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const agents = [
  {
    id: "clarifier",
    name: "Clarifier",
    icon: MessageSquare,
    color: "#0066ff",
    bgColor: "bg-blue-500",
    lightBg: "bg-blue-50",
    model: "Claude 3.5",
  },
  {
    id: "drafter",
    name: "Drafter",
    icon: PenTool,
    color: "#8b5cf6",
    bgColor: "bg-purple-500",
    lightBg: "bg-purple-50",
    model: "GPT-4o",
  },
  {
    id: "critic",
    name: "Critic",
    icon: Brain,
    color: "#06b6d4",
    bgColor: "bg-cyan-500",
    lightBg: "bg-cyan-50",
    model: "GPT-4o-mini",
  },
  {
    id: "finalizer",
    name: "Finalizer",
    icon: CheckCircle2,
    color: "#10b981",
    bgColor: "bg-emerald-500",
    lightBg: "bg-emerald-50",
    model: "Claude 3.5",
  },
];

const demoConversation = [
  {
    agent: "user",
    text: "Write a prompt for a chatbot that helps with cooking",
  },
  {
    agent: "clarifier",
    text: "What cuisine types should it specialize in? Should it handle dietary restrictions? Recipe complexity level?",
  },
  {
    agent: "drafter",
    text: "You are a friendly culinary assistant specializing in home cooking. Help users discover recipes based on ingredients they have, dietary needs, and skill level...",
  },
  {
    agent: "critic",
    text: "Good foundation. Suggestions: Add measurement conversions, cooking time estimates, and substitution options for missing ingredients.",
  },
  {
    agent: "finalizer",
    text: "You are CookMate, an expert culinary assistant. Your capabilities include: ingredient-based recipe suggestions, dietary accommodations (vegan, gluten-free, allergies), step-by-step instructions with timing, measurement conversions, and smart ingredient substitutions...",
  },
];

export function Demo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [messages, setMessages] = useState<typeof demoConversation>([]);

  useEffect(() => {
    if (isPlaying && currentStep < demoConversation.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setMessages((prev) => [...prev, demoConversation[currentStep + 1]]);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (currentStep >= demoConversation.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep]);

  const startDemo = () => {
    setIsPlaying(true);
    setCurrentStep(-1);
    setMessages([]);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
    setMessages([]);
  };

  const activeAgent = isPlaying
    ? demoConversation[currentStep + 1]?.agent
    : null;

  return (
    <section className="py-24 bg-gradient-to-b from-[var(--background)] to-[var(--background-secondary)]/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium mb-4">
              <Play className="h-4 w-4" />
              Interactive Demo
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
              Watch the AI Council in Action
            </h2>
            <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
              See how 4 specialized agents collaborate to transform a simple idea into a precision-engineered prompt.
            </p>
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Agent Network Visualization */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <div className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-sm">
                  <h3 className="text-sm font-medium text-[var(--foreground-secondary)] mb-6">
                    AI Council
                  </h3>

                  {/* Agent Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {agents.map((agent) => {
                      const Icon = agent.icon;
                      const isActive = activeAgent === agent.id;
                      const isPast = messages.some((m) => m.agent === agent.id);

                      return (
                        <motion.div
                          key={agent.id}
                          className={`relative p-4 rounded-xl border-2 transition-all ${
                            isActive
                              ? "border-current shadow-lg"
                              : isPast
                              ? "border-current/30 bg-current/5"
                              : "border-[var(--border)]"
                          }`}
                          style={{ borderColor: isActive || isPast ? agent.color : undefined }}
                          animate={isActive ? { scale: [1, 1.02, 1] } : {}}
                          transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
                        >
                          {isActive && (
                            <motion.div
                              className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                              style={{ backgroundColor: agent.color }}
                              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                              isActive ? agent.bgColor : agent.lightBg
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                isActive ? "text-white" : ""
                              }`}
                              style={{ color: isActive ? undefined : agent.color }}
                            />
                          </div>
                          <p className="font-medium text-[var(--foreground)] text-sm">
                            {agent.name}
                          </p>
                          <p className="text-xs text-[var(--foreground-secondary)]">
                            {agent.model}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Control Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={startDemo}
                      disabled={isPlaying}
                      className="flex-1 gap-2"
                    >
                      <Play className="h-4 w-4" />
                      {messages.length > 0 ? "Replay" : "Start Demo"}
                    </Button>
                    {messages.length > 0 && (
                      <Button variant="outline" onClick={resetDemo}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation Panel */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[var(--border)] bg-[var(--background-secondary)]/50">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[var(--primary)]" />
                    <span className="font-medium text-[var(--foreground)]">
                      Refinement Session
                    </span>
                  </div>
                </div>

                <div className="p-6 min-h-[400px]">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
                        <Play className="h-8 w-8 text-[var(--primary)]" />
                      </div>
                      <p className="text-[var(--foreground-secondary)]">
                        Click "Start Demo" to see the AI council refine a prompt
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {messages.map((message, index) => {
                          const isUser = message.agent === "user";
                          const agent = agents.find((a) => a.id === message.agent);

                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.4 }}
                              className={`flex gap-3 ${isUser ? "justify-end" : ""}`}
                            >
                              {!isUser && agent && (
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${agent.bgColor}`}
                                >
                                  <agent.icon className="h-4 w-4 text-white" />
                                </div>
                              )}
                              <div
                                className={`max-w-[80%] p-4 rounded-2xl ${
                                  isUser
                                    ? "bg-[var(--primary)] text-white rounded-br-md"
                                    : "bg-[var(--background-secondary)] rounded-bl-md"
                                }`}
                              >
                                {!isUser && agent && (
                                  <p
                                    className="text-xs font-medium mb-1"
                                    style={{ color: agent.color }}
                                  >
                                    {agent.name}
                                  </p>
                                )}
                                <p
                                  className={`text-sm ${
                                    isUser ? "text-white" : "text-[var(--foreground)]"
                                  }`}
                                >
                                  {message.text}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>

                      {/* Typing indicator */}
                      {isPlaying && currentStep < demoConversation.length - 1 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center">
                            <motion.div
                              className="flex gap-1"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-[var(--foreground-secondary)]" />
                              <div className="w-1.5 h-1.5 rounded-full bg-[var(--foreground-secondary)]" />
                              <div className="w-1.5 h-1.5 rounded-full bg-[var(--foreground-secondary)]" />
                            </motion.div>
                          </div>
                          <div className="p-4 rounded-2xl bg-[var(--background-secondary)] rounded-bl-md">
                            <motion.div
                              className="flex gap-1"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <div className="w-2 h-2 rounded-full bg-[var(--foreground-secondary)]" />
                              <div className="w-2 h-2 rounded-full bg-[var(--foreground-secondary)]" />
                              <div className="w-2 h-2 rounded-full bg-[var(--foreground-secondary)]" />
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>

                {/* Result indicator */}
                {messages.length === demoConversation.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border-t border-[var(--border)] bg-emerald-50"
                  >
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">
                        Prompt refined successfully!
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
