import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import ExamViewer from './src/viewer/ExamViewer.jsx';
import ShareExamButton from './src/components/ShareExamButton';
import { usePyodide } from './src/viewer/usePyodide.js';

import './theme.css';

const Icons = {
    Home: (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    Settings: (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>,
    History: (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>,
    Upload: (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>,
    Moon: (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>,
    Sun: (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>,
    Academic: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
    Zen: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-8 0 4 4 0 0 0-8 0 4 4 0 0 1-4 4" /></svg>,
    Check: (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12" /></svg>,
    Close: (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>,
    Import: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m8 17 4 4 4-4" /></svg>,
    Download: (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>,
    Trash: (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>,
    ChevronBack: (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="9 18 15 12 9 6" /></svg>,
    ChevronForward: (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="15 18 9 12 15 6" /></svg>,
    Timer: (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    Flag: (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" /></svg>,
    Sparkles: (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>,
    Zap: (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
};

const TOKENS = {
    colors: {
        primary: 'var(--color-primary)',
        primaryLight: 'var(--color-primary-light)',
        success: 'var(--color-success)',
        successLight: 'var(--color-success-light)',
        error: 'var(--color-error)',
        errorLight: 'var(--color-error-light)',
        text: 'var(--color-text)',
        textSecondary: 'var(--color-text-secondary)',
        surface: 'var(--color-surface)',
        white: 'var(--color-white)',
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
    },
    shadows: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        card: 'var(--card-shadow)',
    },
    radius: {
        btn: 'var(--radius-button)',
        card: 'var(--radius-card)',
        full: '9999px',
        lg: '12px',
    }
};

// ============================================================
// UTILITIES: LZString Compression
// ============================================================
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

// Components now rely on static scripts in index.html

function KaTeXSpan({ math, displayMode }) {
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current && window.katex) {
            try {
                window.katex.render(math, ref.current, { displayMode: !!displayMode, throwOnError: false });
            } catch (err) { ref.current.textContent = math; }
        }
    }, [math, displayMode]);
    return <span ref={ref} style={{ direction: 'ltr', display: 'inline-block' }}>{math}</span>;
}

function SafeSvg({ svg }) {
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current && svg) {
            while (ref.current.firstChild) ref.current.removeChild(ref.current.firstChild);
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(svg, "image/svg+xml");
                ref.current.appendChild(document.importNode(doc.documentElement, true));
            } catch (e) {
                ref.current.textContent = "Error rendering SVG";
            }
        }
    }, [svg]);
    return <div ref={ref} />;
}

function parseParagraph(text, keyOffset) {
    const parts = [];
    let remaining = text;
    let key = keyOffset;
    while (remaining.length > 0) {
        const blockIdx = remaining.indexOf('$$');
        const inlineIdx = remaining.indexOf('$');
        if (blockIdx === -1 && inlineIdx === -1) { parts.push(<span key={key++}>{remaining}</span>); break; }
        if (blockIdx !== -1 && (inlineIdx === -1 || blockIdx <= inlineIdx)) {
            if (blockIdx > 0) parts.push(<span key={key++}>{remaining.slice(0, blockIdx)}</span>);
            const closeIdx = remaining.indexOf('$$', blockIdx + 2);
            if (closeIdx === -1) { parts.push(<span key={key++}>{remaining.slice(blockIdx)}</span>); break; }
            parts.push(<KaTeXSpan key={key++} math={remaining.slice(blockIdx + 2, closeIdx)} displayMode={true} />);
            remaining = remaining.slice(closeIdx + 2);
        } else {
            if (inlineIdx > 0) parts.push(<span key={key++}>{remaining.slice(0, inlineIdx)}</span>);
            const closeIdx = remaining.indexOf('$', inlineIdx + 1);
            if (closeIdx === -1) { parts.push(<span key={key++}>{remaining.slice(inlineIdx)}</span>); break; }
            parts.push(<KaTeXSpan key={key++} math={remaining.slice(inlineIdx + 1, closeIdx)} displayMode={false} />);
            remaining = remaining.slice(closeIdx + 1);
        }
    }
    return { parts, nextKey: key };
}

function MixedContent({ text }) {
    if (!text) return null;

    // Simple Markdown Bold support
    const processedText = String(text).replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    const paragraphs = processedText.split(/\n\n+/);
    let keyCounter = 0;
    return (
        <span style={{ display: 'block' }}>
            {paragraphs.map((para, pIdx) => {
                const lines = para.split('\n');
                const paraChildren = [];
                lines.forEach((line, lIdx) => {
                    const { parts, nextKey } = parseParagraph(line, keyCounter);
                    keyCounter = nextKey;
                    paraChildren.push(...parts);
                    if (lIdx < lines.length - 1) paraChildren.push(<br key={keyCounter++} />);
                });
                return <p key={pIdx} style={{ marginTop: pIdx === 0 ? '0' : '12px', marginBottom: '0', textAlign: 'right' }}>{paraChildren}</p>;
            })}
        </span>
    );
}

// ============================================================
// COMPONENT: PortalView (New Home Screen)
// ============================================================
function PortalView({ onOpenImport, onFileUpload, onOpenHistory, historyCount }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center', padding: '20px', gap: '48px' }}>
            <div>
                <h1 style={{ fontSize: '56px', fontWeight: '900', color: TOKENS.colors.primary, marginBottom: '24px', letterSpacing: '-0.04em' }}>Universal Exam Builder</h1>
                <p style={{ fontSize: '20px', color: TOKENS.colors.textSecondary, maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' }}>
                    צרו, שתפו ונהלו מבחנים אינטראקטיביים בכל נושא. פלטפורמת הלמידה המתקדמת לסטודנטים.
                </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', width: '100%', maxWidth: '1000px' }}>
                <PortalCard icon={<Icons.Import />} title="הדבקת קוד (JSON)" desc="הדביקו קוד שנוצר על ידי Gemini" onClick={onOpenImport} />
                <PortalCard icon={<Icons.Upload />} title="טעינת קובץ" desc="העלו קובץ .exam שחבר שיתף איתכם" onClick={() => document.getElementById('file-input').click()} />
                {historyCount > 0 && (
                    <PortalCard icon={<Icons.History />} title="היסטוריה" desc={`חזרו ל-${historyCount} המבחנים האחרונים שלכם`} onClick={onOpenHistory} />
                )}
            </div>
            <input id="file-input" type="file" accept=".json,.exam" style={{ display: 'none' }} onChange={onFileUpload} />
        </div>
    );
}

function PortalCard({ icon, title, desc, onClick }) {
    return (
        <div
            onClick={onClick}
            style={{ padding: '40px 32px', backgroundColor: TOKENS.colors.white, borderRadius: TOKENS.radius.card, boxShadow: TOKENS.shadows.card, cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', border: `1px solid ${TOKENS.colors.border}`, textAlign: 'center', position: 'relative', overflow: 'hidden' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-12px)'; e.currentTarget.style.borderColor = TOKENS.colors.primary; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = TOKENS.colors.border; }}
        >
            <div style={{ padding: '20px', borderRadius: '20px', backgroundColor: TOKENS.colors.primaryLight, color: TOKENS.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {React.cloneElement(icon, { width: 40, height: 40 })}
            </div>
            <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: '800', color: TOKENS.colors.text }}>{title}</h3>
                <p style={{ margin: 0, fontSize: '15px', color: TOKENS.colors.textSecondary, lineHeight: '1.4' }}>{desc}</p>
            </div>
        </div>
    );
}

// ============================================================
// COMPONENT: AppHeader
// ============================================================
function AppHeader({ onOpenSettings, onPromptArchitect, onViewerOpen, onHome, currentTitle, showHome }) {
    return (
        <header className="no-print app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', backgroundColor: TOKENS.colors.white, borderBottom: `1px solid ${TOKENS.colors.border}`, position: 'sticky', top: 0, zIndex: 100, boxShadow: TOKENS.shadows.sm, backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: TOKENS.spacing.lg }}>
                <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: TOKENS.colors.primary, letterSpacing: '-0.02em' }}>{currentTitle || 'Universal Exam Builder'}</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {showHome && (
                    <button onClick={onHome} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.colors.textSecondary, padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = TOKENS.colors.surface} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <Icons.Home />
                    </button>
                )}
                <button title="מחולל פרומפטים" onClick={onPromptArchitect} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.colors.primary, padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = TOKENS.colors.primaryLight} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <Icons.Sparkles />
                </button>
                <button onClick={onOpenSettings} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.colors.textSecondary, padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = TOKENS.colors.surface} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <Icons.Settings />
                </button>
            </div>
        </header>
    );
}

// ============================================================
// COMPONENT: HistoryModal
// ============================================================
function HistoryModal({ isOpen, onClose, history, onLoadEntry }) {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px', backdropFilter: 'blur(4px)' }}>
            <div style={{ backgroundColor: TOKENS.colors.white, borderRadius: TOKENS.radius.card, width: '100%', maxWidth: '440px', maxHeight: '85vh', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: TOKENS.shadows.lg }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>היסטוריה</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.colors.textSecondary }}><Icons.Close /></button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                    {history.length === 0 ? <div style={{ textAlign: 'center', color: TOKENS.colors.textSecondary, padding: '40px 0' }}>טרם נשמרו מבחנים</div> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {history.map(entry => (
                                <div key={entry.id} onClick={() => onLoadEntry(entry)} style={{ padding: '16px', borderRadius: TOKENS.radius.lg, border: `1px solid ${TOKENS.colors.border}`, cursor: 'pointer', backgroundColor: TOKENS.colors.surface, transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = TOKENS.colors.primary}>
                                    <div style={{ fontWeight: '800', fontSize: '15px', marginBottom: '2px' }}>{entry.title}</div>
                                    <div style={{ fontSize: '12px', color: TOKENS.colors.textSecondary }}>{entry.date} • {entry.questions.length} שאלות</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================================
// COMPONENT: SettingsModal
// ============================================================
function SettingsModal({ isOpen, onClose, theme, setTheme, preset, setPreset, onExport, onImport, onClear }) {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px', backdropFilter: 'blur(4px)' }}>
            <div style={{ backgroundColor: TOKENS.colors.white, borderRadius: TOKENS.radius.card, width: '100%', maxWidth: '440px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', boxShadow: TOKENS.shadows.lg }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>הגדרות</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.colors.textSecondary }}><Icons.Close /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '15px', fontWeight: '800', marginBottom: '12px' }}>מערכת תצוגה</label>
                        <div style={{ display: 'flex', gap: '12px', backgroundColor: TOKENS.colors.surface, padding: '4px', borderRadius: '16px' }}>
                            <button onClick={() => setTheme('light')} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700', backgroundColor: theme === 'light' ? TOKENS.colors.white : 'transparent', boxShadow: theme === 'light' ? TOKENS.shadows.sm : 'none', color: theme === 'light' ? TOKENS.colors.text : TOKENS.colors.textSecondary }}>
                                <Icons.Sun /> בהיר
                            </button>
                            <button onClick={() => setTheme('dark')} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700', backgroundColor: theme === 'dark' ? TOKENS.colors.white : 'transparent', boxShadow: theme === 'dark' ? TOKENS.shadows.sm : 'none', color: theme === 'dark' ? TOKENS.colors.text : TOKENS.colors.textSecondary }}>
                                <Icons.Moon /> כהה
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '15px', fontWeight: '800', marginBottom: '12px' }}>סגנון (Preset)</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button onClick={() => setPreset('pro')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', border: `2px solid ${preset === 'pro' ? TOKENS.colors.primary : TOKENS.colors.border}`, backgroundColor: TOKENS.colors.white, cursor: 'pointer', textAlign: 'right' }}>
                                <div style={{ backgroundColor: TOKENS.colors.primaryLight, padding: '8px', borderRadius: '10px', color: TOKENS.colors.primary }}><Icons.Academic width={18} height={18} /></div>
                                <div style={{ fontWeight: '800', fontSize: '15px' }}>Academic Pro</div>
                            </button>
                            <button onClick={() => setPreset('zen')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', border: `2px solid ${preset === 'zen' ? TOKENS.colors.primary : TOKENS.colors.border}`, backgroundColor: TOKENS.colors.white, cursor: 'pointer', textAlign: 'right' }}>
                                <div style={{ backgroundColor: TOKENS.colors.primaryLight, padding: '8px', borderRadius: '10px', color: TOKENS.colors.primary }}><Icons.Zen width={18} height={18} /></div>
                                <div style={{ fontWeight: '800', fontSize: '15px' }}>Zen Focus</div>
                            </button>
                            <button onClick={() => setPreset('pulse')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', border: `2px solid ${preset === 'pulse' ? TOKENS.colors.primary : TOKENS.colors.border}`, backgroundColor: TOKENS.colors.white, cursor: 'pointer', textAlign: 'right' }}>
                                <div style={{ backgroundColor: TOKENS.colors.primaryLight, padding: '8px', borderRadius: '10px', color: TOKENS.colors.primary }}><Icons.Zap width={18} height={18} /></div>
                                <div style={{ fontWeight: '800', fontSize: '15px' }}>Pulse Red</div>
                            </button>
                        </div>
                    </div>

                    <div style={{ borderTop: `1px solid ${TOKENS.colors.border}`, paddingTop: '24px' }}>
                        <label style={{ display: 'block', fontSize: '15px', fontWeight: '800', marginBottom: '16px' }}>נתונים ואחסון</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={onExport} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', border: `1px solid ${TOKENS.colors.border}`, backgroundColor: TOKENS.colors.white, cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                                    <Icons.Download /> גיבוי נתונים
                                </button>
                                <button onClick={() => document.getElementById('import-input').click()} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', border: `1px solid ${TOKENS.colors.border}`, backgroundColor: TOKENS.colors.white, cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                                    <Icons.Upload /> שחזור נתונים
                                </button>
                            </div>
                            <button onClick={onClear} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: TOKENS.colors.errorLight, color: TOKENS.colors.error, cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}>
                                <Icons.Trash /> מחיקת כל ההיסטוריה
                            </button>
                            <input id="import-input" type="file" accept=".json" style={{ display: 'none' }} onChange={onImport} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// COMPONENT: ImportModal
// ============================================================
function ImportModal({ isOpen, onClose, onImport }) {
    const [text, setText] = useState('');

    // Reset text when modal opens
    useEffect(() => {
        if (isOpen) setText('');
    }, [isOpen]);

    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px', backdropFilter: 'blur(4px)' }}>
            <div style={{ backgroundColor: TOKENS.colors.white, borderRadius: TOKENS.radius.card, width: '95%', maxWidth: '640px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: TOKENS.shadows.lg }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>הדבקת קוד מבחן (JSON)</h2>
                <p style={{ color: TOKENS.colors.textSecondary, fontSize: '15px' }}>הדביקו כאן את ה-JSON שנוצר על ידי הסייען האקדמי שלכם.</p>
                <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder='[ { "id": 1, ... } ]' style={{ width: '100%', height: '300px', padding: '16px', borderRadius: TOKENS.radius.lg, border: `2px solid ${TOKENS.colors.border}`, backgroundColor: TOKENS.colors.surface, fontFamily: 'monospace', fontSize: '14px', resize: 'none', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontWeight: '800', cursor: 'pointer', color: TOKENS.colors.textSecondary }}>ביטול</button>
                    <button onClick={() => { onImport(text); onClose(); }} disabled={!text.trim()} style={{ padding: '12px 32px', borderRadius: TOKENS.radius.btn, border: 'none', backgroundColor: text.trim() ? TOKENS.colors.primary : TOKENS.colors.border, color: 'white', fontWeight: '900', cursor: 'pointer', boxShadow: TOKENS.shadows.md }}>טען מבחן</button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// CORE UI COMPONENTS (MCQ, Open, Screen)
// ============================================================
function MCQQuestion({ question, userAnswer, onAnswer, mode }) {
    const isPractice = mode === 'practice';
    const hasSvg = !!question.svg;

    // Normalizing options if they are string[]
    const options = Array.isArray(question.options) ? question.options.map((opt, idx) => {
        if (typeof opt === 'string') {
            const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
            return { id: labels[idx] || String(idx + 1), text: opt };
        }
        return opt;
    }) : [];

    // Normalizing Correct Answer
    const rawCorrect = question.correctAnswer !== undefined ? question.correctAnswer : question.answer;
    let resolvedCorrect = rawCorrect;
    if (typeof rawCorrect === 'number') {
        resolvedCorrect = options[rawCorrect]?.id || String(rawCorrect + 1);
    } else if (typeof rawCorrect === 'string' && !options.some(o => o.id === rawCorrect)) {
        const found = options.find(o => o.text === rawCorrect);
        if (found) resolvedCorrect = found.id;
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: hasSvg ? 'repeat(auto-fit, minmax(350px, 1fr))' : '1fr', gap: '40px', alignItems: 'start' }}>
            <div style={{ order: 1 }}>
                <div style={{ fontSize: '20px', color: TOKENS.colors.text, lineHeight: '1.6', marginBottom: '32px', textAlign: 'right', fontWeight: '700' }}>
                    <MixedContent text={question.question} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing.md }}>
                    {options.map((option) => {
                        const isSelected = userAnswer === option.id;
                        const isCorrect = option.id === resolvedCorrect;
                        const isLocked = isPractice && !!userAnswer;
                        let bgColor = TOKENS.colors.white, borderColor = TOKENS.colors.border;
                        if (isPractice && userAnswer) {
                            if (isSelected && isCorrect) { bgColor = TOKENS.colors.successLight; borderColor = TOKENS.colors.success; }
                            else if (isSelected && !isCorrect) { bgColor = TOKENS.colors.errorLight; borderColor = TOKENS.colors.error; }
                            else if (!isSelected && isCorrect) { bgColor = TOKENS.colors.successLight; borderColor = TOKENS.colors.success; }
                        } else if (isSelected) {
                            bgColor = TOKENS.colors.primaryLight; borderColor = TOKENS.colors.primary;
                        }
                        return (
                            <button key={option.id} disabled={isLocked} onClick={() => onAnswer(option.id)} style={{ display: 'flex', padding: '20px 24px', backgroundColor: bgColor, border: `2px solid ${borderColor}`, borderRadius: TOKENS.radius.lg, cursor: isLocked ? 'default' : 'pointer', textAlign: 'right', gap: '16px', transition: 'all 0.2s', fontSize: '17px', color: TOKENS.colors.text }} onMouseOver={e => !isLocked && !isSelected && (e.currentTarget.style.borderColor = TOKENS.colors.primary)} onMouseOut={e => !isLocked && !isSelected && (e.currentTarget.style.borderColor = TOKENS.colors.border)}>
                                <span style={{ fontWeight: '950', color: TOKENS.colors.primary, minWidth: '24px' }}>{option.id}.</span>
                                <MixedContent text={option.text} />
                            </button>
                        );
                    })}
                </div>
            </div>
            {hasSvg && (
                <div style={{ order: 2, padding: '24px', backgroundColor: TOKENS.colors.white, borderRadius: TOKENS.radius.lg, border: `1px solid ${TOKENS.colors.border}`, textAlign: 'center', alignSelf: 'start', boxShadow: TOKENS.shadows.sm }}>
                    <SafeSvg svg={question.svg} />
                </div>
            )}
        </div>
    );
}

function OpenQuestion({ question, mode, showSolution, onToggleSolution }) {
    const hasSvg = !!question.svg;

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: hasSvg ? 'repeat(auto-fit, minmax(350px, 1fr))' : '1fr', gap: '40px', alignItems: 'start', marginBottom: '32px' }}>
                <div style={{ order: 1, fontSize: '20px', color: TOKENS.colors.text, lineHeight: '1.8', textAlign: 'right', fontWeight: '700' }}>
                    <MixedContent text={question.question} />
                </div>
                {hasSvg && (
                    <div style={{ order: 2, padding: '24px', backgroundColor: TOKENS.colors.white, borderRadius: TOKENS.radius.lg, border: `1px solid ${TOKENS.colors.border}`, textAlign: 'center', boxShadow: TOKENS.shadows.sm }}>
                        <SafeSvg svg={question.svg} />
                    </div>
                )}
            </div>

            {showSolution && (
                <div style={{ padding: '32px', backgroundColor: TOKENS.colors.successLight, borderRadius: TOKENS.radius.lg, border: `2px solid ${TOKENS.colors.success}`, marginTop: '24px' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: TOKENS.colors.success, fontWeight: '900', fontSize: '18px' }}>פתרון מודרך</h4>
                    <div style={{ fontSize: '17px', lineHeight: '1.8' }}>
                        <MixedContent text={question.solution} />
                    </div>
                </div>
            )}
            {!showSolution && (
                <button onClick={onToggleSolution} style={{ width: '100%', padding: '20px', backgroundColor: TOKENS.colors.surface, border: `2px dashed ${TOKENS.colors.primary}`, color: TOKENS.colors.primary, borderRadius: TOKENS.radius.lg, cursor: 'pointer', fontWeight: '800', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    צפה בפתרון המלא
                </button>
            )}

        </div>
    );
}

function QuestionScreen({ questions, mode, examTimeLeft, currentIdx, userAnswers, showSolution, onAnswer, onToggleSolution, onNext, onPrev, onFinish }) {
    const q = questions[currentIdx];
    const isLast = currentIdx === questions.length - 1;
    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ fontSize: '15px', color: TOKENS.colors.textSecondary, backgroundColor: TOKENS.colors.white, padding: '8px 16px', borderRadius: '12px', fontWeight: '700' }}>
                    שאלה {currentIdx + 1} מתוך {questions.length} • {q.subject}
                </div>
                {mode === 'exam' && examTimeLeft !== null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '900', color: examTimeLeft < 60 ? TOKENS.colors.error : TOKENS.colors.primary, backgroundColor: TOKENS.colors.white, padding: '8px 20px', borderRadius: '12px' }}>
                        <Icons.Timer />
                        {Math.floor(examTimeLeft / 60)}:{(examTimeLeft % 60).toString().padStart(2, '0')}
                    </div>
                )}
            </div>
            <div style={{ position: 'relative', height: '8px', backgroundColor: TOKENS.colors.border, borderRadius: '4px', marginBottom: '40px', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', backgroundColor: TOKENS.colors.primary, borderRadius: '4px', width: `${((currentIdx + 1) / questions.length) * 100}%`, transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)', boxShadow: '0 0 10px rgba(79, 70, 229, 0.4)' }} />
            </div>
            <div className="question-card" style={{ backgroundColor: TOKENS.colors.white, padding: '48px', borderRadius: TOKENS.radius.card, boxShadow: TOKENS.shadows.card, marginBottom: '40px', border: `1px solid ${TOKENS.colors.border}`, position: 'relative' }}>
                {userAnswers[q.id] && mode === 'practice' && (
                    <div style={{ position: 'absolute', top: '-12px', left: '24px', backgroundColor: TOKENS.colors.success, color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '900', boxShadow: TOKENS.shadows.sm }}>נפתר</div>
                )}
                {q.type === 'MCQ' ? (
                    <MCQQuestion
                        question={q}
                        userAnswer={userAnswers[q.id]}
                        onAnswer={onAnswer}
                        mode={mode}
                    />
                ) : (
                    <OpenQuestion
                        question={q}
                        mode={mode}
                        showSolution={showSolution}
                        onToggleSolution={onToggleSolution}
                    />
                )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                <button onClick={onPrev} disabled={currentIdx === 0} style={{ padding: '14px 28px', borderRadius: TOKENS.radius.lg, border: `2px solid ${TOKENS.colors.border}`, backgroundColor: TOKENS.colors.white, display: 'flex', alignItems: 'center', gap: '12px', cursor: currentIdx === 0 ? 'default' : 'pointer', fontWeight: '800', opacity: currentIdx === 0 ? 0.5 : 1 }}>
                    <Icons.ChevronBack /> הקודם
                </button>
                {isLast ? (
                    <button onClick={onFinish} style={{ padding: '14px 40px', backgroundColor: TOKENS.colors.success, color: 'white', border: 'none', borderRadius: TOKENS.radius.lg, fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: TOKENS.shadows.md }}>
                        <Icons.Flag /> סיום מבחן
                    </button>
                ) : (
                    <button onClick={onNext} style={{ padding: '14px 40px', backgroundColor: TOKENS.colors.primary, color: 'white', border: 'none', borderRadius: TOKENS.radius.lg, fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: TOKENS.shadows.md }}>
                        הבא <Icons.ChevronForward />
                    </button>
                )}
            </div>
        </div>
    );
}

