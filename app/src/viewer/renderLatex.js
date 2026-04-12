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
function normalizeLatexInput(str) {
  if (!str) return '';
  return str
    .replace(/\r\n?/g, '\n')
    .replace(/\\\\/g, '\\')
    // ── Simple Markdown Support ──
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    // ── Aggressive Ghosting Shield ──
    // Pattern 1: Single-char variable ghost "$R$ R" → "$R$"
    .replace(/\$([A-Za-z0-9])\$\s+(\1)\b/g, (_m, v) => '$' + v + '$')
    // Pattern 2: Multi-char expression ghost "$v_0$ v_0" → "$v_0$"
    .replace(/\$([^$]{2,})\$\s+([A-Za-z0-9_]+)\b/g, (match, latex, plain) => {
      const stripped = latex.replace(/[\\{}_^]/g, '');
      const normalizedPlain = plain.replace(/_/g, '');
      return stripped === normalizedPlain ? '$' + latex + '$' : match;
    })
    // Pattern 3: Greek letter ghost "$\rho$ ρ"
    .replace(/\$\\([a-zA-Z]+)\$\s+[\u0370-\u03FF\u0590-\u05FF]/g, (_m, cmd) => '$\\\\' + cmd + '$');
}

export function splitLatex(str) {
  if (!str || typeof str !== 'string') return [];

  const normalized = normalizeLatexInput(str);

  const segments = [];
  // Match $$ first (greedy prevention: non-greedy .+?)
  const RE = /\$\$(.+?)\$\$|\$(.+?)\$/gs;
  let lastIndex = 0;
  let match;

  while ((match = RE.exec(normalized)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      const text = normalized.slice(lastIndex, match.index);
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
  if (lastIndex < normalized.length) {
    const tail = normalized.slice(lastIndex);
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
  if (typeof window === 'undefined' || !window.katex) return segs;

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
