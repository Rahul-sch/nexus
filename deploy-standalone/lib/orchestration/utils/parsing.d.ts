import { z } from 'zod';
export declare function extractJSON(text: string): string;
export declare function parseStructuredOutput<T>(text: string, schema: z.ZodType<T>): Promise<T>;
export declare function sanitizeErrorMessage(error: unknown): string;
export declare function getErrorCode(error: unknown): string;
//# sourceMappingURL=parsing.d.ts.map