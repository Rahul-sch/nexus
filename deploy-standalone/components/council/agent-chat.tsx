"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, PenTool, Brain, CheckCircle2, Copy, Check } from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  providerType?: string;
  modelId?: string;
}

interface AgentChatProps {
  messages: Message[];
  isProcessing?: boolean;
  currentPhase?: string | null;
}

const agentConfig: Record<string, {
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  lightBg: string;
}> = {
  clarifier: {
    name: "Clarifier",
    icon: MessageSquare,
    color: "#0066ff",
    bgColor: "bg-blue-500",
    lightBg: "bg-blue-50",
  },
  drafter: {
    name: "Drafter",
    icon: PenTool,
    color: "#8b5cf6",
    bgColor: "bg-purple-500",
    lightBg: "bg-purple-50",
  },
  critic: {
    name: "Critic",
    icon: Brain,
    color: "#06b6d4",
    bgColor: "bg-cyan-500",
    lightBg: "bg-cyan-50",
  },
  finalizer: {
    name: "Finalizer",
    icon: CheckCircle2,
    color: "#10b981",
    bgColor: "bg-emerald-500",
    lightBg: "bg-emerald-50",
  },
  user: {
    name: "You",
    icon: MessageSquare,
    color: "var(--primary)",
    bgColor: "bg-[var(--primary)]",
    lightBg: "bg-[var(--primary)]/10",
  },
  system: {
    name: "System",
    icon: MessageSquare,
    color: "#6b7280",
    bgColor: "bg-gray-500",
    lightBg: "bg-gray-50",
  },
};

function MessageBubble({ message, index }: { message: Message; index: number }) {
  const [copied, setCopied] = useState(false);
  const agent = agentConfig[message.role] || agentConfig.system;
  const Icon = agent.icon;
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        type: "spring",
        stiffness: 100
      }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 + index * 0.05, type: "spring", stiffness: 200 }}
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${agent.bgColor}`}
      >
        <Icon className="h-5 w-5 text-white" />
      </motion.div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? "text-right" : ""}`}>
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-medium"
            style={{ color: agent.color }}
          >
            {agent.name}
          </span>
          {message.modelId && (
            <span className="text-xs text-[var(--foreground-secondary)]">
              via {message.modelId}
            </span>
          )}
        </div>

        <motion.div
          className={`relative group p-4 rounded-2xl ${
            isUser
              ? "bg-[var(--primary)] text-white rounded-tr-md"
              : `${agent.lightBg} rounded-tl-md`
          }`}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          {/* Animated border for non-user messages */}
          {!isUser && (
            <motion.div
              className="absolute inset-0 rounded-2xl rounded-tl-md"
              style={{
                border: `2px solid ${agent.color}`,
                opacity: 0
              }}
              whileHover={{ opacity: 0.3 }}
            />
          )}

          <p className={`text-sm whitespace-pre-wrap ${
            isUser ? "text-white" : "text-[var(--foreground)]"
          }`}>
            {message.content}
          </p>

          {/* Copy button */}
          <motion.button
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            onClick={handleCopy}
            className={`absolute top-2 right-2 p-1.5 rounded-lg transition-colors ${
              isUser
                ? "bg-white/20 hover:bg-white/30 text-white"
                : "bg-[var(--background)] hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)]"
            }`}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </motion.button>
        </motion.div>

        <span className="text-xs text-[var(--foreground-secondary)] mt-1 block">
          {new Date(message.createdAt).toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
  );
}

function TypingIndicator({ agentRole }: { agentRole: string }) {
  const agent = agentConfig[agentRole] || agentConfig.system;
  const Icon = agent.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex gap-3"
    >
      <motion.div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${agent.bgColor}`}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Icon className="h-5 w-5 text-white" />
      </motion.div>

      <div className={`p-4 rounded-2xl rounded-tl-md ${agent.lightBg}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: agent.color }}>
            {agent.name} is thinking
          </span>
          <motion.div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: agent.color }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export function AgentChat({ messages, isProcessing, currentPhase }: AgentChatProps) {
  const activeAgent = currentPhase?.toLowerCase().replace("_", "") || "clarifier";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] bg-[var(--background-secondary)]/30">
        <h3 className="font-medium text-[var(--foreground)]">AI Council Discussion</h3>
        <p className="text-xs text-[var(--foreground-secondary)]">
          {messages.length} messages in this session
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} index={index} />
          ))}

          {isProcessing && (
            <TypingIndicator key="typing" agentRole={activeAgent} />
          )}
        </AnimatePresence>

        {messages.length === 0 && !isProcessing && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mb-4"
            >
              <MessageSquare className="h-8 w-8 text-[var(--primary)]" />
            </motion.div>
            <p className="text-[var(--foreground-secondary)]">
              Start a refinement to see the AI council discuss
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
