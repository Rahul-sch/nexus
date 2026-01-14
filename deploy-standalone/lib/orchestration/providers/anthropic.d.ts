import { BaseProvider, ChatMessage, ChatResponse } from './base.js';
export declare class AnthropicProvider extends BaseProvider {
    private client;
    constructor(apiKey: string);
    chat(options: {
        model: string;
        system: string;
        messages: ChatMessage[];
        temperature: number;
        maxTokens: number;
    }): Promise<ChatResponse>;
}
export declare function createAnthropicProvider(apiKey: string): AnthropicProvider;
//# sourceMappingURL=anthropic.d.ts.map