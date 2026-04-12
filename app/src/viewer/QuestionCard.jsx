import React, { useState, useRef, useEffect, Component } from 'react';
import DiagramViewer from './DiagramViewer.jsx';
import { renderSegments } from './renderLatex.js';

class DiagramErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          margin: '16px 0', padding: '16px', borderRadius: '10px',
          backgroundColor: 'var(--color-error-light)',
          border: '1px solid var(--color-error)', fontSize: '13px',
          color: 'var(--color-error)', fontWeight: '700',
        }}>
          ⚠️ שגיאה בטעינת השרטוט
        </div>
      );
    }
    return this.props.children;
  }
}

const DIFFICULTY_COLORS = {
  Easy: { bg: 'var(--color-success-light)', text: 'var(--color-success)' },
  Medium: { bg: '#fef3c7', text: '#d97706' },
  Hard: { bg: 'var(--color-error-light)', text: 'var(--color-error)' },
  // Hebrew variants from AI output
  'קל': { bg: 'var(--color-success-light)', text: 'var(--color-success)' },
  'בינוני': { bg: '#fef3c7', text: '#d97706' },
  'קשה': { bg: 'var(--color-error-light)', text: 'var(--color-error)' },
};

const BLOCK_HTML_TAG_RE = /<(?:hr|div|p|ul|ol|li|table|blockquote|h[1-6])\b/i;

function sanitizeHtmlFragment(content) {
  const htmlWithBreaks = content.replace(/\n/g, '<br />');
  if (typeof window !== 'undefined' && window.DOMPurify) {
    return window.DOMPurify.sanitize(htmlWithBreaks, { USE_PROFILES: { html: true } });
  }
  return htmlWithBreaks;
}

/**
 * Renders a mixed text+LaTeX string as React elements.
 * Math blocks are forced to LTR; text is left as-is (inherits RTL).
 */
function HtmlTextSegment({ content }) {
  const safeHtml = sanitizeHtmlFragment(content);
  if (!safeHtml) return null;

  if (BLOCK_HTML_TAG_RE.test(safeHtml)) {
    return <div style={{ display: 'block' }} dangerouslySetInnerHTML={{ __html: safeHtml }} />;
  }

  return <span dangerouslySetInnerHTML={{ __html: safeHtml }} />;
}

function LatexLine({ text }) {
  // Exam-style horizontal rule separator
  if (text.trim() === '---') {
    return <hr style={{ border: 'none', borderTop: '1.5px solid var(--color-border)', margin: '16px 0' }} />;
  }
  const segments = renderSegments(text);
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return <HtmlTextSegment key={i} content={seg.content} />;
        }
        return <MathSpan key={i} html={seg.html} content={seg.content} />;
      })}
    </>
  );
}

function LatexText({ str }) {
  if (!str) return null;
  const paragraphs = String(str).split(/\n\n+/);

  return (
    <div style={{ display: 'block' }}>
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n');
        return (
          <div key={pIdx} style={{ marginTop: pIdx === 0 ? '0' : '12px', marginBottom: '0', textAlign: 'right' }}>
            {lines.map((line, lIdx) => (
              <React.Fragment key={`${pIdx}-${lIdx}`}>
                <LatexLine text={line} />
                {lIdx < lines.length - 1 ? <br /> : null}
              </React.Fragment>
            ))}
          </div>
        );
      })}
    </div>
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
 * Normalizes a question object from the raw AI JSON to the internal format.
 * Handles: mcq/MCQ case, options as string[], solution/answer field mapping.
 */
/** Returns the value as a trimmed string if it's a non-empty string, otherwise null. */
function extractScript(val) {
  if (typeof val === 'string' && val.trim()) return val;
  return null;
}

