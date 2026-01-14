import { createCouncilGraph } from './graph.js';
import { broadcastComplete } from './broadcast.js';
// Create cancellation checker using injected dependency
function createCancellationChecker(deps) {
    return async (refineryId) => {
        const status = await deps.checkRefineryStatus(refineryId);
        return status === 'cancelled';
    };
}
export async function executeRefinement(refineryId, userId, deps) {
    const checkCancellation = createCancellationChecker(deps);
    const graph = createCouncilGraph(checkCancellation);
    try {
        // Load initial state
        const refinery = await deps.getRefinery(refineryId);
        const keys = await deps.getDecryptedKeys(userId);
        const initialState = {
            refineryId,
            userId,
            initialPrompt: refinery.augmented_prompt ?? refinery.initial_prompt,
            config: refinery.config,
            providerKeys: keys,
            currentPhase: 'clarifying',
            iteration: 1,
            nextNode: 'clarifier'
        };
        // Update status
        await deps.updateRefineryStatus(refineryId, 'running', {
            started_at: new Date().toISOString(),
            running_since: new Date().toISOString()
        });
        // Execute graph
        const finalState = await graph.invoke(initialState);
        // Handle final state
        if (finalState.error) {
            if (finalState.error.code === 'CANCELLED') {
                // Already cancelled, don't overwrite status
                return;
            }
            await deps.updateRefineryStatus(refineryId, 'failed', {
                error_message: finalState.error.message,
                error_code: finalState.error.code,
                completed_at: new Date().toISOString()
            });
        }
        else if (finalState.clarifierOutput?.needsQuestions) {
            await deps.updateRefineryStatus(refineryId, 'awaiting_user', {
                current_phase: 'awaiting_user'
            });
        }
        else {
            const finalPrompt = finalState.finalizerOutput?.finalPrompt ?? '';
            await deps.updateRefineryStatus(refineryId, 'completed', {
                final_prompt: finalPrompt,
                total_tokens_used: finalState.tokensUsed,
                completed_at: new Date().toISOString()
            });
            // Broadcast completion
            await broadcastComplete(refineryId, {
                finalPrompt,
                totalTokens: finalState.tokensUsed
            });
        }
        // Update token usage
        if (finalState.tokensUsed > 0) {
            await deps.incrementTokenUsage(userId, finalState.tokensUsed);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await deps.updateRefineryStatus(refineryId, 'failed', {
            error_message: `Unexpected error during refinement: ${errorMessage}`,
            error_code: 'UNEXPECTED_ERROR',
            completed_at: new Date().toISOString()
        });
    }
}
// Default model configuration
export const DEFAULT_MODELS = {
    clarifier: 'claude-3-5-sonnet-20241022',
    drafter: 'gpt-4o',
    critic: 'gpt-4o-mini',
    finalizer: 'claude-3-5-sonnet-20241022'
};
export const DEFAULT_CONFIG = {
    maxIterations: 2,
    temperature: 0.7,
    models: DEFAULT_MODELS
};
//# sourceMappingURL=worker.js.map