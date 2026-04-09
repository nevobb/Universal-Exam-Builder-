# Design: Polish & Resilience Pass
**Date:** 2026-04-10  
**Scope:** `Architecture.jsx` — responsive design, data resilience, design system consistency  
**Approach:** Targeted fixes only (Approach A). No new patterns introduced.

---

## Task 1 — Responsive Design

### Strategy
Extend `THEME_CSS` with `@media` breakpoints. Assign CSS class names to the 5 affected elements using `className` props (same pattern as existing `no-print`/`content-card` classes). No inline style object changes.

### Breakpoints
- `640px` — mobile (phones, portrait tablets)
- `1024px` — tablet (landscape tablets, small laptops)

### Classes and Rules

| Class | Default (desktop) | ≤1024px (tablet) | ≤640px (mobile) |
|---|---|---|---|
| `.sidebar` | `width: 360px` | `width: 360px` | `width: 85vw; max-width: 340px` |
| `.app-header` | `padding: 16px 40px` | `padding: 16px 24px` | `padding: 12px 16px` |
| `.question-card` | `padding: 48px` | `padding: 36px` | `padding: 24px` |
| `.two-col-grid` | `grid-template-columns: repeat(2, 1fr)` | unchanged | `grid-template-columns: 1fr` |
| `.action-buttons` | `flex-direction: row` | unchanged | `flex-direction: column` |

### Files Changed
- `THEME_CSS` string: add responsive block at the bottom
- `HistorySidebar`: add `className="sidebar"` to the inner drawer `<div>`
- `AppHeader`: add `className="app-header"` to `<header>`
- `QuestionScreen`: add `className="question-card"` to the white card `<div>`
- `ExamSetupScreen` time grid: add `className="two-col-grid"`
- `PromptArchitectView` form grid: add `className="two-col-grid"`
- `SummaryScreen` action buttons row: add `className="action-buttons"`

---

## Task 2 — Data Resilience

### Fix 1: localStorage history parse crash
**Location:** `App` component, `useState` initializer for `history`  
**Problem:** `JSON.parse(localStorage.getItem('bt-history') || '[]')` throws on corrupted data, crashing the app on load with a white screen.  
**Fix:** Extract to a safe helper:
```js
function safeLoadHistory() {
  try {
    return JSON.parse(localStorage.getItem('bt-history') || '[]');
  } catch {
    localStorage.removeItem('bt-history');
    return [];
  }
}
```
Replace the `useState` initializer with `safeLoadHistory`.

### Fix 2: localStorage write quota error
**Location:** All `localStorage.setItem('bt-history', ...)` calls (2 locations: `handleLoadCustomJSON`, `handleImportData`)  
**Problem:** `QuotaExceededError` throws silently, history appears to save but doesn't.  
**Fix:** Wrap each write in `try/catch`, alert `'שגיאה: אחסון מלא. נסה למחוק מבחנים ישנים.'` on failure.

### Fix 3: Exam timer input validation
**Location:** `ExamSetupScreen`  
**Problem:** `parseInt(customTime) * 60` can produce `NaN`, `0`, or negative seconds — exam starts and immediately ends.  
**Fix:**
- Add `min="1" max="300"` to the `<input>`
- Derive `isValidTime = Number.isInteger(+customTime) && +customTime >= 1 && +customTime <= 300`
- Disable the "התחל בחינה" button when `!isValidTime`
- Pass `Math.max(1, parseInt(customTime, 10)) * 60` to `onStartExam`

### Fix 4: Imported question schema validation
**Location:** `handleLoadCustomJSON`, after `Array.isArray(data)` check  
**Problem:** An array of non-question objects passes validation and breaks the exam renderer.  
**Fix:** Add a light structural check on the first item:
```js
const isValidSchema = data.length > 0 &&
  ['id', 'type', 'question', 'solution'].every(k => k in data[0]);
if (!isValidSchema) { alert('פורמט JSON לא תקין: חסרים שדות חובה.'); return; }
```

---

