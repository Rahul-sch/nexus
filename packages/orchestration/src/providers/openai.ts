import OpenAI from 'openai';
import { BaseProvider, ChatMessage, ChatResponse } from './base.js';

export class OpenAIProvider extends BaseProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    super(apiKey);
    this.client = new OpenAI({ apiKey });
  }

  async chat(options: {
    model: string;
    system: string;
    messages: ChatMessage[];
    temperature: number;
    maxTokens: number;
  }): Promise<ChatResponse> {
    const messagesWithSystem: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: options.system },
      ...options.messages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
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

export function createOpenAIProvider(apiKey: string): OpenAIProvider {
  return new OpenAIProvider(apiKey);
}
