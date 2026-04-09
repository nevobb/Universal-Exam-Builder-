# Universal Exam Builder

A professional, single-file web application for generating, loading, and taking AI-powered academic exams. Built with React + Vite and packaged into a self-contained HTML file.

---

## Features

- **Multi-Theme Design System** — Switch between `Academic Pro` and `Zen` presets, with full `light`/`dark` mode support, all driven by CSS variable tokens.
- **LaTeX Math Rendering** — Inline (`$...$`) and block (`$$...$$`) math expressions rendered via KaTeX.
- **AI-Driven Exam Generation** — Paste JSON output from the **Universal Academic Architect** Gemini Gem directly into the app.
- **PDF Export** — Print any exam to PDF via the browser's native print dialog (optimized print stylesheet included).
- **Exam Sharing** — Share exams via URL using LZString-compressed query parameters.
- **History Sidebar** — Up to 50 previously loaded exams are persisted in `localStorage`.
- **File Upload** — Load exam JSON files directly from disk.
- **Two Exam Modes** — `Practice` mode (immediate feedback per question) and `Exam` mode (full session with score summary).
- **Hebrew/RTL Support** — UI and content fully support right-to-left text.

---

## Tech Stack

| Tool | Role |
|---|---|
| React 18 | UI Framework |
| Vite 5 | Build tool |
| `vite-plugin-singlefile` | Bundles everything into one `.html` file |
| KaTeX | LaTeX rendering (loaded from CDN at runtime) |
| LZString | URL-safe exam compression (inlined, no dependency) |

---

## Repository Structure

```
TestBuilderGem/
├── app/                  # Application source code and build config
│   ├── Architecture.jsx  # Entire app — single React source file
│   ├── index.html        # Entry point
│   ├── vite.config.js    # Singlefile build config
│   └── package.json
├── ai/                   # AI System instructions and experts
│   ├── Gem_System_Prompt.md
│   ├── Math_Expert.md
│   └── Physics_Expert.md
├── docs/                 # Documentation and changelogs
├── examples/             # Sample exam JSON files for testing
└── .github/              # GitHub Actions workflows
```

---

## Setup

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
cd app
npm install

# Start development server
npm run dev

# Build a self-contained single HTML file
npm run build
# Output: dist/index.html
```

The built `dist/index.html` is fully portable — open it in any browser, no server required.

---

## Usage with the Gemini Gem

### Step 1 — Open the Gem

Use the **Universal Academic Architect** Gemini Gem (see `ai/Gem_System_Prompt.md` for the system prompt to configure it).

### Step 2 — Request an Exam

Paste a prompt like:

```
Create a 10-question exam on Newtonian Mechanics. Mix MCQ and Open questions. Difficulty: Medium to Hard.
```

---

## License

Private project. Not for redistribution.
