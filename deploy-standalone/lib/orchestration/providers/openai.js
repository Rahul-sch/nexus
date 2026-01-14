import OpenAI from 'openai';
import { BaseProvider } from './base.js';
export class OpenAIProvider extends BaseProvider {
    client;
    constructor(apiKey) {
        super(apiKey);
        this.client = new OpenAI({ apiKey });
    }
    async chat(options) {
        const messagesWithSystem = [
            { role: 'system', content: options.system },
            ...options.messages.map(m => ({
                role: m.role,
                content: m.content
            }))
        ];
        const response = await this.client.chat.completions.create({
            model: options.model,
            max_tokens: options.maxTokens,
            temperature: options.temperature,
            messages: messagesWithSystem
        });
        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No content in OpenAI response');
        }
        return {
            content,
            usage: {
                inputTokens: response.usage?.prompt_tokens ?? 0,
                outputTokens: response.usage?.completion_tokens ?? 0,
                totalTokens: response.usage?.total_tokens ?? 0
            }
        };
    }
}
export function createOpenAIProvider(apiKey) {
    return new OpenAIProvider(apiKey);
}
//# sourceMappingURL=openai.js.map