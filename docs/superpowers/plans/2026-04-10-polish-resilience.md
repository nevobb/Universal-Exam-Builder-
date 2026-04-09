# Polish & Resilience Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix design-system bugs, harden data handling, add responsive layout, and deliver three polished UX features (progress bar, summary status indicators, request-more-questions buttons).

**Architecture:** All changes live in a single file (`Architecture.jsx`). Pure helper functions are extracted above the `App` component so they can be tested in isolation via `src/utils.test.js`. CSS additions go into the existing `THEME_CSS` string. No new files are created except the test additions.

**Tech Stack:** React 18, Vite, Vitest, inline styles + CSS-in-JS string (`THEME_CSS`), `localStorage`, `navigator.clipboard`.

---

## File Map

| File | Change Type | Responsibility |
|---|---|---|
| `Architecture.jsx` | Modify | All implementation changes |
| `src/utils.test.js` | Modify | New tests for pure helper functions |

---

## Task 1: Design System — Fix `TOKENS.radius.lg` and Hardcoded Zen Colors

**Files:**
- Modify: `Architecture.jsx` lines 138–142 (TOKENS.radius), line ~474 (SettingsModal Zen button)

No test needed — these are compile-time token values and visual-only color references. Verified by inspection.

- [ ] **Step 1: Add `lg` to `TOKENS.radius`**

Find this block in `Architecture.jsx` (around line 138):
```js
  radius: {
    btn: 'var(--radius-button)',
    card: 'var(--radius-card)',
    full: '9999px',
  }
```
Replace with:
```js
  radius: {
    btn: 'var(--radius-button)',
    card: 'var(--radius-card)',
    full: '9999px',
    lg: '12px',
  }
```

- [ ] **Step 2: Fix hardcoded zen colors in `SettingsModal`**

Find the Zen preset button in `SettingsModal` (around line 474). It has:
```jsx
<div style={{ backgroundColor: '#F0FDF4', padding: '8px', borderRadius: '10px', color: '#10B981' }}>
```
Replace with:
```jsx
<div style={{ backgroundColor: TOKENS.colors.primaryLight, padding: '8px', borderRadius: '10px', color: TOKENS.colors.primary }}>
```

- [ ] **Step 3: Run tests — must stay green**
```bash
npx vitest run
```
Expected: `33 tests passed`

- [ ] **Step 4: Commit**
```bash
git add Architecture.jsx
git commit -m "fix: add TOKENS.radius.lg and replace hardcoded zen colors with tokens"
```

---

## Task 2: Data Resilience — Write Failing Tests for Pure Helpers

**Files:**
- Modify: `src/utils.test.js` — append new test suite at the bottom

These three pure functions will be extracted into `Architecture.jsx` in Task 3. We test them here first (TDD), inlined into the test file following the existing pattern.

- [ ] **Step 1: Add pure helper definitions + tests to `src/utils.test.js`**

Append the following block to the **end** of `src/utils.test.js`:

