# STEM Exam Viewer — Design Spec
**Date:** 2026-04-10
**Status:** Approved
**Project:** TestBuilderGem / Universal Exam Builder Pro Max

---

## Overview

Add a "Exam Viewer" tab to the existing React/Vite single-file app (`Architecture.jsx`). The viewer parses AI-generated exam JSON, renders Hebrew questions with full LaTeX support via KaTeX, and executes embedded Python scripts in the browser via Pyodide to generate SVG circuit/graph diagrams using `schemdraw` and `matplotlib`.

---

## Decisions Made

| Question | Decision |
|---|---|
| Integration | New tab in existing app, own component file(s) |
| JSON input | Both auto-inject (`window.__GEMINI_EXAM_DATA__`) and manual paste/upload |
| Styling | Existing inline style system + CSS custom property tokens (no Tailwind, no new deps) |
| Pyodide init | Lazy — starts loading only when Exam Viewer tab is first opened |
| File structure | Modular: `app/src/viewer/` with 4 focused files |

---

## File Structure

```
app/
  index.html              ← add KaTeX CDN (CSS + JS)
  Architecture.jsx        ← add tab + import ExamViewer (3 lines)
  src/
    viewer/               ← NEW directory
      usePyodide.js       ← Pyodide lazy-init hook
      DiagramViewer.jsx   ← Python execution → SVG render
      QuestionCard.jsx    ← single question (LaTeX + diagram + solution toggle)
      ExamViewer.jsx      ← page: JSON input panel + question list + loading overlay
```

---

## Component Architecture

### `usePyodide.js`
- **Responsibility:** Manage the full Pyodide lifecycle.
- **States:** `'idle' | 'loading' | 'ready' | 'error'`
- **API:** `{ pyodide, status, error, init }`
- `init()` is called once by `ExamViewer` on first tab open. It:
  1. Loads Pyodide from CDN (`https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js`)
  2. Calls `micropip.install(['schemdraw', 'matplotlib'])`
  3. Sets status to `'ready'`
- Subsequent calls to `init()` are no-ops (guarded by a module-level singleton: `let _pyodideInstance = null`).
- The singleton lives outside the hook function so Pyodide survives component remounts and tab switches without re-initializing.

### `DiagramViewer.jsx`
- **Props:** `script: string | null`, `pyodide: object`
- **Responsibility:** Execute one Python script and render the resulting SVG.
- On mount (or when `script` changes): calls `pyodide.runPythonAsync(script)`.
- Expects the Python script to return an SVG string as its final expression.
- Renders SVG via `dangerouslySetInnerHTML` inside a sandboxed `<div>`.
- **Error handling:** If execution throws, renders a subtle fallback error box (no crash). Error message shown in a collapsed `<details>` block.
- Does not re-execute if `pyodide` is not yet `'ready'` — shows a spinner instead.

### `QuestionCard.jsx`
- **Props:** `question: object`, `pyodide: object`, `index: number`
- **Responsibility:** Render one question object completely.
- **Layout (RTL):**
  - Badge row: question number (indigo pill), subject (gray pill), difficulty (color-coded pill)
  - Question text: rendered via `renderLatex()` helper
  - `<DiagramViewer>` — only mounted when `question.python_drawer !== null`
  - Solution toggle button: "👁️ הצג פתרון" / "🙈 הסתר פתרון"
  - Solution panel: hidden by default, revealed by toggle, rendered via `renderLatex()`
- **`renderLatex(str)` helper** (defined in `QuestionCard.jsx`):
  - Guards: if `!window.katex`, returns the raw string (KaTeX CDN not yet parsed)
  - Unescapes double-backslashes (`\\\\` → `\\`)
  - Splits string on `$$...$$` (block) and `$...$` (inline) delimiters
  - Calls `window.katex.renderToString()` with `throwOnError: false`
  - Wraps math output in a `<span style="direction:ltr;display:inline-block">`
  - Returns an array of React elements (mix of plain text spans and math spans)

