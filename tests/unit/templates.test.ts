import { describe, it, expect } from 'vitest';
import { buildTemplateFiles, buildTemplatePartFiles } from '@/lib/theme/templates';
import { buildPatternFiles } from '@/lib/theme/patterns';
import { buildStyleCss } from '@/lib/theme/style-css';
import { buildFunctionsPhp } from '@/lib/theme/functions-php';
import { MOCK_GENERATED_THEME } from '../fixtures';

describe('buildTemplateFiles', () => {
  it('generates correct filename for each template', () => {
    const files = buildTemplateFiles(MOCK_GENERATED_THEME.templates);
    const paths = files.map((f) => f.path);
    expect(paths).toContain('templates/index.html');
    expect(paths).toContain('templates/single.html');
    expect(paths).toContain('templates/page.html');
    expect(paths).toContain('templates/404.html');
  });
});

describe('buildTemplatePartFiles', () => {
  it('generates correct paths for parts', () => {
    const files = buildTemplatePartFiles(MOCK_GENERATED_THEME.templateParts);
    const paths = files.map((f) => f.path);
    expect(paths).toContain('parts/header.html');
    expect(paths).toContain('parts/footer.html');
  });
});

describe('buildPatternFiles', () => {
  it('wraps pattern content in PHP header', () => {
    const files = buildPatternFiles(MOCK_GENERATED_THEME.patterns, 'dark-portfolio');
    for (const file of files) {
      expect(file.content).toContain('<?php');
      expect(file.content).toContain('* Title:');
      expect(file.content).toContain('* Slug: dark-portfolio/');
      expect(file.content).toContain('* Categories:');
      expect(file.content).toContain('?>');
    }
  });
});

describe('buildStyleCss', () => {
  it('generates valid style.css header', () => {
    const css = buildStyleCss(
      'Dark Portfolio',
      'dark-portfolio',
      'A test description for theme',
      ''
    );
    expect(css).toContain('Theme Name: Dark Portfolio');
    expect(css).toContain('Text Domain: dark-portfolio');
    expect(css).toContain('Requires at least: 6.4');
    expect(css).toContain('Version: 1.0.0');
  });
});

describe('buildFunctionsPhp', () => {
  it('generates functions.php with correct slug', () => {
    const php = buildFunctionsPhp('dark-portfolio', 'Dark Portfolio');
    expect(php).toContain('<?php');
    expect(php).toContain('dark_portfolio_setup');
    expect(php).toContain('dark_portfolio_enqueue_styles');
    expect(php).toContain("'dark-portfolio-style'");
    expect(php).toContain('dark_portfolio_register_block_patterns');
    expect(php).toContain("'Dark Portfolio'");
  });
});