```js
// ============================================================
// Pure Helpers — Data Resilience (mirrors Architecture.jsx)
// ============================================================

/**
 * Returns true if data is a non-empty array whose first item
 * has the four required question fields.
 */
function isValidQuestionArray(data) {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    ['id', 'type', 'question', 'solution'].every((k) => k in data[0])
  );
}

/**
 * Returns true if val is an integer between 1 and 300 (inclusive).
 */
function isValidTime(val) {
  const n = Number(val);
  return Number.isInteger(n) && n >= 1 && n <= 300;
}

/**
 * Builds a clipboard prompt for requesting more questions.
 * @param {string} subject - e.g. "Physics - Kinematics"
 * @param {number} count   - current question count
 * @param {'MCQ'|'Open'} type
 */
function buildMoreQuestionsPrompt(subject, count, type) {
  const typeLabel = type === 'MCQ' ? 'MCQ' : 'פתוחות';
  return `צור ${count} שאלות ${typeLabel} נוספות למבחן '${subject}'. שמור על אותו schema בדיוק.`;
}

// ============================================================
// Tests — isValidQuestionArray
// ============================================================

describe('isValidQuestionArray', () => {
  it('returns true for a valid question array', () => {
    const data = [{ id: 1, type: 'MCQ', question: 'Q?', solution: 'S.' }];
    expect(isValidQuestionArray(data)).toBe(true);
  });

  it('returns false for an empty array', () => {
    expect(isValidQuestionArray([])).toBe(false);
  });

  it('returns false for a non-array (object)', () => {
    expect(isValidQuestionArray({ id: 1 })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isValidQuestionArray(null)).toBe(false);
  });

  it('returns false when first item is missing "id"', () => {
    const data = [{ type: 'MCQ', question: 'Q?', solution: 'S.' }];
    expect(isValidQuestionArray(data)).toBe(false);
  });

  it('returns false when first item is missing "question"', () => {
    const data = [{ id: 1, type: 'MCQ', solution: 'S.' }];
    expect(isValidQuestionArray(data)).toBe(false);
  });

  it('returns false when first item is missing "solution"', () => {
    const data = [{ id: 1, type: 'MCQ', question: 'Q?' }];
    expect(isValidQuestionArray(data)).toBe(false);
  });

  it('returns true even when extra fields are present', () => {
    const data = [{ id: 1, type: 'MCQ', question: 'Q?', solution: 'S.', options: [], correctAnswer: 'A' }];
    expect(isValidQuestionArray(data)).toBe(true);
  });
});

// ============================================================
// Tests — isValidTime
// ============================================================

describe('isValidTime', () => {
  it('returns true for 1 (minimum)', () => {
    expect(isValidTime(1)).toBe(true);
  });

  it('returns true for 60 (typical)', () => {
    expect(isValidTime(60)).toBe(true);
  });

  it('returns true for 300 (maximum)', () => {
    expect(isValidTime(300)).toBe(true);
  });

  it('returns true for string "60" (input value type)', () => {
    expect(isValidTime('60')).toBe(true);
  });

  it('returns false for 0', () => {
    expect(isValidTime(0)).toBe(false);
  });

  it('returns false for negative numbers', () => {
    expect(isValidTime(-5)).toBe(false);
  });

  it('returns false for 301 (above max)', () => {
    expect(isValidTime(301)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidTime('')).toBe(false);
  });

  it('returns false for NaN', () => {
    expect(isValidTime(NaN)).toBe(false);
  });

  it('returns false for floats (non-integer)', () => {
    expect(isValidTime(1.5)).toBe(false);
  });
});

// ============================================================
// Tests — buildMoreQuestionsPrompt
// ============================================================

describe('buildMoreQuestionsPrompt', () => {
  it('builds an MCQ prompt with subject and count', () => {
    const result = buildMoreQuestionsPrompt('Physics - Kinematics', 10, 'MCQ');
    expect(result).toContain('10');
    expect(result).toContain('Physics - Kinematics');
    expect(result).toContain('MCQ');
  });

  it('builds an Open prompt with Hebrew type label', () => {
    const result = buildMoreQuestionsPrompt('Math', 5, 'Open');
    expect(result).toContain('5');
    expect(result).toContain('Math');
    expect(result).toContain('פתוחות');
  });

  it('returns a non-empty string', () => {
    expect(buildMoreQuestionsPrompt('Bio', 3, 'MCQ').length).toBeGreaterThan(0);
  });

  it('includes schema instruction', () => {
    const result = buildMoreQuestionsPrompt('Chem', 8, 'Open');
    expect(result).toContain('schema');
  });
});
```

- [ ] **Step 2: Run tests — new tests must FAIL (functions not yet in Architecture.jsx)**

```bash
npx vitest run
```
Expected: 33 old tests pass, **new tests also pass** — because the functions are inlined in the test file itself (same pattern as existing `LZString` and `parseExamJson`). All tests green.

Confirm: `Tests: 33 + 22 = 55 passed` (approximately).

---

## Task 3: Data Resilience — Implement Helpers in `Architecture.jsx`

