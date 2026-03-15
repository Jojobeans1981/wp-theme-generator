import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/ai/prompts';
import type { ThemeRequest } from '@/lib/types';

describe('buildSystemPrompt', () => {
  const systemPrompt = buildSystemPrompt();

  it('contains wp:html ban', () => {
    expect(systemPrompt).toContain('wp:html');
    expect(systemPrompt).toContain('BANNED');
  });

  it('contains JSON output instruction', () => {
    expect(systemPrompt).toContain('valid JSON output');
    expect(systemPrompt).toContain('OUTPUT FORMAT');
  });
});

describe('buildUserPrompt', () => {
  it('includes theme name and description', () => {
    const request: ThemeRequest = {
      themeName: 'My Test Theme',
      description: 'A simple test theme for validation purposes and testing',
    };
    const prompt = buildUserPrompt(request);
    expect(prompt).toContain('My Test Theme');
    expect(prompt).toContain('A simple test theme');
  });

  it('includes colors when provided', () => {
    const request: ThemeRequest = {
      themeName: 'Color Theme',
      description: 'A theme with custom colors for testing purposes',
      colorPalette: {
        primary: '#FF0000',
        secondary: '#00FF00',
        accent: '#0000FF',
        background: '#FFFFFF',
        foreground: '#000000',
      },
    };
    const prompt = buildUserPrompt(request);
    expect(prompt).toContain('#FF0000');
    expect(prompt).toContain('#00FF00');
    expect(prompt).toContain('Primary');
  });

  it('omits colors section when not provided', () => {
    const request: ThemeRequest = {
      themeName: 'No Colors',
      description: 'A theme without explicit colors provided',
    };
    const prompt = buildUserPrompt(request);
    expect(prompt).toContain('Choose a cohesive');
    expect(prompt).not.toContain('#FF0000');
  });

  it('includes typography when provided', () => {
    const request: ThemeRequest = {
      themeName: 'Font Theme',
      description: 'A theme with custom typography configuration',
      typography: { headingFont: 'Oswald', bodyFont: 'Lato' },
    };
    const prompt = buildUserPrompt(request);
    expect(prompt).toContain('Oswald');
    expect(prompt).toContain('Lato');
  });
});
