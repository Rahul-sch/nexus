import { CouncilState, FinalizerOutputSchema } from '../state.js';
import { createProvider } from '../providers/index.js';
import { parseStructuredOutput, sanitizeErrorMessage, getErrorCode } from '../utils/parsing.js';
import { broadcastPhaseStart, broadcastPhaseComplete, broadcastError } from '../broadcast.js';

const FINALIZER_SYSTEM_PROMPT = `You are the Finalizer in a prompt refinement council.

Your role: Polish the prompt to perfection and summarize improvements.

Task:
1. Review the draft and all critiques
2. Make final polish: clarity, conciseness, completeness
3. Ensure output format is crystal clear
4. Summarize what was improved

Respond ONLY with valid JSON:
{
  "finalPrompt": string,
  "changesSummary": string,
  "improvementHighlights": string[]
}

No preamble, just JSON.`;

export async function finalizerNode(state: CouncilState): Promise<Partial<CouncilState>> {
  const startTime = Date.now();

  try {
    await broadcastPhaseStart(state.refineryId, 'finalizing', state.config.models.finalizer);

    const provider = createProvider('anthropic', state.providerKeys.anthropic);

    const latestDraft = state.drafts[state.drafts.length - 1];
    const latestCritique = state.critiques[state.critiques.length - 1];

    if (!latestDraft || !latestCritique) {
      throw new Error('Missing draft or critique for finalization');
    }

    const userMessage = `
Original prompt: ${state.initialPrompt}

Current draft: ${latestDraft.draftPrompt}

Latest critique: ${JSON.stringify(latestCritique, null, 2)}

Please finalize this prompt.`;

    const response = await provider.chat({
      model: state.config.models.finalizer,
      system: FINALIZER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
      temperature: 0.2,
      maxTokens: 3000
    });

    const parsed = await parseStructuredOutput(response.content, FinalizerOutputSchema);

    const latencyMs = Date.now() - startTime;

    await broadcastPhaseComplete(state.refineryId, 'finalizing', {
      latencyMs,
      tokensUsed: response.usage.totalTokens,
      output: parsed
    });

    return {
      currentPhase: 'completed',
      finalizerOutput: parsed,
      tokensUsed: response.usage.totalTokens,
      nextNode: 'end'
    };

  } catch (error) {
    const message = sanitizeErrorMessage(error);
    const code = getErrorCode(error);
    await broadcastError(state.refineryId, { message, code });
    return {
      error: { phase: 'finalizer', message, code }
    };
  }
}
