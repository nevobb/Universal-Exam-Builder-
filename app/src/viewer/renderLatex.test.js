import { describe, it, expect } from 'vitest';
import { splitLatex } from './renderLatex.js';

describe('splitLatex', () => {
  it('returns a single text segment for plain text', () => {
    const result = splitLatex('hello world');
    expect(result).toEqual([{ type: 'text', content: 'hello world' }]);
  });

  it('detects inline math wrapped in single $', () => {
    const result = splitLatex('Current is $I = 2A$');
    expect(result).toEqual([
      { type: 'text', content: 'Current is ' },
      { type: 'inline', content: 'I = 2A' },
    ]);
  });

  it('detects block math wrapped in $$', () => {
    const result = splitLatex('$$E = mc^2$$');
    expect(result).toEqual([{ type: 'block', content: 'E = mc^2' }]);
  });

  it('handles mixed text, inline, and block math', () => {
    const result = splitLatex('Find $x$ where $$x^2 = 4$$ then done');
    expect(result).toEqual([
      { type: 'text', content: 'Find ' },
      { type: 'inline', content: 'x' },
      { type: 'text', content: ' where ' },
      { type: 'block', content: 'x^2 = 4' },
      { type: 'text', content: ' then done' },
    ]);
  });

  it('unescapes double-backslashes before splitting', () => {
    const result = splitLatex('$\\\\frac{1}{2}$');
    expect(result).toEqual([{ type: 'inline', content: '\\frac{1}{2}' }]);
  });

  it('returns empty array for empty string', () => {
    expect(splitLatex('')).toEqual([]);
  });

  it('returns empty array for null', () => {
    expect(splitLatex(null)).toEqual([]);
  });

  it('returns a single text segment when no math delimiters present', () => {
    const result = splitLatex('שאלה פשוטה ללא נוסחאות');
    expect(result).toEqual([{ type: 'text', content: 'שאלה פשוטה ללא נוסחאות' }]);
  });

  it('handles multiple inline math expressions', () => {
    const result = splitLatex('$a$ plus $b$ equals $c$');
    expect(result).toEqual([
      { type: 'inline', content: 'a' },
      { type: 'text', content: ' plus ' },
      { type: 'inline', content: 'b' },
      { type: 'text', content: ' equals ' },
      { type: 'inline', content: 'c' },
    ]);
  });

  it('prioritizes $$ over $ (block wins when both delimiters present)', () => {
    const result = splitLatex('$$a + b$$');
    expect(result[0].type).toBe('block');
  });

  it('filters out empty text segments', () => {
    const result = splitLatex('$x$');
    expect(result.every(s => s.content.length > 0)).toBe(true);
  });
});
