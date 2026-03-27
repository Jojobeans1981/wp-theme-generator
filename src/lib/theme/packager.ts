import archiver from 'archiver';
import { PassThrough } from 'stream';
import type { ThemeRequest, GeneratedTheme } from '../types';
import { buildThemeJson } from './theme-json';
import { buildPatternFiles } from './patterns';
import { buildStyleCss } from './style-css';
import { buildFunctionsPhp } from './functions-php';
import { BASE_TEMPLATES, BASE_PARTS, BASE_PATTERNS } from './base-templates';

function resolveSlug(request: ThemeRequest): string {
  return (
    request.slug ||
    request.themeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  );
}

export async function packageTheme(
  request: ThemeRequest,
  theme: GeneratedTheme
): Promise<Buffer> {
  const slug = resolveSlug(request);

  // Gather all files
  const files: Array<{ path: string; content: string }> = [];

  // theme.json (from AI)
  files.push({
    path: `${slug}/theme.json`,
    content: buildThemeJson(theme.themeJson),
  });

  // style.css
  files.push({
    path: `${slug}/style.css`,
    content: buildStyleCss(request.themeName, slug, request.description, theme.styleCss),
  });

  // functions.php
  files.push({
    path: `${slug}/functions.php`,
    content: buildFunctionsPhp(slug, request.themeName),
  });

  // Templates (pre-built, guaranteed valid)
  for (const [name, content] of Object.entries(BASE_TEMPLATES)) {
    files.push({ path: `${slug}/templates/${name}.html`, content });
  }

  // Template parts (pre-built)
  for (const [name, content] of Object.entries(BASE_PARTS)) {
    files.push({ path: `${slug}/parts/${name}.html`, content });
  }

  // Patterns (pre-built, with AI-customized hero text)
  const heroTitle = (theme as unknown as Record<string, string>).heroTitle || `Welcome to ${request.themeName}`;
  const heroSubtitle = (theme as unknown as Record<string, string>).heroSubtitle || request.description;

  const patterns = [
    {
      ...BASE_PATTERNS.hero,
      content: BASE_PATTERNS.hero.content
        .replace('Welcome to Your New Site', heroTitle)
        .replace('A beautifully designed WordPress experience, built with blocks.', heroSubtitle),
    },
    BASE_PATTERNS['featured-posts'],
    BASE_PATTERNS.cta,
  ];

  for (const f of buildPatternFiles(patterns, slug)) {
    files.push({ path: `${slug}/${f.path}`, content: f.content });
  }

  // Build ZIP in memory
  return new Promise<Buffer>((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    const passthrough = new PassThrough();

    passthrough.on('data', (chunk: Buffer) => chunks.push(chunk));
    passthrough.on('end', () => resolve(Buffer.concat(chunks)));
    passthrough.on('error', reject);
    archive.on('error', reject);

    archive.pipe(passthrough);

    for (const file of files) {
      archive.append(file.content, { name: file.path });
    }

    archive.finalize();
  });
}
