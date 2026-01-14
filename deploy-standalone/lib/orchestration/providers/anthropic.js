import Anthropic from '@anthropic-ai/sdk';
import { BaseProvider } from './base.js';
export class AnthropicProvider extends BaseProvider {
    client;
    constructor(apiKey) {
        super(apiKey);
        this.client = new Anthropic({ apiKey });
    }
    async chat(options) {
        const response = await this.client.messages.create({
            model: options.model,
            max_tokens: options.maxTokens,
            temperature: options.temperature,
            system: options.system,
            messages: options.messages.map(m => ({
                role: m.role === 'system' ? 'user' : m.role,
                content: m.content
            }))
        });
        const content = response.content[0];
        if (content.type !== 'text') {
            throw new Error('Expected text response from Anthropic');
        }
        return {
            content: content.text,
            usage: {
                inputTokens: response.usage.input_tokens,
                outputTokens: response.usage.output_tokens,
                totalTokens: response.usage.input_tokens + response.usage.output_tokens
            }
        };
    }
}
export function createAnthropicProvider(apiKey) {
    return new AnthropicProvider(apiKey);
}
//# sourceMappingURL=anthropic.js.map