## Task 3 — Design System Consistency

### Fix 1: `TOKENS.radius.lg` undefined — critical
**Location:** `TOKENS.radius` object (line ~138)  
**Problem:** `TOKENS.radius.lg` is used 14 times but never defined — `borderRadius: undefined` silently drops from every MCQ option, history card, solution panel, etc.  
**Fix:** Add `lg: '12px'` to `TOKENS.radius`. Value sits between `btn` (10px) and `card` (16px/32px).

### Fix 2: Hardcoded zen colors in `SettingsModal`
**Location:** `SettingsModal`, Zen preset button (line ~474)  
**Problem:** `backgroundColor: '#F0FDF4'` and `color: '#10B981'` are hardcoded. In dark mode these render as light green regardless of theme.  
**Fix:** Replace with `TOKENS.colors.primaryLight` and `TOKENS.colors.primary` — these already resolve to the correct zen+dark values via CSS variables.

### Font decision (no change)
`--font-body` stays as `Inter` in Zen mode. Only `--font-heading` switches to Comfortaa. Intentional — exam body text readability takes priority.

---

---

## Task 4 — Feature Additions (Agent A Approved)

### Feature 1: Question Progress Bar
**Location:** `QuestionScreen`, above the white question card  
**Spec:**
- A `2–4px` tall horizontal bar spanning the full card width
- Sits between the header row (question counter / timer) and the white question card — not sticky, flows naturally in the layout
- Fill = `(currentIdx + 1) / questions.length * 100%`
- Fill color: `TOKENS.colors.primary`
- Track color: `TOKENS.colors.border`
- Smooth transition: `width 0.3s ease`
- No new component — inline `<div>` pair inside `QuestionScreen`

### Feature 2: "Request More Questions" Buttons
**Location:** `SummaryScreen`, below the results list, above the final "חזרה למסך הבית" button  
**Spec:**
- Two side-by-side buttons (stack on mobile via `.action-buttons` class):
  - "בקש עוד שאלות MCQ" (Request More MCQ)
  - "בקש עוד שאלות פתוחות" (Request More Open)
- On click: copy a pre-formatted Hebrew prompt to clipboard:
  - MCQ: `"צור [N] שאלות MCQ נוספות למבחן '[Subject]'. שמור על אותו schema בדיוק."`
  - Open: `"צור [N] שאלות פתוחות נוספות למבחן '[Subject]'. שמור על אותו schema בדיוק."`
  - Where `N` = current question count, `Subject` = `questions[0]?.subject`
- After copy: button text changes to "✓ הועתק!" for 2 seconds then resets — use local `useState` per button
- Style: outlined secondary style — `border: 2px solid TOKENS.colors.primary`, `color: TOKENS.colors.primary`, `backgroundColor: TOKENS.colors.white`, `borderRadius: TOKENS.radius.btn`

### Feature 3: Summary Results Visual Status Indicators
**Location:** `SummaryScreen`, collapsed question row header  
**Spec:**
- Each row's title area gets a status badge on the right side (RTL — visually left):
  - **MCQ correct:** `Icons.Check` in `TOKENS.colors.success` + `backgroundColor: TOKENS.colors.successLight` tint on the row
  - **MCQ incorrect:** `Icons.Close` in `TOKENS.colors.error` + `backgroundColor: TOKENS.colors.errorLight` tint on the row
  - **Open questions:** neutral — no icon, no tint (can't auto-grade)
- Badge is a small `24×24` circle containing the icon
- The tint applies to the collapsed header `<div>` background only — not the expanded content area
- Logic: `const isCorrect = q.type === 'MCQ' && userAnswers[q.id] === q.correctAnswer`

---

## Out of Scope
- New features (Prompt Architect screen belongs to Agent A)
- Refactoring unrelated components
- Additional localStorage keys beyond `bt-history`
- Any changes to `TOKENS.colors`, `TOKENS.shadows`, or `TOKENS.spacing`

---

## Verification
After implementation: `npx vitest run` must pass all 33 tests with no regressions.
