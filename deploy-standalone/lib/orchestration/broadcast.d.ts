export declare function broadcastPhaseStart(refineryId: string, phase: string, model: string): Promise<void>;
export declare function broadcastPhaseComplete(refineryId: string, phase: string, data: {
    latencyMs: number;
    tokensUsed: number;
    output: unknown;
}): Promise<void>;
export declare function broadcastError(refineryId: string, error: {
    message: string;
    code: string;
}): Promise<void>;
export declare function broadcastComplete(refineryId: string, data: {
    finalPrompt: string;
    totalTokens: number;
}): Promise<void>;
//# sourceMappingURL=broadcast.d.ts.map