### `ExamViewer.jsx`
- **Props:** `sharedData: array | null` (passed from Architecture.jsx when builder has data)
- **Responsibility:** Top-level viewer page.
- On mount:
  1. Calls `init()` from `usePyodide` (lazy Pyodide start).
  2. If `sharedData` is non-null, uses it as the initial `questions` state.
  3. Else reads `window.__GEMINI_EXAM_DATA__`; if non-null, uses it.
  4. Else shows the JSON input panel.
- **JSON Input Panel:**
  - Textarea for paste + "טען JSON" button
  - File upload input (`.json` files) + "📂 העלה קובץ" button
  - Parses with `JSON.parse()`, validates it is an array, sets `questions` state
  - Shows inline error if JSON is malformed
- **Loading overlay:** Full-screen overlay with spinner shown while `status === 'loading'`. Text: "טוען מנוע שרטוט אקדמי..." with sub-text listing library names.
- **Question list:** Maps `questions` array → `<QuestionCard>` components. Uses the existing `TOKENS` design system from Architecture.jsx for colors/shadows.

---

## Data Flow

```
AI backend  ──►  window.__GEMINI_EXAM_DATA__  ──┐
                                                 ├──►  questions[] in ExamViewer
User paste/upload  ─────────────────────────────┘
                                ↓
              questions.map(q => <QuestionCard question={q} pyodide={pyodide} />)
                                ↓
              QuestionCard renders text + <DiagramViewer script={q.python_drawer} />
                                ↓
              DiagramViewer calls pyodide.runPythonAsync(script) → SVG string
                                ↓
              dangerouslySetInnerHTML renders the SVG
```

---

## Integration into Architecture.jsx

Three changes only:

1. **Import at top:**
   ```js
   import ExamViewer from './src/viewer/ExamViewer';
   ```

2. **Add tab to nav array:**
   ```js
   { id: 'viewer', label: '📋 צפייה במבחן', icon: Icons.Academic }
   ```

3. **Add render case in screen switch:**
   ```jsx
   {activeTab === 'viewer' && <ExamViewer sharedData={examData} />}
   ```
   Where `examData` is the state variable holding the generated questions array (whatever the existing builder stores after AI generation). If no such variable exists yet, pass `null` — the viewer will fall back to `window.__GEMINI_EXAM_DATA__` or the manual input panel.

---

## index.html Changes

Add two CDN links in `<head>` (before `<!-- GEMINI_INJECT_HERE -->`):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
```

No other index.html changes needed.

---

## Styling Rules

- Use existing CSS custom properties: `var(--color-primary)`, `var(--color-surface)`, `var(--color-border)`, `var(--shadow-md)`, etc.
- All viewer containers: `direction: rtl`
- Math spans: `direction: ltr; display: inline-block`
- Difficulty badge colors: Easy → `var(--color-success)`, Medium → orange `#d97706`, Hard → `var(--color-error)`
- Solution panel: revealed with a smooth `max-height` CSS transition; left-border accent in `var(--color-success)`
- Error fallback in DiagramViewer: subtle red-tinted box using `var(--color-error-light)` and `var(--color-error)`

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Pyodide CDN fails to load | `status = 'error'`; viewer shows a banner with retry button |
| `micropip.install` fails | Same as above — Python execution impossible without deps |
| `runPythonAsync` throws | DiagramViewer shows error fallback box, does not crash QuestionCard |
| JSON parse fails in input panel | Inline error message below textarea, `questions` state unchanged |
| `python_drawer` is null | DiagramViewer not mounted; no spinner shown |

---

## Out of Scope

- Multiple choice (MCQ) question type rendering — only `OPEN` type supported in this spec
- Answer submission / scoring
- Print mode for the viewer (existing Architecture.jsx print CSS is a bonus)
- Caching executed Python results across page reloads
