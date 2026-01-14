"use client";

import { motion } from "framer-motion";
import { MessageSquare, PenTool, Brain, CheckCircle2 } from "lucide-react";

interface CouncilNetworkProps {
  activeAgent?: string | null;
  phase?: string | null;
}

const agents = [
  {
    id: "clarifier",
    name: "Clarifier",
    icon: MessageSquare,
    color: "#0066ff",
    position: { x: 0, y: -100 },
    description: "Identifies ambiguities",
  },
  {
    id: "drafter",
    name: "Drafter",
    icon: PenTool,
    color: "#8b5cf6",
    position: { x: 100, y: 0 },
    description: "Creates refined drafts",
  },
  {
    id: "critic",
    name: "Critic",
    icon: Brain,
    color: "#06b6d4",
    position: { x: 0, y: 100 },
    description: "Evaluates quality",
  },
  {
    id: "finalizer",
    name: "Finalizer",
    icon: CheckCircle2,
    color: "#10b981",
    position: { x: -100, y: 0 },
    description: "Polishes output",
  },
];

export function CouncilNetwork({ activeAgent, phase }: CouncilNetworkProps) {
  const normalizedPhase = phase?.toLowerCase() || "";
  const isActive = (agentId: string) => {
    if (!normalizedPhase) return false;
    return normalizedPhase.includes(agentId);
  };

  return (
    <div className="relative w-full h-[320px] flex items-center justify-center">
      {/* Center hub */}
      <motion.div
        className="absolute w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[var(--primary)]/30 z-10"
        animate={{
          scale: activeAgent ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: activeAgent ? Infinity : 0,
        }}
      >
        <span className="text-white text-xl font-bold">N</span>
      </motion.div>

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {agents.map((agent, index) => {
          const nextAgent = agents[(index + 1) % agents.length];
          const centerX = 160;
          const centerY = 160;
          const startX = centerX + agent.position.x;
          const startY = centerY + agent.position.y;
          const endX = centerX + nextAgent.position.x;
          const endY = centerY + nextAgent.position.y;

          return (
            <motion.line
              key={`line-${agent.id}-${nextAgent.id}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="url(#lineGradient)"
              strokeWidth="2"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 1, delay: index * 0.2 }}
            />
          );
        })}
        {/* Lines to center */}
        {agents.map((agent, index) => {
          const centerX = 160;
          const centerY = 160;
          const agentX = centerX + agent.position.x;
          const agentY = centerY + agent.position.y;

          return (
            <motion.line
              key={`center-line-${agent.id}`}
              x1={centerX}
              y1={centerY}
              x2={agentX}
              y2={agentY}
              stroke={agent.color}
              strokeWidth="2"
              strokeOpacity={isActive(agent.id) ? 0.8 : 0.2}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            />
          );
        })}
      </svg>

      {/* Agent nodes */}
      {agents.map((agent, index) => {
        const Icon = agent.icon;
        const active = isActive(agent.id);

        return (
          <motion.div
            key={agent.id}
            className="absolute"
            style={{
              left: `calc(50% + ${agent.position.x}px - 32px)`,
              top: `calc(50% + ${agent.position.y}px - 32px)`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
          >
            <motion.div
              className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                active
                  ? "shadow-lg"
                  : "bg-white border border-[var(--border)]"
              }`}
              style={{
                backgroundColor: active ? `${agent.color}15` : undefined,
                borderColor: active ? agent.color : undefined,
                boxShadow: active ? `0 8px 24px ${agent.color}30` : undefined,
              }}
              animate={
                active
                  ? {
                      scale: [1, 1.05, 1],
                    }
                  : {}
              }
              transition={{
                duration: 1.5,
                repeat: active ? Infinity : 0,
              }}
            >
              <Icon
                className="h-6 w-6 transition-colors duration-300"
                style={{ color: active ? agent.color : "var(--foreground-secondary)" }}
              />

              {/* Active indicator */}
              {active && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                  style={{ backgroundColor: agent.color }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* Label */}
            <div className="text-center mt-2">
              <p
                className={`text-xs font-medium transition-colors ${
                  active ? "text-[var(--foreground)]" : "text-[var(--foreground-secondary)]"
                }`}
              >
                {agent.name}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
