import { BaseProvider } from './base.js';
import { AnthropicProvider, createAnthropicProvider } from './anthropic.js';
import { OpenAIProvider, createOpenAIProvider } from './openai.js';
export { BaseProvider, AnthropicProvider, OpenAIProvider };
export { createAnthropicProvider, createOpenAIProvider };
export type { ChatMessage, ChatResponse, ProviderConfig } from './base.js';
export declare function createProvider(providerType: string, apiKey: string): BaseProvider;
//# sourceMappingURL=index.d.ts.map