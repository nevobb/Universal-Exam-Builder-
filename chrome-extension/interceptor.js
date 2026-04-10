/**
 * TestBuilder Bridge - Network Interceptor (v2.4.0-DEBUG)
 * Patches both fetch and XHR to capture Gemini's JSON exam streams.
 * Optimized for MAIN world injection and Trusted Types compliance.
 */

(function() {
    console.log("🚀 TestBuilder Interceptor v2.4.0-DEBUG Active");
    // Trusted Types Monitor — catches the exact string and sink causing violations
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
        try {
            if (!window.trustedTypes.defaultPolicy) {
                window.trustedTypes.createPolicy('default', {
                    createHTML: (s) => { console.warn("⚠️ TrustedHTML Violation attempted with:", s); return s; },
                    createScript: (s) => { console.warn("⚠️ TrustedScript Violation attempted with:", s); return s; }
                });
            }
        } catch (e) {
            console.error("❌ Gemini CSP blocked Policy creation. We must find the sink manually.", e);
        }
    }
    const bridgeEventName = '__GEMINI_DATA_DETECTED__';

    // 1. PATCH FETCH
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        const url = args[0] instanceof Request ? args[0].url : args[0];

        // Track Gemini's chat and stream endpoints
        if (url.includes('BardChatUi') || url.includes('StreamGenerate') || url.includes('POST_CHAT')) {
            const clone = response.clone();
            clone.text().then(text => {
                detectAndRelay(text);
            }).catch(() => {});
        }

        return response;
    };

    // 2. PATCH XHR (Backup)
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        this._url = url;
        return originalOpen.apply(this, arguments);
    };

    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function() {
        this.addEventListener('load', () => {
            if (this._url && (this._url.includes('BardChatUi') || this._url.includes('StreamGenerate'))) {
                detectAndRelay(this.responseText);
            }
        });
        return originalSend.apply(this, arguments);
    };

    function detectAndRelay(rawText) {
        if (!rawText) return;

        // Pattern 1: Standard JSON Array. Pattern 2: Escaped JSON (Gemini stream style)
        const patterns = [
            /\[\s*{\s*"id":\s*".+?"\s*,.+?\s*}\s*\]/sg,
            /\[\s*{\s*\\"id\\":\s*\\".+?\\"\s*,.+?}\s*\]/sg
        ];

        patterns.forEach(regex => {
            const matches = rawText.match(regex);
            if (matches) {
                matches.forEach(match => {
                    try {
                        const cleanStr = match.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                        const data = JSON.parse(cleanStr);
                        
                        // Heuristic: Must be an array of questions
                        if (Array.isArray(data) && data.length > 0 && (data[0].question || data[0].id)) {
                            window.dispatchEvent(new CustomEvent(bridgeEventName, { detail: data }));
                            console.log('[TestBuilder Interceptor] Valid JSON Captured:', data.length, 'entries');
                        }
                    } catch (e) {
                        // Not our JSON, ignore
                    }
                });
            }
        });
    }

    // Ping confirmation for Content Script
    window._testbuilder_connector_active = true;
    console.log('[TestBuilder Interceptor] v2.4.0-DEBUG is actively monitoring network streams.');
})();
