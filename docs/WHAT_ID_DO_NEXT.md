# What I'd Do Next

## 1. Live Preview

Embed WordPress Playground (`@wp-playground/client`) in an iframe to render the generated theme in real-time. After generation, the ZIP would be injected into a WordPress Playground instance running in the browser, giving users instant visual feedback without downloading or installing anything. This is the single highest-impact improvement — it closes the feedback loop from minutes to seconds.

## 2. Iterative Refinement

After initial generation, let users click on individual templates or patterns to modify their description and regenerate just that piece. The system would send the existing theme context (colors, fonts, other templates) along with the updated description, so the regenerated piece stays visually consistent. This transforms the tool from single-shot to conversational.

## 3. Block Validation Pipeline

Replace the current regex-based block validator with a formal AST parser for WordPress block grammar. The block comment syntax has a defined grammar (opening comments with JSON attributes, self-closing variants, nested innerBlocks). A proper parser would catch subtle nesting errors, validate block-specific attribute schemas, and produce better error messages for the retry prompt.

## 4. Multi-Model Support

Benchmark Claude Sonnet vs. GPT-4o vs. Gemini Pro vs. open-source models (Llama 3, Mistral) for theme generation quality. Key metrics: valid JSON rate on first attempt, `wp:html` avoidance rate, block markup correctness, and subjective design quality. The provider abstraction (`AIProvider` interface) already supports this — each model would just need prompt tuning.

## 5. Pattern Library

Build a library of pre-validated, hand-crafted block pattern snippets (hero variants, testimonial sections, pricing grids, footer layouts). Instead of generating patterns from scratch, the AI would compose from this library, dramatically reducing hallucination risk. The system prompt would include the library as a reference, and the AI would select and customize patterns rather than inventing them.

## 6. Caching

Cache generated themes by a hash of the input parameters. If two users request a "dark photography portfolio" with the same colors and fonts, serve the cached ZIP instead of calling the API again. This reduces cost and latency for common requests. Cache invalidation would be time-based (24-48 hours) since theme generation is not deterministic.

## 7. Streaming

Stream the AI response using Claude's streaming API and build the preview progressively. As each template or pattern is parsed from the stream, show it in the UI immediately. This transforms the 15-45 second wait into an engaging reveal sequence. The `archiver` package supports streaming as well, so the ZIP could be assembled as data arrives.

## 8. Production Hardening

For a production deployment:
- **Rate limiting**: Per-IP and per-API-key limits to prevent abuse (e.g., 10 generations/hour per IP)
- **Request queuing**: Use a job queue (BullMQ/Redis) to handle concurrent requests without overwhelming the AI API
- **Usage analytics**: Track generation success rate, retry rate, common failure modes, and user patterns
- **Error monitoring**: Integrate Sentry or similar for structured error reporting
- **CDN**: Serve the frontend from a CDN with edge caching
- **Database**: Store generated themes with metadata for analytics and potential re-download
- **Authentication**: Add user accounts to track generation history and enable saved preferences