function SummaryScreen({ questions, userAnswers, mode, expandedItems, onToggleItem, onRestart }) {
    const score = questions.filter(q => q.type === 'MCQ' && userAnswers[q.id] === q.correctAnswer).length;
    const mcqCount = questions.filter(q => q.type === 'MCQ').length;
    const [mcqCopied, setMcqCopied] = useState(false);
    const [openCopied, setOpenCopied] = useState(false);

    const subject = questions[0]?.subject || 'המבחן';
    const count = questions.length;

    const handleCopyPrompt = (type, setCopied) => {
        const prompt = buildMoreQuestionsPrompt(subject, count, type);
        navigator.clipboard.writeText(prompt).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => console.error('[TestBuilder] Clipboard copy failed:', err));
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '900', marginBottom: '24px', letterSpacing: '-0.04em' }}>סיכום {mode === 'exam' ? 'בחינה' : 'תרגול'}</h2>
            {mcqCount > 0 && (
                <div style={{ fontSize: '28px', color: TOKENS.colors.primary, fontWeight: '900', marginBottom: '48px' }}>
                    ציון סופי: {Math.round((score / mcqCount) * 100)}%
                </div>
            )}
            <div className="no-print action-buttons" style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '48px' }}>
                <button onClick={onRestart} style={{ padding: '16px 48px', backgroundColor: TOKENS.colors.primary, color: 'white', border: 'none', borderRadius: TOKENS.radius.btn, fontWeight: '900', fontSize: '17px', cursor: 'pointer', boxShadow: TOKENS.shadows.md }}>חזרה למסך הבית</button>
                <button onClick={() => window.print()} style={{ padding: '16px 48px', backgroundColor: TOKENS.colors.white, color: TOKENS.colors.primary, border: `2px solid ${TOKENS.colors.primary}`, borderRadius: TOKENS.radius.btn, fontWeight: '900', fontSize: '17px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icons.Download /> הדפס PDF
                </button>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {questions.map((q, idx) => {
                    const isCorrect = q.type === 'MCQ' && userAnswers[q.id] === q.correctAnswer;
                    const isIncorrect = q.type === 'MCQ' && !!userAnswers[q.id] && !isCorrect;
                    const headerBg = isCorrect ? TOKENS.colors.successLight : isIncorrect ? TOKENS.colors.errorLight : TOKENS.colors.white;
                    return (
                        <div key={q.id} className="content-card" style={{ border: `1px solid ${TOKENS.colors.border}`, borderRadius: TOKENS.radius.lg, overflow: 'hidden', backgroundColor: TOKENS.colors.white }}>
                            <div onClick={() => onToggleItem(idx)} style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: headerBg, transition: 'background 0.2s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: q.type === 'MCQ' ? (isCorrect ? TOKENS.colors.success : TOKENS.colors.error) : TOKENS.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: TOKENS.shadows.sm }}>
                                        {q.type === 'MCQ' ? (
                                            isCorrect ? <Icons.Check width={16} height={16} style={{ color: 'white' }} /> : <Icons.Close width={16} height={16} style={{ color: 'white' }} />
                                        ) : (
                                            <Icons.Academic width={16} height={16} style={{ color: 'white' }} />
                                        )}
                                    </div>
                                    <span style={{ fontWeight: '800', fontSize: '17px', color: TOKENS.colors.text }}>שאלה {idx + 1}: {q.subject}</span>
                                </div>
                                <div style={{ color: TOKENS.colors.textSecondary }}>
                                    {expandedItems[idx] ? <Icons.Close /> : <Icons.ChevronForward style={{ transform: 'rotate(90deg)' }} />}
                                </div>
                            </div>
                            {expandedItems[idx] && (
                                <div style={{ padding: '32px', backgroundColor: TOKENS.colors.surface, borderTop: `1px solid ${TOKENS.colors.border}` }}>
                                    <MixedContent text={q.question} />
                                    <div style={{ marginTop: '24px', padding: '24px', backgroundColor: TOKENS.colors.successLight, borderRadius: TOKENS.radius.lg, border: `1px solid ${TOKENS.colors.success}` }}>
                                        <MixedContent text={q.solution} />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Global Add Section at Summary */}
            <div className="no-print" style={{ marginTop: '40px', padding: '40px', textAlign: 'center', backgroundColor: TOKENS.colors.surface, borderRadius: TOKENS.radius.card, border: `2px dashed ${TOKENS.colors.border}`, marginBottom: '60px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '12px', color: TOKENS.colors.text }}>💡 רוצה להעמיק בחומר?</h3>
                <p style={{ color: TOKENS.colors.textSecondary, marginBottom: '32px', fontSize: '16px' }}>הפוך את המבחן הבא למקיף יותר עם שאלות נוספות ב"פרוטוקול הזהב"</p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <button
                        onClick={() => handleCopyPrompt('MCQ', setMcqCopied)}
                        style={{ padding: '14px 28px', backgroundColor: mcqCopied ? TOKENS.colors.success : TOKENS.colors.primary, color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', transition: '0.2s' }}
                    >
                        {mcqCopied ? '✅ הועתק!' : '+ בקש 5 שאלות MCQ נוספות'}
                    </button>
                    <button
                        onClick={() => handleCopyPrompt('Open', setOpenCopied)}
                        style={{ padding: '14px 28px', backgroundColor: TOKENS.colors.white, color: openCopied ? TOKENS.colors.success : TOKENS.colors.primary, border: `2px solid ${openCopied ? TOKENS.colors.success : TOKENS.colors.primary}`, borderRadius: '12px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', transition: '0.2s' }}
                    >
                        {openCopied ? '✅ הועתק!' : '+ בקש 5 שאלות פתוחות נוספות'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ExamSetupScreen({ onStartExam, onCancel }) {
    const [customTime, setCustomTime] = useState('60');
    const timeIsValid = isValidTime(customTime);
    return (
        <div style={{ padding: '40px 24px', maxWidth: '640px', margin: '40px auto', textAlign: 'center', backgroundColor: TOKENS.colors.white, borderRadius: TOKENS.radius.card, boxShadow: TOKENS.shadows.card }}>
            <div style={{ color: TOKENS.colors.primary, marginBottom: '24px', display: 'flex', justifyContent: 'center' }}><Icons.Timer width={64} height={64} /></div>
            <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '12px' }}>הגדרת זמן לבחינה</h2>
            <p style={{ color: TOKENS.colors.textSecondary, marginBottom: '40px' }}>בחרו את הזמן המוקצב לפתרון המבחן. המערכת תבצע סיום אוטומטי בגמר הזמן.</p>

            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
                {[10, 30, 60, 90].map(mins => (
                    <button key={mins} onClick={() => onStartExam(mins * 60)} style={{ padding: '16px', backgroundColor: TOKENS.colors.surface, border: `2px solid ${TOKENS.colors.border}`, borderRadius: TOKENS.radius.lg, fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', fontSize: '18px' }} onMouseOver={e => e.currentTarget.style.borderColor = TOKENS.colors.primary} onMouseOut={e => e.currentTarget.style.borderColor = TOKENS.colors.border}>
                        {mins} דקות
                    </button>
                ))}
            </div>

            <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <input type="number" min="1" max="300" value={customTime} onChange={e => setCustomTime(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: `2px solid ${timeIsValid ? TOKENS.colors.border : TOKENS.colors.error}`, width: '80px', textAlign: 'center', fontSize: '18px', fontWeight: '700' }} />
                <span style={{ fontWeight: '700' }}>דקות בהתאמה אישית</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button onClick={() => onStartExam(parseInt(customTime, 10) * 60)} disabled={!timeIsValid} style={{ padding: '18px', backgroundColor: timeIsValid ? TOKENS.colors.primary : TOKENS.colors.border, color: 'white', border: 'none', borderRadius: TOKENS.radius.btn, fontWeight: '900', fontSize: '18px', cursor: timeIsValid ? 'pointer' : 'default', boxShadow: timeIsValid ? TOKENS.shadows.md : 'none', transition: 'all 0.2s' }}>התחל בחינה</button>
                <button onClick={onCancel} style={{ background: 'none', border: 'none', fontWeight: '800', color: TOKENS.colors.textSecondary, cursor: 'pointer' }}>ביטול וחזרה</button>
            </div>
        </div>
    );
}

// ============================================================
// COMPONENT: PromptArchitectView
// ============================================================
const DIFFICULTY_LEVELS = [
    { id: 'easy', label: 'קלה', desc: 'הבנה בסיסית', promptKey: 'Basic Concept Understanding' },
    { id: 'medium', label: 'בינונית', desc: 'חיזוק היסודות', promptKey: 'Intermediate Foundation' },
    { id: 'hard', label: 'קשה', desc: 'אתגר אקדמי', promptKey: 'High Academic Challenge' },
    { id: 'vhard', label: 'קשה מאוד', desc: 'התעללות מלאה', promptKey: 'Extremely Challenging (Abuse Protocol)' },
];

// ============================================================
// COMPONENT: PromptArchitectView
// ============================================================
function PromptArchitectView({ onSuccess }) {
    const [subject, setSubject] = useState('');
    const [count, setCount] = useState(10);
    const [difficulty, setDifficulty] = useState('medium');
    const [type, setType] = useState('רק פתוחות (Open Questions)');
    const [special, setSpecial] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const isPhysics = (subject || '').toLowerCase().includes('פיזיקה') || (subject || '').toLowerCase().includes('physics') || (subject || '').toLowerCase().includes('חשמל') || (subject || '').toLowerCase().includes('גאוס') || (subject || '').toLowerCase().includes('מגנטיות');
    const diagramInstruction = isPhysics
        ? 'דיאגרמות: עבור מעגלים סטנדרטיים השתמש ב-python_drawer עם schemdraw. עבור גאומטריה, סימטריה, משטחי גאוס, מבנים כדוריים/גליליים ואזורים מוצללים השתמש ב-python_drawer עם matplotlib.'
        : 'דיאגרמות: עבור פונקציות, שטחים, גרפים, אזורים מוצללים ושדות כיוונים השתמש ב-python_drawer עם matplotlib ו-numpy.';

    const selectedDifficulty = DIFFICULTY_LEVELS.find(d => d.id === difficulty) || DIFFICULTY_LEVELS[1];

    const generatedPrompt = `נושא: ${subject || '[בחר נושא]'}
כמות שאלות: ${count}
רמת קושי (ערך יחיד בלבד — אין לפרש כטווח): ${selectedDifficulty.promptKey}
סוג שאלות: ${type}
${special ? `\nדגשים נוספים: ${special}` : ''}

===== פרוטוקול זהב (Golden Protocol) =====
1. סדר הפלט: הפלט הסופי חייב להיות אך ורק בלוק קוד json יחיד המכיל מערך JSON תקין, ישירות להדבקה ב-Exam Viewer. את כל הפתרון, הבדיקה והחשיבה בצע באופן פרטי לפני הפלט.
2. LaTeX: כל backslash ב-LaTeX חייב להיות DOUBLE-ESCAPED (חובה: \\\\frac, \\\\sqrt, \\\\vec, \\\\rho).
3. מגן RTL: כל מספר, יחידת מידה או ביטוי מתמטי בתוך הטקסט (השאלה והתשובות) חייב להיות עטוף ב-$ ... $ (למשל: $5 [C]$, $12 [V]$, $x^2$). זה קריטי כדי למנוע היפוך סדר בטקסט RTL.
4. ${diagramInstruction}
5. מבנה JSON:
   - type חייב להיות בדיוק "multiple-choice" או "open-ended".
   - שאלות multiple-choice: options חייב להכיל בדיוק 4 מחרוזות; correctAnswer חייב להיות מספר שלם (index 0-3).
   - שאלות open-ended: options חייב להיות []; correctAnswer חייב להיות null.
   - השתמש ב-python_drawer כשדה עליון בלבד; אין להשתמש ב-diagram מקונן.
   - בשאלות פתוחות: העדף ניסוח רב-סעיפי מפורש כמו א. / ב. / ג.; השתמש ב-<br><br> רק כשצריך; אל תשתמש ב-<hr> בתוך הטקסט.
   - DRY: בשדה solution — תשובה סופית בלבד.
   - explanation: הסבר קצר של הפתרון — שדה חובה.
6. python_drawer: הערך הסופי המוחזר חייב להיות מחרוזת UTF-8 של SVG תקין, המתחילה ב-<svg או בהצהרת XML ואחריה <svg. אין להדפיס טקסט debug, אין להשתמש ב-print(...) כשלב סופי, ואין להחזיר bytes.
7. עבור matplotlib, סיים בתבנית השקולה ל:
   - import io
   - buf = io.BytesIO()
   - fig.savefig(buf, format='svg', bbox_inches='tight', transparent=True)
   - plt.close(fig)
   - buf.getvalue().decode('utf-8')
8. ללא קיבוץ/ערבוב: אל תקבץ שאלות לפי סוג — סדר מעורב בלבד.

המטרה: רמה אקדמית גבוהה ביותר, ללא כפילויות משתנים.`;

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedPrompt).then(() => {
            setIsCopied(true);
            setTimeout(() => {
                onSuccess();
            }, 2000);
        }).catch(err => console.error('[TestBuilder] Clipboard copy failed:', err));
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ backgroundColor: TOKENS.colors.white, padding: '48px', borderRadius: TOKENS.radius.card, boxShadow: TOKENS.shadows.card }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ backgroundColor: TOKENS.colors.primaryLight, padding: '12px', borderRadius: '16px', color: TOKENS.colors.primary }}>
                        <Icons.Sparkles />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '900' }}>מחולל הפרומפטים שלי</h2>
                </div>

                <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '14px', color: TOKENS.colors.textSecondary }}>נושא המבחן</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder="לדוגמה: מכניקה ניוטונית, פיזיולוגיה..."
                            style={{ width: '100%', padding: '16px', borderRadius: TOKENS.radius.btn, border: `2px solid ${TOKENS.colors.border}`, fontSize: '16px', outline: 'none', transition: 'border-color 0.2s', direction: 'rtl', fontFamily: 'inherit' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '14px', color: TOKENS.colors.textSecondary }}>כמות שאלות</label>
                        <input
                            type="number"
                            value={count}
                            onChange={e => setCount(e.target.value)}
                            min="1" max="50"
                            style={{ width: '100%', padding: '16px', borderRadius: TOKENS.radius.btn, border: `2px solid ${TOKENS.colors.border}`, fontSize: '16px', outline: 'none', fontFamily: 'inherit' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '14px', color: TOKENS.colors.textSecondary }}>רמת קושי</label>
                        <select
                            value={difficulty}
                            onChange={e => setDifficulty(e.target.value)}
                            style={{ width: '100%', padding: '16px', borderRadius: TOKENS.radius.btn, border: `2px solid ${TOKENS.colors.border}`, fontSize: '16px', outline: 'none', backgroundColor: 'white', fontFamily: 'inherit' }}
                        >
                            {DIFFICULTY_LEVELS.map(lvl => (
                                <option key={lvl.id} value={lvl.id}>
                                    {lvl.label} — {lvl.desc}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '14px', color: TOKENS.colors.textSecondary }}>סוג שאלות</label>
                        <select
                            value={type}
                            onChange={e => setType(e.target.value)}
                            style={{ width: '100%', padding: '16px', borderRadius: TOKENS.radius.btn, border: `2px solid ${TOKENS.colors.border}`, fontSize: '16px', outline: 'none', backgroundColor: 'white', fontFamily: 'inherit' }}
                        >
                            <option>רק אמריקאי (MCQ)</option>
                            <option>רק פתוחות (Open Questions)</option>
                            <option>מעורב (Mixed)</option>
                        </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '14px', color: TOKENS.colors.textSecondary }}>דגשים מיוחדים (אופציונלי)</label>
                        <textarea
                            value={special}
                            onChange={e => setSpecial(e.target.value)}
                            placeholder="למשל: תתמקד בחוק השלישי של ניוטון..."
                            style={{ width: '100%', padding: '16px', borderRadius: TOKENS.radius.btn, border: `2px solid ${TOKENS.colors.border}`, fontSize: '16px', outline: 'none', height: '100px', resize: 'vertical', direction: 'rtl', fontFamily: 'inherit' }}
                        />
                    </div>
                </div>

                <button
                    onClick={handleCopy}
                    disabled={!subject}
                    style={{
                        width: '100%', margin: '40px 0', padding: '24px',
                        backgroundColor: isCopied ? TOKENS.colors.success : TOKENS.colors.primary,
                        color: 'white', border: 'none', borderRadius: TOKENS.radius.card,
                        fontSize: '18px', fontWeight: '900', cursor: 'pointer',
                        boxShadow: TOKENS.shadows.md, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '12px', transition: 'all 0.3s',
                        opacity: !subject ? 0.5 : 1
                    }}
                >
                    {isCopied ? <><Icons.Check /> הועתק בהצלחה!</> : <><Icons.Sparkles /> הפק והעתק פרומפט ✨</>}
                </button>

                <div>
                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: '800', fontSize: '14px', color: TOKENS.colors.textSecondary }}>תצוגה מקדימה:</label>
                    <div style={{ backgroundColor: TOKENS.colors.surface, padding: '24px', borderRadius: TOKENS.radius.lg, border: `1px solid ${TOKENS.colors.border}`, fontSize: '14px', color: TOKENS.colors.textSecondary, whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: '1.6', direction: 'rtl', textAlign: 'right' }}>
                        {generatedPrompt}
                    </div>
                </div>
            </div>
        </div>
    );
}


