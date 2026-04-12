import React, { useState, useEffect, useRef } from 'react';
import QuestionCard from './QuestionCard.jsx';

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
 */
export default function ExamViewer({ sharedData, pyodide, pyodideStatus, pyodideError, displayMode, setDisplayMode, onCopyBulkPrompt }) {
  const status = pyodideStatus ?? 'idle';
  const pyError = pyodideError ?? null;
  const [questions, setQuestions] = useState(null);
  const [jsonInput, setJsonInput] = useState('');
  const [parseError, setParseError] = useState(null);
  const [currentFocusIdx, setCurrentFocusIdx] = useState(0);
  const [bulkMcqCopied, setBulkMcqCopied] = useState(false);
  const [bulkOpenCopied, setBulkOpenCopied] = useState(false);
  const fileRef = useRef(null);

  // Auto-load from prop or window injection
  useEffect(() => {
    if (questions) return; // already have questions
    if (sharedData && Array.isArray(sharedData) && sharedData.length > 0) {
      setQuestions(sharedData);
      return;
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
        placeholder={'[{"id":"q1","type":"open-ended","subject":"Physics 2","difficulty":"Intermediate Foundation","question":"...","options":[],"correctAnswer":null,"python_drawer":null,"solution":"...","explanation":"..."}]'}
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', backgroundColor: 'var(--color-surface)', padding: '12px 20px', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--color-white)', padding: '4px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <button onClick={() => setDisplayMode('scroll')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '800', transition: 'all 0.2s', backgroundColor: displayMode === 'scroll' ? 'var(--color-primary)' : 'transparent', color: displayMode === 'scroll' ? 'white' : 'var(--color-text-secondary)' }}>📜 רשימה</button>
          <button onClick={() => setDisplayMode('focus')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '800', transition: 'all 0.2s', backgroundColor: displayMode === 'focus' ? 'var(--color-primary)' : 'transparent', color: displayMode === 'focus' ? 'white' : 'var(--color-text-secondary)' }}>🎯 מיקוד</button>
        </div>
        <div style={{ fontWeight: '900', fontSize: '15px', color: 'var(--color-primary)' }}>
          {questions.length} שאלות במבחן
        </div>
        <button onClick={() => { setQuestions(null); setJsonInput(''); setParseError(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: '700', textDecoration: 'underline' }}>🔄 טען אחר</button>
      </div>

      {displayMode === 'scroll' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {questions.map((q, i) => (
            <QuestionCard key={q.id ?? i} question={q} pyodide={pyodide} status={status} index={i} />
          ))}

          {/* Global "More Questions" Section at the bottom of the list */}
          <div style={{
            marginTop: '40px', padding: '40px', textAlign: 'center',
            backgroundColor: 'var(--color-surface)', borderRadius: '24px',
            border: '2px dashed var(--color-border)',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '12px', color: 'var(--color-text)' }}>💡 רוצה עוד שאלות למבחן?</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', fontSize: '15px' }}>הפוך את המבחן למקיף יותר בלחיצת כפתור אחת</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  if (onCopyBulkPrompt) {
                    onCopyBulkPrompt('MCQ');
                    setBulkMcqCopied(true);
                    setTimeout(() => setBulkMcqCopied(false), 2000);
                  }
                }}
                style={{
                  padding: '14px 28px', backgroundColor: bulkMcqCopied ? 'var(--color-success)' : 'var(--color-primary)',
                  color: 'white', border: 'none', borderRadius: '12px',
                  fontSize: '15px', fontWeight: '800', cursor: 'pointer', transition: '0.2s',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                {bulkMcqCopied ? '✅ הועתק!' : '+ בקש 5 שאלות MCQ'}
              </button>
              <button
                onClick={() => {
                  if (onCopyBulkPrompt) {
                    onCopyBulkPrompt('Open');
                    setBulkOpenCopied(true);
                    setTimeout(() => setBulkOpenCopied(false), 2000);
                  }
                }}
                style={{
                  padding: '14px 28px', backgroundColor: 'var(--color-white)',
                  color: bulkOpenCopied ? 'var(--color-success)' : 'var(--color-primary)',
                  border: `2px solid ${bulkOpenCopied ? 'var(--color-success)' : 'var(--color-primary)'}`,
                  borderRadius: '12px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', transition: '0.2s'
                }}
              >
                {bulkOpenCopied ? '✅ הועתק!' : '+ בקש 5 שאלות פתוחות'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
          <QuestionCard question={questions[currentFocusIdx]} pyodide={pyodide} status={status} index={currentFocusIdx} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', padding: '20px', backgroundColor: 'var(--color-white)', borderRadius: '16px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--color-border)' }}>
            <button
              onClick={() => setCurrentFocusIdx(p => Math.max(0, p - 1))}
              disabled={currentFocusIdx === 0}
              style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-white)', cursor: currentFocusIdx === 0 ? 'default' : 'pointer', fontWeight: '800', opacity: currentFocusIdx === 0 ? 0.4 : 1, transition: 'all 0.2s' }}
            >
              שאלה קודמת
            </button>
            <div style={{ fontWeight: '900', color: 'var(--color-text-secondary)', fontSize: '15px' }}>
              {currentFocusIdx + 1} / {questions.length}
            </div>
            <button
              onClick={() => setCurrentFocusIdx(p => Math.min(questions.length - 1, p + 1))}
              disabled={currentFocusIdx === questions.length - 1}
              style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--color-primary)', color: 'white', cursor: currentFocusIdx === questions.length - 1 ? 'default' : 'pointer', fontWeight: '800', opacity: currentFocusIdx === questions.length - 1 ? 0.4 : 1, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}
            >
              שאלה הבאה
            </button>
          </div>
        </div>
      )}
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