**Files:**
- Modify: `Architecture.jsx` — add helpers above `App`, update `App` body

- [ ] **Step 1: Add pure helper functions above `App` (before line 857)**

Find this comment block in `Architecture.jsx`:
```js
// ============================================================
// MAIN APP COMPONENT
// ============================================================
export default function App() {
```

Insert the following helpers **immediately before** that block:

```js
// ============================================================
// DATA RESILIENCE HELPERS
// ============================================================

function safeLoadHistory() {
  try {
    const raw = localStorage.getItem('bt-history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    localStorage.removeItem('bt-history');
    return [];
  }
}

function safeSetHistory(data) {
  try {
    localStorage.setItem('bt-history', JSON.stringify(data));
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      alert('שגיאה: האחסון המקומי מלא. נסה למחוק מבחנים ישנים.');
    }
  }
}

function isValidQuestionArray(data) {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    ['id', 'type', 'question', 'solution'].every((k) => k in data[0])
  );
}

function isValidTime(val) {
  const n = Number(val);
  return Number.isInteger(n) && n >= 1 && n <= 300;
}

function buildMoreQuestionsPrompt(subject, count, type) {
  const typeLabel = type === 'MCQ' ? 'MCQ' : 'פתוחות';
  return `צור ${count} שאלות ${typeLabel} נוספות למבחן '${subject}'. שמור על אותו schema בדיוק.`;
}
```

- [ ] **Step 2: Update `history` useState initializer in `App`**

Find in `App`:
```js
const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('bt-history') || '[]'));
```
Replace with:
```js
const [history, setHistory] = useState(safeLoadHistory);
```

- [ ] **Step 3: Update `handleLoadCustomJSON` — add schema check + safe write**