// ============================================================
// LAYOUT WRAPPER (defined outside App to prevent remounts)
// ============================================================
function Layout({
    children,
    mode, examTitle, setMode,
    isHistoryModalOpen, setIsHistoryModalOpen,
    isSettingsOpen, setIsSettingsOpen,
    isImportModalOpen, setIsImportModalOpen,
    history, handleLoadFromHistory,
    theme, setTheme, preset, setPreset,
    handleExportData, handleImportData, handleClearData,
    handleLoadCustomJSON,
    onPromptArchitect,
    onViewerOpen,
}) {
    return (
        <div style={{ backgroundColor: TOKENS.colors.surface, minHeight: '100vh', fontFamily: 'var(--font-body)', direction: 'rtl' }}>
            <AppHeader
                onOpenSettings={() => setIsSettingsOpen(true)}
                onPromptArchitect={onPromptArchitect}
                onViewerOpen={onViewerOpen}
                onHome={() => setMode('welcome')}
                showHome={mode && mode !== 'welcome'}
                currentTitle={mode && mode !== 'welcome' ? examTitle : null}
            />
            <HistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} history={history} onLoadEntry={handleLoadFromHistory} />
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                theme={theme} setTheme={setTheme}
                preset={preset} setPreset={setPreset}
                onExport={handleExportData}
                onImport={handleImportData}
                onClear={handleClearData}
            />
            <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleLoadCustomJSON} />
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>{children}</div>
            <footer className="no-print" style={{ textAlign: 'center', padding: '40px', color: TOKENS.colors.textSecondary, fontSize: '12px', opacity: 0.6 }}>
                Universal Exam Builder v3.1.5-PRO • Phase 3 Release
            </footer>
        </div>
    );
}

