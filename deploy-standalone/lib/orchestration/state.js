import { Annotation } from '@langchain/langgraph';
import { z } from 'zod';
// ============================================================================
// JSON OUTPUT SCHEMAS (one per agent)
// ============================================================================
export const ClarifierOutputSchema = z.object({
    needsQuestions: z.boolean(),
    questions: z.array(z.string()).optional(),
    analysis: z.string(),
    enhancedContext: z.string(),
    confidence: z.number().min(0).max(1)
});
export const DrafterOutputSchema = z.object({
    draftPrompt: z.string(),
    reasoning: z.string(),
    structureUsed: z.string() // e.g., "role-task-requirements"
});
export const CriticOutputSchema = z.object({
    overallScore: z.number().min(1).max(10),
    clarity: z.number().min(1).max(10),
    completeness: z.number().min(1).max(10),
    specificity: z.number().min(1).max(10),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    suggestions: z.array(z.string()),
    requiresRevision: z.boolean()
});
export const FinalizerOutputSchema = z.object({
    finalPrompt: z.string(),
    changesSummary: z.string(),
    improvementHighlights: z.array(z.string())
});
// ============================================================================
// LANGGRAPH STATE WITH PROPER CHANNELS
// ============================================================================
export const CouncilStateAnnotation = Annotation.Root({
    // Identifiers
    refineryId: Annotation(),
    userId: Annotation(),
    // Input (immutable)
    initialPrompt: Annotation(),
    // Config
    config: Annotation(),
    // Provider keys (decrypted, passed in, NOT persisted to DB)
    providerKeys: Annotation(),
    // Runtime state
    currentPhase: Annotation(),
    iteration: Annotation({
        default: () => 1,
        reducer: (_, next) => next
    }),
    // CRITICAL: Explicit routing - each node sets the next destination
    // This fixes bugs where guard couldn't route correctly
    nextNode: Annotation({
        default: () => 'clarifier',
        reducer: (_, next) => next
    }),
    // Agent outputs (append-only)
    clarifierOutput: Annotation({
        default: () => null,
        reducer: (_, next) => next
    }),
    drafts: Annotation({
        default: () => [],
        reducer: (prev, next) => [...prev, ...next]
    }),
    critiques: Annotation({
        default: () => [],
        reducer: (prev, next) => [...prev, ...next]
    }),
    finalizerOutput: Annotation({
        default: () => null,
        reducer: (_, next) => next
    }),
    // Token tracking
    tokensUsed: Annotation({
        default: () => 0,
        reducer: (prev, next) => prev + next
    }),
    // Error state
    error: Annotation({
        default: () => null,
        reducer: (_, next) => next
    }),
    // Cancellation flag (checked by guard node against DB)
    isCancelled: Annotation({
        default: () => false,
        reducer: (_, next) => next
    })
});
//# sourceMappingURL=state.js.map