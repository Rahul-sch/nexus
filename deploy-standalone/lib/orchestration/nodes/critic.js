import { CriticOutputSchema } from '../state.js';
import { createProvider } from '../providers/index.js';
import { parseStructuredOutput, sanitizeErrorMessage, getErrorCode } from '../utils/parsing.js';
import { broadcastPhaseStart, broadcastPhaseComplete, broadcastError } from '../broadcast.js';
const CRITIC_SYSTEM_PROMPT = `You are the Critic in a prompt refinement council.

Your role: Evaluate the current draft and decide if it needs revision.

Task:
1. Score clarity, completeness, specificity (1-10 each)
2. List strengths and weaknesses
3. If score < 7.5 or significant gaps exist: requiresRevision = true
4. Otherwise: requiresRevision = false

Be honest but constructive.

Respond ONLY with valid JSON:
{
  "overallScore": number,
  "clarity": number,
  "completeness": number,
  "specificity": number,
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[],
  "requiresRevision": boolean
}

No preamble, just JSON.`;
export async function criticNode(state) {
    const startTime = Date.now();
    try {
        await broadcastPhaseStart(state.refineryId, 'critiquing', state.config.models.critic);
        const provider = createProvider('openai', state.providerKeys.openai);
        const latestDraft = state.drafts[state.drafts.length - 1];
        if (!latestDraft) {
            throw new Error('No draft to critique');
        }
        const userMessage = `Please critique this prompt:\n\n${latestDraft.draftPrompt}`;
        const response = await provider.chat({
            model: state.config.models.critic,
            system: CRITIC_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userMessage }],
            temperature: 0.3,
            maxTokens: 2000
        });
        const parsed = await parseStructuredOutput(response.content, CriticOutputSchema);
        const latencyMs = Date.now() - startTime;
        await broadcastPhaseComplete(state.refineryId, 'critiquing', {
            latencyMs,
            tokensUsed: response.usage.totalTokens,
            output: parsed
        });
        // CRITICAL: Determine next node and increment iteration if revision needed
        const requiresRevision = parsed.requiresRevision &&
            state.iteration < state.config.maxIterations;
        return {
            currentPhase: requiresRevision ? 'revising' : 'finalizing',
            critiques: [parsed],
            tokensUsed: response.usage.totalTokens,
            // IMPORTANT: Set nextNode to route guard correctly
            nextNode: requiresRevision ? 'drafter' : 'finalizer',
            // Increment iteration ONLY if we're going back to drafting
            iteration: requiresRevision ? state.iteration + 1 : state.iteration
        };
    }
    catch (error) {
        const message = sanitizeErrorMessage(error);
        const code = getErrorCode(error);
        await broadcastError(state.refineryId, { message, code });
        return {
            error: { phase: 'critic', message, code }
        };
    }
}
//# sourceMappingURL=critic.js.map