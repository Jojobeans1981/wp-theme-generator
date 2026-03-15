import archiver from 'archiver';
import { PassThrough } from 'stream';
import type { ThemeRequest, GeneratedTheme } from '../types';
import { buildThemeJson } from './theme-json';
import { buildTemplateFiles, buildTemplatePartFiles } from './templates';
import { buildPatternFiles } from './patterns';
import { buildStyleCss } from './style-css';
import { buildFunctionsPhp } from './functions-php';

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

  // theme.json
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

  // Templates
  for (const f of buildTemplateFiles(theme.templates)) {
    files.push({ path: `${slug}/${f.path}`, content: f.content });
  }

  // Template parts
  for (const f of buildTemplatePartFiles(theme.templateParts)) {
    files.push({ path: `${slug}/${f.path}`, content: f.content });
  }

  // Patterns
  for (const f of buildPatternFiles(theme.patterns, slug)) {
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
