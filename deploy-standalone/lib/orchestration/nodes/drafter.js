import { DrafterOutputSchema } from '../state.js';
import { createProvider } from '../providers/index.js';
import { parseStructuredOutput, sanitizeErrorMessage, getErrorCode } from '../utils/parsing.js';
import { broadcastPhaseStart, broadcastPhaseComplete, broadcastError } from '../broadcast.js';
const DRAFTER_SYSTEM_PROMPT = `You are the Drafter in a prompt refinement council.

Your role: Create a well-structured, clear prompt based on the original intent.

Task:
1. Use proven prompt structures (role-task-requirements, step-by-step, etc.)
2. Make the request unambiguous and specific
3. Include clear output format expectations
4. Keep it concise but complete

Respond ONLY with valid JSON:
{
  "draftPrompt": string,
  "reasoning": string,
  "structureUsed": string
}

No preamble, just JSON.`;
export async function drafterNode(state) {
    const startTime = Date.now();
    try {
        await broadcastPhaseStart(state.refineryId, 'drafting', state.config.models.drafter);
        const provider = createProvider('openai', state.providerKeys.openai);
        // Build user message with context from previous iterations
        let userMessage = state.initialPrompt;
        // Add clarifier context if available
        if (state.clarifierOutput?.enhancedContext) {
            userMessage = `Original prompt:\n${state.initialPrompt}\n\nContext from clarifier:\n${state.clarifierOutput.enhancedContext}`;
        }
        // If revising, include previous critique feedback
        if (state.iteration > 1 && state.critiques.length > 0) {
            const latestCritique = state.critiques[state.critiques.length - 1];
            const previousDraft = state.drafts[state.drafts.length - 1];
            userMessage = `Original prompt:\n${state.initialPrompt}

Previous draft (iteration ${state.iteration - 1}):\n${previousDraft?.draftPrompt ?? 'N/A'}

Critique feedback:
- Weaknesses: ${latestCritique.weaknesses.join(', ')}
- Suggestions: ${latestCritique.suggestions.join(', ')}

Please create an improved draft addressing this feedback.`;
        }
        const response = await provider.chat({
            model: state.config.models.drafter,
            system: DRAFTER_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userMessage }],
            temperature: state.config.temperature,
            maxTokens: 3000
        });
        const parsed = await parseStructuredOutput(response.content, DrafterOutputSchema);
        const latencyMs = Date.now() - startTime;
        await broadcastPhaseComplete(state.refineryId, 'drafting', {
            latencyMs,
            tokensUsed: response.usage.totalTokens,
            output: parsed
        });
        return {
            currentPhase: 'critiquing',
            drafts: [parsed],
            tokensUsed: response.usage.totalTokens,
            nextNode: 'critic'
        };
    }
    catch (error) {
        const message = sanitizeErrorMessage(error);
        const code = getErrorCode(error);
        await broadcastError(state.refineryId, { message, code });
        return {
            error: { phase: 'drafter', message, code }
        };
    }
}
//# sourceMappingURL=drafter.js.map