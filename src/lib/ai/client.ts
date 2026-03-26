import Anthropic from '@anthropic-ai/sdk';

const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';

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

class GroqProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_completion_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      if (response.status === 429) {
        throw Object.assign(new Error('Rate limited by Groq. Please wait a moment.'), { status: 429 });
      }
      throw new Error(`Groq API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No text response from Groq');
    }
    return content;
  }
}

export function createAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || 'groq';

  if (provider === 'anthropic') {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    const model = process.env.AI_MODEL || DEFAULT_ANTHROPIC_MODEL;
    return new AnthropicProvider(apiKey, model);
  }

  // Default: Groq
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is required. Get a free key at https://console.groq.com');
  }
  const model = process.env.AI_MODEL || DEFAULT_GROQ_MODEL;
  return new GroqProvider(apiKey, model);
}
