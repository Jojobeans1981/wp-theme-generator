import { describe, it, expect } from 'vitest';
import { themeRequestSchema, generatedThemeSchema } from '@/lib/theme/schema';
import { MOCK_GENERATED_THEME } from '../fixtures';

describe('themeRequestSchema', () => {
  it('validates correct ThemeRequest', () => {
    const result = themeRequestSchema.safeParse({
      description: 'A minimal dark photography portfolio with hero section',
      themeName: 'Dark Portfolio',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty description', () => {
    const result = themeRequestSchema.safeParse({
      description: 'short',
      themeName: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid hex colors', () => {
    const result = themeRequestSchema.safeParse({
      description: 'A minimal dark photography portfolio with hero section',
      themeName: 'Test Theme',
      colorPalette: {
        primary: 'red',
        secondary: '#000',
        accent: '#FF0000',
        background: '#FFFFFF',
        foreground: '#000000',
      },
    });
    expect(result.success).toBe(false);
  });

  it('rejects slug with spaces or uppercase', () => {
    const result = themeRequestSchema.safeParse({
      description: 'A minimal dark photography portfolio with hero section',
      themeName: 'Test Theme',
      slug: 'Bad Slug',
    });
    expect(result.success).toBe(false);
  });
});

describe('generatedThemeSchema', () => {
  it('validates complete GeneratedTheme structure', () => {
    const result = generatedThemeSchema.safeParse(MOCK_GENERATED_THEME);
    expect(result.success).toBe(true);
  });

  it('accepts theme without templates (pre-built templates used)', () => {
    const minimal = {
      ...MOCK_GENERATED_THEME,
      templates: undefined,
      templateParts: undefined,
      patterns: undefined,
    };
    const result = generatedThemeSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it('accepts theme with heroTitle and heroSubtitle', () => {
    const withHero = {
      ...MOCK_GENERATED_THEME,
      heroTitle: 'Welcome',
      heroSubtitle: 'A great site',
    };
    const result = generatedThemeSchema.safeParse(withHero);
    expect(result.success).toBe(true);
  });
});
