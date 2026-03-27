import { NextResponse } from 'next/server';
import { themeRequestSchema } from '@/lib/theme/schema';
import { createAIProvider } from '@/lib/ai/client';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/ai/prompts';
import { parseAIResponse } from '@/lib/ai/parser';
import { validateTheme } from '@/lib/validation/theme-validator';
import { packageTheme } from '@/lib/theme/packager';
import type { GeneratedTheme, ThemeRequest } from '@/lib/types';

export async function POST(request: Request) {
  try {
    // 1. Parse and validate input
    const body: unknown = await request.json();
    const input = themeRequestSchema.safeParse(body);
    if (!input.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: input.error.issues },
        { status: 400 }
      );
    }

    const slug =
      input.data.slug ||
      input.data.themeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Could not generate a valid slug from theme name. Please provide a slug manually.' },
        { status: 400 }
      );
    }

    const themeRequest: ThemeRequest = {
      ...input.data,
      slug,
    };

    // 2. Generate via AI
    const provider = createAIProvider();
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(themeRequest);

    let rawResponse: string;
    try {
      rawResponse = await provider.generate(systemPrompt, userPrompt);
    } catch (e: unknown) {
      const err = e as { status?: number; message?: string };
      if (err.status === 429) {
        return NextResponse.json(
          { error: 'Rate limited by AI provider. Please wait a moment and try again.' },
          { status: 429 }
        );
      }
      throw e;
    }

    // 3. Parse AI response (with up to 2 retries on failure)
    let theme: GeneratedTheme;
    let lastError: Error | null = null;
    const MAX_ATTEMPTS = 3;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        if (attempt > 0) {
          const retryPrompt =
            userPrompt +
            `\n\nATTEMPT ${attempt + 1} — your previous response had these errors:\n${lastError!.message}\n\nCRITICAL RULES FOR YOUR RETRY:\n- Return ONLY raw JSON, no markdown fences\n- Every fontFamily entry MUST have "slug", "name", and "fontFamily" keys\n- settings.color.palette MUST be an array of {slug, color, name} objects\n- templates must be [{name, content}], templateParts must be [{name, area, content}]\n- patterns must be [{name, title, categories, content}] with at least 3 entries\n- Include "styleCss" key (can be empty string "")\n- version must be 3`;
          rawResponse = await provider.generate(systemPrompt, retryPrompt);
        }
        theme = parseAIResponse(rawResponse);
        lastError = null;
        break;
      } catch (e) {
        lastError = e as Error;
      }
    }

    if (lastError || !theme!) {
      throw lastError || new Error('Theme generation failed after retries');
    }

    // 4. Validate complete theme
    const validation = validateTheme(theme, slug);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Generated theme contains invalid block markup',
          details: validation.errors,
        },
        { status: 422 }
      );
    }

    // 5. Package into ZIP
    const zipBuffer = await packageTheme(themeRequest, theme);

    // 6. Return ZIP
    return new Response(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${slug}.zip"`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Theme generation failed. Please try again.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
