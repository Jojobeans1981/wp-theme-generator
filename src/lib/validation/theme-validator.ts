import type { GeneratedTheme, ValidationResult } from '../types';
import { validateBlockMarkup } from './block-validator';

export function validateTheme(theme: GeneratedTheme, slug: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.push('Theme slug must be lowercase alphanumeric with hyphens only');
  }

  // Check required templates
  const templateNames = theme.templates.map((t) => t.name);
  if (!templateNames.includes('index')) {
    errors.push('Missing required template: index');
  }

  // Check required template parts
  const partNames = theme.templateParts.map((p) => p.name);
  if (!partNames.includes('header')) {
    errors.push('Missing required template part: header');
  }
  if (!partNames.includes('footer')) {
    errors.push('Missing required template part: footer');
  }

  // Check minimum patterns
  if (theme.patterns.length < 1) {
    errors.push(`At least 1 pattern required, got ${theme.patterns.length}`);
  }

  // Check theme.json version
  if (theme.themeJson.version !== 3) {
    errors.push(`theme.json version must be 3, got ${theme.themeJson.version}`);
  }

  // Check theme.json has required settings
  if (!theme.themeJson.settings.color.palette.length) {
    errors.push('theme.json must have at least one color in palette');
  }
  if (!theme.themeJson.settings.typography.fontFamilies.length) {
    errors.push('theme.json must have at least one font family');
  }
  if (!theme.themeJson.settings.layout.contentSize) {
    errors.push('theme.json must have layout.contentSize');
  }

  // Validate all block markup
  const allContent = [
    ...theme.templates.map((t) => ({ content: t.content, context: `template:${t.name}` })),
    ...theme.templateParts.map((t) => ({
      content: t.content,
      context: `part:${t.name}`,
    })),
    ...theme.patterns.map((p) => ({
      content: p.content,
      context: `pattern:${p.name}`,
    })),
  ];

  for (const { content, context } of allContent) {
    const result = validateBlockMarkup(content, context);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  return { valid: errors.length === 0, errors, warnings };
}
