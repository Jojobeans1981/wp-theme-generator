import { describe, it, expect } from 'vitest';
import { parseAIResponse } from '@/lib/ai/parser';
import { MOCK_GENERATED_THEME } from '../fixtures';

describe('parseAIResponse', () => {
  it('parses valid JSON response', () => {
    const raw = JSON.stringify(MOCK_GENERATED_THEME);
    const result = parseAIResponse(raw);
    expect(result.themeJson.version).toBe(3);
    expect(result.templates.length).toBeGreaterThan(0);
    expect(result.patterns.length).toBeGreaterThanOrEqual(3);
  });

  it('strips markdown code fences before parsing', () => {
    const raw = '```json\n' + JSON.stringify(MOCK_GENERATED_THEME) + '\n```';
    const result = parseAIResponse(raw);
    expect(result.themeJson.version).toBe(3);
  });

  it('strips plain code fences before parsing', () => {
    const raw = '```\n' + JSON.stringify(MOCK_GENERATED_THEME) + '\n```';
    const result = parseAIResponse(raw);
    expect(result.themeJson.version).toBe(3);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseAIResponse('not valid json')).toThrow('AI returned invalid JSON');
  });

  it('throws on valid JSON that fails schema', () => {
    const raw = JSON.stringify({ hello: 'world' });
    expect(() => parseAIResponse(raw)).toThrow('schema validation');
  });
});
