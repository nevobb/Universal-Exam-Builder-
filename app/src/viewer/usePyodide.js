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
      // loadPyodide is injected by the Pyodide CDN script (added dynamically by ExamViewer)
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