// ============================================================
// DATA RESILIENCE HELPERS
// ============================================================

function safeLoadHistory() {
    try {
        const raw = localStorage.getItem('bt-history');
        return raw ? JSON.parse(raw) : [];
    } catch {
        localStorage.removeItem('bt-history');
        return [];
    }
}

function safeSetHistory(data) {
    try {
        localStorage.setItem('bt-history', JSON.stringify(data));
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            alert('שגיאה: האחסון המקומי מלא. נסה למחוק מבחנים ישנים.');
        }
    }
}

function isValidQuestionArray(data) {
    return (
        Array.isArray(data) &&
        data.length > 0 &&
        ['id', 'type', 'question', 'solution'].every((k) => k in data[0])
    );
}

function isValidTime(val) {
    const n = Number(val);
    return Number.isInteger(n) && n >= 1 && n <= 300;
}

function buildMoreQuestionsPrompt(subject, count, type) {
    const typeLabel = type === 'MCQ' ? 'מרובות בחירה (MCQ)' : 'פתוחות (Open-Ended)';
    const isPhysics = subject?.toLowerCase().includes('פיזיקה') || subject?.toLowerCase().includes('physics') || subject?.toLowerCase().includes('חשמל') || subject?.toLowerCase().includes('גאוס') || subject?.toLowerCase().includes('מגנטיות');
    const diagramInstruction = isPhysics
        ? 'דיאגרמות: עבור מעגלים סטנדרטיים השתמש ב-python_drawer עם schemdraw. עבור גאומטריה, סימטריה, משטחי גאוס, מבנים כדוריים/גליליים ואזורים מוצללים השתמש ב-python_drawer עם matplotlib.'
        : 'דיאגרמות: עבור פונקציות, שטחים, גרפים, אזורים מוצללים ושדות כיוונים השתמש ב-python_drawer עם matplotlib ו-numpy.';

    return `נושא: ${subject}
כמות שאלות נוספות: ${count}
סוג: ${typeLabel}

===== פרוטוקול זהב (Golden Protocol) =====
1. סדר הפלט: הפלט הסופי חייב להיות אך ורק בלוק קוד json יחיד המכיל מערך JSON תקין, ישירות להדבקה ב-Exam Viewer. את כל הפתרון, הבדיקה והחשיבה בצע באופן פרטי לפני הפלט.
2. LaTeX: כל backslash ב-LaTeX חייב להיות DOUBLE-ESCAPED (חובה: \\\\frac, \\\\sqrt, \\\\vec, \\\\rho).
3. מגן RTL: כל מספר, יחידת מידה או ביטוי מתמטי בתוך הטקסט (השאלה והתשובות) חייב להיות עטוף ב-$ ... $ (למשל: $5 [C]$, $12 [V]$, $x^2$). זה קריטי כדי למנוע היפוך סדר בטקסט RTL.
4. ${diagramInstruction}
5. מבנה JSON:
   - type חייב להיות בדיוק "multiple-choice" או "open-ended".
   - שאלות multiple-choice: options חייב להכיל בדיוק 4 מחרוזות; correctAnswer חייב להיות מספר שלם (index 0-3).
   - שאלות open-ended: options חייב להיות []; correctAnswer חייב להיות null.
   - השתמש ב-python_drawer כשדה עליון בלבד; אין להשתמש ב-diagram מקונן.
   - בשאלות פתוחות: העדף ניסוח רב-סעיפי מפורש כמו א. / ב. / ג.; השתמש ב-<br><br> רק כשצריך; אל תשתמש ב-<hr> בתוך הטקסט.
   - DRY: בשדה solution — תשובה סופית בלבד.
   - explanation: הסבר קצר של הפתרון — שדה חובה.
6. python_drawer: הערך הסופי המוחזר חייב להיות מחרוזת UTF-8 של SVG תקין, המתחילה ב-<svg או בהצהרת XML ואחריה <svg. אין להדפיס טקסט debug, אין להשתמש ב-print(...) כשלב סופי, ואין להחזיר bytes.
7. עבור matplotlib, סיים בתבנית השקולה ל:
   - import io
   - buf = io.BytesIO()
   - fig.savefig(buf, format='svg', bbox_inches='tight', transparent=True)
   - plt.close(fig)
   - buf.getvalue().decode('utf-8')
8. ללא קיבוץ/ערבוב: אל תקבץ שאלות לפי סוג — סדר מעורב בלבד.

המטרה: רמה אקדמית גבוהה ביותר, ללא כפילויות משתנים.`;
}

