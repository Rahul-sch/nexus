import { z } from 'zod';

// Attempt to extract and parse JSON from LLM response
// Handles cases where LLM wraps JSON in markdown, explains it, etc.
export function extractJSON(text: string): string {
  // Try markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) return codeBlockMatch[1];

  // Try raw JSON object/array
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (jsonMatch) return jsonMatch[0];

  // Fall back to full text
  return text;
}

// Parse with automatic repair attempt
export async function parseStructuredOutput<T>(
  text: string,
  schema: z.ZodType<T>
): Promise<T> {
  try {
    // Extract JSON if wrapped
    const extracted = extractJSON(text);
    const parsed = JSON.parse(extracted);
    return schema.parse(parsed);
  } catch (error) {
    // If JSON parsing fails, try to repair using Claude
    // For MVP, just throw - repair can be added later
    throw new Error(`Failed to parse LLM output: ${error}`);
  }
}

// Sanitize error messages before returning to client
export function sanitizeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  // Remove sensitive patterns (API keys, tokens, etc.)
  return message
    .replace(/sk-[a-zA-Z0-9]{20,}/g, '[REDACTED]')
    .replace(/Bearer\s+[a-zA-Z0-9._%+-]+/g, '[REDACTED]')
    .slice(0, 200); // Truncate to prevent log bloat
}

export function getErrorCode(error: unknown): string {
  if (error && typeof error === 'object') {
    if ('code' in error && typeof error.code === 'string') return error.code;
    if ('status' in error && typeof error.status === 'number') return `HTTP_${error.status}`;
    if ('message' in error && typeof error.message === 'string') {
      if (error.message.includes('rate_limit')) return 'RATE_LIMITED';
      if (error.message.includes('timeout')) return 'TIMEOUT';
    }
  }
  return 'UNKNOWN_ERROR';
}
