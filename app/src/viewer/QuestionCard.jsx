import React, { useState, useRef, useEffect } from 'react';
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
        // Use a safe wrapper component for math
        return <MathSpan key={i} html={seg.html} content={seg.content} />;
      })}
    </>
  );
}

function MathSpan({ html, content }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && html) {
      // Clear and append safely
      while (ref.current.firstChild) ref.current.removeChild(ref.current.firstChild);
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const nodes = Array.from(doc.body.childNodes);
      nodes.forEach(node => ref.current.appendChild(document.importNode(node, true)));
    }
  }, [html]);

  return (
    <span
      ref={ref}
      style={{ direction: 'ltr', display: 'inline-block' }}
    >
      {!html && content}
    </span>
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
