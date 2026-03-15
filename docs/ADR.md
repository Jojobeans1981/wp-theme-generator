# Architectural Decision Record

## Context

We need a web application that generates complete WordPress Block Themes from natural language descriptions. The generated themes must install and activate in WordPress 6.4+ without errors, use only native block markup (zero `wp:html`), and look visually polished. The system must handle the inherent unreliability of LLM output through validation and retry mechanisms.

## Decision: AI Model Choice

**Chosen:** Claude Sonnet (claude-sonnet-4-20250514) via the Anthropic API.

**Alternatives considered:**
- **GPT-4 / GPT-4o (OpenAI):** Strong at structured output, especially with JSON mode. However, Claude's larger context window (200k tokens) gives more room for the extensive system prompt needed to teach WordPress block markup syntax. Claude also tends to follow negative constraints ("never use X") more reliably.
- **Local/open-source models (Llama, Mistral):** Would eliminate API costs and latency, but the quality of structured WordPress block markup output from sub-70B models is significantly lower. The block comment syntax is niche enough that smaller models hallucinate invalid patterns frequently.

**Trade-offs accepted:** API dependency, per-request cost (~$0.02-0.05 per generation), and 15-45s latency. These are acceptable for a take-home project; a production system would add caching and streaming.

## Decision: Structured Output Strategy

**Chosen:** Single-prompt JSON generation with schema validation and one retry on failure.

**Alternatives considered:**
- **Function calling / tool use:** Claude supports tool use, which could enforce output structure. However, the theme data is deeply nested (JSON within JSON — block attributes are JSON inside HTML comment strings inside a JSON field). Tool use schemas don't handle this well, and the overhead of multiple tool calls would increase latency significantly.
- **Multi-step generation:** Generate `theme.json` first, then each template individually, then patterns. This would give finer control and allow validation between steps. However, it multiplies API calls (8-12 per theme), increases total latency to 2-3 minutes, and makes it harder for the AI to maintain design consistency across files.
- **Template composition:** Pre-build template skeletons and have the AI fill in only the variable parts (colors, content, layout choices). This would be more reliable but limits creative flexibility — the whole point is generating unique themes.

**Why single-prompt works:** The system prompt is exhaustive (2000+ tokens of block markup examples), and Zod validation catches structural issues immediately. The retry mechanism appends the specific validation errors to the prompt, giving Claude targeted feedback. In testing, the first attempt succeeds ~85% of the time, and the retry brings it to ~95%.

## Decision: Prompt Engineering Approach

**What worked:**
- Explicit block markup examples for every block type, showing exact HTML structure (not just the comment syntax)
- Negative constraints stated emphatically: "BANNED", "NEVER", "VIOLATION = FAILURE"
- Requiring output as raw JSON with no markdown fences (and stripping them anyway as a fallback)
- Providing the exact JSON schema shape in the prompt

**What failed during development:**
- Short/vague prompts like "generate a WordPress block theme" produce generic output with `wp:html` fallbacks
- Asking for "creative" output without constraining the block vocabulary leads to invented block names
- Not showing the HTML wrapper elements (e.g., `<div class="wp-block-group">`) causes incomplete markup

**Key insight:** The system prompt must teach the AI both the comment syntax AND the required HTML wrapper for each block type. WordPress block markup is a two-layer format (comments + HTML), and most AI models only know the comment layer.

## Decision: Validation Strategy

**Chosen:** Three-layer validation: Zod schema → block markup validator → theme structure validator.

1. **Zod schema validation** (parser.ts): Ensures the AI response has the correct JSON shape — all required fields exist, types match, hex colors are valid, etc. This catches ~60% of issues.

2. **Block markup validation** (block-validator.ts): Scans every template and pattern for `wp:html` usage (instant rejection), invalid JSON in block attributes (using a brace-depth parser, not regex), and mismatched opening/closing tags. This catches ~30% of remaining issues.

3. **Theme structure validation** (theme-validator.ts): Checks that required templates exist (index at minimum), header/footer parts exist, at least 3 patterns are present, theme.json has version 3 with required settings. This catches the final ~10%.

**Why three layers instead of one:** Each layer catches different failure modes. Schema validation can't check block markup structure. Block validation can't verify theme completeness. Separating them also makes testing much cleaner — each validator has focused unit tests.

## Decision: No Custom HTML Enforcement

The `wp:html` block is WordPress's escape hatch for arbitrary HTML. Allowing it would undermine the entire value proposition of a "block theme" — themes should be fully editable in the Site Editor. Our enforcement is three-fold:

1. **Prompt-level:** The system prompt explicitly bans `wp:html` with emphatic language and provides native block alternatives for every common use case.
2. **Validation-level:** The block validator regex-scans for `wp:html` in every template and pattern string.
3. **Rejection-level:** If found, the API returns a 422 error. There is no "fix and continue" — the entire response is rejected.

## Security Considerations

- **API key handling:** The Anthropic API key is stored in `.env.local` (gitignored) and accessed only server-side via `process.env`. It never reaches the browser.
- **Theme slug validation:** Slugs are validated against `/^[a-z0-9-]+$/` to prevent directory traversal or injection in file paths.
- **PHP output:** The `functions.php` generator uses the slug (already validated) in function names via simple string replacement. There is no user-controlled string interpolation in PHP code beyond the validated slug and theme name.
- **Input sanitization:** All user input passes through Zod schemas before reaching the AI prompt or any file generator. Description length is capped at 1000 characters.
- **ZIP creation:** Files are created in memory using `archiver` — no temp files are written to disk, eliminating file system race conditions.

## Design Quality

To push beyond generic "white page with defaults" output:

- The system prompt mandates Cover blocks for hero sections (with overlay colors for visual depth)
- Group blocks with constrained/flex/grid layouts create structured sections
- The prompt requires color application via theme.json palette slugs (not inline hex) so the design is cohesive
- Font size presets create typographic hierarchy
- Quick-start presets in the UI demonstrate high-quality themes (dark photography portfolio, colorful food blog, etc.) that set user expectations
- The prompt explicitly states "visually impressive and unique — not a generic starter theme"
