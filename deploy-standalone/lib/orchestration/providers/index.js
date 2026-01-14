import { BaseProvider } from './base.js';
import { AnthropicProvider, createAnthropicProvider } from './anthropic.js';
import { OpenAIProvider, createOpenAIProvider } from './openai.js';
export { BaseProvider, AnthropicProvider, OpenAIProvider };
export { createAnthropicProvider, createOpenAIProvider };
export function createProvider(providerType, apiKey) {
    switch (providerType.toLowerCase()) {
        case 'anthropic':
            return createAnthropicProvider(apiKey);
        case 'openai':
            return createOpenAIProvider(apiKey);
        default:
            throw new Error(`Unknown provider: ${providerType}`);
    }
}
//# sourceMappingURL=index.js.map