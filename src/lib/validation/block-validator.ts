import type { ValidationResult } from '../types';

/**
 * Extracts JSON attribute objects from block comments.
 * Block attrs look like: <!-- wp:blockname {"key":"val"} --> or <!-- wp:blockname {"key":"val"} /-->
 * We need to handle nested braces in the JSON properly.
 */
function extractBlockAttrs(content: string): Array<{ json: string; pos: number }> {
  const results: Array<{ json: string; pos: number }> = [];
  // Find all block comment openings: <!-- wp:something
  const blockStart = /<!-- wp:\S+\s+\{/g;
  let match;
  while ((match = blockStart.exec(content)) !== null) {
    // Find the start of the JSON object
    const jsonStart = content.indexOf('{', match.index);
    if (jsonStart === -1) continue;

    // Track brace depth to find the matching closing brace
    let depth = 0;
    let i = jsonStart;
    let inString = false;
    let escaped = false;

    for (; i < content.length; i++) {
      const ch = content[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\' && inString) {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === '{') depth++;
      if (ch === '}') {
        depth--;
        if (depth === 0) {
          results.push({ json: content.slice(jsonStart, i + 1), pos: jsonStart });
          break;
        }
      }
    }
  }
  return results;
}

export function validateBlockMarkup(content: string, context: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // CRITICAL: Check for banned wp:html block
  if (/<!--\s*wp:html/.test(content)) {
    errors.push(`${context}: Contains banned wp:html block`);
  }

  // Check that block attribute JSON is parseable
  const attrs = extractBlockAttrs(content);
  for (const attr of attrs) {
    try {
      JSON.parse(attr.json);
    } catch {
      errors.push(
        `${context}: Invalid JSON in block attributes: ${attr.json.slice(0, 100)}`
      );
    }
  }

  // Check for balanced opening/closing block tags
  // First remove self-closing blocks to avoid counting them as openings
  const selfClosingRegex = /<!-- wp:[a-z][a-z0-9/-]*(?:\s[^]*?)?\s*\/-->/g;
  const nonScContent = content.replace(selfClosingRegex, '');

  // Count opening blocks
  const openRegex = /<!-- wp:([a-z][a-z0-9/-]*)/g;
  const openings: string[] = [];
  let oMatch;
  while ((oMatch = openRegex.exec(nonScContent)) !== null) {
    openings.push(oMatch[1]);
  }

  // Count closing blocks
  const closeRegex = /<!-- \/wp:([a-z][a-z0-9/-]*)\s*-->/g;
  const closings: string[] = [];
  let cMatch;
  while ((cMatch = closeRegex.exec(nonScContent)) !== null) {
    closings.push(cMatch[1]);
  }

  if (openings.length !== closings.length) {
    warnings.push(
      `${context}: Block tag mismatch — ${openings.length} opening vs ${closings.length} closing tags`
    );
  }

  // Check for empty content
  if (!content.trim()) {
    errors.push(`${context}: Content is empty`);
  }

  return { valid: errors.length === 0, errors, warnings };
}
