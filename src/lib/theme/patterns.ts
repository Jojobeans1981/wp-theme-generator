import type { PatternFile } from '../types';
import type { ThemeFileOutput } from './templates';

export function buildPatternFiles(
  patterns: PatternFile[],
  themeSlug: string
): ThemeFileOutput[] {
  return patterns.map((p) => {
    const phpHeader = `<?php
/**
 * Title: ${p.title}
 * Slug: ${themeSlug}/${p.name}
 * Categories: ${p.categories.join(', ')}
 */
?>
`;
    return {
      path: `patterns/${p.name}.php`,
      content: phpHeader + p.content,
    };
  });
}
