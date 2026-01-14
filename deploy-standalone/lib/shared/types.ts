// Provider types
export type ProviderType = 'anthropic' | 'openai' | 'xai' | 'deepseek';

// Refinery status
export type RefineryStatus =
  | 'pending'
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'awaiting_user';

// Agent roles
export type AgentRole = 'clarifier' | 'drafter' | 'critic' | 'finalizer';

// Base interfaces
export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VaultEntry {
  id: string;
  userId: string;
  providerType: ProviderType;
  keyHint: string;
  isValid: boolean | null;
  validatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Refinery {
  id: string;
  userId: string;
  title?: string;
  status: RefineryStatus;
  initialPrompt: string;
  augmentedPrompt?: string;
  finalPrompt?: string;
  config: RefineryConfig;
  currentPhase?: string;
  currentIteration: number;
  totalTokensUsed: number;
  errorMessage?: string;
  errorCode?: string;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  runningSince?: Date;
  heartbeatAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefineryConfig {
  maxIterations: number;
  temperature: number;
}

export interface Message {
  id: string;
  refineryId: string;
  role: AgentRole | 'user' | 'system';
  content: string;
  providerType?: ProviderType;
  modelId?: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs?: number;
  iteration: number;
  createdAt: Date;
}

export interface Artifact {
  id: string;
  refineryId: string;
  messageId?: string;
  artifactType: 'draft' | 'critique' | 'final' | 'clarification_questions';
  content: Record<string, unknown>;
  iteration: number;
  createdAt: Date;
}

export interface UsageQuota {
  id: string;
  userId: string;
  tokensUsedToday: number;
  tokensUsedMonth: number;
  dailyLimit: number;
  monthlyLimit: number;
  lastResetDaily: Date;
  lastResetMonthly: Date;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