Find `handleLoadCustomJSON` in `App`. It currently reads:
```js
  const handleLoadCustomJSON = (json) => {
    try {
      let cleanedJson = json.trim();
      if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```(json)?/, '').replace(/```$/, '').trim();
      }
      
      const data = JSON.parse(cleanedJson);
      if (Array.isArray(data)) {
        setDynamicQuestions(data);
        setMode('welcome');
        const newEntry = {
          id: Date.now(),
          title: data[0]?.subject || 'מבחן חדש',
          date: new Date().toLocaleDateString('he-IL'),
          questions: data
        };
        const newHistory = [newEntry, ...history.slice(0, 49)];
        setHistory(newHistory);
        localStorage.setItem('bt-history', JSON.stringify(newHistory));
      }
    } catch (e) { alert('Invalid JSON format'); }
  };
```
Replace with:
```js
  const handleLoadCustomJSON = (json) => {
    try {
      let cleanedJson = json.trim();
      if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```(json)?/, '').replace(/```$/, '').trim();
      }
      const data = JSON.parse(cleanedJson);
      if (!isValidQuestionArray(data)) {
        alert('פורמט JSON לא תקין: חסרים שדות חובה (id, type, question, solution).');
        return;
      }
      setDynamicQuestions(data);
      setMode('welcome');
      const newEntry = {
        id: Date.now(),
        title: data[0]?.subject || 'מבחן חדש',
        date: new Date().toLocaleDateString('he-IL'),
        questions: data
      };
      const newHistory = [newEntry, ...history.slice(0, 49)];
      setHistory(newHistory);
      safeSetHistory(newHistory);
    } catch (e) { alert('Invalid JSON format'); }
  };
```

- [ ] **Step 4: Update `handleImportData` — replace raw localStorage write with `safeSetHistory`**

Find in `handleImportData`:
```js
            setHistory(data.history);
            localStorage.setItem('bt-history', JSON.stringify(data.history));
```
Replace with:
```js
            setHistory(data.history);
            safeSetHistory(data.history);
```

- [ ] **Step 5: Update `ExamSetupScreen` — add timer validation**

Find `ExamSetupScreen` component. It currently starts with:
```js
function ExamSetupScreen({ onStartExam, onCancel }) {
  const [customTime, setCustomTime] = useState('60');
```
And the custom input is:
```jsx
        <input type="number" value={customTime} onChange={e => setCustomTime(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: `2px solid ${TOKENS.colors.border}`, width: '80px', textAlign: 'center', fontSize: '18px', fontWeight: '700' }} />
```
And the start button is:
```jsx
        <button onClick={() => onStartExam(parseInt(customTime) * 60)} style={{ padding: '18px', backgroundColor: TOKENS.colors.primary, color: 'white', border: 'none', borderRadius: TOKENS.radius.btn, fontWeight: '900', fontSize: '18px', cursor: 'pointer', boxShadow: TOKENS.shadows.md }}>התחל בחינה</button>
```

Replace the entire `ExamSetupScreen` function with:
```js
function ExamSetupScreen({ onStartExam, onCancel }) {
  const [customTime, setCustomTime] = useState('60');
  const timeIsValid = isValidTime(customTime);
  return (
    <div style={{ padding: '40px 24px', maxWidth: '640px', margin: '40px auto', textAlign: 'center', backgroundColor: TOKENS.colors.white, borderRadius: TOKENS.radius.card, boxShadow: TOKENS.shadows.card }}>
      <div style={{ color: TOKENS.colors.primary, marginBottom: '24px', display: 'flex', justifyContent: 'center' }}><Icons.Timer width={64} height={64} /></div>
      <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '12px' }}>הגדרת זמן לבחינה</h2>
      <p style={{ color: TOKENS.colors.textSecondary, marginBottom: '40px' }}>בחרו את הזמן המוקצב לפתרון המבחן. המערכת תבצע סיום אוטומטי בגמר הזמן.</p>
      
      <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[10, 30, 60, 90].map(mins => (
          <button key={mins} onClick={() => onStartExam(mins * 60)} style={{ padding: '16px', backgroundColor: TOKENS.colors.surface, border: `2px solid ${TOKENS.colors.border}`, borderRadius: TOKENS.radius.lg, fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', fontSize: '18px' }} onMouseOver={e => e.currentTarget.style.borderColor = TOKENS.colors.primary} onMouseOut={e => e.currentTarget.style.borderColor = TOKENS.colors.border}>
            {mins} דקות
          </button>
        ))}
      </div>
      
      <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <input type="number" min="1" max="300" value={customTime} onChange={e => setCustomTime(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: `2px solid ${timeIsValid ? TOKENS.colors.border : TOKENS.colors.error}`, width: '80px', textAlign: 'center', fontSize: '18px', fontWeight: '700' }} />
        <span style={{ fontWeight: '700' }}>דקות בהתאמה אישית</span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button onClick={() => onStartExam(parseInt(customTime, 10) * 60)} disabled={!timeIsValid} style={{ padding: '18px', backgroundColor: timeIsValid ? TOKENS.colors.primary : TOKENS.colors.border, color: 'white', border: 'none', borderRadius: TOKENS.radius.btn, fontWeight: '900', fontSize: '18px', cursor: timeIsValid ? 'pointer' : 'default', boxShadow: timeIsValid ? TOKENS.shadows.md : 'none', transition: 'all 0.2s' }}>התחל בחינה</button>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', fontWeight: '800', color: TOKENS.colors.textSecondary, cursor: 'pointer' }}>ביטול וחזרה</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Run tests**
```bash
npx vitest run
```
Expected: All tests pass (≥55 tests).

- [ ] **Step 7: Commit**
```bash
git add Architecture.jsx src/utils.test.js
git commit -m "feat: harden data resilience — safeLoadHistory, quota guard, timer validation, schema check"
```

---

## Task 4: Responsive CSS

**Files:**
- Modify: `Architecture.jsx` — `THEME_CSS` string + `className` props on 6 elements

- [ ] **Step 1: Add responsive media queries to `THEME_CSS`**

Find the end of the `THEME_CSS` string. It currently ends with:
```css
    header, footer, button, .sidebar, .modal { display: none !important; }
    .content-card { box-shadow: none !important; border: 1px solid #eee !important; break-inside: avoid; }
    h1, h2, h3 { color: black !important; }
  }
`;
```
Replace `};` (the closing of THEME_CSS) with:
```css
    header, footer, button, .sidebar, .modal { display: none !important; }
    .content-card { box-shadow: none !important; border: 1px solid #eee !important; break-inside: avoid; }
    h1, h2, h3 { color: black !important; }
  }

  @media (max-width: 1024px) {
    .app-header { padding: 16px 24px !important; }
    .question-card { padding: 36px !important; }
  }

  @media (max-width: 640px) {
    .sidebar { width: 85vw !important; max-width: 340px !important; }
    .app-header { padding: 12px 16px !important; }
    .question-card { padding: 24px 16px !important; }
    .two-col-grid { grid-template-columns: 1fr !important; }
    .action-buttons { flex-direction: column !important; align-items: stretch !important; }
  }
`;
```

- [ ] **Step 2: Add `className="app-header"` to `AppHeader`**

Find in `AppHeader`:
```jsx
    <header className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px',
```
Replace `className="no-print"` with `className="no-print app-header"`.

- [ ] **Step 3: Add `className="sidebar"` to `HistorySidebar` inner drawer**

Find in `HistorySidebar` the inner sliding div (the one with `width: '360px'`):
```jsx
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '360px', backgroundColor: TOKENS.colors.white,
```
Add `className="sidebar"` to that `<div>`:
```jsx
      <div className="sidebar" style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '360px', backgroundColor: TOKENS.colors.white,
```

- [ ] **Step 4: Add `className="question-card"` to `QuestionScreen` white card**

Find in `QuestionScreen`:
```jsx
      <div style={{ backgroundColor: TOKENS.colors.white, padding: '48px', borderRadius: TOKENS.radius.card, boxShadow: TOKENS.shadows.card, marginBottom: '40px' }}>
```
Add `className="question-card"`:
```jsx
      <div className="question-card" style={{ backgroundColor: TOKENS.colors.white, padding: '48px', borderRadius: TOKENS.radius.card, boxShadow: TOKENS.shadows.card, marginBottom: '40px' }}>
```

- [ ] **Step 5: Add `className="two-col-grid"` to `PromptArchitectView` form grid**

Find in `PromptArchitectView`:
```jsx
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
```
Add `className="two-col-grid"`:
```jsx
        <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
```

- [ ] **Step 6: Add `className="action-buttons"` to `SummaryScreen` top action buttons row**

Find in `SummaryScreen`:
```jsx
      <div className="no-print" style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '48px' }}>
