import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MOCK_GENERATED_THEME } from '../fixtures';

// Mock the AI client before importing the route
vi.mock('@/lib/ai/client', () => ({
  createAIProvider: () => ({
    generate: vi.fn().mockResolvedValue(JSON.stringify(MOCK_GENERATED_THEME)),
  }),
}));

// We need to test the route handler logic directly
import { POST } from '@/app/api/generate/route';

function createRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for invalid input (missing description)', async () => {
    const request = createRequest({ themeName: 'Test' });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
  });

  it('returns 400 for description that is too short', async () => {
    const request = createRequest({
      themeName: 'Test Theme',
      description: 'too short',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 for invalid slug format', async () => {
    const request = createRequest({
      themeName: 'Test Theme',
      description: 'A detailed description that meets the minimum length requirement',
      slug: 'INVALID SLUG',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('returns a ZIP file for valid input', async () => {
    const request = createRequest({
      themeName: 'Dark Portfolio',
      description:
        'A dark mode photography portfolio with sticky nav, large hero, gallery grid, and minimal footer',
      slug: 'dark-portfolio',
      colorPalette: {
        primary: '#E8C547',
        secondary: '#2A2A2A',
        accent: '#C9A84C',
        background: '#0D0D0D',
        foreground: '#F5F5F5',
      },
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/zip');
    expect(response.headers.get('Content-Disposition')).toContain('dark-portfolio.zip');
  });

  it('auto-generates slug from theme name when not provided', async () => {
    const request = createRequest({
      themeName: 'My Cool Theme',
      description:
        'A beautiful theme with lots of details and colors for testing purposes',
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Disposition')).toContain('my-cool-theme.zip');
  });

  it('returns 400 for theme name with invalid characters', async () => {
    const request = createRequest({
      themeName: 'Theme@#$!',
      description: 'A detailed description that meets the minimum length requirement',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
