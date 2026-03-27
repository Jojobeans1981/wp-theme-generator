/**
 * Fixes common WordPress block markup errors produced by LLMs.
 * WordPress block parser is extremely strict about HTML matching comments.
 * This fixer rewrites inner HTML to match what WordPress actually expects.
 */

/**
 * Fix group blocks: ensure inner div has correct class
 */
function fixGroupBlocks(content: string): string {
  // Fix group blocks with missing or wrong wrapper
  return content.replace(
    /<!-- wp:group(\s+\{[^]*?\})?\s*-->([\s\S]*?)<!-- \/wp:group\s*-->/g,
    (match, attrsStr, inner) => {
      const attrs = attrsStr ? attrsStr.trim() : '';
      // Check if inner content already has the correct wrapper
      if (inner.trim().startsWith('<div class="wp-block-group')) {
        return match; // Already correct
      }
      // Wrap inner content in correct div
      const cleanInner = inner.replace(/^<div[^>]*>/, '').replace(/<\/div>\s*$/, '');
      return `<!-- wp:group${attrs ? ' ' + attrs : ''} --><div class="wp-block-group">${cleanInner}</div><!-- /wp:group -->`;
    }
  );
}

/**
 * Fix cover blocks: ensure proper inner structure
 */
function fixCoverBlocks(content: string): string {
  return content.replace(
    /<!-- wp:cover(\s+\{[^]*?\})?\s*-->([\s\S]*?)<!-- \/wp:cover\s*-->/g,
    (match, attrsStr, inner) => {
      // If it already has wp-block-cover class, leave it
      if (inner.includes('wp-block-cover__inner-container')) {
        return match;
      }
      const attrs = attrsStr ? attrsStr.trim() : '';
      let parsedAttrs: Record<string, unknown> = {};
      try {
        if (attrs) parsedAttrs = JSON.parse(attrs);
      } catch { /* ignore */ }

      const minHeight = parsedAttrs.minHeight || 500;
      const isDark = parsedAttrs.isDark ? ' is-dark' : '';
      const overlayColor = parsedAttrs.overlayColor as string || 'primary';

      // Extract any block comments from inner content
      const blockContent = inner.replace(/<[^>]*>/g, '').trim() ? inner :
        inner.replace(/^<div[^>]*>/, '').replace(/<\/div>\s*$/, '');

      return `<!-- wp:cover${attrs ? ' ' + attrs : ''} --><div class="wp-block-cover${isDark}" style="min-height:${minHeight}px"><span aria-hidden="true" class="wp-block-cover__background has-${overlayColor}-background-color has-background-dim"></span><div class="wp-block-cover__inner-container">${blockContent}</div></div><!-- /wp:cover -->`;
    }
  );
}

/**
 * Fix columns blocks
 */
function fixColumnsBlocks(content: string): string {
  // Fix outer columns wrapper
  content = content.replace(
    /<!-- wp:columns(\s+\{[^]*?\})?\s*-->([\s\S]*?)<!-- \/wp:columns\s*-->/g,
    (match, attrs, inner) => {
      if (inner.trim().startsWith('<div class="wp-block-columns')) {
        return match;
      }
      const cleanInner = inner.replace(/^<div[^>]*>/, '').replace(/<\/div>\s*$/, '');
      return `<!-- wp:columns${attrs || ''} --><div class="wp-block-columns">${cleanInner}</div><!-- /wp:columns -->`;
    }
  );

  // Fix individual column wrappers
  content = content.replace(
    /<!-- wp:column(\s+\{[^]*?\})?\s*-->([\s\S]*?)<!-- \/wp:column\s*-->/g,
    (match, attrs, inner) => {
      if (inner.trim().startsWith('<div class="wp-block-column')) {
        return match;
      }
      const cleanInner = inner.replace(/^<div[^>]*>/, '').replace(/<\/div>\s*$/, '');
      return `<!-- wp:column${attrs || ''} --><div class="wp-block-column">${cleanInner}</div><!-- /wp:column -->`;
    }
  );

  return content;
}