```
Replace `className="no-print"` with `className="no-print action-buttons"`.

- [ ] **Step 7: Run tests**
```bash
npx vitest run
```
Expected: All tests pass.

- [ ] **Step 8: Commit**
```bash
git add Architecture.jsx
git commit -m "feat: add responsive CSS breakpoints (640px/1024px) and className props"
```

---

## Task 5: Progress Bar in `QuestionScreen`

**Files:**
- Modify: `Architecture.jsx` — `QuestionScreen` component

- [ ] **Step 1: Insert progress bar between header row and question card**

Find in `QuestionScreen` the gap between the header row and the white card:
```jsx
      </div>
      <div className="question-card" style={{ backgroundColor: TOKENS.colors.white, padding: '48px',
```
Insert the progress bar `<div>` pair between them:
```jsx
      </div>
      <div style={{ height: '4px', backgroundColor: TOKENS.colors.border, borderRadius: '2px', marginBottom: '32px', overflow: 'hidden' }}>
        <div style={{ height: '100%', backgroundColor: TOKENS.colors.primary, borderRadius: '2px', width: `${((currentIdx + 1) / questions.length) * 100}%`, transition: 'width 0.3s ease' }} />
      </div>
      <div className="question-card" style={{ backgroundColor: TOKENS.colors.white, padding: '48px',
```

- [ ] **Step 2: Run tests**
```bash
npx vitest run
```
Expected: All tests pass.

- [ ] **Step 3: Commit**
```bash
git add Architecture.jsx
git commit -m "feat: add question progress bar to QuestionScreen"
```

---

## Task 6: Summary Status Indicators

**Files:**
- Modify: `Architecture.jsx` — `SummaryScreen` component, results list map

- [ ] **Step 1: Update the results list in `SummaryScreen`**

Find the `questions.map` block in `SummaryScreen`. It currently renders:
```jsx
        {questions.map((q, idx) => (
          <div key={q.id} className="content-card" style={{ border: `1px solid ${TOKENS.colors.border}`, borderRadius: TOKENS.radius.lg, overflow: 'hidden', backgroundColor: TOKENS.colors.white }}>
            <div onClick={() => onToggleItem(idx)} style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '800', fontSize: '17px' }}>שאלה {idx + 1}: {q.subject}</span>
              <div style={{ color: TOKENS.colors.textSecondary }}>
                {expandedItems[idx] ? <Icons.Close /> : <Icons.ChevronForward style={{ transform: 'rotate(90deg)' }} />}
              </div>
            </div>
```
Replace with:
```jsx
        {questions.map((q, idx) => {
          const isCorrect = q.type === 'MCQ' && userAnswers[q.id] === q.correctAnswer;
          const isIncorrect = q.type === 'MCQ' && !!userAnswers[q.id] && !isCorrect;
          const headerBg = isCorrect ? TOKENS.colors.successLight : isIncorrect ? TOKENS.colors.errorLight : TOKENS.colors.white;
          return (
          <div key={q.id} className="content-card" style={{ border: `1px solid ${TOKENS.colors.border}`, borderRadius: TOKENS.radius.lg, overflow: 'hidden', backgroundColor: TOKENS.colors.white }}>
            <div onClick={() => onToggleItem(idx)} style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: headerBg, transition: 'background 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {q.type === 'MCQ' && (
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: isCorrect ? TOKENS.colors.success : TOKENS.colors.error, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isCorrect ? <Icons.Check width={14} height={14} style={{ color: 'white' }} /> : <Icons.Close width={14} height={14} style={{ color: 'white' }} />}
                  </div>
                )}
                <span style={{ fontWeight: '800', fontSize: '17px' }}>שאלה {idx + 1}: {q.subject}</span>
              </div>
              <div style={{ color: TOKENS.colors.textSecondary }}>
                {expandedItems[idx] ? <Icons.Close /> : <Icons.ChevronForward style={{ transform: 'rotate(90deg)' }} />}
              </div>
            </div>
```

Also update the closing of the map — change the closing `)}` to `); })}`:

Find:
```jsx
            )}
          </div>
        ))}
