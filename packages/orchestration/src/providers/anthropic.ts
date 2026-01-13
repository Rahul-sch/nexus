import Anthropic from '@anthropic-ai/sdk';
import { BaseProvider, ChatMessage, ChatResponse } from './base.js';

export class AnthropicProvider extends BaseProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    super(apiKey);
    this.client = new Anthropic({ apiKey });
  }

  async chat(options: {
    model: string;
    system: string;
    messages: ChatMessage[];
    temperature: number;
    maxTokens: number;
  }): Promise<ChatResponse> {
    const response = await this.client.messages.create({
      model: options.model,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      system: options.system,
      messages: options.messages.map(m => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: m.content
      })) as Anthropic.MessageParam[]
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

export function createAnthropicProvider(apiKey: string): AnthropicProvider {
  return new AnthropicProvider(apiKey);
}
