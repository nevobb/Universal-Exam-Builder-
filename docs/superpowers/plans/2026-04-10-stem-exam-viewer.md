# STEM Exam Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Exam Viewer" mode to the existing app that parses AI-generated question JSON, renders Hebrew text + LaTeX via KaTeX, and runs embedded Python diagrams via Pyodide (WebAssembly).

**Architecture:** A new `app/src/viewer/` directory holds four focused files. `ExamViewer.jsx` is wired into `Architecture.jsx` as a new `mode === 'viewer'` case. Pyodide loads lazily on first viewer open. KaTeX loads from CDN (no npm package). All styling uses existing CSS custom properties from the design system.

**Tech Stack:** React 18, Vite, Vitest, KaTeX (CDN), Pyodide (CDN via `loadPyodide`), schemdraw + matplotlib (micropip)

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `app/index.html` | Add KaTeX CDN CSS + JS links |
| Create | `app/src/viewer/renderLatex.js` | Pure function: split string into text/math segments |
| Create | `app/src/viewer/renderLatex.test.js` | Vitest unit tests for renderLatex |
| Create | `app/src/viewer/usePyodide.js` | React hook: lazy Pyodide singleton lifecycle |
| Create | `app/src/viewer/DiagramViewer.jsx` | Run Python script → render SVG or error fallback |
| Create | `app/src/viewer/QuestionCard.jsx` | Render one question: badges + text + diagram + solution toggle |
| Create | `app/src/viewer/ExamViewer.jsx` | Page: JSON input panel + loading overlay + question list |
| Modify | `app/Architecture.jsx` | Add viewer mode, import, header button |

---

## Task 1: Add KaTeX CDN to index.html

**Files:**
- Modify: `app/index.html`

- [ ] **Step 1: Add CDN links**

Open `app/index.html`. Insert these two lines **before** the `<!-- GEMINI_INJECT_HERE -->` comment:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
```

The `<head>` section should look like:
```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Universal Exam Builder Pro Max</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <!-- GEMINI_INJECT_HERE -->
  <script>window.__GEMINI_EXAM_DATA__ = null;</script>
</head>
```

- [ ] **Step 2: Verify dev server starts**

```bash
cd app && npm run dev
```

Open the browser. Open DevTools → Network tab. Confirm `katex.min.js` and `katex.min.css` load with status 200. No console errors.

- [ ] **Step 3: Commit**

```bash
cd app && git add index.html
git commit -m "feat: add KaTeX CDN to index.html"
```

---

## Task 2: Create `renderLatex.js` (pure function) + tests

**Files:**
- Create: `app/src/viewer/renderLatex.js`
- Create: `app/src/viewer/renderLatex.test.js`

### Why a separate file?
`renderLatex` is a pure function with no React or browser dependencies. Extracting it makes it fully unit-testable in the Vitest node environment.

- [ ] **Step 1: Write the failing tests first**

Create `app/src/viewer/renderLatex.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { splitLatex } from './renderLatex.js';