function normalizeQuestion(q) {
  if (!q) return null;

  const type = String(q.type || '').toLowerCase();
  const options = Array.isArray(q.options) ? q.options.map((opt, idx) => {
    if (typeof opt === 'string') {
      const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
      return { id: labels[idx] || String(idx + 1), text: opt };
    }
    return opt;
  }) : [];

  const rawAnswer = q.correctAnswer !== undefined ? q.correctAnswer : q.answer;
  let resolvedCorrect = null;

  if (type === 'mcq' || type === 'multiple-choice') {
    if (typeof rawAnswer === 'number') {
      resolvedCorrect = options[rawAnswer]?.id || String(rawAnswer + 1);
    } else if (typeof rawAnswer === 'string') {
      if (options.some(o => o.id === rawAnswer)) {
        resolvedCorrect = rawAnswer;
      } else {
        const found = options.find(o => o.text === rawAnswer);
        resolvedCorrect = found ? found.id : rawAnswer;
      }
    }
  }

  return {
    ...q,
    type: (type === 'mcq' || type === 'multiple-choice') ? 'MCQ' : 'Open',
    options,
    correctAnswer: resolvedCorrect,
    question: q.question || '',
    solution: q.solution || '',
    // Guarantee these are string-or-null — AI sometimes returns objects or proxies
    python_drawer: extractScript(q.python_drawer),
    diagram: extractScript(q.diagram),
  };
}

/**
 * Renders a single exam question card.
 */
export default function QuestionCard({ question: rawQuestion, pyodide, status, index }) {
  const [showSolution, setShowSolution] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const questionId = rawQuestion?.id;
  useEffect(() => {
    setShowSolution(false);
    setSelectedOption(null);
  }, [questionId]);

  const question = normalizeQuestion(rawQuestion);
  if (!question) return null;

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

      {/* Diagram (supports both `python_drawer` and `diagram` fields) */}
      {(question.python_drawer || question.diagram) && (
        <DiagramErrorBoundary>
          <DiagramViewer script={question.python_drawer || question.diagram} pyodide={pyodide} status={status} />
        </DiagramErrorBoundary>
      )}

      {/* MCQ Options */}
      {question.type === 'MCQ' && question.options.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {question.options.map((opt) => {
            const isCorrect = !!selectedOption && opt.id === question.correctAnswer;
            const isWrong = !!selectedOption && selectedOption === opt.id && opt.id !== question.correctAnswer;

            return (
              <button
                key={opt.id}
                onClick={() => !selectedOption && setSelectedOption(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: `1.5px solid ${
                    isCorrect ? 'var(--color-success)' :
                    isWrong ? 'var(--color-error)' :
                    selectedOption === opt.id ? 'var(--color-primary)' :
                    'var(--color-border)'
                  }`,
                  backgroundColor:
                    isCorrect ? 'var(--color-success-light)' :
                    isWrong ? 'var(--color-error-light)' :
                    selectedOption === opt.id ? 'var(--color-primary-light)' :
                    'var(--color-surface)',
                  cursor: selectedOption ? 'default' : 'pointer',
                  textAlign: 'right',
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: 'var(--color-text)',
                  transition: 'all 0.2s',
                  direction: 'rtl',
                }}
              >
                <span style={{
                  minWidth: '28px', height: '28px',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '13px',
                  backgroundColor:
                    isCorrect ? 'var(--color-success)' :
                    isWrong ? 'var(--color-error)' :
                    selectedOption === opt.id ? 'var(--color-primary)' :
                    'var(--color-border)',
                  color: (isCorrect || isWrong || selectedOption === opt.id) ? 'white' : 'var(--color-text-secondary)',
                }}>
                  {opt.id}
                </span>
                <span style={{ flex: 1 }}>
                  <LatexText str={opt.text} />
                </span>
                {isCorrect && <span style={{ fontSize: '18px' }}>✅</span>}
                {isWrong && <span style={{ fontSize: '18px' }}>❌</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Solution toggle */}
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
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
            {question.type === 'MCQ' && question.correctAnswer && (
              <div style={{ fontWeight: '800', marginBottom: '10px', color: 'var(--color-success)' }}>
                ✅ תשובה נכונה: {question.correctAnswer}
              </div>
            )}
            <LatexText str={question.solution} />
          </div>
        )}
      </div>
    </div>
  );
}
