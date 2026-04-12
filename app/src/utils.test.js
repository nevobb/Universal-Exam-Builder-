/**
 * Unit tests for LZString compression and JSON validation logic.
 *
 * These tests are extracted/adapted from the logic in Architecture.jsx
 * to run in isolation via Vitest.
 *
 * Run with: npx vitest run
 */

import { describe, it, expect } from 'vitest';

// ============================================================
// LZString — inlined from Architecture.jsx for test isolation
// ============================================================
const LZString = {
  _f: String.fromCharCode,
  compressToEncodedURIComponent: (a) => {
    if (null == a) return "";
    return LZString._c(a, 6, (a) =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$".charAt(a)
    );
  },
  decompressFromEncodedURIComponent: (a) => {
    if (null == a) return "";
    if ("" == a) return null;
    a = a.replace(/ /g, "+");
    return LZString._d(a.length, 32, (b) =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$".indexOf(a.charAt(b))
    );
  },
  _c: (a, b, c) => {
    if (null == a) return "";
    var d, e, f, g = {}, h = {}, i = "", j = "", k = "", l = 2, m = 3, n = 2, o = [], p = 0, q = 0;
    for (f = 0; f < a.length; f += 1)
      if (i = a.charAt(f), Object.prototype.hasOwnProperty.call(g, i) || (g[i] = m++, h[i] = !0), j = k + i, Object.prototype.hasOwnProperty.call(g, j)) k = j;
      else {
        if (Object.prototype.hasOwnProperty.call(h, k)) {
          if (k.charCodeAt(0) < 256) {
            for (d = 0; d < n; d++) p <<= 1, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++;
            for (e = k.charCodeAt(0), d = 0; d < 8; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1;
          } else {
            for (e = 1, d = 0; d < n; d++) p = p << 1 | e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e = 0;
            for (e = k.charCodeAt(0), d = 0; d < 16; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1;
          }
          l--, 0 == l && (l = Math.pow(2, n), n++), delete h[k];
        } else for (e = g[k], d = 0; d < n; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1;
        l--, 0 == l && (l = Math.pow(2, n), n++), g[j] = m++, k = String(i);
      }
    if ("" !== k) {
      if (Object.prototype.hasOwnProperty.call(h, k)) {
        if (k.charCodeAt(0) < 256) {
          for (d = 0; d < n; d++) p <<= 1, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++;
          for (e = k.charCodeAt(0), d = 0; d < 8; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1;
        } else {
          for (e = 1, d = 0; d < n; d++) p = p << 1 | e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e = 0;
          for (e = k.charCodeAt(0), d = 0; d < 16; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1;
        }
        l--, 0 == l && (l = Math.pow(2, n), n++), delete h[k];
      } else for (e = g[k], d = 0; d < n; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1;
      l--, 0 == l && (l = Math.pow(2, n), n++);
    }
    for (e = 2, d = 0; d < n; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1;
    for (;;) { if (p <<= 1, q == b - 1) { o.push(c(p)); break; } q++; }
    return o.join("");
  },
  _d: (a, b, c) => {
    var d, e, f, g, h, i, j, k = [], l = 4, m = 4, n = 3, o = "", p = [], q = { val: c(0), position: b, index: 1 };
    for (d = 0; d < 3; d += 1) k[d] = d;
    for (f = 0, h = Math.pow(2, 2), g = 1; g != h;) e = q.val & q.position, q.position >>= 1, 0 == q.position && (q.position = b, q.val = c(q.index++)), f |= (0 < e ? 1 : 0) * g, g <<= 1;
    switch (f) {
      case 0:
        for (f = 0, h = Math.pow(2, 8), g = 1; g != h;) e = q.val & q.position, q.position >>= 1, 0 == q.position && (q.position = b, q.val = c(q.index++)), f |= (0 < e ? 1 : 0) * g, g <<= 1;
        j = LZString._f(f); break;
      case 1:
        for (f = 0, h = Math.pow(2, 16), g = 1; g != h;) e = q.val & q.position, q.position >>= 1, 0 == q.position && (q.position = b, q.val = c(q.index++)), f |= (0 < e ? 1 : 0) * g, g <<= 1;
        j = LZString._f(f); break;
      case 2: return "";
    }
    for (k[3] = j, i = j, p.push(j);;) {
      if (q.index > a) return "";
      for (f = 0, h = Math.pow(2, n), g = 1; g != h;) e = q.val & q.position, q.position >>= 1, 0 == q.position && (q.position = b, q.val = c(q.index++)), f |= (0 < e ? 1 : 0) * g, g <<= 1;
      switch (j = f) {
        case 0:
          for (f = 0, h = Math.pow(2, 8), g = 1; g != h;) e = q.val & q.position, q.position >>= 1, 0 == q.position && (q.position = b, q.val = c(q.index++)), f |= (0 < e ? 1 : 0) * g, g <<= 1;
          k[m++] = LZString._f(f), j = m - 1, l--; break;
        case 1:
          for (f = 0, h = Math.pow(2, 16), g = 1; g != h;) e = q.val & q.position, q.position >>= 1, 0 == q.position && (q.position = b, q.val = c(q.index++)), f |= (0 < e ? 1 : 0) * g, g <<= 1;
          k[m++] = LZString._f(f), j = m - 1, l--; break;
        case 2: return p.join("");
      }
      if (0 == l && (l = Math.pow(2, n), n++), k[j]) o = k[j];
      else { if (j !== m) return null; o = i + i.charAt(0); }
      p.push(o), k[m++] = i + o.charAt(0), l--, i = o, 0 == l && (l = Math.pow(2, n), n++);
    }
  },
};

// ============================================================
// JSON Validation — adapted from handleLoadCustomJSON in Architecture.jsx
// ============================================================

/**
 * Parses and validates exam JSON string.
 * Strips ```json code fences if present.
 * Returns the parsed array, or throws on failure.
 */
function parseExamJson(raw) {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?/, '').replace(/```$/, '').trim();
  }
  const data = JSON.parse(cleaned); // throws on invalid JSON
  if (!Array.isArray(data)) {
    throw new TypeError('Exam JSON must be an array');
  }
  return data;
}

/**
 * Validates that a single question object has the required fields.
 */
function validateQuestion(q) {
  const errors = [];
  if ((typeof q.id !== 'number' && typeof q.id !== 'string') || q.id === '') errors.push('id is required');
  if (q.type !== 'multiple-choice' && q.type !== 'open-ended') errors.push('type must be "multiple-choice" or "open-ended"');
  if (typeof q.subject !== 'string' || !q.subject) errors.push('subject is required');
  if (typeof q.difficulty !== 'string' || !q.difficulty) errors.push('difficulty is required');
  if (typeof q.question !== 'string' || !q.question) errors.push('question text is required');
  if (typeof q.solution !== 'string' || !q.solution) errors.push('solution is required');
  if (typeof q.explanation !== 'string' || !q.explanation) errors.push('explanation is required');
  if (!(q.python_drawer === null || typeof q.python_drawer === 'string' || q.python_drawer === undefined)) {
    errors.push('python_drawer must be a string or null');
  }

  if (q.type === 'multiple-choice') {
    if (!Array.isArray(q.options) || q.options.length !== 4 || !q.options.every(o => typeof o === 'string')) {
      errors.push('multiple-choice questions must have exactly 4 string options');
    }
    if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3) {
      errors.push('multiple-choice correctAnswer must be an integer between 0 and 3');
    }
  }

  if (q.type === 'open-ended') {
    if (!Array.isArray(q.options) || q.options.length !== 0) errors.push('open-ended questions must have empty options array');
    if (q.correctAnswer !== null) errors.push('open-ended correctAnswer must be null');
  }

  return errors;
}

// ============================================================
// Tests — LZString
// ============================================================

describe('LZString', () => {
  it('compresses and decompresses a simple string', () => {
    const input = 'Hello, World!';
    const compressed = LZString.compressToEncodedURIComponent(input);
    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    expect(decompressed).toBe(input);
  });

  it('compresses and decompresses a JSON exam array string', () => {
    const exam = JSON.stringify([
      {
        id: 'q1',
        type: 'multiple-choice',
        subject: 'Physics 2',
        difficulty: 'Intermediate Foundation',
        question: 'Q1?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        python_drawer: null,
        solution: 'Sol.',
        explanation: 'Hint.',
      }
    ]);
    const compressed = LZString.compressToEncodedURIComponent(exam);
    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    expect(decompressed).toBe(exam);
  });

  it('compresses a long repetitive string effectively', () => {
    const input = 'physics '.repeat(200);
    const compressed = LZString.compressToEncodedURIComponent(input);
    expect(compressed.length).toBeLessThan(input.length);
  });

  it('returns empty string when compressing null', () => {
    expect(LZString.compressToEncodedURIComponent(null)).toBe('');
  });

  it('returns empty string when decompressing null', () => {
    expect(LZString.decompressFromEncodedURIComponent(null)).toBe('');
  });

  it('returns null when decompressing empty string', () => {
    expect(LZString.decompressFromEncodedURIComponent('')).toBeNull();
  });

  it('handles unicode characters (Hebrew)', () => {
    const input = 'שלום עולם — מבחן';
    const compressed = LZString.compressToEncodedURIComponent(input);
    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    expect(decompressed).toBe(input);
  });

  it('handles LaTeX content', () => {
    const input = '$E = mc^2$, $$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$';
    const compressed = LZString.compressToEncodedURIComponent(input);
    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    expect(decompressed).toBe(input);
  });

  it('produces URL-safe output (no reserved chars except + and $)', () => {
    const input = JSON.stringify({ question: 'What is $F = ma$?' });
    const compressed = LZString.compressToEncodedURIComponent(input);
    // Should not contain characters that break URL params (space, %, &, #, =)
    expect(compressed).not.toMatch(/[ %&#]/);
  });

  it('decompresses space-replaced-with-plus correctly (URL param decoding simulation)', () => {
    const input = 'test string with spaces';
    const compressed = LZString.compressToEncodedURIComponent(input);
    // Simulate URL param transport where + might become space
    const withSpaces = compressed.replace(/\+/g, ' ');
    const decompressed = LZString.decompressFromEncodedURIComponent(withSpaces);
    expect(decompressed).toBe(input);
  });
});

// ============================================================
// Tests — JSON Parsing (parseExamJson)
// ============================================================

describe('parseExamJson', () => {
  const validExam = JSON.stringify([
    {
      id: 'q1',
      type: 'multiple-choice',
      subject: 'Math',
      difficulty: 'Intermediate Foundation',
      question: 'Q?',
      options: ['1', '2', '3', '4'],
      correctAnswer: 0,
      python_drawer: null,
      solution: 'S.',
      explanation: 'Hint.',
    }
  ]);

  it('parses a valid JSON array string', () => {
    const result = parseExamJson(validExam);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
  });

  it('strips ```json code fences before parsing', () => {
    const fenced = '```json\n' + validExam + '\n```';
    const result = parseExamJson(fenced);
    expect(Array.isArray(result)).toBe(true);
  });

  it('strips plain ``` code fences before parsing', () => {
    const fenced = '```\n' + validExam + '\n```';
    const result = parseExamJson(fenced);
    expect(Array.isArray(result)).toBe(true);
  });

  it('throws SyntaxError on malformed JSON', () => {
    expect(() => parseExamJson('{ not valid json ]')).toThrow(SyntaxError);
  });

  it('throws TypeError when JSON is valid but not an array', () => {
    expect(() => parseExamJson('{"key": "value"}')).toThrow(TypeError);
  });

  it('throws TypeError when root is a JSON string, not array', () => {
    expect(() => parseExamJson('"just a string"')).toThrow(TypeError);
  });

  it('handles leading/trailing whitespace around the JSON', () => {
    const result = parseExamJson('  ' + validExam + '  ');
    expect(Array.isArray(result)).toBe(true);
  });

  it('parses multiple questions', () => {
    const multiExam = JSON.stringify([
      { id: 1 }, { id: 2 }, { id: 3 }
    ]);
    const result = parseExamJson(multiExam);
    expect(result).toHaveLength(3);
  });

  it('preserves LaTeX content through parse round-trip', () => {
    const latex = '$E = mc^2$';
    const exam = JSON.stringify([{ id: 1, question: latex }]);
    const result = parseExamJson(exam);
    expect(result[0].question).toBe(latex);
  });
});

// ============================================================
// Tests — validateQuestion
// ============================================================

describe('validateQuestion', () => {
  const validMCQ = {
    id: 'q1',
    type: 'multiple-choice',
    subject: 'Physics 2',
    difficulty: 'Intermediate Foundation',
    question: 'What is $F = ma$?',
    options: ['Force', 'Mass', 'Acceleration', 'None'],
    correctAnswer: 0,
    python_drawer: null,
    solution: 'Newton\'s second law.',
    explanation: 'Use the definition of force.',
  };

  const validOpen = {
    id: 'q2',
    type: 'open-ended',
    subject: 'Math',
    difficulty: 'High Academic Challenge',
    question: 'Prove the Fundamental Theorem of Calculus.',
    options: [],
    correctAnswer: null,
    python_drawer: null,
    solution: 'Full proof here...',
    explanation: 'Relate accumulation to antiderivatives.',
  };

  it('returns no errors for a valid MCQ question', () => {
    expect(validateQuestion(validMCQ)).toHaveLength(0);
  });

  it('returns no errors for a valid Open question', () => {
    expect(validateQuestion(validOpen)).toHaveLength(0);
  });

  it('reports error when id is not a number', () => {
    const errors = validateQuestion({ ...validMCQ, id: '' });
    expect(errors).toContain('id is required');
  });

  it('reports error for invalid type', () => {
    const errors = validateQuestion({ ...validMCQ, type: 'TrueFalse' });
    expect(errors).toContain('type must be "multiple-choice" or "open-ended"');
  });

  it('reports error for invalid difficulty', () => {
    const errors = validateQuestion({ ...validMCQ, difficulty: '' });
    expect(errors).toContain('difficulty is required');
  });

  it('reports error for missing subject', () => {
    const errors = validateQuestion({ ...validMCQ, subject: '' });
    expect(errors).toContain('subject is required');
  });

  it('reports error for missing question text', () => {
    const errors = validateQuestion({ ...validMCQ, question: '' });
    expect(errors).toContain('question text is required');
  });

  it('reports error for missing solution', () => {
    const errors = validateQuestion({ ...validMCQ, solution: '' });
    expect(errors).toContain('solution is required');
  });

  it('reports error for missing explanation', () => {
    const errors = validateQuestion({ ...validMCQ, explanation: '' });
    expect(errors).toContain('explanation is required');
  });

  it('reports error when MCQ has wrong number of options', () => {
    const errors = validateQuestion({ ...validMCQ, options: ['X'] });
    expect(errors).toContain('multiple-choice questions must have exactly 4 string options');
  });

  it('reports error when MCQ correctAnswer is out of range', () => {
    const errors = validateQuestion({ ...validMCQ, correctAnswer: 4 });
    expect(errors).toContain('multiple-choice correctAnswer must be an integer between 0 and 3');
  });

  it('requires empty options and null correctAnswer for Open questions', () => {
    const errors = validateQuestion(validOpen);
    expect(errors).toHaveLength(0);
  });

  it('accepts current prompt difficulty strings', () => {
    for (const difficulty of [
      'Basic Concept Understanding',
      'Intermediate Foundation',
      'High Academic Challenge',
      'Extremely Challenging (Abuse Protocol)',
    ]) {
      const errors = validateQuestion({ ...validOpen, difficulty });
      expect(errors).toHaveLength(0);
    }
  });

  it('reports error when open-ended options are not empty', () => {
    const errors = validateQuestion({ ...validOpen, options: ['A'] });
    expect(errors).toContain('open-ended questions must have empty options array');
  });

  it('reports error when open-ended correctAnswer is not null', () => {
    const errors = validateQuestion({ ...validOpen, correctAnswer: 0 });
    expect(errors).toContain('open-ended correctAnswer must be null');
  });

  it('reports error when python_drawer is not a string or null', () => {
    const errors = validateQuestion({ ...validMCQ, python_drawer: { bad: true } });
    expect(errors).toContain('python_drawer must be a string or null');
  });
});

// ============================================================
// Integration Test — full round-trip: exam -> compress -> decompress -> parse
// ============================================================

describe('Full round-trip: exam JSON -> LZString -> decompress -> parse', () => {
  const exam = [
    {
      id: 'q1',
      type: 'multiple-choice',
      subject: 'Computer Science - Algorithms',
      difficulty: 'High Academic Challenge',
      question: 'What is the time complexity of building a heap from $n$ elements?',
      options: [
        '$O(n \\log n)$',
        '$O(n)$',
        '$O(n^2)$',
        '$O(\\log n)$',
      ],
      correctAnswer: 1,
      python_drawer: null,
      solution: 'Bottom-up heapify runs in $O(n)$ time.',
      explanation: 'Use the standard heap-build analysis.',
    },
    {
      id: 'q2',
      type: 'open-ended',
      subject: 'Medical Science - Physiology',
      difficulty: 'Intermediate Foundation',
      question: 'Describe the role of ADH in urine concentration.',
      options: [],
      correctAnswer: null,
      python_drawer: null,
      solution: 'ADH inserts AQP2 channels...',
      explanation: 'Connect ADH to water reabsorption.',
    },
  ];

  it('compresses, decompresses, and parses back to original exam', () => {
    const serialized = JSON.stringify(exam);
    const compressed = LZString.compressToEncodedURIComponent(serialized);
    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    const parsed = parseExamJson(decompressed);

    expect(parsed).toHaveLength(2);
    expect(parsed[0].id).toBe('q1');
    expect(parsed[1].type).toBe('open-ended');
    expect(JSON.stringify(parsed)).toBe(serialized);
  });

  it('all questions in the round-tripped exam pass validation', () => {
    const serialized = JSON.stringify(exam);
    const compressed = LZString.compressToEncodedURIComponent(serialized);
    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    const parsed = parseExamJson(decompressed);

    for (const q of parsed) {
      const errors = validateQuestion(q);
      expect(errors).toHaveLength(0);
    }
  });
});

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
  const typeLabel = type === 'MCQ' ? 'מרובות בחירה (MCQ)' : 'פתוחות (Open-Ended)';
  return `נושא: ${subject}
כמות שאלות נוספות: ${count}
סוג: ${typeLabel}

===== פרוטוקול זהב (Golden Protocol) =====
- הפלט הסופי חייב להיות אך ורק בלוק קוד json יחיד עם מערך JSON תקין.
- type חייב להיות בדיוק "multiple-choice" או "open-ended".
- בשאלות multiple-choice: options חייב להכיל בדיוק 4 מחרוזות; correctAnswer חייב להיות מספר שלם בין 0 ל-3.
- בשאלות open-ended: options חייב להיות []; correctAnswer חייב להיות null.
- השתמש ב-python_drawer כשדה עליון בלבד; אין להשתמש ב-diagram מקונן.`;
}

// ============================================================
// Tests — isValidQuestionArray
// ============================================================

describe('isValidQuestionArray', () => {
  it('returns true for a valid question array', () => {
    const data = [{ id: 'q1', type: 'multiple-choice', question: 'Q?', solution: 'S.' }];
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
    const data = [{ type: 'multiple-choice', question: 'Q?', solution: 'S.' }];
    expect(isValidQuestionArray(data)).toBe(false);
  });

  it('returns false when first item is missing "question"', () => {
    const data = [{ id: 'q1', type: 'multiple-choice', solution: 'S.' }];
    expect(isValidQuestionArray(data)).toBe(false);
  });

  it('returns false when first item is missing "solution"', () => {
    const data = [{ id: 'q1', type: 'multiple-choice', question: 'Q?' }];
    expect(isValidQuestionArray(data)).toBe(false);
  });

  it('returns true even when extra fields are present', () => {
    const data = [{ id: 'q1', type: 'multiple-choice', question: 'Q?', solution: 'S.', options: ['A', 'B', 'C', 'D'], correctAnswer: 0 }];
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
    expect(result).toContain('open-ended');
  });

  it('returns a non-empty string', () => {
    expect(buildMoreQuestionsPrompt('Bio', 3, 'MCQ').length).toBeGreaterThan(0);
  });

  it('includes current schema instructions', () => {
    const result = buildMoreQuestionsPrompt('Chem', 8, 'Open');
    expect(result).toContain('json');
    expect(result).toContain('multiple-choice');
    expect(result).toContain('python_drawer');
    expect(result).not.toContain('<scratchpad>');
  });
});
