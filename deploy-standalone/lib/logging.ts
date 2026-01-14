const REDACT_PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
  [/sk-[a-zA-Z0-9]{20,}/g, '[REDACTED:OPENAI_KEY]'],
  [/sk-ant-[a-zA-Z0-9-]{20,}/g, '[REDACTED:ANTHROPIC_KEY]'],
  [/xai-[a-zA-Z0-9]{20,}/g, '[REDACTED:XAI_KEY]'],
  [/"api_key"\s*:\s*"[^"]+"/gi, '"api_key":"[REDACTED]"'],
  [/"password"\s*:\s*"[^"]+"/gi, '"password":"[REDACTED]"'],
  [/"secret"\s*:\s*"[^"]+"/gi, '"secret":"[REDACTED]"'],
  [/"token"\s*:\s*"[^"]+"/gi, '"token":"[REDACTED]"'],
  [/Bearer\s+[a-zA-Z0-9._-]+/gi, 'Bearer [REDACTED]'],
];

export function redact(input: string): string {
  let output = input;
  for (const [pattern, replacement] of REDACT_PATTERNS) {
    output = output.replace(pattern, replacement);
  }
  return output;
}

export function redactObject(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return redact(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(redactObject);
  }
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Redact sensitive field names entirely
      if (['api_key', 'password', 'secret', 'token', 'apiKey'].includes(key)) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = redactObject(value);
      }
    }
    return result;
  }
  return obj;
}

export function redactLog(
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>
): void {
  const sanitized = data ? redactObject(data) : undefined;
  const timestamp = new Date().toISOString();

  if (sanitized) {
    console[level](`[${timestamp}] ${message}`, sanitized);
  } else {
    console[level](`[${timestamp}] ${message}`);
  }
}

// Error serialization helper
export function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: redact(error.message),
      stack: error.stack ? redact(error.stack.split('\n').slice(0, 5).join('\n')) : undefined
    };
  }
  return { error: String(error) };
}
