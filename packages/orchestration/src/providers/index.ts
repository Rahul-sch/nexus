import { BaseProvider } from './base.js';
import { AnthropicProvider, createAnthropicProvider } from './anthropic.js';
import { OpenAIProvider, createOpenAIProvider } from './openai.js';

export { BaseProvider, AnthropicProvider, OpenAIProvider };
export { createAnthropicProvider, createOpenAIProvider };
export type { ChatMessage, ChatResponse, ProviderConfig } from './base.js';

export function createProvider(providerType: string, apiKey: string): BaseProvider {
  switch (providerType.toLowerCase()) {
    case 'anthropic':
      return createAnthropicProvider(apiKey);
    case 'openai':
      return createOpenAIProvider(apiKey);
    default:
      throw new Error(`Unknown provider: ${providerType}`);
  }
}
