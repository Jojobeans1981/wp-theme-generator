import { describe, it, expect } from 'vitest';
import { buildThemeJson } from '@/lib/theme/theme-json';
import { MOCK_GENERATED_THEME } from '../fixtures';

describe('buildThemeJson', () => {
  const output = buildThemeJson(MOCK_GENERATED_THEME.themeJson);
  const parsed = JSON.parse(output);

  it('generates valid theme.json with schema URL', () => {
    expect(parsed.$schema).toBe('https://schemas.wp.org/wp/6.4/theme.json');
  });

  it('includes all palette colors', () => {
    expect(parsed.settings.color.palette).toHaveLength(5);
    const slugs = parsed.settings.color.palette.map((c: { slug: string }) => c.slug);
    expect(slugs).toContain('primary');
    expect(slugs).toContain('secondary');
    expect(slugs).toContain('background');
  });

  it('includes font families', () => {
    expect(parsed.settings.typography.fontFamilies.length).toBeGreaterThanOrEqual(1);
    const slugs = parsed.settings.typography.fontFamilies.map(
      (f: { slug: string }) => f.slug
    );
    expect(slugs).toContain('heading');
    expect(slugs).toContain('body');
  });

  it('sets version to 3', () => {
    expect(parsed.version).toBe(3);
  });
});
