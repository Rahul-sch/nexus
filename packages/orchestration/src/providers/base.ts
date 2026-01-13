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

export abstract class BaseProvider {
  protected apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API key cannot be empty');
    }
    this.apiKey = apiKey;
  }

  abstract chat(options: {
    model: string;
    system: string;
    messages: ChatMessage[];
    temperature: number;
    maxTokens: number;
  }): Promise<ChatResponse>;
}
