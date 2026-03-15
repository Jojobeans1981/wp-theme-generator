import type { GeneratedTheme, ThemeRequest } from '@/lib/types';

export const MOCK_THEME_REQUEST: ThemeRequest = {
  description: 'A dark mode photography portfolio with sticky nav, large hero, gallery grid, and minimal footer',
  themeName: 'Dark Portfolio',
  slug: 'dark-portfolio',
  colorPalette: {
    primary: '#E8C547',
    secondary: '#2A2A2A',
    accent: '#C9A84C',
    background: '#0D0D0D',
    foreground: '#F5F5F5',
  },
  typography: {
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
  },
  features: ['portfolio'],
};

export const MOCK_GENERATED_THEME: GeneratedTheme = {
  themeJson: {
    version: 3,
    settings: {
      color: {
        palette: [
          { slug: 'primary', color: '#E8C547', name: 'Primary' },
          { slug: 'secondary', color: '#2A2A2A', name: 'Secondary' },
          { slug: 'accent', color: '#C9A84C', name: 'Accent' },
          { slug: 'background', color: '#0D0D0D', name: 'Background' },
          { slug: 'foreground', color: '#F5F5F5', name: 'Foreground' },
        ],
      },
      typography: {
        fontFamilies: [
          { fontFamily: '"Playfair Display", serif', slug: 'heading', name: 'Heading' },
          { fontFamily: '"Inter", sans-serif', slug: 'body', name: 'Body' },
        ],
        fontSizes: [
          { slug: 'small', size: '0.875rem', name: 'Small' },
          { slug: 'medium', size: '1rem', name: 'Medium' },
          { slug: 'large', size: '1.5rem', name: 'Large' },
          { slug: 'x-large', size: '2.25rem', name: 'Extra Large' },
          { slug: 'xx-large', size: '3.5rem', name: 'Double Extra Large' },
        ],
      },
      spacing: {
        units: ['px', 'em', 'rem', 'vh', 'vw', '%'],
        spacingSizes: [
          { slug: '10', size: '0.5rem', name: 'Small' },
          { slug: '20', size: '1rem', name: 'Medium' },
          { slug: '30', size: '1.5rem', name: 'Large' },
          { slug: '40', size: '2.5rem', name: 'Extra Large' },
          { slug: '50', size: '4rem', name: 'Huge' },
        ],
      },
      layout: { contentSize: '800px', wideSize: '1200px' },
      appearanceTools: true,
      useRootPaddingAwareAlignments: true,
    },
    styles: {
      color: {
        background: 'var(--wp--preset--color--background)',
        text: 'var(--wp--preset--color--foreground)',
      },
      typography: {
        fontFamily: 'var(--wp--preset--font-family--body)',
        fontSize: 'var(--wp--preset--font-size--medium)',
        lineHeight: '1.7',
      },
      elements: {
        h1: {
          typography: {
            fontFamily: 'var(--wp--preset--font-family--heading)',
            fontSize: 'var(--wp--preset--font-size--xx-large)',
          },
        },
        h2: {
          typography: {
            fontFamily: 'var(--wp--preset--font-family--heading)',
            fontSize: 'var(--wp--preset--font-size--x-large)',
          },
        },
        link: { color: { text: 'var(--wp--preset--color--accent)' } },
      },
      blocks: {},
    },
    templateParts: [
      { name: 'header', title: 'Header', area: 'header' },
      { name: 'footer', title: 'Footer', area: 'footer' },
    ],
  },
  templates: [
    {
      name: 'index',
      content:
        '<!-- wp:template-part {"slug":"header","area":"header"} /--><!-- wp:group {"layout":{"type":"constrained"}} --><div class="wp-block-group"><!-- wp:query {"queryId":1,"query":{"perPage":6,"postType":"post","order":"desc","orderBy":"date"}} --><div class="wp-block-query"><!-- wp:post-template --><!-- wp:post-featured-image /--><!-- wp:post-title {"isLink":true} /--><!-- wp:post-excerpt /--><!-- wp:post-date /--><!-- /wp:post-template --><!-- wp:query-pagination --><div class="wp-block-query-pagination"><!-- wp:query-pagination-previous /--><!-- wp:query-pagination-numbers /--><!-- wp:query-pagination-next /--></div><!-- /wp:query-pagination --></div><!-- /wp:query --></div><!-- /wp:group --><!-- wp:template-part {"slug":"footer","area":"footer"} /-->',
    },
    {
      name: 'single',
      content:
        '<!-- wp:template-part {"slug":"header","area":"header"} /--><!-- wp:group {"layout":{"type":"constrained"}} --><div class="wp-block-group"><!-- wp:post-featured-image /--><!-- wp:post-title /--><!-- wp:post-date /--><!-- wp:post-content /--><!-- wp:post-terms {"term":"category"} /--></div><!-- /wp:group --><!-- wp:template-part {"slug":"footer","area":"footer"} /-->',
    },
    {
      name: 'page',
      content:
        '<!-- wp:template-part {"slug":"header","area":"header"} /--><!-- wp:group {"layout":{"type":"constrained"}} --><div class="wp-block-group"><!-- wp:post-title /--><!-- wp:post-content /--></div><!-- /wp:group --><!-- wp:template-part {"slug":"footer","area":"footer"} /-->',
    },
    {
      name: 'archive',
      content:
        '<!-- wp:template-part {"slug":"header","area":"header"} /--><!-- wp:group {"layout":{"type":"constrained"}} --><div class="wp-block-group"><!-- wp:query-title /--><!-- wp:query {"queryId":2,"query":{"perPage":9,"postType":"post","order":"desc","orderBy":"date"}} --><div class="wp-block-query"><!-- wp:post-template --><!-- wp:post-featured-image /--><!-- wp:post-title {"isLink":true} /--><!-- wp:post-excerpt /--><!-- /wp:post-template --><!-- wp:query-pagination --><div class="wp-block-query-pagination"><!-- wp:query-pagination-previous /--><!-- wp:query-pagination-numbers /--><!-- wp:query-pagination-next /--></div><!-- /wp:query-pagination --></div><!-- /wp:query --></div><!-- /wp:group --><!-- wp:template-part {"slug":"footer","area":"footer"} /-->',
    },
    {
      name: '404',
      content:
        '<!-- wp:template-part {"slug":"header","area":"header"} /--><!-- wp:group {"layout":{"type":"constrained"}} --><div class="wp-block-group"><!-- wp:heading {"textAlign":"center"} --><h2 class="has-text-align-center">Page Not Found</h2><!-- /wp:heading --><!-- wp:paragraph {"align":"center"} --><p class="has-text-align-center">The page you are looking for does not exist. Try searching or go back to the homepage.</p><!-- /wp:paragraph --><!-- wp:search {"label":"Search","buttonText":"Search"} /--></div><!-- /wp:group --><!-- wp:template-part {"slug":"footer","area":"footer"} /-->',
    },
    {
      name: 'search',
      content:
        '<!-- wp:template-part {"slug":"header","area":"header"} /--><!-- wp:group {"layout":{"type":"constrained"}} --><div class="wp-block-group"><!-- wp:query-title /--><!-- wp:search {"label":"Search","buttonText":"Search"} /--><!-- wp:query {"queryId":3,"query":{"perPage":10,"postType":"post"}} --><div class="wp-block-query"><!-- wp:post-template --><!-- wp:post-title {"isLink":true} /--><!-- wp:post-excerpt /--><!-- /wp:post-template --></div><!-- /wp:query --></div><!-- /wp:group --><!-- wp:template-part {"slug":"footer","area":"footer"} /-->',
    },
  ],
  templateParts: [
    {
      name: 'header',
      area: 'header',
      content:
        '<!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between"},"style":{"spacing":{"padding":{"top":"20px","bottom":"20px"}}}} --><div class="wp-block-group"><!-- wp:site-title /--><!-- wp:navigation /--></div><!-- /wp:group -->',
    },
    {
      name: 'footer',
      area: 'footer',
      content:
        '<!-- wp:group {"backgroundColor":"secondary","layout":{"type":"constrained"},"style":{"spacing":{"padding":{"top":"40px","bottom":"40px"}}}} --><div class="wp-block-group has-secondary-background-color has-background"><!-- wp:paragraph {"align":"center","fontSize":"small"} --><p class="has-text-align-center has-small-font-size">Built with WordPress Block Themes</p><!-- /wp:paragraph --></div><!-- /wp:group -->',
    },
  ],
  patterns: [
    {
      name: 'hero-section',
      title: 'Hero Section',
      categories: ['featured'],
      content:
        '<!-- wp:cover {"overlayColor":"primary","minHeight":600,"isDark":true} --><div class="wp-block-cover is-dark" style="min-height:600px"><span aria-hidden="true" class="wp-block-cover__background has-primary-background-color has-background-dim"></span><div class="wp-block-cover__inner-container"><!-- wp:heading {"textAlign":"center","fontSize":"xx-large"} --><h2 class="has-text-align-center has-xx-large-font-size">Welcome to Dark Portfolio</h2><!-- /wp:heading --><!-- wp:paragraph {"align":"center"} --><p class="has-text-align-center">Showcasing visual stories through light and shadow</p><!-- /wp:paragraph --></div></div><!-- /wp:cover -->',
    },
    {
      name: 'featured-posts',
      title: 'Featured Posts Grid',
      categories: ['featured'],
      content:
        '<!-- wp:group {"layout":{"type":"constrained"}} --><div class="wp-block-group"><!-- wp:heading --><h2>Featured Work</h2><!-- /wp:heading --><!-- wp:query {"queryId":10,"query":{"perPage":3,"postType":"post","order":"desc","orderBy":"date"}} --><div class="wp-block-query"><!-- wp:post-template {"layout":{"type":"grid","columnCount":3}} --><!-- wp:post-featured-image /--><!-- wp:post-title {"isLink":true} /--><!-- /wp:post-template --></div><!-- /wp:query --></div><!-- /wp:group -->',
    },
    {
      name: 'call-to-action',
      title: 'Call to Action',
      categories: ['featured'],
      content:
        '<!-- wp:group {"backgroundColor":"secondary","layout":{"type":"constrained"},"style":{"spacing":{"padding":{"top":"60px","bottom":"60px"}}}} --><div class="wp-block-group has-secondary-background-color has-background"><!-- wp:heading {"textAlign":"center"} --><h2 class="has-text-align-center">Ready to collaborate?</h2><!-- /wp:heading --><!-- wp:paragraph {"align":"center"} --><p class="has-text-align-center">Get in touch to discuss your next project.</p><!-- /wp:paragraph --><!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} --><div class="wp-block-buttons"><!-- wp:button {"backgroundColor":"primary"} --><div class="wp-block-button"><a class="wp-block-button__link has-primary-background-color has-background wp-element-button">Contact Me</a></div><!-- /wp:button --></div><!-- /wp:buttons --></div><!-- /wp:group -->',
    },
  ],
  styleCss: '',
};
