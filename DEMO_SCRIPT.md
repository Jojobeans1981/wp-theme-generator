# Word-Press-O-Matic — Demo Script

**Runtime:** ~4 minutes
**Vibe:** Casual, like you're showing a buddy what you built. Don't rush it.

---

## [0:00–0:10] App loads

> So this is Word-Press-O-Matic. Basically, you tell it what kind of WordPress site you want, and it builds the entire theme for you — templates, patterns, colors, typography, the whole thing. You get a ZIP you can drop straight into WordPress.

---

## [0:10–0:30] Looking at the presets

> Up top here you've got some quick-start presets. I set these up so you can get going without having to think too hard about it. There's a business landing page, a food blog, a docs site... but let's go with the photography portfolio because it looks the coolest.

---

## [0:30–0:45] Preset clicked, form fills in

> One click and it fills everything in. The theme name, the description — all of it. "Obsidian Lens." I thought that sounded pretty good.

---

## [0:45–1:30] Description visible

> The description is the important part — this is what the AI actually reads to figure out what to build. We're telling it we want a dark-mode portfolio, big hero section, gallery grid, sticky nav, serif fonts. The more detail you put here, the better the output. You can totally write your own from scratch too.

---

## [1:30–1:45] Advanced options open

> Down here there's advanced options. Let me open that up.

---

## [1:45–2:15] Color palette

> So the preset also set up a full color palette — five colors. Primary, secondary, accent, background, foreground. These aren't just for show — they go directly into the theme.json and WordPress uses them as palette slugs throughout the site. So after you install the theme, you can still tweak them in the block editor.

---

## [2:15–2:30] Typography and features

> Fonts are Playfair Display for headings, Inter for body. Classic combo. There's like twenty Google Fonts in the dropdown. And the site type is set to "portfolio" which nudges the AI toward gallery-style layouts.

---

## [2:30–2:40] Click Generate

> Alright, let's generate it.

---

## [2:40–2:50] Spinner starts

> So what's happening now is it's sending everything to Claude with a pretty beefy system prompt. That prompt has the full WordPress block syntax reference baked in — Cover blocks, Query Loops, Columns, all that. And it explicitly tells the AI it can never use the custom HTML block. That's a hard rule.

---

## [2:50–3:15] Status messages cycling

> You can see the status updating as it goes. It's designing the color system, building the header, creating templates... Under the hood the API gets back one big JSON blob with every file in it. If the JSON is malformed or doesn't match the schema, it automatically retries with the error message appended so Claude can fix itself. Works about 95% of the time with the retry.

---

## [3:15–3:30] Validation and packaging

> Now it's validating the block markup. Every template and pattern gets scanned — if there's a wp:html block anywhere, the whole thing gets rejected. It also checks that opening and closing block tags are balanced and that JSON attributes parse correctly. Then it assembles all the files and packages them into a ZIP in memory — no temp files on disk.

---

## [3:30–3:45] Result screen

> And there it is. Theme generated. You can see the file size, and it's ready for WordPress 6.4 or newer.

---

## [3:45–4:10] File tree

> Here's what it built. theme.json with all the design tokens. Six templates — index with a query loop for posts, single post, page, archive, 404, and search. Header and footer parts. And three patterns — a hero section, a featured posts grid, and a call-to-action. Each pattern has proper PHP registration headers so WordPress picks them up automatically.

---

## [4:10–4:20] Download

> Hit download, you get the ZIP. Upload it to WordPress, activate it, done.

---

## [4:20–4:30] Generate Another

> And you can just hit "Generate Another" and make a completely different theme. Different description, different colors, whatever. Each one is built from scratch.

---

## If anyone asks about the tech

- Next.js 16, TypeScript, Tailwind, Claude API (Sonnet), Zod for validation, Archiver for the ZIP
- Three layers of validation: schema, block markup, theme structure
- Auto-retry with error feedback if the AI messes up the JSON
- 61 tests, all passing — unit tests on validators, parsers, builders, plus an end-to-end integration test
- The whole ZIP gets built in memory, no temp files
- Only uses native WordPress blocks — zero wp:html anywhere
