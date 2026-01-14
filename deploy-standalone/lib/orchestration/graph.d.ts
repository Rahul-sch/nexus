export type CheckCancellationFn = (refineryId: string) => Promise<boolean>;
export declare function createCouncilGraph(checkCancellation: CheckCancellationFn): import("@langchain/langgraph").CompiledStateGraph<import("@langchain/langgraph").StateType<{
    refineryId: import("@langchain/langgraph").LastValue<string>;
    userId: import("@langchain/langgraph").LastValue<string>;
    initialPrompt: import("@langchain/langgraph").LastValue<string>;
    config: import("@langchain/langgraph").LastValue<{
        maxIterations: number;
        temperature: number;
        models: {
            clarifier: string;
            drafter: string;
            critic: string;
            finalizer: string;
        };
    }>;
    providerKeys: import("@langchain/langgraph").LastValue<Record<string, string>>;
    currentPhase: import("@langchain/langgraph").LastValue<string>;
    iteration: import("@langchain/langgraph").BinaryOperatorAggregate<number, number>;
    nextNode: import("@langchain/langgraph").BinaryOperatorAggregate<"clarifier" | "drafter" | "critic" | "finalizer" | "end", "clarifier" | "drafter" | "critic" | "finalizer" | "end">;
    clarifierOutput: import("@langchain/langgraph").BinaryOperatorAggregate<{
        needsQuestions: boolean;
        analysis: string;
        enhancedContext: string;
        confidence: number;
        questions?: string[] | undefined;
    } | null, {
        needsQuestions: boolean;
        analysis: string;
        enhancedContext: string;
        confidence: number;
        questions?: string[] | undefined;
    } | null>;
    drafts: import("@langchain/langgraph").BinaryOperatorAggregate<{
        draftPrompt: string;
        reasoning: string;
        structureUsed: string;
    }[], {
        draftPrompt: string;
        reasoning: string;
        structureUsed: string;
    }[]>;
    critiques: import("@langchain/langgraph").BinaryOperatorAggregate<{
        overallScore: number;
        clarity: number;
        completeness: number;
        specificity: number;
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
        requiresRevision: boolean;
    }[], {
        overallScore: number;
        clarity: number;
        completeness: number;
        specificity: number;
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
        requiresRevision: boolean;
    }[]>;
    finalizerOutput: import("@langchain/langgraph").BinaryOperatorAggregate<{
        finalPrompt: string;
        changesSummary: string;
        improvementHighlights: string[];
    } | null, {
        finalPrompt: string;
        changesSummary: string;
        improvementHighlights: string[];
    } | null>;
    tokensUsed: import("@langchain/langgraph").BinaryOperatorAggregate<number, number>;
    error: import("@langchain/langgraph").BinaryOperatorAggregate<{
        phase: string;
        message: string;
        code: string;
    } | null, {
        phase: string;
        message: string;
        code: string;
    } | null>;
    isCancelled: import("@langchain/langgraph").BinaryOperatorAggregate<boolean, boolean>;
}>, import("@langchain/langgraph").UpdateType<{
    refineryId: import("@langchain/langgraph").LastValue<string>;
    userId: import("@langchain/langgraph").LastValue<string>;
    initialPrompt: import("@langchain/langgraph").LastValue<string>;
    config: import("@langchain/langgraph").LastValue<{
        maxIterations: number;
        temperature: number;
        models: {
            clarifier: string;
            drafter: string;
            critic: string;
            finalizer: string;
        };
    }>;
    providerKeys: import("@langchain/langgraph").LastValue<Record<string, string>>;
    currentPhase: import("@langchain/langgraph").LastValue<string>;
    iteration: import("@langchain/langgraph").BinaryOperatorAggregate<number, number>;
    nextNode: import("@langchain/langgraph").BinaryOperatorAggregate<"clarifier" | "drafter" | "critic" | "finalizer" | "end", "clarifier" | "drafter" | "critic" | "finalizer" | "end">;
    clarifierOutput: import("@langchain/langgraph").BinaryOperatorAggregate<{
        needsQuestions: boolean;
        analysis: string;
        enhancedContext: string;
        confidence: number;
        questions?: string[] | undefined;
    } | null, {
        needsQuestions: boolean;
        analysis: string;
        enhancedContext: string;
        confidence: number;
        questions?: string[] | undefined;
    } | null>;
    drafts: import("@langchain/langgraph").BinaryOperatorAggregate<{
        draftPrompt: string;
        reasoning: string;
        structureUsed: string;
    }[], {
        draftPrompt: string;
        reasoning: string;
        structureUsed: string;
    }[]>;
    critiques: import("@langchain/langgraph").BinaryOperatorAggregate<{
        overallScore: number;
        clarity: number;
        completeness: number;
        specificity: number;
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
        requiresRevision: boolean;
    }[], {
        overallScore: number;
        clarity: number;
        completeness: number;
        specificity: number;
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
        requiresRevision: boolean;
    }[]>;
    finalizerOutput: import("@langchain/langgraph").BinaryOperatorAggregate<{
        finalPrompt: string;
        changesSummary: string;
        improvementHighlights: string[];
    } | null, {
        finalPrompt: string;
        changesSummary: string;
        improvementHighlights: string[];
    } | null>;
    tokensUsed: import("@langchain/langgraph").BinaryOperatorAggregate<number, number>;
    error: import("@langchain/langgraph").BinaryOperatorAggregate<{
        phase: string;
        message: string;
        code: string;
    } | null, {
        phase: string;
        message: string;
        code: string;
    } | null>;
    isCancelled: import("@langchain/langgraph").BinaryOperatorAggregate<boolean, boolean>;
}>, "clarifier" | "drafter" | "critic" | "finalizer" | "__start__" | "guard", {
    refineryId: import("@langchain/langgraph").LastValue<string>;
    userId: import("@langchain/langgraph").LastValue<string>;
    initialPrompt: import("@langchain/langgraph").LastValue<string>;
    config: import("@langchain/langgraph").LastValue<{
        maxIterations: number;
        temperature: number;
        models: {
            clarifier: string;
            drafter: string;
            critic: string;
            finalizer: string;
        };
    }>;
    providerKeys: import("@langchain/langgraph").LastValue<Record<string, string>>;
    currentPhase: import("@langchain/langgraph").LastValue<string>;
    iteration: import("@langchain/langgraph").BinaryOperatorAggregate<number, number>;
    nextNode: import("@langchain/langgraph").BinaryOperatorAggregate<"clarifier" | "drafter" | "critic" | "finalizer" | "end", "clarifier" | "drafter" | "critic" | "finalizer" | "end">;
    clarifierOutput: import("@langchain/langgraph").BinaryOperatorAggregate<{
        needsQuestions: boolean;
        analysis: string;
        enhancedContext: string;
        confidence: number;
        questions?: string[] | undefined;
    } | null, {
        needsQuestions: boolean;
        analysis: string;
        enhancedContext: string;
        confidence: number;
        questions?: string[] | undefined;
    } | null>;
    drafts: import("@langchain/langgraph").BinaryOperatorAggregate<{
        draftPrompt: string;
        reasoning: string;
        structureUsed: string;
    }[], {
        draftPrompt: string;
        reasoning: string;
        structureUsed: string;
    }[]>;
    critiques: import("@langchain/langgraph").BinaryOperatorAggregate<{
        overallScore: number;
        clarity: number;
        completeness: number;
        specificity: number;
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
        requiresRevision: boolean;
    }[], {
        overallScore: number;
        clarity: number;
        completeness: number;
        specificity: number;
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
        requiresRevision: boolean;
    }[]>;
    finalizerOutput: import("@langchain/langgraph").BinaryOperatorAggregate<{
        finalPrompt: string;
        changesSummary: string;
        improvementHighlights: string[];
    } | null, {
        finalPrompt: string;
        changesSummary: string;
        improvementHighlights: string[];
    } | null>;
    tokensUsed: import("@langchain/langgraph").BinaryOperatorAggregate<number, number>;
    error: import("@langchain/langgraph").BinaryOperatorAggregate<{
        phase: string;
        message: string;
        code: string;
    } | null, {
        phase: string;
        message: string;
        code: string;
    } | null>;
    isCancelled: import("@langchain/langgraph").BinaryOperatorAggregate<boolean, boolean>;
}, {
    refineryId: import("@langchain/langgraph").LastValue<string>;
    userId: import("@langchain/langgraph").LastValue<string>;
    initialPrompt: import("@langchain/langgraph").LastValue<string>;
    config: import("@langchain/langgraph").LastValue<{
        maxIterations: number;
        temperature: number;
        models: {
            clarifier: string;
            drafter: string;
            critic: string;
            finalizer: string;
        };
    }>;
    providerKeys: import("@langchain/langgraph").LastValue<Record<string, string>>;
    currentPhase: import("@langchain/langgraph").LastValue<string>;
    iteration: import("@langchain/langgraph").BinaryOperatorAggregate<number, number>;
    nextNode: import("@langchain/langgraph").BinaryOperatorAggregate<"clarifier" | "drafter" | "critic" | "finalizer" | "end", "clarifier" | "drafter" | "critic" | "finalizer" | "end">;
    clarifierOutput: import("@langchain/langgraph").BinaryOperatorAggregate<{
        needsQuestions: boolean;
        analysis: string;
        enhancedContext: string;
        confidence: number;
        questions?: string[] | undefined;
    } | null, {
        needsQuestions: boolean;
        analysis: string;
        enhancedContext: string;
        confidence: number;
        questions?: string[] | undefined;
    } | null>;
    drafts: import("@langchain/langgraph").BinaryOperatorAggregate<{
        draftPrompt: string;
        reasoning: string;
        structureUsed: string;
    }[], {
        draftPrompt: string;
        reasoning: string;
        structureUsed: string;
    }[]>;
    critiques: import("@langchain/langgraph").BinaryOperatorAggregate<{
        overallScore: number;
        clarity: number;
        completeness: number;
        specificity: number;
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
        requiresRevision: boolean;
    }[], {
        overallScore: number;
        clarity: number;
        completeness: number;
        specificity: number;
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
        requiresRevision: boolean;
    }[]>;
    finalizerOutput: import("@langchain/langgraph").BinaryOperatorAggregate<{
        finalPrompt: string;
        changesSummary: string;
        improvementHighlights: string[];
    } | null, {
        finalPrompt: string;
        changesSummary: string;
        improvementHighlights: string[];
    } | null>;
    tokensUsed: import("@langchain/langgraph").BinaryOperatorAggregate<number, number>;
    error: import("@langchain/langgraph").BinaryOperatorAggregate<{
        phase: string;
        message: string;
        code: string;
    } | null, {
        phase: string;
        message: string;
        code: string;
    } | null>;
    isCancelled: import("@langchain/langgraph").BinaryOperatorAggregate<boolean, boolean>;
}, import("@langchain/langgraph").StateDefinition>;
//# sourceMappingURL=graph.d.ts.map