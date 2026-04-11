import React, { useState, useRef, useEffect } from 'react';

const LZString = {
    _f: String.fromCharCode,
    compressToEncodedURIComponent: (a) => {
        if (null == a) return "";
        var b = LZString._c(a, 6, (a) => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$".charAt(a));
        return b;
    },
    decompressFromEncodedURIComponent: (a) => {
        if (null == a) return "";
        if ("" == a) return null;
        a = a.replace(/ /g, "+");
        return LZString._d(a.length, 32, (b) => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$".indexOf(a.charAt(b)));
    },
    _c: (a, b, c) => {
        if (null == a) return "";
        var d, e, f, g = {}, h = {}, i = "", j = "", k = "", l = 2, m = 3, n = 2, o = [], p = 0, q = 0;
        for (f = 0; f < a.length; f += 1) if (i = a.charAt(f), Object.prototype.hasOwnProperty.call(g, i) || (g[i] = m++, h[i] = !0), j = k + i, Object.prototype.hasOwnProperty.call(g, j)) k = j; else {
            if (Object.prototype.hasOwnProperty.call(h, k)) {
                if (k.charCodeAt(0) < 256) {
                    for (d = 0; d < n; d++) p <<= 1, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++;
                    for (e = k.charCodeAt(0), d = 0; d < 8; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1
                } else {
                    for (e = 1, d = 0; d < n; d++) p = p << 1 | e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e = 0;
                    for (e = k.charCodeAt(0), d = 0; d < 16; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1
                }
                l--, 0 == l && (l = Math.pow(2, n), n++), delete h[k]
            } else for (e = g[k], d = 0; d < n; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1;
            l--, 0 == l && (l = Math.pow(2, n), n++), g[j] = m++, k = String(i)
        }
        if ("" !== k) {
            if (Object.prototype.hasOwnProperty.call(h, k)) {
                if (k.charCodeAt(0) < 256) {
                    for (d = 0; d < n; d++) p <<= 1, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++;
                    for (e = k.charCodeAt(0), d = 0; d < 8; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1
                } else {
                    for (e = 1, d = 0; d < n; d++) p = p << 1 | e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e = 0;
                    for (e = k.charCodeAt(0), d = 0; d < 16; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1
                }
                l--, 0 == l && (l = Math.pow(2, n), n++), delete h[k]
            } else for (e = g[k], d = 0; d < n; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1;
            l--, 0 == l && (l = Math.pow(2, n), n++)
        }
        for (e = 2, d = 0; d < n; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1;
        for (; ;) {
            if (p <<= 1, q == b - 1) {
                o.push(c(p));
                break
            }
            q++
        }
        return o.join("")
    },
    _d: (a, b, c) => {
        var d, e, f, g, h, i, j, k = [], l = 4, m = 4, n = 3, o = "", p = [], q = { val: c(0), position: b, index: 1 };
        for (d = 0; d < 3; d += 1) k[d] = d;
        for (f = 0, h = Math.pow(2, 2), g = 1; g != h;) e = q.val & q.position, q.position >>= 1, 0 == q.position && (q.position = b, q.val = c(q.index++)), f |= (0 < e ? 1 : 0) * g, g <<= 1;
        switch (f) {
            case 0:
                for (f = 0, h = Math.pow(2, 8), g = 1; g != h;) e = q.val & q.position, q.position >>= 1, 0 == q.position && (q.position = b, q.val = c(q.index++)), f |= (0 < e ? 1 : 0) * g, g <<= 1;
                j = LZString._f(f);
                break;
            case 1:
                for (f = 0, h = Math.pow(2, 16), g = 1; g != h;) e = q.val & q.position, q.position >>= 1, 0 == q.position && (q.position = b, q.val = c(q.index++)), f |= (0 < e ? 1 : 0) * g, g <<= 1;
                j = LZString._f(f);
                break;
            case 2:
                return ""
        }
        for (k[3] = j, i = j, p.push(j); ;) {
            if (q.index > a) return "";
            for (f = 0, h = Math.pow(2, n), g = 1; g != h;) e = q.val & q.position, q.position >>= 1, 0 == q.position && (q.position = b, q.val = c(q.index++)), f |= (0 < e ? 1 : 0) * g, g <<= 1;
            switch (j = f) {
                case 0:
                    for (f = 0, h = Math.pow(2, 8), g = 1; g != h;) e = q.val & q.position, q.position >>= 1, 0 == q.position && (q.position = b, q.val = c(q.index++)), f |= (0 < e ? 1 : 0) * g, g <<= 1;
                    k[m++] = LZString._f(f), j = m - 1, l--;
                    break;
                case 1:
                    for (f = 0, h = Math.pow(2, 16), g = 1; g != h;) e = q.val & q.position, q.position >>= 1, 0 == q.position && (q.position = b, q.val = c(q.index++)), f |= (0 < e ? 1 : 0) * g, g <<= 1;
                    k[m++] = LZString._f(f), j = m - 1, l--;
                    break;
                case 2:
                    return p.join("")
            }
            if (0 == l && (l = Math.pow(2, n), n++), k[j]) o = k[j]; else {
                if (j !== m) return null;
                o = i + i.charAt(0)
            }
            p.push(o), k[m++] = i + o.charAt(0), l--, i = o, 0 == l && (l = Math.pow(2, n), n++)
        }
    }
};

export default function ShareExamButton({ examData }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  function handleShare() {
    if (!examData || (Array.isArray(examData) && examData.length === 0)) return;
    const json = JSON.stringify(examData);
    const compressedData = LZString.compressToEncodedURIComponent(json);
    const shareUrl = window.location.origin + window.location.pathname + '?exam=' + compressedData;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // fallback: do nothing silently
    });
  }

  return (
    <button
      onClick={handleShare}
      aria-label={copied ? 'Copied to clipboard' : 'Share exam via link'}
      aria-pressed={copied}
      style={{
        marginTop: '24px',
        padding: '14px 32px',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-primary)',
        border: '2px solid var(--color-primary)',
        borderRadius: 'var(--radius-button)',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {copied ? '✅ הועתק ללוח!' : 'שתף מבחן 🔗'}
    </button>
  );
}
