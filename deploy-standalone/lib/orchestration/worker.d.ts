export interface RefineryData {
    id: string;
    user_id: string;
    initial_prompt: string;
    augmented_prompt: string | null;
    config: {
        maxIterations: number;
        temperature: number;
        models: {
            clarifier: string;
            drafter: string;
            critic: string;
            finalizer: string;
        };
    };
    status: string;
}
export interface WorkerDependencies {
    getRefinery: (id: string) => Promise<RefineryData>;
    getDecryptedKeys: (userId: string) => Promise<Record<string, string>>;
    updateRefineryStatus: (id: string, status: string, data?: Record<string, unknown>) => Promise<void>;
    checkRefineryStatus: (id: string) => Promise<string>;
    incrementTokenUsage: (userId: string, tokens: number) => Promise<void>;
}
export declare function executeRefinement(refineryId: string, userId: string, deps: WorkerDependencies): Promise<void>;
export declare const DEFAULT_MODELS: {
    clarifier: string;
    drafter: string;
    critic: string;
    finalizer: string;
};
export declare const DEFAULT_CONFIG: {
    maxIterations: number;
    temperature: number;
    models: {
        clarifier: string;
        drafter: string;
        critic: string;
        finalizer: string;
    };
};
//# sourceMappingURL=worker.d.ts.map