import { generatedThemeSchema } from '../theme/schema';
import type { GeneratedTheme } from '../types';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Patch common gaps in LLM output before schema validation.
 * Llama 3.3 frequently omits slugs, color settings, and other fields
 * that Claude always includes. Rather than rejecting, we fill defaults.
 */
function patchAIOutput(data: Record<string, unknown>): Record<string, unknown> {
  const tj = data.themeJson as Record<string, unknown> | undefined;
  if (!tj) return data;

  // Ensure settings exists
  if (!tj.settings) tj.settings = {};
  const settings = tj.settings as Record<string, unknown>;

  // Ensure settings.color exists with a default palette
  if (!settings.color) {
    settings.color = {
      palette: [
        { slug: 'primary', color: '#4F46E5', name: 'Primary' },
        { slug: 'secondary', color: '#1E293B', name: 'Secondary' },
        { slug: 'accent', color: '#F59E0B', name: 'Accent' },
        { slug: 'background', color: '#FFFFFF', name: 'Background' },
        { slug: 'foreground', color: '#1E1E1E', name: 'Foreground' },
      ],
    };
  }

  // Ensure palette entries have slugs
  const color = settings.color as Record<string, unknown>;
  if (Array.isArray(color.palette)) {
    color.palette = (color.palette as Record<string, unknown>[]).map((c, i) => ({
      slug: c.slug || slugify((c.name as string) || `color-${i}`),
      color: c.color || '#000000',
      name: c.name || `Color ${i + 1}`,
      ...c,
    }));
  }

  // Ensure typography.fontFamilies have slugs and names
  const typo = settings.typography as Record<string, unknown> | undefined;
  if (typo && Array.isArray(typo.fontFamilies)) {
    typo.fontFamilies = (typo.fontFamilies as Record<string, unknown>[]).map((f, i) => {
      const family = (f.fontFamily as string) || `Font ${i + 1}`;
      return {
        slug: f.slug || slugify(f.name as string || family),
        name: f.name || family.replace(/["']/g, '').split(',')[0].trim(),
        ...f,
      };
    });
  }

  // Ensure styleCss exists
  if (data.styleCss === undefined || data.styleCss === null) {
    data.styleCss = '';
  }

  return data;
}

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

  // Patch common LLM output gaps before validation
  if (parsed && typeof parsed === 'object') {
    parsed = patchAIOutput(parsed as Record<string, unknown>);
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