// ============================================================
// MAIN APP COMPONENT
// ============================================================
export default function App() {
    const { pyodide, status: pyodideStatus, error: pyodideError, init: initPyodide } = usePyodide();
    const [theme, setTheme] = useState(() => localStorage.getItem('bt-theme') || 'light');
    const [preset, setPreset] = useState(() => localStorage.getItem('bt-preset') || 'pro');
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [history, setHistory] = useState(safeLoadHistory);
    const [mode, setMode] = useState(null);
    const [dynamicQuestions, setDynamicQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [showSolution, setShowSolution] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [examTimeLeft, setExamTimeLeft] = useState(null);
    const [expandedItems, setExpandedItems] = useState({});
    const [displayMode, setDisplayMode] = useState('scroll');


    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('bt-theme', theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.setAttribute('data-preset', preset);
        localStorage.setItem('bt-preset', preset);
    }, [preset]);

    // Boot Pyodide immediately on page load
    useEffect(() => {
        const s = document.getElementById('pyodide-cdn');
        if (!s) {
            const script = document.createElement('script');
            script.id = 'pyodide-cdn';
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
            script.onload = () => initPyodide();
            script.onerror = () => console.error('[TestBuilder] Failed to load Pyodide CDN script');
            document.head.appendChild(script);
        } else if (typeof window.loadPyodide === 'function') {
            initPyodide();
        } else {
            const check = setInterval(() => {
                if (typeof window.loadPyodide === 'function') {
                    clearInterval(check);
                    initPyodide();
                }
            }, 50);
            setTimeout(() => clearInterval(check), 10000);
        }
    }, [initPyodide]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sharedData = params.get('exam');
        if (sharedData) {
            try {
                const decoded = JSON.parse(LZString.decompressFromEncodedURIComponent(sharedData));
                const isValidExam = Array.isArray(decoded) &&
                    decoded.length > 0 &&
                    decoded.filter(Boolean).length > 0 &&
                    decoded.some(item => item && (item.type || item.question || item.text));
                if (isValidExam) {
                    setDynamicQuestions(decoded.filter(Boolean));
                    setMode('welcome');
                    window.history.replaceState({}, document.title, window.location.pathname);
                } else {
                    console.warn('[TestBuilder] Shared exam URL contained invalid data, ignoring.');
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } catch (e) {
                console.error('[TestBuilder] Failed to parse shared exam URL:', e);
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, []);

    const handleLoadCustomJSON = (json) => {
        try {
            let cleanedJson = json.trim();
            if (cleanedJson.startsWith('```')) {
                cleanedJson = cleanedJson.replace(/^```(json)?/, '').replace(/```$/, '').trim();
            }
            const data = JSON.parse(cleanedJson);
            if (!isValidQuestionArray(data)) {
                alert('פורמט JSON לא תקין: חסרים שדות חובה (id, type, question, solution).');
                return;
            }
            setDynamicQuestions(data);
            setMode('viewer');
            const newEntry = {
                id: Date.now(),
                title: data[0]?.subject || 'מבחן חדש',
                date: new Date().toLocaleDateString('he-IL'),
                questions: data
            };
            setHistory(prev => {
                const updated = [newEntry, ...prev.slice(0, 49)];
                safeSetHistory(updated);
                return updated;
            });
        } catch (e) { alert('Invalid JSON format'); }
    };


    const handleLoadFromHistory = (entry) => {
        setDynamicQuestions(entry.questions);
        setMode('viewer');
        setIsHistoryModalOpen(false);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ready) => handleLoadCustomJSON(ready.target.result);
        reader.readAsText(file);
    };

    const handleAnswer = (val) => {
        setUserAnswers(prev => ({ ...prev, [dynamicQuestions[currentIdx].id]: val }));
        if (mode === 'practice') setShowSolution(true);
    };

    const handleExportData = () => {
        const data = {
            history,
            theme,
            preset,
            version: '3.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `exam_builder_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const handleImportData = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ready) => {
            try {
                const data = JSON.parse(ready.target.result);
                if (confirm('האם אתה בטוח שברצונך לשחזר נתונים? הפעולה תדרוס את ההיסטוריה הנוכחית.')) {
                    if (data.history) {
                        setHistory(data.history);
                        safeSetHistory(data.history);
                    }
                    if (data.theme) setTheme(data.theme);
                    if (data.preset) setPreset(data.preset);
                    setIsSettingsOpen(false);
                    alert('הנתונים שוחזרו בהצלחה!');
                }
            } catch (e) { alert('קובץ גיבוי לא תקין'); }
        };
        reader.readAsText(file);
    };

    const handleClearData = () => {
        if (confirm('האם אתה בטוח שברצונך למחוק את כל ההיסטוריה?') && confirm('פעולה זו אינה הפיכה. למחוק בכל זאת?')) {
            setHistory([]);
            localStorage.removeItem('bt-history');
            setIsSettingsOpen(false);
        }
    };

    useEffect(() => {
        if (mode === 'exam' && examTimeLeft > 0 && !isFinished) {
            const timer = setInterval(() => setExamTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (mode === 'exam' && examTimeLeft === 0) {
            setIsFinished(true);
        }
    }, [mode, examTimeLeft, isFinished]);


    const examTitle = dynamicQuestions[0]?.subject || 'Universal Exam Builder';

    const handleCopyBulkPrompt = (type) => {
        const prompt = buildMoreQuestionsPrompt(examTitle || 'המבחן', 5, type);
        navigator.clipboard.writeText(prompt);
    };

    const layoutProps = {
        mode, examTitle, setMode,
        isHistoryModalOpen, setIsHistoryModalOpen,
        isSettingsOpen, setIsSettingsOpen,
        isImportModalOpen, setIsImportModalOpen,
        history, handleLoadFromHistory,
        theme, setTheme, preset, setPreset,
        handleExportData, handleImportData, handleClearData,
        handleLoadCustomJSON,
        onPromptArchitect: () => setMode('prompt-architect'),
        onViewerOpen: () => setMode('viewer'),
    };

    if (mode === 'viewer') {
        return (
            <Layout {...layoutProps}>
                <ExamViewer
                    sharedData={dynamicQuestions.length > 0 ? dynamicQuestions : null}
                    pyodide={pyodide}
                    pyodideStatus={pyodideStatus}
                    pyodideError={pyodideError}
                    displayMode={displayMode}
                    setDisplayMode={setDisplayMode}
                    onCopyBulkPrompt={handleCopyBulkPrompt}
                />
            </Layout>
        );
    }

    if (mode === 'prompt-architect') {
        return (
            <Layout {...layoutProps}>
                <PromptArchitectView onSuccess={() => {
                    setMode('welcome');
                    setTimeout(() => setIsImportModalOpen(true), 150);
                }} />
            </Layout>
        );
    }

    if (!mode || mode === 'welcome') {
        return (
            <Layout {...layoutProps}>
                {dynamicQuestions.length > 0 ? (
                    <div style={{ textAlign: 'center', paddingTop: '40px' }}>
                        <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.03em' }}>{examTitle}</h2>
                        <p style={{ color: TOKENS.colors.textSecondary, marginBottom: '48px', fontSize: '18px' }}>{dynamicQuestions.length} שאלות מוכנות לתרגול</p>
                        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
                            <button onClick={() => { setMode('viewer'); setCurrentIdx(0); setUserAnswers({}); setIsFinished(false); }} style={{ padding: '24px 64px', backgroundColor: TOKENS.colors.primary, color: 'white', border: 'none', borderRadius: TOKENS.radius.card, fontSize: '20px', fontWeight: '900', cursor: 'pointer', boxShadow: TOKENS.shadows.md, display: 'flex', alignItems: 'center', gap: '12px' }}>📖 מצב למידה</button>
                            <button onClick={() => setMode('exam-setup')} style={{ padding: '24px 64px', backgroundColor: TOKENS.colors.white, color: TOKENS.colors.primary, border: `3px solid ${TOKENS.colors.primary}`, borderRadius: TOKENS.radius.card, fontSize: '20px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>⏱️ מצב בחינה</button>
                        </div>
                        <ShareExamButton examData={dynamicQuestions} />
                        <button onClick={() => { setDynamicQuestions([]); setMode(null); }} style={{ marginTop: '80px', background: 'none', border: 'none', color: TOKENS.colors.textSecondary, cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>🔄 טען מבחן אחר</button>
                    </div>
                ) : (
                    <PortalView onOpenImport={() => setIsImportModalOpen(true)} onFileUpload={handleFileUpload} onOpenHistory={() => setIsHistoryModalOpen(true)} historyCount={history.length} />
                )}
            </Layout>
        );
    }

    return (
        <Layout {...layoutProps}>
            {isFinished ? (
                <SummaryScreen questions={dynamicQuestions} userAnswers={userAnswers} mode={mode} expandedItems={expandedItems} onToggleItem={(idx) => setExpandedItems(prev => ({ ...prev, [idx]: !prev[idx] }))} onRestart={() => setMode('welcome')} />
            ) : mode === 'exam-setup' ? (
                <ExamSetupScreen onStartExam={(time) => { setExamTimeLeft(time); setMode('exam'); setCurrentIdx(0); setUserAnswers({}); setIsFinished(false); }} onCancel={() => setMode('welcome')} />
            ) : (
                <QuestionScreen questions={dynamicQuestions} mode={mode} examTimeLeft={examTimeLeft} currentIdx={currentIdx} userAnswers={userAnswers} showSolution={showSolution} onAnswer={handleAnswer} onToggleSolution={() => setShowSolution(true)} onNext={() => { setCurrentIdx(p => p + 1); setShowSolution(false); }} onPrev={() => { setCurrentIdx(p => Math.max(0, p - 1)); setShowSolution(false); }} onFinish={() => setIsFinished(true)} />
            )}
        </Layout>
    );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
