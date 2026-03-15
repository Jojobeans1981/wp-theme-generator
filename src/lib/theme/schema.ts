import { z } from 'zod';

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color (#RRGGBB)');

// ---- Request Schemas ----

export const colorPaletteSchema = z.object({
  primary: hexColor,
  secondary: hexColor,
  accent: hexColor,
  background: hexColor,
  foreground: hexColor,
});

export const typographyConfigSchema = z.object({
  headingFont: z.string().min(1),
  bodyFont: z.string().min(1),
});

export const themeFeatureSchema = z.enum([
  'blog',
  'portfolio',
  'ecommerce',
  'landing',
  'documentation',
]);

export const themeRequestSchema = z.object({
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000),
  themeName: z
    .string()
    .min(2, 'Theme name must be at least 2 characters')
    .max(50)
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Only letters, numbers, spaces, and hyphens allowed'),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only')
    .optional(),
  colorPalette: colorPaletteSchema.optional(),
  typography: typographyConfigSchema.optional(),
  features: z.array(themeFeatureSchema).optional(),
});

// ---- Generated Theme Schemas ----

const paletteColorSchema = z.object({
  slug: z.string().min(1),
  color: hexColor,
  name: z.string().min(1),
});

const fontFamilySchema = z.object({
  fontFamily: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  fontFace: z
    .array(
      z.object({
        fontFamily: z.string().min(1),
        src: z.array(z.string()),
        fontWeight: z.string(),
      })
    )
    .optional(),
});

const fontSizeSchema = z.object({
  slug: z.string().min(1),
  size: z.string().min(1),
  name: z.string().min(1),
});

const spacingSizeSchema = z.object({
  slug: z.string().min(1),
  size: z.string().min(1),
  name: z.string().min(1),
});

const themeJsonDataSchema = z.object({
  version: z.literal(3),
  settings: z.object({
    color: z.object({
      palette: z.array(paletteColorSchema).min(1),
    }),
    typography: z.object({
      fontFamilies: z.array(fontFamilySchema).min(1),
      fontSizes: z.array(fontSizeSchema).min(1),
    }),
    spacing: z.object({
      units: z.array(z.string()),
      spacingSizes: z.array(spacingSizeSchema),
    }),
    layout: z.object({
      contentSize: z.string().min(1),
      wideSize: z.string().min(1),
    }),
    appearanceTools: z.literal(true),
    useRootPaddingAwareAlignments: z.literal(true),
  }),
  styles: z.object({
    color: z.object({
      background: z.string().min(1),
      text: z.string().min(1),
    }),
    typography: z.object({
      fontFamily: z.string().min(1),
      fontSize: z.string().min(1),
      lineHeight: z.string().min(1),
    }),
    spacing: z
      .object({
        padding: z
          .object({
            top: z.string().optional(),
            right: z.string().optional(),
            bottom: z.string().optional(),
            left: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    elements: z.record(z.string(), z.record(z.string(), z.unknown())),
    blocks: z.record(z.string(), z.record(z.string(), z.unknown())),
  }),
  templateParts: z.array(
    z.object({
      name: z.string().min(1),
      title: z.string().min(1),
      area: z.string().min(1),
    })
  ),
  customTemplates: z
    .array(
      z.object({
        name: z.string().min(1),
        title: z.string().min(1),
        postTypes: z.array(z.string()),
      })
    )
    .optional(),
});

const templateFileSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
});

const templatePartFileSchema = z.object({
  name: z.string().min(1),
  area: z.enum(['header', 'footer', 'uncategorized']),
  content: z.string().min(1),
});

const patternFileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  categories: z.array(z.string()).min(1),
  content: z.string().min(1),
});

export const generatedThemeSchema = z.object({
  themeJson: themeJsonDataSchema,
  templates: z.array(templateFileSchema).min(1),
  templateParts: z.array(templatePartFileSchema).min(1),
  patterns: z.array(patternFileSchema).min(3, 'At least 3 patterns required'),
  styleCss: z.string(),
});

export type ValidatedThemeRequest = z.infer<typeof themeRequestSchema>;
export type ValidatedGeneratedTheme = z.infer<typeof generatedThemeSchema>;
