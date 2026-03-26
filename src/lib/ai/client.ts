import Anthropic from '@anthropic-ai/sdk';

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

export interface AIProvider {
  generate(systemPrompt: string, userPrompt: string): Promise<string>;
}

class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 16000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from AI provider');
    }
    return textBlock.text;
  }
}

export function createAIProvider(): AIProvider {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }
  const model = process.env.AI_MODEL || DEFAULT_MODEL;
  return new AnthropicProvider(apiKey, model);
}