/**
 * Fix buttons blocks
 */
function fixButtonsBlocks(content: string): string {
  return content.replace(
    /<!-- wp:buttons(\s+\{[^]*?\})?\s*-->([\s\S]*?)<!-- \/wp:buttons\s*-->/g,
    (match, attrs, inner) => {
      if (inner.trim().startsWith('<div class="wp-block-buttons')) {
        return match;
      }
      const cleanInner = inner.replace(/^<div[^>]*>/, '').replace(/<\/div>\s*$/, '');
      return `<!-- wp:buttons${attrs || ''} --><div class="wp-block-buttons">${cleanInner}</div><!-- /wp:buttons -->`;
    }
  );
}

/**
 * Fix query blocks
 */
function fixQueryBlocks(content: string): string {
  return content.replace(
    /<!-- wp:query(\s+\{[^]*?\})?\s*-->([\s\S]*?)<!-- \/wp:query\s*-->/g,
    (match, attrs, inner) => {
      if (inner.trim().startsWith('<div class="wp-block-query')) {
        return match;
      }
      const cleanInner = inner.replace(/^<div[^>]*>/, '').replace(/<\/div>\s*$/, '');
      return `<!-- wp:query${attrs || ''} --><div class="wp-block-query">${cleanInner}</div><!-- /wp:query -->`;
    }
  );
}

/**
 * Fix paragraph blocks
 */
function fixParagraphBlocks(content: string): string {
  return content.replace(
    /<!-- wp:paragraph(\s+\{[^]*?\})?\s*-->([\s\S]*?)<!-- \/wp:paragraph\s*-->/g,
    (match, attrsStr, inner) => {
      // If inner already starts with <p, it's probably fine
      if (inner.trim().startsWith('<p')) {
        return match;
      }
      let className = '';
      try {
        if (attrsStr) {
          const attrs = JSON.parse(attrsStr.trim());
          const classes: string[] = [];
          if (attrs.align) classes.push(`has-text-align-${attrs.align}`);
          if (attrs.fontSize) classes.push(`has-${attrs.fontSize}-font-size`);
          if (classes.length) className = ` class="${classes.join(' ')}"`;
        }
      } catch { /* ignore */ }
      return `<!-- wp:paragraph${attrsStr || ''} --><p${className}>${inner.trim()}</p><!-- /wp:paragraph -->`;
    }
  );
}

/**
 * Fix heading blocks
 */
function fixHeadingBlocks(content: string): string {
  return content.replace(
    /<!-- wp:heading(\s+\{[^]*?\})?\s*-->([\s\S]*?)<!-- \/wp:heading\s*-->/g,
    (match, attrsStr, inner) => {
      if (inner.trim().match(/^<h[1-6]/)) {
        return match;
      }
      let level = 2;
      let className = '';
      try {
        if (attrsStr) {
          const attrs = JSON.parse(attrsStr.trim());
          if (attrs.level) level = attrs.level;
          const classes: string[] = [];
          if (attrs.textAlign) classes.push(`has-text-align-${attrs.textAlign}`);
          if (attrs.fontSize) classes.push(`has-${attrs.fontSize}-font-size`);
          if (classes.length) className = ` class="${classes.join(' ')}"`;
        }
      } catch { /* ignore */ }
      return `<!-- wp:heading${attrsStr || ''} --><h${level}${className}>${inner.trim()}</h${level}><!-- /wp:heading -->`;
    }
  );
}

/**
 * Apply all block fixes to a content string.
 */
export function fixBlockMarkup(content: string): string {
  let fixed = content;
  fixed = fixGroupBlocks(fixed);
  fixed = fixCoverBlocks(fixed);
  fixed = fixColumnsBlocks(fixed);
  fixed = fixButtonsBlocks(fixed);
  fixed = fixQueryBlocks(fixed);
  fixed = fixParagraphBlocks(fixed);
  fixed = fixHeadingBlocks(fixed);
  return fixed;
}
