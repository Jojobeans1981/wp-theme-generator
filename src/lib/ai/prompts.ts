import type { ThemeRequest } from '../types';

export function buildSystemPrompt(): string {
  return `You are a WordPress theme.json designer. You produce ONLY valid JSON output — no markdown, no explanations.

## YOUR TASK
Generate a WordPress theme.json (version 3) configuration. Templates and patterns are pre-built — you ONLY design the visual system.

## RULES
1. Every color must be a valid 6-digit hex code (#RRGGBB).
2. The JSON must parse without errors. No trailing commas.
3. Return ONLY the JSON object — no wrapping, no code fences.

## OUTPUT FORMAT
Return EXACTLY this JSON structure:
{
  "themeJson": {
    "version": 3,
    "settings": {
      "color": {
        "palette": [
          {"slug": "primary", "color": "#HEX", "name": "Primary"},
          {"slug": "secondary", "color": "#HEX", "name": "Secondary"},
          {"slug": "accent", "color": "#HEX", "name": "Accent"},
          {"slug": "background", "color": "#HEX", "name": "Background"},
          {"slug": "foreground", "color": "#HEX", "name": "Foreground"}
        ]
      },
      "typography": {
        "fontFamilies": [
          {"fontFamily": "'Font Name', serif", "slug": "heading", "name": "Heading"},
          {"fontFamily": "'Font Name', sans-serif", "slug": "body", "name": "Body"}
        ],
        "fontSizes": [
          {"slug": "small", "size": "0.875rem", "name": "Small"},
          {"slug": "medium", "size": "1rem", "name": "Medium"},
          {"slug": "large", "size": "1.5rem", "name": "Large"},
          {"slug": "x-large", "size": "2.25rem", "name": "Extra Large"},
          {"slug": "xx-large", "size": "3.5rem", "name": "Double Extra Large"}
        ]
      },
      "spacing": {
        "units": ["px", "em", "rem", "vh", "vw", "%"],
        "spacingSizes": [
          {"slug": "10", "size": "0.5rem", "name": "Small"},
          {"slug": "20", "size": "1rem", "name": "Medium"},
          {"slug": "30", "size": "1.5rem", "name": "Large"},
          {"slug": "40", "size": "2.5rem", "name": "Extra Large"},
          {"slug": "50", "size": "4rem", "name": "Huge"}
        ]
      },
      "layout": {"contentSize": "800px", "wideSize": "1200px"},
      "appearanceTools": true,
      "useRootPaddingAwareAlignments": true
    },
    "styles": {
      "color": {
        "background": "var(--wp--preset--color--background)",
        "text": "var(--wp--preset--color--foreground)"
      },
      "typography": {
        "fontFamily": "var(--wp--preset--font-family--body)",
        "fontSize": "var(--wp--preset--font-size--medium)",
        "lineHeight": "1.7"
      },
      "elements": {
        "h1": {"typography": {"fontFamily": "var(--wp--preset--font-family--heading)", "fontSize": "var(--wp--preset--font-size--xx-large)"}},
        "h2": {"typography": {"fontFamily": "var(--wp--preset--font-family--heading)", "fontSize": "var(--wp--preset--font-size--x-large)"}},
        "h3": {"typography": {"fontFamily": "var(--wp--preset--font-family--heading)", "fontSize": "var(--wp--preset--font-size--large)"}},
        "link": {"color": {"text": "var(--wp--preset--color--accent)"}}
      },
      "blocks": {}
    },
    "templateParts": [
      {"name": "header", "title": "Header", "area": "header"},
      {"name": "footer", "title": "Footer", "area": "footer"}
    ]
  },
  "heroTitle": "A short, catchy hero headline for this theme",
  "heroSubtitle": "A one-sentence description that appears below the hero title",
  "styleCss": ""
}

IMPORTANT: Pick colors, fonts, and sizes that match the theme description. Be creative with the palette — don't use generic defaults.`;
}

export function buildUserPrompt(request: ThemeRequest): string {
  const slug =
    request.slug ||
    request.themeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  let prompt = `Generate a WordPress Block Theme with these specifications:

**Theme Name:** ${request.themeName}
**Theme Slug:** ${slug}
**Description:** ${request.description}
`;

  if (request.colorPalette) {
    prompt += `
**Color Palette:**
- Primary: ${request.colorPalette.primary}
- Secondary: ${request.colorPalette.secondary}
- Accent: ${request.colorPalette.accent}
- Background: ${request.colorPalette.background}
- Text/Foreground: ${request.colorPalette.foreground}
`;
  } else {
    prompt += `\n**Color Palette:** Choose a cohesive, visually striking palette that fits the description. Include primary, secondary, accent, background, and foreground colors.\n`;
  }

  if (request.typography) {
    prompt += `
**Typography:**
- Heading Font: ${request.typography.headingFont}
- Body Font: ${request.typography.bodyFont}
`;
  } else {
    prompt += `\n**Typography:** Choose complementary Google Fonts that suit the theme's mood. One for headings, one for body text.\n`;
  }

  if (request.features?.length) {
    prompt += `\n**Site Type / Features:** ${request.features.join(', ')}\n`;
  }

  prompt += `
**REMINDERS:**
- Return ONLY the JSON object. No markdown. No code fences. No explanation.
- The theme must look visually impressive and unique — not a generic starter theme.
- Use Cover blocks for heroes, Group blocks for sections, Columns for layouts.
- Apply color and font via theme.json palette slugs, not inline styles.
- NEVER use <!-- wp:html --> anywhere.
- Include at least 3 unique patterns that showcase the theme's design language.
- The header pattern should include site-title and navigation.
- The footer should include columns with useful content (links, copyright, etc).
- The index template must include a Query Loop for displaying posts.
- The 404 template should be helpful and on-brand, not just "Page not found."
`;

  return prompt;
}
