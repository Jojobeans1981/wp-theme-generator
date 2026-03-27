// ---- User Input Types ----

export interface ThemeRequest {
  description: string;
  themeName: string;
  slug?: string;
  colorPalette?: ColorPalette;
  typography?: TypographyConfig;
  features?: ThemeFeature[];
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
}

export interface TypographyConfig {
  headingFont: string;
  bodyFont: string;
}

export type ThemeFeature =
  | 'blog'
  | 'portfolio'
  | 'ecommerce'
  | 'landing'
  | 'documentation';

// ---- AI Output Types ----

export interface GeneratedTheme {
  themeJson: ThemeJsonData;
  templates: TemplateFile[];
  templateParts: TemplatePartFile[];
  patterns: PatternFile[];
  styleCss: string;
  heroTitle?: string;
  heroSubtitle?: string;
}

export interface TemplateFile {
  name: string;
  content: string;
}

export interface TemplatePartFile {
  name: string;
  area: string;
  content: string;
}

export interface PatternFile {
  name: string;
  title: string;
  categories: string[];
  content: string;
}

export interface ThemeJsonPaletteColor {
  slug: string;
  color: string;
  name: string;
}

export interface ThemeJsonFontFamily {
  fontFamily: string;
  slug: string;
  name: string;
  fontFace?: Array<{
    fontFamily: string;
    src: string[];
    fontWeight: string;
  }>;
}

export interface ThemeJsonFontSize {
  slug: string;
  size: string;
  name: string;
}

export interface ThemeJsonSpacingSize {
  slug: string;
  size: string;
  name: string;
}

export interface ThemeJsonData {
  version: 3;
  settings: {
    color: {
      palette: ThemeJsonPaletteColor[];
    };
    typography: {
      fontFamilies: ThemeJsonFontFamily[];
      fontSizes: ThemeJsonFontSize[];
    };
    spacing: {
      units: string[];
      spacingSizes: ThemeJsonSpacingSize[];
    };
    layout: {
      contentSize: string;
      wideSize: string;
    };
    appearanceTools: true;
    useRootPaddingAwareAlignments: true;
  };
  styles: {
    color: { background: string; text: string };
    typography: { fontFamily: string; fontSize: string; lineHeight: string };
    spacing?: {
      padding?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
      };
    };
    elements: Record<string, Record<string, unknown>>;
    blocks: Record<string, Record<string, unknown>>;
  };
  templateParts: Array<{ name: string; title: string; area: string }>;
  customTemplates?: Array<{
    name: string;
    title: string;
    postTypes: string[];
  }>;
}

// ---- Validation Types ----

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ---- API Response Types ----

export interface GenerateErrorResponse {
  error: string;
  details?: unknown;
}
