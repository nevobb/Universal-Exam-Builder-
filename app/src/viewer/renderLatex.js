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
export function splitLatex(str) {
  if (!str || typeof str !== 'string') return [];

  // Unescape double-backslashes produced by JSON double-encoding
  const unescaped = str.replace(/\\\\/g, '\\');

  const segments = [];
  // Match $$ first (greedy prevention: non-greedy .+?)
  const RE = /\$\$(.+?)\$\$|\$(.+?)\$/gs;
  let lastIndex = 0;
  let match;

  while ((match = RE.exec(unescaped)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      const text = unescaped.slice(lastIndex, match.index);
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
  if (lastIndex < unescaped.length) {
    const tail = unescaped.slice(lastIndex);
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
