export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface ChatResponse {
    content: string;
    usage: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    };
}
export interface ProviderConfig {
    apiKey: string;
}
export declare abstract class BaseProvider {
    protected apiKey: string;
    constructor(apiKey: string);
    abstract chat(options: {
        model: string;
        system: string;
        messages: ChatMessage[];
        temperature: number;
        maxTokens: number;
    }): Promise<ChatResponse>;
}
//# sourceMappingURL=base.d.ts.map