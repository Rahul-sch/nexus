import { z } from 'zod';

export const ProviderTypeSchema = z.enum(['anthropic', 'openai', 'xai', 'deepseek']);
// Note: ProviderType type is exported from types.ts to avoid duplicate exports

export const VaultCreateSchema = z.object({
  provider_type: ProviderTypeSchema,
  api_key: z.string().min(10).max(200)
});
export type VaultCreate = z.infer<typeof VaultCreateSchema>;

export const RefineryConfigSchema = z.object({
  maxIterations: z.number().int().min(1).max(3).default(2),
  temperature: z.number().min(0).max(1.5).default(0.7)
});
// Note: RefineryConfig interface is exported from types.ts

export const RefineryCreateSchema = z.object({
  initial_prompt: z.string().min(1).max(50000),
  config: RefineryConfigSchema.optional()
});
export type RefineryCreate = z.infer<typeof RefineryCreateSchema>;

export const RefineStartSchema = z.object({
  refinery_id: z.string().uuid()
});
export type RefineStart = z.infer<typeof RefineStartSchema>;

export const RefineCancelSchema = z.object({
  refinery_id: z.string().uuid()
});
export type RefineCancel = z.infer<typeof RefineCancelSchema>;

export const RefineResumeSchema = z.object({
  refinery_id: z.string().uuid(),
  answers: z.array(z.string()).min(1).max(10)
});
export type RefineResume = z.infer<typeof RefineResumeSchema>;

export const PaginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.string().optional()
});
export type Pagination = z.infer<typeof PaginationSchema>;
