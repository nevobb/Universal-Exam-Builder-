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
  const svgContainerRef = useRef(null);

  // Run Python script and capture SVG result
  useEffect(() => {
    if (!script) return;
    if (status !== 'ready' || !pyodide) return;
    if (script === prevScript.current) return;

    prevScript.current = script;
    setRunning(true);
    setSvg(null);
    setRunError(null);

    pyodide.runPythonAsync(script)
      .then((result) => {
        const raw = typeof result === 'string' ? result : String(result);
        const clean = window.DOMPurify
          ? window.DOMPurify.sanitize(raw, { USE_PROFILES: { svg: true } })
          : raw;
        setSvg(clean);
      })
      .catch((err) => {
        setRunError(err.message || String(err));
      })
      .finally(() => {
        setRunning(false);
      });
  }, [script, pyodide, status]);

  // Inject SVG into DOM safely via DOMParser (avoids dangerouslySetInnerHTML)
  useEffect(() => {
    if (!svgContainerRef.current || !svg) return;
    while (svgContainerRef.current.firstChild) {
      svgContainerRef.current.removeChild(svgContainerRef.current.firstChild);
    }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svg, 'image/svg+xml');
      svgContainerRef.current.appendChild(document.importNode(doc.documentElement, true));
    } catch {
      svgContainerRef.current.textContent = 'Error rendering SVG';
    }
  }, [svg]);

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
      ref={svgContainerRef}
      style={{ margin: '16px 0', overflowX: 'auto', direction: 'ltr' }}
    />
  );
}
