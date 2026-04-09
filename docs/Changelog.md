# Changelog

All notable changes to the Universal Exam Builder are documented here.

---

## [2.0.0] — Modernization Pass

### Overview
A full architectural and design overhaul of the exam builder, consolidating the entire application into a single production-quality React source file (`Architecture.jsx`) with a professional SaaS-grade design system.

### Added
- **Multi-Preset Theme Architecture** — Introduced `Academic Pro` (default) and `Zen` presets, controlled via the `data-preset` HTML attribute. Each preset defines its own border radius, font stack, and shadow style using CSS variable tokens.
- **Full Dark Mode** — System-wide dark mode via `data-theme='dark'` attribute on the document root, persisted to `localStorage` under `bt-theme`.
- **CSS Design Token System** — All colors, radii, shadows, and fonts are now defined as `--color-*`, `--radius-*`, `--shadow-*` CSS custom properties, enabling consistent theming without touching component styles.
- **KaTeX Math Rendering** — Dynamic CDN loading of KaTeX for inline (`$...$`) and block (`$$...$$`) LaTeX expression rendering in questions and solutions.
- **LZString Exam Sharing** — Compressed exam data is encoded into URL query parameters (`?exam=...`) using an inlined LZString implementation, enabling shareable exam links with no backend.
- **History Sidebar** — Up to 50 previously loaded exams are stored and accessible from a slide-out sidebar, persisted in `localStorage` under `bt-history`.
- **Exam Mode vs Practice Mode** — Users can choose between `Exam` mode (full session, score revealed at the end) and `Practice` mode (immediate per-question feedback and solution display).
- **File Upload Support** — Exam JSON files can be loaded directly from disk via the upload button.
- **Print / PDF Export** — A dedicated print stylesheet hides all UI chrome, preserving only exam content for clean PDF output.
- **Markdown Code Block Stripping** — When pasting JSON from the Gemini Gem, leading/trailing ` ```json ` fences are automatically stripped before parsing.

### Changed
- **Single-File Architecture** — All components, styles, icons, utilities, and app logic consolidated into `Architecture.jsx`. No separate CSS files or utility modules.
- **Icon System** — All icons are now inline SVG components defined in the `Icons` object, eliminating any external icon library dependency.
- **Build Output** — Switched to `vite-plugin-singlefile` output: the entire app (JS, CSS, fonts) is inlined into a single portable `dist/index.html`.
- **Font Loading** — Google Fonts (Inter, Outfit, Comfortaa, Rubik) loaded via `@import` in the inlined CSS for the singlefile build.

### Removed
- Dependency on any external UI component library.
- Separate CSS file — all styles are injected via the `GlobalStyles` component using `dangerouslySetInnerHTML`.

---

## [1.0.0] — Initial Release

- Basic single-page exam loader accepting raw JSON input.
- Multiple choice question support.
- Minimal styling with no theme system.
