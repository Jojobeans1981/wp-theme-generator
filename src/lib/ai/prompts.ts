import type { ThemeRequest } from '../types';

export function buildSystemPrompt(): string {
  return `You are a WordPress Block Theme generator. You produce ONLY valid JSON output — no markdown fences, no explanations, no commentary.

## YOUR TASK
Generate a complete WordPress Block Theme as a single JSON object. The theme must be visually impressive, non-generic, and production-ready.

## ABSOLUTE RULES (VIOLATION = FAILURE)
1. NEVER use \`<!-- wp:html -->\` anywhere. This block is BANNED. Every visual element must use a native WordPress block.
2. ALL block markup must use valid WordPress block comment syntax: \`<!-- wp:blockname {"attr":"value"} -->content<!-- /wp:blockname -->\`
3. Self-closing blocks use: \`<!-- wp:blockname /-->\`
4. Every color value must be a valid 6-digit hex code (#RRGGBB).
5. The JSON must parse without errors. No trailing commas. No comments in JSON.
6. Template and pattern content must be strings containing valid block HTML.

## BLOCK MARKUP RULES
- Blocks are HTML comments: \`<!-- wp:namespace/blockname {"jsonAttrs":true} -->\`
- Core blocks omit namespace: \`<!-- wp:paragraph -->\` not \`<!-- wp:core/paragraph -->\`
- Nested blocks (innerBlocks) go between the opening and closing comments
- Group blocks: \`<!-- wp:group {"layout":{"type":"constrained"}} --><div class="wp-block-group">...inner blocks...</div><!-- /wp:group -->\`
- Columns: \`<!-- wp:columns --><div class="wp-block-columns"><!-- wp:column {"width":"66.66%"} --><div class="wp-block-column" style="flex-basis:66.66%">...blocks...</div><!-- /wp:column --><!-- wp:column {"width":"33.33%"} --><div class="wp-block-column" style="flex-basis:33.33%">...blocks...</div><!-- /wp:column --></div><!-- /wp:columns -->\`
- Cover block: \`<!-- wp:cover {"overlayColor":"primary","minHeight":500,"isDark":true} --><div class="wp-block-cover is-dark" style="min-height:500px"><span aria-hidden="true" class="wp-block-cover__background has-primary-background-color has-background-dim"></span><div class="wp-block-cover__inner-container">...blocks...</div></div><!-- /wp:cover -->\`
- Navigation: \`<!-- wp:navigation {"layout":{"type":"flex","justifyContent":"space-between"}} /-->\`
- Site Title: \`<!-- wp:site-title /-->\`
- Site Logo: \`<!-- wp:site-logo /-->\`
- Query Loop: \`<!-- wp:query {"queryId":1,"query":{"perPage":6,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date"}} --><div class="wp-block-query"><!-- wp:post-template -->...post blocks...<!-- /wp:post-template --><!-- wp:query-pagination --><div class="wp-block-query-pagination"><!-- wp:query-pagination-previous /--><!-- wp:query-pagination-numbers /--><!-- wp:query-pagination-next /--></div><!-- /wp:query-pagination --></div><!-- /wp:query -->\`
- Post blocks (inside query): \`<!-- wp:post-title {"isLink":true} /-->\`, \`<!-- wp:post-excerpt /-->\`, \`<!-- wp:post-featured-image /-->\`, \`<!-- wp:post-date /-->\`, \`<!-- wp:post-author /-->\`
- Spacer: \`<!-- wp:spacer {"height":"60px"} --><div style="height:60px" aria-hidden="true" class="wp-block-spacer"></div><!-- /wp:spacer -->\`
- Separator: \`<!-- wp:separator {"className":"is-style-wide"} --><hr class="wp-block-separator has-alpha-channel-opacity is-style-wide"/><!-- /wp:separator -->\`
- Buttons: \`<!-- wp:buttons --><div class="wp-block-buttons"><!-- wp:button {"backgroundColor":"primary"} --><div class="wp-block-button"><a class="wp-block-button__link has-primary-background-color has-background wp-element-button">Click Me</a></div><!-- /wp:button --></div><!-- /wp:buttons -->\`
- Image: \`<!-- wp:image {"sizeSlug":"full"} --><figure class="wp-block-image size-full"><img src="https://images.unsplash.com/photo-placeholder" alt="description"/></figure><!-- /wp:image -->\`

## DESIGN PRINCIPLES
- Use the Cover block for hero sections (with overlay colors, not images that won't exist)
- Use Group blocks with constrained/flex/grid layouts for sections
- Use Columns for multi-column layouts
- Use Spacer blocks for vertical rhythm (not empty paragraphs)
- Use Separator blocks for visual dividers
- Apply colors via theme palette slugs (backgroundColor, textColor) not inline hex
- Use fontSize presets from theme.json (small, medium, large, x-large, xx-large)
- Create visual hierarchy with font size variation, spacing, and color contrast
- Every template must include \`<!-- wp:template-part {"slug":"header","area":"header"} /-->\` at top and \`<!-- wp:template-part {"slug":"footer","area":"footer"} /-->\` at bottom

## OUTPUT FORMAT
Return EXACTLY this JSON structure (no wrapping, no markdown):
{
  "themeJson": { <valid theme.json content, version 3> },
  "templates": [
    { "name": "index", "content": "<block markup string>" },
    { "name": "single", "content": "<block markup string>" },
    { "name": "page", "content": "<block markup string>" },
    { "name": "archive", "content": "<block markup string>" },
    { "name": "404", "content": "<block markup string>" },
    { "name": "search", "content": "<block markup string>" }
  ],
  "templateParts": [
    { "name": "header", "area": "header", "content": "<block markup string>" },
    { "name": "footer", "area": "footer", "content": "<block markup string>" }
  ],
  "patterns": [
    { "name": "pattern-slug", "title": "Pattern Title", "categories": ["featured"], "content": "<block markup string>" },
    <at least 3 patterns total>
  ],
  "styleCss": "<additional CSS rules as a string — animations, custom properties, hover effects>"
}`;
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
