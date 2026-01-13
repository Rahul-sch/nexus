import { CouncilState, ClarifierOutputSchema } from '../state.js';
import { createProvider } from '../providers/index.js';
import { parseStructuredOutput, sanitizeErrorMessage, getErrorCode } from '../utils/parsing.js';
import { broadcastPhaseStart, broadcastPhaseComplete, broadcastError } from '../broadcast.js';

const CLARIFIER_SYSTEM_PROMPT = `You are the Clarifier in a prompt refinement council.

Your role: Analyze the user's prompt and identify any critical ambiguities.

Task:
1. Extract the core intent and requirements
2. Identify blocking ambiguities (only if truly blocking)
3. Provide enhanced context for the Drafter

IMPORTANT: Only set needsQuestions=true for genuinely blocking ambiguities.
Most prompts can proceed without clarification questions.

Respond ONLY with valid JSON matching this schema:
{
  "needsQuestions": boolean,
  "questions": string[] | null,
  "analysis": string,
  "enhancedContext": string,
  "confidence": number
}

No preamble, no explanation, just JSON.`;

export async function clarifierNode(state: CouncilState): Promise<Partial<CouncilState>> {
  const startTime = Date.now();

  try {
    await broadcastPhaseStart(state.refineryId, 'clarifying', state.config.models.clarifier);

    const provider = createProvider('anthropic', state.providerKeys.anthropic);

    const response = await provider.chat({
      model: state.config.models.clarifier,
      system: CLARIFIER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: state.initialPrompt }],
      temperature: 0.3,
      maxTokens: 2000
    });

    const parsed = await parseStructuredOutput(response.content, ClarifierOutputSchema);

    const latencyMs = Date.now() - startTime;

    await broadcastPhaseComplete(state.refineryId, 'clarifying', {
      latencyMs,
      tokensUsed: response.usage.totalTokens,
      output: parsed
    });

    return {
      currentPhase: parsed.needsQuestions ? 'awaiting_user' : 'drafting',
      clarifierOutput: parsed,
      tokensUsed: response.usage.totalTokens,
      nextNode: parsed.needsQuestions ? 'end' : 'drafter'
    };

  } catch (error) {
    const message = sanitizeErrorMessage(error);
    const code = getErrorCode(error);
    await broadcastError(state.refineryId, { message, code });
    return {
      error: { phase: 'clarifier', message, code }
    };
  }
}
