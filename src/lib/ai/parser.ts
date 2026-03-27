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
function normalizeHex(color: unknown): string {
  if (typeof color !== 'string') return '#000000';
  const c = color.trim();
  // Already valid 6-digit hex
  if (/^#[0-9a-fA-F]{6}$/.test(c)) return c;
  // 3-digit hex → expand
  const m3 = c.match(/^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/);
  if (m3) return `#${m3[1]}${m3[1]}${m3[2]}${m3[2]}${m3[3]}${m3[3]}`;
  // Named colors or garbage → fallback
  return '#000000';
}

function patchAIOutput(data: Record<string, unknown>): Record<string, unknown> {
  const tj = data.themeJson as Record<string, unknown> | undefined;
  if (!tj) return data;

  // Ensure version
  if (!tj.version) tj.version = 3;

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

  // Ensure palette entries have slugs and valid hex colors
  const color = settings.color as Record<string, unknown>;
  if (Array.isArray(color.palette)) {
    color.palette = (color.palette as Record<string, unknown>[]).map((c, i) => ({
      slug: c.slug || slugify((c.name as string) || `color-${i}`),
      color: normalizeHex(c.color),
      name: c.name || `Color ${i + 1}`,
    }));
  } else {
    color.palette = [
      { slug: 'primary', color: '#4F46E5', name: 'Primary' },
      { slug: 'background', color: '#FFFFFF', name: 'Background' },
      { slug: 'foreground', color: '#1E1E1E', name: 'Foreground' },
    ];
  }

  // Ensure typography exists with at least one font family
  if (!settings.typography) {
    settings.typography = {
      fontFamilies: [
        { fontFamily: '"Inter", sans-serif', slug: 'body', name: 'Body' },
        { fontFamily: '"Georgia", serif', slug: 'heading', name: 'Heading' },
      ],
    };
  }

  const typo = settings.typography as Record<string, unknown>;
  if (!Array.isArray(typo.fontFamilies) || typo.fontFamilies.length === 0) {
    typo.fontFamilies = [
      { fontFamily: '"Inter", sans-serif', slug: 'body', name: 'Body' },
      { fontFamily: '"Georgia", serif', slug: 'heading', name: 'Heading' },
    ];
  } else {
    typo.fontFamilies = (typo.fontFamilies as Record<string, unknown>[]).map((f, i) => {
      const family = (f.fontFamily as string) || `Font ${i + 1}`;
      return {
        slug: f.slug || slugify((f.name as string) || family),
        name: f.name || family.replace(/["']/g, '').split(',')[0].trim(),
        fontFamily: family,
        ...f,
      };
    });
  }

  // Fix styles fields where Llama sends wrong types
  if (tj.styles && typeof tj.styles === 'object') {
    const styles = tj.styles as Record<string, unknown>;
    if (styles.typography && typeof styles.typography === 'object') {
      const stylesTypo = styles.typography as Record<string, unknown>;
      // Llama sometimes sends fontFamily as an array instead of a string
      if (Array.isArray(stylesTypo.fontFamily)) {
        stylesTypo.fontFamily = (stylesTypo.fontFamily as string[]).join(', ');
      }
      if (Array.isArray(stylesTypo.fontSize)) {
        stylesTypo.fontSize = String((stylesTypo.fontSize as unknown[])[0] || '1rem');
      }
    }
  }

  // Ensure styleCss exists
  if (data.styleCss === undefined || data.styleCss === null) {
    data.styleCss = '';
  }

  // Ensure templateParts is an array
  if (!Array.isArray(data.templateParts)) {
    data.templateParts = [
      { name: 'header', area: 'header', content: '<!-- wp:site-title /--><!-- wp:navigation /-->' },
      { name: 'footer', area: 'footer', content: '<!-- wp:group {"layout":{"type":"constrained"}} --><div class="wp-block-group"><!-- wp:paragraph {"align":"center"} --><p class="has-text-align-center">Powered by WordPress</p><!-- /wp:paragraph --></div><!-- /wp:group -->' },
    ];
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
