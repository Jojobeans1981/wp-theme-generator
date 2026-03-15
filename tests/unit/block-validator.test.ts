import { describe, it, expect } from 'vitest';
import { validateBlockMarkup } from '@/lib/validation/block-validator';

describe('validateBlockMarkup', () => {
  it('accepts valid paragraph block', () => {
    const content = '<!-- wp:paragraph --><p>Hello world</p><!-- /wp:paragraph -->';
    const result = validateBlockMarkup(content, 'test');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('accepts valid nested group with columns', () => {
    const content = `<!-- wp:group {"layout":{"type":"constrained"}} --><div class="wp-block-group"><!-- wp:columns --><div class="wp-block-columns"><!-- wp:column --><div class="wp-block-column"><!-- wp:paragraph --><p>Col 1</p><!-- /wp:paragraph --></div><!-- /wp:column --><!-- wp:column --><div class="wp-block-column"><!-- wp:paragraph --><p>Col 2</p><!-- /wp:paragraph --></div><!-- /wp:column --></div><!-- /wp:columns --></div><!-- /wp:group -->`;
    const result = validateBlockMarkup(content, 'test');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects wp:html block', () => {
    const content = '<!-- wp:html --><div>Custom HTML</div><!-- /wp:html -->';
    const result = validateBlockMarkup(content, 'test');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('wp:html'))).toBe(true);
  });

  it('rejects wp:html even when nested inside other blocks', () => {
    const content =
      '<!-- wp:group --><div class="wp-block-group"><!-- wp:html --><div>bad</div><!-- /wp:html --></div><!-- /wp:group -->';
    const result = validateBlockMarkup(content, 'test');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('wp:html'))).toBe(true);
  });

  it('detects invalid JSON in block attributes', () => {
    const content = '<!-- wp:group {invalid json} --><div></div><!-- /wp:group -->';
    const result = validateBlockMarkup(content, 'test');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Invalid JSON'))).toBe(true);
  });

  it('accepts self-closing blocks (navigation, site-title)', () => {
    const content = '<!-- wp:navigation /--><!-- wp:site-title /-->';
    const result = validateBlockMarkup(content, 'test');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('accepts valid query loop with post template', () => {
    const content = `<!-- wp:query {"queryId":1,"query":{"perPage":6,"postType":"post","order":"desc","orderBy":"date"}} --><div class="wp-block-query"><!-- wp:post-template --><!-- wp:post-title {"isLink":true} /--><!-- wp:post-excerpt /--><!-- /wp:post-template --><!-- wp:query-pagination --><div class="wp-block-query-pagination"><!-- wp:query-pagination-previous /--><!-- wp:query-pagination-numbers /--><!-- wp:query-pagination-next /--></div><!-- /wp:query-pagination --></div><!-- /wp:query -->`;
    const result = validateBlockMarkup(content, 'test');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('accepts cover block with nested content', () => {
    const content = `<!-- wp:cover {"overlayColor":"primary","minHeight":500} --><div class="wp-block-cover" style="min-height:500px"><span aria-hidden="true" class="wp-block-cover__background has-primary-background-color has-background-dim"></span><div class="wp-block-cover__inner-container"><!-- wp:heading --><h2>Title</h2><!-- /wp:heading --></div></div><!-- /wp:cover -->`;
    const result = validateBlockMarkup(content, 'test');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects empty content', () => {
    const result = validateBlockMarkup('', 'test');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('empty'))).toBe(true);
  });
});