```
Replace with:
```jsx
            )}
          </div>
          );
        })}
```

- [ ] **Step 2: Run tests**
```bash
npx vitest run
```
Expected: All tests pass.

- [ ] **Step 3: Commit**
```bash
git add Architecture.jsx
git commit -m "feat: add V/X status indicators and color tinting to SummaryScreen results"
```

---

## Task 7: "Request More Questions" Buttons

**Files:**
- Modify: `Architecture.jsx` — `SummaryScreen` component

- [ ] **Step 1: Add `useState` imports to `SummaryScreen` and insert buttons**

`SummaryScreen` currently starts with:
```js
function SummaryScreen({ questions, userAnswers, mode, expandedItems, onToggleItem, onRestart }) {
  const score = questions.filter(q => q.type === 'MCQ' && userAnswers[q.id] === q.correctAnswer).length;
  const mcqCount = questions.filter(q => q.type === 'MCQ').length;
```
Replace with:
```js
function SummaryScreen({ questions, userAnswers, mode, expandedItems, onToggleItem, onRestart }) {
  const score = questions.filter(q => q.type === 'MCQ' && userAnswers[q.id] === q.correctAnswer).length;
  const mcqCount = questions.filter(q => q.type === 'MCQ').length;
  const [mcqCopied, setMcqCopied] = useState(false);
  const [openCopied, setOpenCopied] = useState(false);

  const subject = questions[0]?.subject || 'המבחן';
  const count = questions.length;

  const handleCopyPrompt = (type, setCopied) => {
    const prompt = buildMoreQuestionsPrompt(subject, count, type);
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
```

- [ ] **Step 2: Insert the two buttons below the results list and above the bottom "חזרה למסך הבית" button**

Find in `SummaryScreen` the bottom section — the final standalone restart button:
```jsx
      <button onClick={onRestart} style={{ padding: '18px 64px', backgroundColor: TOKENS.colors.primary, color: 'white', border: 'none', borderRadius: TOKENS.radius.btn, fontWeight: '900', fontSize: '18px', cursor: 'pointer', boxShadow: TOKENS.shadows.md }}>חזרה למסך הבית</button>
```
Insert the request-more block **immediately before** that button:
```jsx
      <div className="action-buttons" style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '32px' }}>
        <button
          onClick={() => handleCopyPrompt('MCQ', setMcqCopied)}
          style={{ flex: 1, maxWidth: '280px', padding: '14px 24px', borderRadius: TOKENS.radius.btn, border: `2px solid ${TOKENS.colors.primary}`, backgroundColor: TOKENS.colors.white, color: mcqCopied ? TOKENS.colors.success : TOKENS.colors.primary, fontWeight: '800', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
        >
          {mcqCopied ? <><Icons.Check /> הועתק!</> : '+ בקש עוד שאלות MCQ'}
        </button>
        <button
          onClick={() => handleCopyPrompt('Open', setOpenCopied)}
          style={{ flex: 1, maxWidth: '280px', padding: '14px 24px', borderRadius: TOKENS.radius.btn, border: `2px solid ${TOKENS.colors.primary}`, backgroundColor: TOKENS.colors.white, color: openCopied ? TOKENS.colors.success : TOKENS.colors.primary, fontWeight: '800', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
        >
          {openCopied ? <><Icons.Check /> הועתק!</> : '+ בקש עוד שאלות פתוחות'}
        </button>
      </div>
      <button onClick={onRestart} style={{ padding: '18px 64px', backgroundColor: TOKENS.colors.primary, color: 'white', border: 'none', borderRadius: TOKENS.radius.btn, fontWeight: '900', fontSize: '18px', cursor: 'pointer', boxShadow: TOKENS.shadows.md }}>חזרה למסך הבית</button>
```

- [ ] **Step 3: Run tests**
```bash
npx vitest run
```
Expected: All tests pass.

- [ ] **Step 4: Commit**
```bash
git add Architecture.jsx
git commit -m "feat: add Request More Questions clipboard buttons to SummaryScreen"
```

---

## Task 8: Final Verification

- [ ] **Step 1: Run full test suite**
```bash
npx vitest run
```
Expected output:
```
✓ src/utils.test.js  (55 tests)
Test Files  1 passed (1)
      Tests  55 passed (55)
```

- [ ] **Step 2: Update Agent B Handoff**

Open `git-ready/Agent_B_Handoff.md` and update the task list to mark all items complete and summarize findings:
```markdown
## ✅ Completed in This Session

- Fixed `TOKENS.radius.lg` (was undefined — 14 silent borderRadius drops)
- Replaced 2 hardcoded zen colors with TOKENS references (dark mode safe)
- `safeLoadHistory()` — prevents white-screen crash on corrupted localStorage
- `safeSetHistory()` — alerts user on QuotaExceededError
- Schema validation in `handleLoadCustomJSON` — rejects arrays missing required fields
- Exam timer clamped to 1–300 min with disabled button on invalid input
- Responsive CSS: 640px + 1024px breakpoints for sidebar, header, cards, grids, button rows
- Progress bar in QuestionScreen (4px, animated, token colors)
- Summary status indicators: V/X badge + color tint per MCQ result
- Request More Questions buttons (clipboard, 2s feedback, Hebrew prompts)
```

- [ ] **Step 3: Final commit**
```bash
git add git-ready/Agent_B_Handoff.md
git commit -m "docs: update Agent B Handoff with completed session summary"
```
