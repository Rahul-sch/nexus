import { z } from 'zod';
export declare const ClarifierOutputSchema: z.ZodObject<{
    needsQuestions: z.ZodBoolean;
    questions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    analysis: z.ZodString;
    enhancedContext: z.ZodString;
    confidence: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    needsQuestions: boolean;
    analysis: string;
    enhancedContext: string;
    confidence: number;
    questions?: string[] | undefined;
}, {
    needsQuestions: boolean;
    analysis: string;
    enhancedContext: string;
    confidence: number;
    questions?: string[] | undefined;
}>;
export declare const DrafterOutputSchema: z.ZodObject<{
    draftPrompt: z.ZodString;
    reasoning: z.ZodString;
    structureUsed: z.ZodString;
}, "strip", z.ZodTypeAny, {
    draftPrompt: string;
    reasoning: string;
    structureUsed: string;
}, {
    draftPrompt: string;
    reasoning: string;
    structureUsed: string;
}>;
export declare const CriticOutputSchema: z.ZodObject<{
    overallScore: z.ZodNumber;
    clarity: z.ZodNumber;
    completeness: z.ZodNumber;
    specificity: z.ZodNumber;
    strengths: z.ZodArray<z.ZodString, "many">;
    weaknesses: z.ZodArray<z.ZodString, "many">;
    suggestions: z.ZodArray<z.ZodString, "many">;
    requiresRevision: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    overallScore: number;
    clarity: number;
    completeness: number;
    specificity: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    requiresRevision: boolean;
}, {
    overallScore: number;
    clarity: number;
    completeness: number;
    specificity: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    requiresRevision: boolean;
}>;
export declare const FinalizerOutputSchema: z.ZodObject<{
    finalPrompt: z.ZodString;
    changesSummary: z.ZodString;
    improvementHighlights: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    finalPrompt: string;
    changesSummary: string;
    improvementHighlights: string[];
}, {
    finalPrompt: string;
    changesSummary: string;
    improvementHighlights: string[];
}>;
export type ClarifierOutput = z.infer<typeof ClarifierOutputSchema>;
export type DrafterOutput = z.infer<typeof DrafterOutputSchema>;
export type CriticOutput = z.infer<typeof CriticOutputSchema>;
export type FinalizerOutput = z.infer<typeof FinalizerOutputSchema>;
export declare const CouncilStateAnnotation: import("@langchain/langgraph").AnnotationRoot<{
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
}>;
export type CouncilState = typeof CouncilStateAnnotation.State;
//# sourceMappingURL=state.d.ts.map