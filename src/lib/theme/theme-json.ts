import type { ThemeJsonData } from '../types';

export function buildThemeJson(data: ThemeJsonData): string {
  const themeJson = {
    $schema: 'https://schemas.wp.org/wp/6.4/theme.json',
    ...data,
  };

  return JSON.stringify(themeJson, null, 2);
}
