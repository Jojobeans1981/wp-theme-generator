import { describe, it, expect } from 'vitest';
import { packageTheme } from '@/lib/theme/packager';
import { MOCK_THEME_REQUEST, MOCK_GENERATED_THEME } from '../fixtures';

// Helper to list files in a ZIP buffer using raw ZIP parsing
async function listZipEntries(buffer: Buffer): Promise<string[]> {
  const entries: string[] = [];

  // ZIP end of central directory is at the end of the file
  // Simple approach: scan for local file headers (PK\x03\x04)
  let offset = 0;
  while (offset < buffer.length - 4) {
    if (
      buffer[offset] === 0x50 &&
      buffer[offset + 1] === 0x4b &&
      buffer[offset + 2] === 0x03 &&
      buffer[offset + 3] === 0x04
    ) {
      // Local file header found
      const nameLength = buffer.readUInt16LE(offset + 26);
      const extraLength = buffer.readUInt16LE(offset + 28);
      const name = buffer.toString('utf8', offset + 30, offset + 30 + nameLength);
      entries.push(name);
      // Skip past this header + name + extra + compressed data is tricky
      // Just move past the header for scanning
      offset += 30 + nameLength + extraLength;
      // Skip the compressed data by finding next PK signature or end
      while (
        offset < buffer.length - 4 &&
        !(
          buffer[offset] === 0x50 &&
          buffer[offset + 1] === 0x4b &&
          (buffer[offset + 2] === 0x03 || buffer[offset + 2] === 0x01)
        )
      ) {
        offset++;
      }
    } else {
      offset++;
    }
  }

  return entries;
}

describe('packageTheme', () => {
  it('produces valid ZIP buffer', async () => {
    const buffer = await packageTheme(MOCK_THEME_REQUEST, MOCK_GENERATED_THEME);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    // ZIP files start with PK signature
    expect(buffer[0]).toBe(0x50); // P
    expect(buffer[1]).toBe(0x4b); // K
  });

  it('ZIP contains all expected files', async () => {
    const buffer = await packageTheme(MOCK_THEME_REQUEST, MOCK_GENERATED_THEME);
    const entries = await listZipEntries(buffer);

    expect(entries).toContain('dark-portfolio/theme.json');
    expect(entries).toContain('dark-portfolio/style.css');
    expect(entries).toContain('dark-portfolio/functions.php');
    expect(entries).toContain('dark-portfolio/templates/index.html');
    expect(entries).toContain('dark-portfolio/parts/header.html');
    expect(entries).toContain('dark-portfolio/parts/footer.html');
  });

  it('ZIP file paths use correct directory structure', async () => {
    const buffer = await packageTheme(MOCK_THEME_REQUEST, MOCK_GENERATED_THEME);
    const entries = await listZipEntries(buffer);

    // All entries should start with the slug
    for (const entry of entries) {
      expect(entry.startsWith('dark-portfolio/')).toBe(true);
    }

    // Templates in templates/ subdir
    const templateEntries = entries.filter((e) => e.includes('/templates/'));
    expect(templateEntries.length).toBeGreaterThan(0);

    // Parts in parts/ subdir
    const partEntries = entries.filter((e) => e.includes('/parts/'));
    expect(partEntries.length).toBe(2);

    // Patterns in patterns/ subdir
    const patternEntries = entries.filter((e) => e.includes('/patterns/'));
    expect(patternEntries.length).toBeGreaterThanOrEqual(3);
  });
});