describe('splitLatex', () => {
  it('returns a single text segment for plain text', () => {
    const result = splitLatex('hello world');
    expect(result).toEqual([{ type: 'text', content: 'hello world' }]);
  });

  it('detects inline math wrapped in single $', () => {
    const result = splitLatex('Current is $I = 2A$');
    expect(result).toEqual([
      { type: 'text', content: 'Current is ' },
      { type: 'inline', content: 'I = 2A' },
    ]);
  });

  it('detects block math wrapped in $$', () => {
    const result = splitLatex('$$E = mc^2$$');
    expect(result).toEqual([{ type: 'block', content: 'E = mc^2' }]);
  });

  it('handles mixed text, inline, and block math', () => {
    const result = splitLatex('Find $x$ where $$x^2 = 4$$ then done');
    expect(result).toEqual([
      { type: 'text', content: 'Find ' },
      { type: 'inline', content: 'x' },
      { type: 'text', content: ' where ' },
      { type: 'block', content: 'x^2 = 4' },
      { type: 'text', content: ' then done' },
    ]);
  });

  it('unescapes double-backslashes before splitting', () => {
    const result = splitLatex('$\\\\frac{1}{2}$');
    expect(result).toEqual([{ type: 'inline', content: '\\frac{1}{2}' }]);
  });

  it('returns empty array for empty string', () => {
    expect(splitLatex('')).toEqual([]);
  });

  it('returns empty array for null', () => {
    expect(splitLatex(null)).toEqual([]);
  });

  it('returns a single text segment when no math delimiters present', () => {
    const result = splitLatex('שאלה פשוטה ללא נוסחאות');
    expect(result).toEqual([{ type: 'text', content: 'שאלה פשוטה ללא נוסחאות' }]);
  });

  it('handles multiple inline math expressions', () => {
    const result = splitLatex('$a$ plus $b$ equals $c$');
    expect(result).toEqual([
      { type: 'inline', content: 'a' },
      { type: 'text', content: ' plus ' },
      { type: 'inline', content: 'b' },
      { type: 'text', content: ' equals ' },
      { type: 'inline', content: 'c' },
    ]);
  });

  it('prioritizes $$ over $ (block wins when both delimiters present)', () => {
    const result = splitLatex('$$a + b$$');
    expect(result[0].type).toBe('block');
  });

  it('filters out empty text segments', () => {
    const result = splitLatex('$x$');
    expect(result.every(s => s.content.length > 0)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd app && npx vitest run src/viewer/renderLatex.test.js
```

Expected: FAIL — `Cannot find module './renderLatex.js'`

- [ ] **Step 3: Create `renderLatex.js`**

Create `app/src/viewer/renderLatex.js`:

```js
/**
 * Splits a string containing LaTeX math into segments.
 *
 * Segments have shape: { type: 'text' | 'inline' | 'block', content: string }
 *
 * - Block math: $$...$$
 * - Inline math: $...$
 * - Everything else: plain text
 *
 * Double-backslashes (\\) are unescaped to single (\) before splitting,
 * matching the double-encoded output from the AI JSON generator.
 *
 * @param {string|null} str
 * @returns {{ type: string, content: string }[]}
 */
export function splitLatex(str) {
  if (!str) return [];

  // Unescape double-backslashes produced by JSON double-encoding
  const unescaped = str.replace(/\\\\/g, '\\');

  const segments = [];
  // Match $$ first (greedy prevention: non-greedy .+?)
  const RE = /\$\$(.+?)\$\$|\$(.+?)\$/gs;
  let lastIndex = 0;
  let match;

  while ((match = RE.exec(unescaped)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      const text = unescaped.slice(lastIndex, match.index);
      if (text) segments.push({ type: 'text', content: text });
    }

    if (match[1] !== undefined) {
      // $$ block $$
      segments.push({ type: 'block', content: match[1] });
    } else {
      // $ inline $
      segments.push({ type: 'inline', content: match[2] });
    }

    lastIndex = RE.lastIndex;
  }

  // Remaining text after last match
  if (lastIndex < unescaped.length) {
    const tail = unescaped.slice(lastIndex);
    if (tail) segments.push({ type: 'text', content: tail });
  }

  return segments;
}

/**
 * Renders a LaTeX string to an array of React-renderable objects.
 *
 * Requires window.katex to be loaded (KaTeX CDN).
 * Falls back to raw text if KaTeX is not available yet.
 *
 * @param {string|null} str
 * @returns {{ type: string, content: string, html?: string }[]}
 */
export function renderSegments(str) {
  const segs = splitLatex(str);
  if (!window.katex) return segs;

  return segs.map((seg) => {
    if (seg.type === 'text') return seg;
    try {
      const html = window.katex.renderToString(seg.content, {
        throwOnError: false,
        displayMode: seg.type === 'block',
      });
      return { ...seg, html };
    } catch {
      return { ...seg, html: seg.content };
    }
  });
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
cd app && npx vitest run src/viewer/renderLatex.test.js
```

Expected: All 11 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd app && git add src/viewer/renderLatex.js src/viewer/renderLatex.test.js
git commit -m "feat(viewer): add splitLatex pure parser with tests"
```

---

## Task 3: Create `usePyodide.js`

**Files:**
- Create: `app/src/viewer/usePyodide.js`

No unit tests here — the hook depends on CDN fetch and `window.loadPyodide` (browser-only). It will be validated by integration in Task 7.

- [ ] **Step 1: Create the hook**

Create `app/src/viewer/usePyodide.js`:

```js
import { useState, useRef, useCallback } from 'react';

// Module-level singleton so Pyodide survives tab switches and component remounts
let _pyodideInstance = null;
let _initPromise = null;

/**
 * Lazy Pyodide hook. Call init() once on first viewer open.
 *
 * Status values: 'idle' | 'loading' | 'ready' | 'error'
 *
 * Usage:
 *   const { pyodide, status, error, init } = usePyodide();
 *   useEffect(() => { init(); }, []);
 */
export function usePyodide() {
  const [status, setStatus] = useState(
    _pyodideInstance ? 'ready' : 'idle'
  );
  const [error, setError] = useState(null);
  const pyodideRef = useRef(_pyodideInstance);

  const init = useCallback(async () => {
    // Already ready — no-op
    if (_pyodideInstance) {
      pyodideRef.current = _pyodideInstance;
      setStatus('ready');
      return;
    }

    // Already initializing — wait for the existing promise
    if (_initPromise) {
      setStatus('loading');
      try {
        _pyodideInstance = await _initPromise;
        pyodideRef.current = _pyodideInstance;
        setStatus('ready');
      } catch (err) {
        setStatus('error');
        setError(err.message);
      }
      return;
    }

    // First call — start loading
    setStatus('loading');
    setError(null);

    _initPromise = (async () => {
      // loadPyodide is injected by the Pyodide CDN script (added in ExamViewer)
      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
      });
      await pyodide.loadPackage('micropip');
      const micropip = pyodide.pyimport('micropip');
      await micropip.install(['schemdraw', 'matplotlib']);
      return pyodide;
    })();

    try {
      _pyodideInstance = await _initPromise;
      pyodideRef.current = _pyodideInstance;
      setStatus('ready');
    } catch (err) {
      _initPromise = null; // Allow retry
      setStatus('error');
      setError(err.message || 'Failed to load Pyodide');
    }
  }, []);

  return { pyodide: pyodideRef.current, status, error, init };
}
```

- [ ] **Step 2: Commit**

```bash
cd app && git add src/viewer/usePyodide.js
git commit -m "feat(viewer): add lazy usePyodide hook with singleton pattern"
```

---

## Task 4: Create `DiagramViewer.jsx`

**Files:**
- Create: `app/src/viewer/DiagramViewer.jsx`

- [ ] **Step 1: Create the component**

Create `app/src/viewer/DiagramViewer.jsx`:

```jsx
import React, { useState, useEffect, useRef } from 'react';

/**
 * Executes a Python script via Pyodide and renders the resulting SVG.
 *
 * Props:
 *   script   {string|null} — raw Python source. If null, renders nothing.
 *   pyodide  {object|null} — the Pyodide instance from usePyodide.
 *   status   {string}      — 'idle'|'loading'|'ready'|'error' from usePyodide.
 */
export default function DiagramViewer({ script, pyodide, status }) {
  const [svg, setSvg] = useState(null);
  const [runError, setRunError] = useState(null);
  const [running, setRunning] = useState(false);
  const prevScript = useRef(null);

  useEffect(() => {
    if (!script) return;
    if (status !== 'ready' || !pyodide) return;
    if (script === prevScript.current) return; // Skip re-run if script unchanged

    prevScript.current = script;
    setRunning(true);
    setSvg(null);
    setRunError(null);

    pyodide.runPythonAsync(script)
      .then((result) => {
        const svgString = typeof result === 'string' ? result : String(result);
        setSvg(svgString);
      })
      .catch((err) => {
        setRunError(err.message || String(err));
      })
      .finally(() => {
        setRunning(false);
      });
  }, [script, pyodide, status]);

  if (!script) return null;

  // Pyodide still loading — show a small inline spinner
  if (status === 'loading' || running) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '10px', padding: '24px', borderRadius: '10px',
        border: '1px dashed var(--color-border)',
        color: 'var(--color-text-secondary)', fontSize: '13px',
        margin: '16px 0',
      }}>
        <span style={{
          width: '16px', height: '16px',
          border: '2px solid var(--color-primary)',
          borderTopColor: 'transparent', borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.8s linear infinite',
        }} />
        מריץ קוד Python...
      </div>
    );
  }

  // Python execution error — subtle fallback, never crashes the card
  if (runError) {
    return (
      <div style={{
        margin: '16px 0', padding: '16px', borderRadius: '10px',
        backgroundColor: 'var(--color-error-light)',
        border: '1px solid var(--color-error)', fontSize: '13px',
      }}>
        <div style={{ fontWeight: '700', color: 'var(--color-error)', marginBottom: '6px' }}>
          ⚠️ שגיאה בהרצת שרטוט
        </div>
        <details>
          <summary style={{ cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
            פרטי השגיאה
          </summary>
          <pre style={{ marginTop: '8px', fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'var(--color-error)' }}>
            {runError}
          </pre>
        </details>
      </div>
    );
  }

  if (!svg) return null;

  return (
    <div
      style={{ margin: '16px 0', overflowX: 'auto', direction: 'ltr' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd app && git add src/viewer/DiagramViewer.jsx
git commit -m "feat(viewer): add DiagramViewer component with error fallback"
```

---

## Task 5: Create `QuestionCard.jsx`

**Files:**
- Create: `app/src/viewer/QuestionCard.jsx`

- [ ] **Step 1: Create the component**

Create `app/src/viewer/QuestionCard.jsx`:

```jsx
import React, { useState } from 'react';
import DiagramViewer from './DiagramViewer.jsx';
import { renderSegments } from './renderLatex.js';

const DIFFICULTY_COLORS = {
  Easy: { bg: 'var(--color-success-light)', text: 'var(--color-success)' },
  Medium: { bg: '#fef3c7', text: '#d97706' },
  Hard: { bg: 'var(--color-error-light)', text: 'var(--color-error)' },
  // Hebrew variants from AI output
  'קל': { bg: 'var(--color-success-light)', text: 'var(--color-success)' },
  'בינוני': { bg: '#fef3c7', text: '#d97706' },
  'קשה': { bg: 'var(--color-error-light)', text: 'var(--color-error)' },
};

/**
 * Renders a mixed text+LaTeX string as React elements.
 * Math blocks are forced to LTR; text is left as-is (inherits RTL).
 */
function LatexText({ str }) {
  const segments = renderSegments(str);
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return <span key={i}>{seg.content}</span>;
        }
        if (seg.html) {
          return (
            <span
              key={i}
              style={{ direction: 'ltr', display: 'inline-block' }}
              dangerouslySetInnerHTML={{ __html: seg.html }}
            />
          );
        }
        // Fallback: KaTeX not yet loaded
        return (
          <span key={i} style={{ direction: 'ltr', display: 'inline-block', fontStyle: 'italic' }}>
            {seg.content}
          </span>
        );
      })}
    </>
  );
}

/**
 * Renders a single exam question card.
 *
 * Props:
 *   question {object} — the question object from the JSON array
 *   pyodide  {object|null} — Pyodide instance (passed down for DiagramViewer)
 *   status   {string}      — Pyodide status
 *   index    {number}      — 0-based position in the questions array
 */
export default function QuestionCard({ question, pyodide, status, index }) {
  const [showSolution, setShowSolution] = useState(false);
  const difficulty = question.difficulty || '';
  const diffColors = DIFFICULTY_COLORS[difficulty] || { bg: 'var(--color-primary-light)', text: 'var(--color-primary)' };

  const pill = (label, bg, color) => (
    <span style={{
      background: bg, color, borderRadius: '999px',
      padding: '3px 12px', fontSize: '12px', fontWeight: '700',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );

  return (
    <div style={{
      backgroundColor: 'var(--color-white)',
      borderRadius: 'var(--radius-card)',
      padding: '28px 32px',
      boxShadow: 'var(--card-shadow)',
      border: '1px solid var(--color-border)',
      direction: 'rtl',
      marginBottom: '24px',
    }}>
      {/* Badge row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
        {pill(`שאלה ${index + 1}`, 'var(--color-primary)', 'white')}
        {question.subject && pill(question.subject, 'var(--color-surface)', 'var(--color-text-secondary)')}
        {difficulty && pill(difficulty, diffColors.bg, diffColors.text)}
        <span style={{ marginRight: 'auto', fontSize: '11px', color: 'var(--color-text-secondary)', fontStyle: 'italic', opacity: 0.7 }}>
          {question.type}
        </span>
      </div>

      {/* Question text */}
      <div style={{ fontSize: '16px', lineHeight: '1.9', color: 'var(--color-text)', marginBottom: '20px' }}>
        <LatexText str={question.question} />
      </div>

      {/* Diagram (only if python_drawer is present) */}
      {question.python_drawer && (
        <DiagramViewer script={question.python_drawer} pyodide={pyodide} status={status} />
      )}

      {/* Solution toggle */}
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '8px' }}>
        <button
          onClick={() => setShowSolution(v => !v)}
          style={{
            background: 'transparent',
            border: `1.5px solid var(--color-primary)`,
            color: 'var(--color-primary)',
            borderRadius: '8px',
            padding: '8px 18px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'var(--color-primary-light)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          {showSolution ? '🙈 הסתר פתרון' : '👁️ הצג פתרון'}
        </button>

        {showSolution && (
          <div style={{
            marginTop: '14px',
            padding: '16px 20px',
            backgroundColor: 'var(--color-success-light)',
            borderRadius: '10px',
            borderRight: '3px solid var(--color-success)',
            fontSize: '15px',
            lineHeight: '1.8',
            color: 'var(--color-text)',
          }}>
            <LatexText str={question.solution} />
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd app && git add src/viewer/QuestionCard.jsx
git commit -m "feat(viewer): add QuestionCard with LaTeX rendering and solution toggle"
```

---

## Task 6: Create `ExamViewer.jsx`

**Files:**
- Create: `app/src/viewer/ExamViewer.jsx`

`parseViewerJson` is a pure function exported from `ExamViewer.jsx` — testable without a browser. We create `ExamViewer.jsx` first, then write tests that import from it.

- [ ] **Step 1: Write the failing test stubs**

Append to `app/src/viewer/renderLatex.test.js`:

```js
import { parseViewerJson } from './ExamViewer.jsx';

describe('parseViewerJson', () => {
  it('returns ok:true and data for valid JSON array', () => {
    const result = parseViewerJson(JSON.stringify([{ id: 1 }]));
    expect(result.ok).toBe(true);
    expect(result.data).toHaveLength(1);
  });

  it('strips ```json fences before parsing', () => {
    const fenced = '```json\n[{"id":1}]\n```';
    const result = parseViewerJson(fenced);
    expect(result.ok).toBe(true);
  });

  it('strips plain ``` fences before parsing', () => {
    const fenced = '```\n[{"id":1}]\n```';
    const result = parseViewerJson(fenced);
    expect(result.ok).toBe(true);
  });

  it('returns ok:false for malformed JSON', () => {
    const result = parseViewerJson('{not json}');
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('returns ok:false when JSON is an object not an array', () => {
    const result = parseViewerJson('{"key":"value"}');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('מערך');
  });

  it('returns ok:false for empty input', () => {
    const result = parseViewerJson('');
    expect(result.ok).toBe(false);
  });

  it('returns ok:false for empty array', () => {
    const result = parseViewerJson('[]');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('ריק');
  });

  it('preserves all question fields through parse', () => {
    const q = { id: 1, type: 'OPEN', question: 'מהו?', solution: 'כך', python_drawer: null };
    const result = parseViewerJson(JSON.stringify([q]));
    expect(result.ok).toBe(true);
    expect(result.data[0]).toMatchObject(q);
  });
});
```

- [ ] **Step 2: Run tests — confirm import fails**

```bash
cd app && npx vitest run src/viewer/renderLatex.test.js
```

Expected: the new `parseViewerJson` describe block FAILs — function is not defined in test context (it's not exported from any file yet). The earlier `splitLatex` tests still PASS.

- [ ] **Step 3: Create `ExamViewer.jsx`**

Create `app/src/viewer/ExamViewer.jsx`:

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { usePyodide } from './usePyodide.js';
import QuestionCard from './QuestionCard.jsx';

// Pyodide CDN script injection (idempotent)
function ensurePyodideScript() {
  if (document.getElementById('pyodide-cdn')) return;
  const s = document.createElement('script');
  s.id = 'pyodide-cdn';
  s.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
  document.head.appendChild(s);
}

/**
 * Parses raw JSON string → { ok: true, data: [] } | { ok: false, error: string }
 * Exported so it can be inlined into tests.
 */
export function parseViewerJson(raw) {
  if (!raw || !raw.trim()) return { ok: false, error: 'הקלט ריק' };
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?/, '').replace(/```$/, '').trim();
  }
  let data;
  try {
    data = JSON.parse(cleaned);
  } catch {
    return { ok: false, error: 'JSON שגוי — בדוק פסיקים, סוגריים, וגרשיים' };
  }
  if (!Array.isArray(data)) return { ok: false, error: 'הקלט חייב להיות מערך של שאלות (array)' };
  if (data.length === 0) return { ok: false, error: 'המערך ריק — אין שאלות לטעון' };
  return { ok: true, data };
}

/**
 * Top-level Exam Viewer page.
 *
 * Props:
 *   sharedData {array|null} — questions injected by the builder tab; null if none.
 */
export default function ExamViewer({ sharedData }) {
  const { pyodide, status, error: pyError, init } = usePyodide();
  const [questions, setQuestions] = useState(null);
  const [jsonInput, setJsonInput] = useState('');
  const [parseError, setParseError] = useState(null);
  const fileRef = useRef(null);

  // Kick off lazy Pyodide load and inject CDN script on first render
  useEffect(() => {
    ensurePyodideScript();
    init();
  }, [init]);

  // Auto-load from prop or window injection
  useEffect(() => {
    if (questions) return; // already have questions
    if (sharedData && Array.isArray(sharedData) && sharedData.length > 0) {
      setQuestions(sharedData);
      return;
    }
    const winData = window.__GEMINI_EXAM_DATA__;
    if (winData && Array.isArray(winData) && winData.length > 0) {
      setQuestions(winData);
    }
  }, [sharedData, questions]);

  function handleLoadJson() {
    const result = parseViewerJson(jsonInput);
    if (result.ok) {
      setQuestions(result.data);
      setParseError(null);
    } else {
      setParseError(result.error);
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setJsonInput(text);
      const result = parseViewerJson(text);
      if (result.ok) {
        setQuestions(result.data);
        setParseError(null);
      } else {
        setParseError(result.error);
      }
    };
    reader.readAsText(file);
  }

  const containerStyle = {
    direction: 'rtl',
    maxWidth: '860px',
    margin: '0 auto',
    padding: '0 0 60px',
  };

  // Pyodide loading overlay
  const loadingOverlay = status === 'loading' && (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15,23,42,0.85)',
      backdropFilter: 'blur(6px)',
      zIndex: 500,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '20px',
      color: '#f8fafc',
    }}>
      <div style={{
        width: '52px', height: '52px',
        border: '3px solid var(--color-primary)',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <div style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
        טוען מנוע שרטוט אקדמי...
      </div>
      <div style={{ fontSize: '13px', color: '#94a3b8' }}>
        מתקין: schemdraw, matplotlib
      </div>
    </div>
  );

  // Pyodide error banner
  const errorBanner = status === 'error' && (
    <div style={{
      padding: '14px 20px', marginBottom: '24px',
      backgroundColor: 'var(--color-error-light)',
      border: '1px solid var(--color-error)',
      borderRadius: '10px', fontSize: '14px',
      color: 'var(--color-error)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span>⚠️ מנוע השרטוט לא נטען: {pyError}</span>
      <button
        onClick={() => init()}
        style={{ background: 'var(--color-error)', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px' }}
      >
        נסה שנית
      </button>
    </div>
  );

  // JSON input panel (shown when no questions loaded)
  const inputPanel = !questions && (
    <div style={{
      backgroundColor: 'var(--color-white)',
      borderRadius: 'var(--radius-card)',
      padding: '32px',
      boxShadow: 'var(--card-shadow)',
      border: '1px solid var(--color-border)',
      marginBottom: '32px',
    }}>
      <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '16px', color: 'var(--color-text)' }}>
        📋 טען שאלות
      </div>
      <textarea
        value={jsonInput}
        onChange={e => setJsonInput(e.target.value)}
        placeholder={'[{"id":1,"type":"OPEN","subject":"Physics","difficulty":"Medium","question":"...","solution":"...","python_drawer":null}]'}
        style={{
          width: '100%', boxSizing: 'border-box',
          height: '120px', resize: 'vertical',
          backgroundColor: 'var(--color-surface)',
          border: `1px solid ${parseError ? 'var(--color-error)' : 'var(--color-border)'}`,
          borderRadius: '10px', padding: '12px 14px',
          fontFamily: 'monospace', fontSize: '13px',
          color: 'var(--color-text)', direction: 'ltr',
          outline: 'none',
        }}
      />
      {parseError && (
        <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--color-error)' }}>
          ⚠️ {parseError}
        </div>
      )}
      <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
        <button
          onClick={handleLoadJson}
          style={{
            backgroundColor: 'var(--color-primary)', color: 'white',
            border: 'none', borderRadius: '10px',
            padding: '10px 22px', cursor: 'pointer',
            fontWeight: '700', fontSize: '14px',
          }}
        >
          טען JSON
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: '10px', padding: '10px 22px',
            cursor: 'pointer', fontWeight: '600', fontSize: '14px',
          }}
        >
          📂 העלה קובץ
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );

  // Loaded question list
  const questionList = questions && (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ fontWeight: '900', fontSize: '22px', color: 'var(--color-text)' }}>
          {questions.length} שאלות
        </div>
        <button
          onClick={() => { setQuestions(null); setJsonInput(''); setParseError(null); }}
          style={{
            background: 'none', border: '1px solid var(--color-border)',
            borderRadius: '8px', padding: '7px 14px',
            cursor: 'pointer', color: 'var(--color-text-secondary)',
            fontSize: '13px',
          }}
        >
          🔄 טען מבחן אחר
        </button>
      </div>
      {questions.map((q, i) => (
        <QuestionCard key={q.id ?? i} question={q} pyodide={pyodide} status={status} index={i} />
      ))}
    </>
  );

  return (
    <div style={containerStyle}>
      {loadingOverlay}
      {errorBanner}
      {inputPanel}
      {questionList}
    </div>
  );
}
```

- [ ] **Step 4: Run all viewer tests — confirm all pass**

```bash
cd app && npx vitest run src/viewer/renderLatex.test.js
```

Expected: All tests PASS (splitLatex + parseViewerJson suites).

- [ ] **Step 5: Commit**

```bash
cd app && git add src/viewer/ExamViewer.jsx src/viewer/renderLatex.test.js
git commit -m "feat(viewer): add ExamViewer page with JSON input, Pyodide overlay, and question list"
```

---

## Task 7: Wire ExamViewer into Architecture.jsx

**Files:**
- Modify: `app/Architecture.jsx`

- [ ] **Step 1: Add the import**

Open `app/Architecture.jsx`. After the existing React import on line 1, add:

```js
import ExamViewer from './src/viewer/ExamViewer.jsx';
```

The top of the file should look like:
```js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import ExamViewer from './src/viewer/ExamViewer.jsx';
```

- [ ] **Step 2: Add `onViewerOpen` prop to `AppHeader` and a viewer button**

Find the `AppHeader` function (around line 409). Add `onViewerOpen` to its props and insert a button next to the existing `onPromptArchitect` button.

Current signature:
```js
function AppHeader({ onToggleSidebar, onOpenSettings, onPromptArchitect, onHome, currentTitle, showHome }) {
```

Change to:
```js
function AppHeader({ onToggleSidebar, onOpenSettings, onPromptArchitect, onViewerOpen, onHome, currentTitle, showHome }) {
```

Inside the header's button row (the `<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>` block), add this button **before** the `onPromptArchitect` button:

```jsx
<button
  title="צפייה במבחן"
  onClick={onViewerOpen}
  style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.colors.primary, padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
  onMouseOver={e => e.currentTarget.style.backgroundColor = TOKENS.colors.primaryLight}
  onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
>
  📋
</button>
```

- [ ] **Step 3: Thread `onViewerOpen` through `Layout`**

Find the `Layout` function (around line 922). Add `onViewerOpen` to its props and pass it through to `AppHeader`.

Current `Layout` signature:
```js
function Layout({
  children,
  mode, examTitle, setMode,
  isHistoryModalOpen, setIsHistoryModalOpen,
  isSettingsOpen, setIsSettingsOpen,
  isImportModalOpen, setIsImportModalOpen,
  history, handleLoadFromHistory,
  theme, setTheme, preset, setPreset,
  handleExportData, handleImportData, handleClearData,
  handleLoadCustomJSON,
  onPromptArchitect,
}) {
```

Add `onViewerOpen,` to the destructured props list. Then find the `<AppHeader .../>` call inside Layout and add:
```jsx
onViewerOpen={onViewerOpen}
```

- [ ] **Step 4: Add `onViewerOpen` to `layoutProps` in `App`**

Find the `layoutProps` object in the `App` function (around line 1169). Add:

```js
onViewerOpen: () => setMode('viewer'),
```

- [ ] **Step 5: Add viewer render case**

Find the main return block in `App` (around line 1186). The structure is:

```jsx
return (
  <Layout {...layoutProps}>
    {dynamicQuestions.length > 0 ? (
      ...welcome screen...
    ) : (
      <PortalView ... />
    )}
  </Layout>
);
```

Replace with:

```jsx
return (
  <Layout {...layoutProps}>
    {mode === 'viewer' ? (
      <ExamViewer sharedData={dynamicQuestions.length > 0 ? dynamicQuestions : null} />
    ) : dynamicQuestions.length > 0 ? (
      <div>
        ...existing welcome screen content...
      </div>
    ) : (
      <PortalView onOpenImport={() => setIsImportModalOpen(true)} onFileUpload={handleFileUpload} onOpenHistory={() => setIsHistoryModalOpen(true)} historyCount={history.length} />
    )}
  </Layout>
);
```

**Important:** Keep the existing welcome screen JSX (lines ~1186–1198) intact inside the second branch. Only wrap it in the new ternary.

- [ ] **Step 6: Run the dev server and smoke-test**

```bash
cd app && npm run dev
```

1. Open the app. Confirm the 📋 button appears in the header.
2. Click 📋 — the viewer screen loads. Confirm the JSON input panel appears.
3. Confirm a loading overlay appears briefly (Pyodide loading from CDN).
4. Paste this minimal JSON and click "טען JSON":
   ```json
   [{"id":1,"type":"OPEN","subject":"Physics","difficulty":"Medium","question":"Find $I$ where $I = V/R$ and $V = 12V$, $R = 6\\Omega$","solution":"$I = 2A$","python_drawer":null}]
   ```
5. Confirm a question card renders with:
   - "שאלה 1" badge in indigo
   - "Physics" badge in gray
   - "Medium" badge in amber
   - Question text with inline math rendered via KaTeX
   - "👁️ הצג פתרון" button at the bottom
6. Click the solution toggle. Confirm solution panel appears with rendered LaTeX.
7. Click 📋 again from home to confirm no double-load of Pyodide (check browser console — `loadPyodide` should only be called once).

- [ ] **Step 7: Run all tests**

```bash
cd app && npm test
```

Expected: all tests PASS (LZString, parseExamJson, validateQuestion, isValidQuestionArray, isValidTime, buildMoreQuestionsPrompt, splitLatex, parseViewerJson).

- [ ] **Step 8: Commit**

```bash
cd app && git add Architecture.jsx
git commit -m "feat(viewer): wire ExamViewer into Architecture.jsx as viewer mode"
```

---

## Task 8: Smoke-test with Python diagram

**Files:** None — validation only.

- [ ] **Step 1: Test a real Python diagram**

With the dev server running, navigate to the viewer, paste this JSON, and click "טען JSON":

```json
[
  {
    "id": 1,
    "type": "OPEN",
    "subject": "Physics - Circuits",
    "difficulty": "Medium",
    "question": "מצא את הזרם במעגל הבא:",
    "solution": "א. $I = 2\\\\text{A}$",
    "python_drawer": "import schemdraw\nimport schemdraw.elements as elm\nd = schemdraw.Drawing()\nd += elm.Battery().up().label('12V')\nd += elm.Resistor().right().label('6\\\\Omega')\nd += elm.Line().down()\nd += elm.Line().left()\nsvg_string = d.get_imagedata('svg').decode('utf-8')\nsvg_string"
  }
]
```

Wait for Pyodide to finish loading (overlay disappears). Confirm:
- The circuit SVG renders inside the question card
- No JavaScript console errors
- "👁️ הצג פתרון" reveals the solution with rendered LaTeX

- [ ] **Step 2: Test error fallback**

Paste a question with a broken Python script:

```json
[{"id":2,"type":"OPEN","subject":"Test","difficulty":"Easy","question":"שאלה","solution":"תשובה","python_drawer":"import nonexistent_lib\nresult"}]
```

Confirm: the error fallback box appears with "⚠️ שגיאה בהרצת שרטוט" and a collapsible error detail. The app does not crash.

- [ ] **Step 3: Final commit**

```bash
cd app && git add -p  # review any stray changes
git commit -m "feat: complete STEM Exam Viewer — LaTeX + Pyodide SVG diagrams"
```
