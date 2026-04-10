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
    if (
      winData &&
      Array.isArray(winData) &&
      winData.length > 0 &&
      ['id', 'question', 'solution'].every((k) => k in winData[0])
    ) {
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
