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
  name: z.string().min(1).default('Font'),
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
  name: z.string().min(1).default('Size'),
});

const spacingSizeSchema = z.object({
  slug: z.string().min(1),
  size: z.string().min(1),
  name: z.string().min(1).default('Space'),
});

const DEFAULT_FONT_SIZES = [
  { slug: 'small', size: '0.875rem', name: 'Small' },
  { slug: 'medium', size: '1rem', name: 'Medium' },
  { slug: 'large', size: '1.5rem', name: 'Large' },
  { slug: 'x-large', size: '2.25rem', name: 'Extra Large' },
  { slug: 'xx-large', size: '3.5rem', name: 'Double Extra Large' },
];

const DEFAULT_SPACING = {
  units: ['px', 'em', 'rem', 'vh', 'vw', '%'],
  spacingSizes: [
    { slug: '10', size: '0.5rem', name: 'Small' },
    { slug: '20', size: '1rem', name: 'Medium' },
    { slug: '30', size: '1.5rem', name: 'Large' },
    { slug: '40', size: '2.5rem', name: 'Extra Large' },
    { slug: '50', size: '4rem', name: 'Huge' },
  ],
};

const themeJsonDataSchema = z.object({
  version: z.number().default(3).transform(() => 3 as const),
  settings: z.object({
    color: z.object({
      palette: z.array(paletteColorSchema).min(1),
    }),
    typography: z.object({
      fontFamilies: z.array(fontFamilySchema).min(1),
      fontSizes: z.array(fontSizeSchema).min(1).default(DEFAULT_FONT_SIZES),
    }),
    spacing: z.object({
      units: z.array(z.string()).default(DEFAULT_SPACING.units),
      spacingSizes: z.array(spacingSizeSchema).default(DEFAULT_SPACING.spacingSizes),
    }).default(DEFAULT_SPACING),
    layout: z.object({
      contentSize: z.string().min(1).default('800px'),
      wideSize: z.string().min(1).default('1200px'),
    }).default(() => ({ contentSize: '800px', wideSize: '1200px' })),
    appearanceTools: z.boolean().default(true).transform(() => true as const),
    useRootPaddingAwareAlignments: z.boolean().default(true).transform(() => true as const),
  }),
  styles: z.object({
    color: z.object({
      background: z.string().min(1).default('var(--wp--preset--color--background)'),
      text: z.string().min(1).default('var(--wp--preset--color--foreground)'),
    }).default(() => ({
      background: 'var(--wp--preset--color--background)',
      text: 'var(--wp--preset--color--foreground)',
    })),
    typography: z.object({
      fontFamily: z.string().min(1).default('var(--wp--preset--font-family--body)'),
      fontSize: z.string().min(1).default('var(--wp--preset--font-size--medium)'),
      lineHeight: z.string().min(1).default('1.7'),
    }).default(() => ({
      fontFamily: 'var(--wp--preset--font-family--body)',
      fontSize: 'var(--wp--preset--font-size--medium)',
      lineHeight: '1.7',
    })),
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
    elements: z.record(z.string(), z.record(z.string(), z.unknown())).default({}),
    blocks: z.record(z.string(), z.record(z.string(), z.unknown())).default({}),
  }).default(() => ({
    color: {
      background: 'var(--wp--preset--color--background)',
      text: 'var(--wp--preset--color--foreground)',
    },
    typography: {
      fontFamily: 'var(--wp--preset--font-family--body)',
      fontSize: 'var(--wp--preset--font-size--medium)',
      lineHeight: '1.7',
    },
    elements: {},
    blocks: {},
  })),
  templateParts: z.array(
    z.object({
      name: z.string().min(1),
      title: z.string().min(1),
      area: z.string().min(1),
    })
  ).default(() => [
    { name: 'header', title: 'Header', area: 'header' },
    { name: 'footer', title: 'Footer', area: 'footer' },
  ]),
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
