import type { TemplateFile, TemplatePartFile } from '../types';

export interface ThemeFileOutput {
  path: string;
  content: string;
}

export function buildTemplateFiles(templates: TemplateFile[]): ThemeFileOutput[] {
  return templates.map((t) => ({
    path: `templates/${t.name}.html`,
    content: t.content,
  }));
}

export function buildTemplatePartFiles(parts: TemplatePartFile[]): ThemeFileOutput[] {
  return parts.map((p) => ({
    path: `parts/${p.name}.html`,
    content: p.content,
  }));
}
