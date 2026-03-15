import { generatedThemeSchema } from '../theme/schema';
import type { GeneratedTheme } from '../types';

export function parseAIResponse(raw: string): GeneratedTheme {
  let cleaned = raw.trim();

  // Strip markdown fences if the model adds them despite instructions
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(
      `AI returned invalid JSON: ${(e as Error).message}\n\nFirst 500 chars: ${cleaned.slice(0, 500)}`
    );
  }

  // Validate against schema
  const result = generatedThemeSchema.safeParse(parsed);
  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`AI output failed schema validation:\n${errors}`);
  }

  return result.data as GeneratedTheme;
}
