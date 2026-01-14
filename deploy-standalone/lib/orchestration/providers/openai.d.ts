import { BaseProvider, ChatMessage, ChatResponse } from './base.js';
export declare class OpenAIProvider extends BaseProvider {
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
export declare function createOpenAIProvider(apiKey: string): OpenAIProvider;
//# sourceMappingURL=openai.d.ts.map