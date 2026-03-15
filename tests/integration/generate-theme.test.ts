import { describe, it, expect } from 'vitest';
import { parseAIResponse } from '@/lib/ai/parser';
import { validateTheme } from '@/lib/validation/theme-validator';
import { packageTheme } from '@/lib/theme/packager';
import { MOCK_THEME_REQUEST, MOCK_GENERATED_THEME } from '../fixtures';

// This test exercises the full pipeline with a mock AI response
// (no actual API call — the mock fixture simulates what Claude returns)

describe('End-to-end theme generation', () => {
  it('generates a valid, downloadable theme from a description', async () => {
    // 1. Simulate AI response (as if from Claude)
    const mockRawResponse = JSON.stringify(MOCK_GENERATED_THEME);

    // 2. Parse the AI response
    const theme = parseAIResponse(mockRawResponse);
    expect(theme.themeJson.version).toBe(3);
    expect(theme.templates.length).toBeGreaterThanOrEqual(1);
    expect(theme.patterns.length).toBeGreaterThanOrEqual(3);

    // 3. Validate the theme
    const validation = validateTheme(theme, 'dark-portfolio');
    expect(validation.errors).toHaveLength(0);
    expect(validation.valid).toBe(true);

    // 4. Package into ZIP
    const zipBuffer = await packageTheme(MOCK_THEME_REQUEST, theme);
    expect(zipBuffer).toBeInstanceOf(Buffer);
    expect(zipBuffer.length).toBeGreaterThan(0);

    // 5. Verify ZIP has PK signature
    expect(zipBuffer[0]).toBe(0x50);
    expect(zipBuffer[1]).toBe(0x4b);

    // 6. Scan entries for expected files
    const bufStr = zipBuffer.toString('binary');
    expect(bufStr).toContain('dark-portfolio/theme.json');
    expect(bufStr).toContain('dark-portfolio/style.css');
    expect(bufStr).toContain('dark-portfolio/functions.php');
    expect(bufStr).toContain('dark-portfolio/templates/index.html');
    expect(bufStr).toContain('dark-portfolio/parts/header.html');
    expect(bufStr).toContain('dark-portfolio/parts/footer.html');
    expect(bufStr).toContain('dark-portfolio/patterns/');

    // 7. Verify no wp:html in any template
    for (const template of theme.templates) {
      expect(template.content).not.toContain('wp:html');
    }
    for (const part of theme.templateParts) {
      expect(part.content).not.toContain('wp:html');
    }
    for (const pattern of theme.patterns) {
      expect(pattern.content).not.toContain('wp:html');
    }
  });
});
